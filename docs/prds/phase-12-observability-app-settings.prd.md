# PRD — Phase 12: Observability & App Settings

**Status:** `Active`
**Last updated:** 2026-07-17

---

## Problem

Two related gaps. First: logs have a canonical taxonomy (`logging.mdc` — debug/info/warn/error, `[kebab-case-tag]` convention) but only ever surface in Vercel's log viewer — there's no in-app way to browse, filter, or triage them, and no persistence beyond whatever Vercel retains. Second: the template has no admin-editable configuration store at all. Any runtime toggle (starting with "is debug logging on") requires an env var and a redeploy to change — which doesn't fit a template meant to give every spun-off product a way to flip settings live.

This PRD was fully grilled in a planning chat before decomposition into epics/stories. The settled-decisions ledger below carries that session's decisions in the order they were made, with rationale kept — not a summary. It is the input the epics and stories were decomposed from, and remains the record of *why* each was scoped as it is.

## Goal

Ship a generic, admin-editable settings store (settings table + registry + admin page), and a log-persistence system (logs table + wrapper + admin page) whose first real consumer is the settings-driven minimum log level — proving the settings infrastructure works by using it for something real, not a demo.

## Out of scope

- `scripts/checks/*.mjs` (CI hard-constraint check scripts) — stay on plain `console.*`. Not application logs; muddies a page meant for runtime app behavior.
- Ad-hoc setting creation from the admin UI — the set of settings is fixed in code (a registry), admins edit values only.
- Per-admin read state on logs — read/unread is global, not per-user.
- General column sorting on the logs table — filters handle narrowing; sorting is scoped to a single newest/oldest timestamp toggle only (breaking this would break cursor pagination's stable sort key).

---

## Epics & stories

### Epic 1: App settings store `Complete`

- **1.1 The settings registry.** Settings are declared in code — key, label, description, value type, default — as the single source of truth for what settings exist. The store holds values only; a key absent from the registry isn't a setting, and admins never invent keys. Seeded with the two this phase needs: minimum log level and log retention window.
- **1.2 Persisted values with registry defaults.** A setting's value persists per spun-off project and reads back with the registry default standing in when nothing has been set yet. Value shape varies per setting (level is a string enum, retention a number), so the store holds heterogeneous values without a schema change per setting. Admin-only.
- **1.3 Cached reads, invalidated on save.** Reads go through the tagged server data cache under one coarse tag covering the whole settings set; saving invalidates that tag so an admin's change propagates across serverless instances at once rather than waiting out a TTL. Design and trade-offs settled in [ADR-0006](../adr/ADR-0006-settings-reads-cached-under-one-coarse-tag.md).

*Success:*
- Reading an unset setting returns its registry default; reading a set one returns the stored value.
- A saved value takes effect on the next read everywhere, with no redeploy and no staleness window.
- Settings of different value types coexist without a schema change.
- A key absent from the registry can't be written.
- Non-admins can neither read nor write settings.
- `pnpm pre-push` is green.

### Epic 2: Settings admin page `Complete`

- **2.1 The settings page.** A new admin page renders each registry setting as a block — label, description, and an input control typed to the setting — grouped under feature-area headings, with per-row save and a toast confirmation reusing the existing pattern. The page renders whatever's in the registry, so a new setting is a registry entry rather than a page change. Mockup: `.mockups/admin_settings_page.html`.

*Success:*
- Every registry setting renders with a control matching its declared type, showing the live value or the default.
- Saving one setting saves only that setting and confirms with a toast.
- Adding a registry entry surfaces a new control with no page-code change.
- The page is admin-gated.
- `pnpm pre-push` is green.

### Epic 3: Log persistence

- **3.1 Logs persist.** Application logs are written to a table so they can be browsed in-app and outlive Vercel's retention. A row carries level, tag, message, and arbitrary structured context — an error is one shape of context, not a column of its own. Admin-only read.
- **3.2 The wrapper.** Call sites log through a thin wrapper that does what `console.*` does today plus a persisted write. Tag is a required explicit argument, so a missing tag is a compile-time error rather than a null discovered later on the admin page. Fire-and-forget: no call site awaits it and no sync function becomes async. Inside a request the write defers so it survives serverless teardown without blocking the response — the same silent-drop risk that ruled out Pino/Winston's transport model.
- **3.3 CLI wrapper variant.** Admin CLI scripts log through a variant that awaits its write directly — there's no request whose life needs extending, and the process runs to completion before exiting.
- **3.4 The level threshold.** The minimum log level setting gates logging: below it, a call neither prints nor persists. This is the settings store's first real consumer. The CLI variant has no request cache to read through, so it resolves the threshold directly at startup.

*Success:*
- A below-threshold call produces neither console output nor a row; an at-or-above call produces both.
- Changing the minimum level from the settings page changes behavior on the next request, with no redeploy.
- No call site awaits the wrapper, and no function became async to accommodate it.
- A log written during a request survives the response completing.
- CLI-script logs persist.
- `pnpm pre-push` is green.

### Epic 4: Console sweep

- **4.1 Application logs move onto the wrapper.** Every application log in `src/` routes through the request wrapper, with each site's existing bracket-prefixed tag split out into the explicit tag argument. Two sites don't follow the convention — one passes a tag variable, one interpolates the tag mid-message — and need the sweep to read what they actually hold rather than a mechanical find-replace.
- **4.2 Admin CLI logs move onto the CLI variant.** The promote, demote, and list-admins scripts and their shared CLI library route through the CLI variant. The CI hard-constraint check scripts stay on plain `console.*` deliberately — they're CI output, not application runtime behavior, and persisting them would muddy a page meant for what's happening in a running app.

*Success:*
- Every swept site logs through a wrapper with an explicit tag; nothing in the swept surface prints via raw `console.*`.
- The two non-conforming sites carry real, correct tags.
- The CI check scripts are untouched and still on plain `console.*`.
- `pnpm pre-push` is green.

### Epic 5: Raw console guardrail

- **5.1 The guardrail.** A check rejects raw `console.*` outside the wrapper across the swept surfaces, so new ones can't creep back in; the CI check scripts stay exempt. A new `check:*` pairs one-to-one with a hard-constraint entry, so this routes through the AGENTS.md change protocol as a deliberate addition. It sequences after the sweep — its passing state is only meaningful once every existing call site has moved.

*Success:*
- The guardrail fails on a planted raw `console.*` in a swept surface and passes clean on the codebase.
- CI check scripts are exempt and still pass.
- The change protocol is followed and the hard-constraint statement matches enforcement.
- `pnpm pre-push` is green.

### Epic 6: Log retention purge

- **6.1 Logs purge on a schedule.** Logs older than the retention window are deleted by the database on a schedule, with the window read from settings so an admin changes it without a migration or a redeploy — the settings store's second real consumer. Scheduling is established by migration and tracked in source control like any other schema change, and setup docs note that it enables a database extension. Admin CLI privilege-change events get no exemption; retention is uniform.

*Success:*
- The scheduled job exists after migrations run.
- Rows older than the window are gone after a run; newer rows survive.
- Changing the retention setting changes what the next run deletes, with no migration or redeploy.
- Setup docs note the extension.
- `pnpm pre-push` is green.

### Epic 7: Logs page — browse

- **7.1 Browse logs.** A new admin page lists logs newest-first — timestamp, level badge, tag, and a truncated single-line message — with a row expanding on click to reveal the full message and its context. Paging is cursor-based on the timestamp rather than offset, because the table is written to concurrently and offset paging drifts and slows under inserts. Mockup: `.mockups/admin_logs_page.html`.
- **7.2 Copy a row.** A row copies its message and formatted context to the clipboard, reusing the error panel's existing copy pattern, for pasting into an AI chat or elsewhere.
- **7.3 Sort direction.** The timestamp header flips between newest- and oldest-first. It's the only sort control on the page — no other column sorts, since paging depends on a single stable key and the filters cover what sorting would.

*Success:*
- Rows show timestamp, level, tag, and truncated message; expanding one reveals the full message and context.
- Paging stays consistent while rows are being inserted.
- Flipping direction re-pages correctly from the top.
- Copy places the message and formatted context on the clipboard.
- No column but timestamp offers any sort affordance.
- The page is admin-gated.
- `pnpm pre-push` is green.

### Epic 8: Logs page — triage

- **8.1 Filters.** The page filters by level (multi-select chips colored to match the row badges), by tag (a searchable dropdown populated from the tags actually present), and by read status (all or unread only).
- **8.2 Search.** A free-text bar matches against message, context, and tag by substring — right-sized given the purge keeps the table small, revisited only if volume ever makes it slow. Tag is included so a cluster of one tag is findable by search, which is what a tag sort would otherwise have been for.
- **8.3 Read state.** Read/unread is global rather than per-admin, since a template can't know how many admins a spinoff has and shared read state is the simpler default. It's marked explicitly only — by row, or by a "mark all as read" scoped to the current filter view. Nothing auto-marks on page load or scroll, which would defeat read/unread as a triage tool.

*Success:*
- Filters compose with each other, with search, and with paging.
- Unread rows are visually distinct from read ones.
- "Mark all as read" affects only rows in the active filter view.
- Nothing becomes read without an explicit action.
- Search matches against message, context, and tag.
- `pnpm pre-push` is green.

### Epic 9: Debug logs at the three seams

- **9.1 The session seam.** Session and proxy decisions emit debug logs — token refreshed versus reused, claims read while expired — so the boundary [ADR-0005](../adr/ADR-0005-proxy-as-sole-session-authority.md) settled can be watched live rather than inferred from a stack trace.
- **9.2 The settings seam.** Settings reads and invalidations emit debug logs — cache hit or miss, invalidation firing on save — so a stale-settings report is diagnosable instead of guessed at.
- **9.3 The avatar storage seam.** Avatar upload and delete emit debug logs covering the success path, including the case where a storage delete fails without blocking the profile update.

*Success:*
- With the threshold at debug, a single pass through sign-in, a settings save, and an avatar upload produces a legible trace on the logs page.
- With the threshold at info, none of them appear.
- No seam's control flow or behavior changes as a result of its logging.
- `pnpm pre-push` is green.

---

## Notes

- **ADR-0006 written during this planning session** — [ADR-0006](../adr/ADR-0006-settings-reads-cached-under-one-coarse-tag.md) settles decision 9's caching design and covers Epic 1.3. It was the phase's only ADR candidate; nothing else here clears all three bars.
- **Four decisions were made at decomposition** and are recorded as ledger entries 30–33, amending decisions 6 and 19. Epic 9 is net-new scope arising from decision 33.
- **Dependencies:** Epic 1 before Epics 3.4 and 6 (both read settings). Epic 3 before Epics 4, 6, and 9 (all need a wrapper). Epic 4 before Epic 5 — the guardrail's clean-pass criterion is meaningless until the sweep has landed. Epic 7 before Epic 8 (same page). Epic 9 last: its logs need the wrapper, the settings store, and the threshold all present.
- **Epics 7 and 8 deliberately split one page across two epics.** The logs page's decisions (15–21) are more than one context window holds. The intermediate state — a logs page with no filters — is real but harmless, since nothing ships to users mid-phase.
- **Only hard-constraint change is Epic 5's guardrail,** routed through the AGENTS.md change protocol. Nothing in this phase touches the auth boundary or the admin gate.
- **No new LEXICON terms.** Settings registry, wrapper, and tag are implementation vocabulary, not domain terms meaningful to a domain expert.
- **Open at plan time — Epic 3.4's CLI threshold read.** The CLI variant runs outside Next.js, so it has no request context and no tagged cache to read the threshold through. A direct read at process start is the intended approach (short-lived process, cache bypass is harmless), but the ledger doesn't cover it; plan review should confirm rather than let it be invented.
