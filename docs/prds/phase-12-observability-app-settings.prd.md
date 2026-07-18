# PRD — Phase 12: Observability & App Settings

**Status:** `Active`
**Last updated:** 2026-07-18

---

## Problem

Two related gaps. First: logs have a canonical taxonomy (`logging.mdc` — debug/info/warn/error, `[kebab-case-tag]` convention) but only ever surface in Vercel's log viewer — there's no in-app way to browse, filter, or triage them, and no persistence beyond whatever Vercel retains. Second: the template has no admin-editable configuration store at all. Any runtime toggle (starting with "is debug logging on") requires an env var and a redeploy to change — which doesn't fit a template meant to give every spun-off product a way to flip settings live.

This PRD was fully grilled in a planning chat before decomposition into epics/stories.

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

### Epic 3: Log persistence `Complete`

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

### Epic 4: Console sweep `Complete`

- **4.1 Application logs move onto the wrapper.** Every application log in `src/` routes through the request wrapper, with each site's existing bracket-prefixed tag split out into the explicit tag argument. Two sites don't follow the convention — one passes a tag variable, one interpolates the tag mid-message — and need the sweep to read what they actually hold rather than a mechanical find-replace.
- **4.2 Admin CLI logs move onto the CLI variant.** The promote, demote, and list-admins scripts and their shared CLI library route through the CLI variant. The CI hard-constraint check scripts stay on plain `console.*` deliberately — they're CI output, not application runtime behavior, and persisting them would muddy a page meant for what's happening in a running app.

*Success:*
- Every swept site logs through a wrapper with an explicit tag; nothing in the swept surface prints via raw `console.*`.
- The two non-conforming sites carry real, correct tags.
- The CI check scripts are untouched and still on plain `console.*`.
- `pnpm pre-push` is green.

### Epic 5: Client log relay `Complete`

- **5.1 The client wrapper.** Browser call sites log through a client wrapper that prints to the browser console immediately and posts the same log to a server relay. The set of client call sites is closed and declared in code — a call names a declared key rather than inventing a tag — mirroring how the settings registry fixes the set of settings. The console print is immediate and ungated: a developer's devtools level filter is theirs, not an admin's to set remotely. An `Error` passed as context is flattened to its name, message, and stack before the call, because an `Error` can't survive the serialization boundary intact. Nothing awaits the post; a failed post never surfaces to the user or changes the caller's control flow.
- **5.2 The relay.** A route handler at a stable, documented path accepts a declared key, level, message, and context, and forwards them to the existing request wrapper — it does not write to the log table itself, so the threshold check and the deferred write stay in one place. It constructs the tag itself from the key under a `client-` namespace, so a browser cannot produce a tag outside that namespace or forge one belonging to a server seam. An unknown key is rejected. Cross-origin posts are rejected. Context is validated as a plain object or absent, and over-cap context is truncated rather than dropped, with the row recording that truncation happened so an admin reading it isn't misled. Where a session is present it reads it server-side and attaches the user id — the only field in a relayed row that isn't a browser claim. Absence of a session is normal and never blocks the write. Design and trade-offs settled in [ADR-0007](../adr/ADR-0007-client-log-relay-unauthenticated.md).
- **5.3 The browser sweep.** The five browser call sites move onto the wrapper: the three route error boundaries, the avatar storage module, and the auth form error extractor. The error boundaries pass the error digest they already hold, which is the correlation key back to the server-side stack for the same error. The auth form error extractor's callers pass the attempted email — the one case where attribution matters most and a session can't supply it, since the failure *is* the absence of a session.
- **5.4 The server-only boundary made real.** The request wrapper becomes genuinely unimportable from a client bundle rather than conventionally so. With two near-identically-shaped wrappers now sitting side by side, a shared module importing the wrong one would silently pull the service client toward the browser bundle — the boundary needs to fail the build, not rely on a reader noticing. `logging.mdc` currently claims this enforcement exists; the claim becomes true.
- **5.5 The exposure documented.** README documents that the relay is an unauthenticated write path into the log table, states plainly that the template ships no rate limit, and tells a deployer how to add one — naming Vercel's WAF concretely as the worked example. A stable path is what makes that possible: every firewall rate-limits by path, and none durably rate-limits a Server Action. `logging.mdc`'s server-only section is corrected to match the code, and its exemption table is regrouped by *why* each surface is exempt rather than listing unlike files flat — wrapper internals (logging through the wrapper recurses), bootstrap path (fires only when the credentials persistence needs are absent), and not-application-logging (CI output, interactive stdout, test spies). Epic 6's guardrail derives its exemptions from this table, and a spinoff adding a surface needs the category, not a precedent to pattern-match against.

*Success:*
- A browser call site prints to the browser console immediately and produces a row tagged under `client-`, distinguishable from a server log about the same subject.
- An unknown key produces no row.
- A cross-origin post to the relay is rejected.
- A below-threshold client call still prints in the browser console and produces no row.
- An `Error` passed as context arrives with its name, message, and stack.
- Over-cap context lands truncated, and the row shows that it was truncated.
- A relayed row from a signed-in browser carries the user id; one from a signed-out browser carries none and still lands.
- No raw `console.*` remains in the five browser call sites.
- Importing the request wrapper from a client module fails the build.
- README documents the relay's unauthenticated write path and how to rate-limit it.
- `logging.mdc`'s server-only claim matches the code, and its exemption table is grouped by category with each surface's real reason.
- `pnpm pre-push` is green.

### Epic 6: Raw console guardrail `Complete`

- **6.1 The guardrail.** A check rejects raw `console.*` outside the wrapper across the swept surfaces, so new ones can't creep back in; the CI check scripts stay exempt. A new `check:*` pairs one-to-one with a hard-constraint entry, so this routes through the AGENTS.md change protocol as a deliberate addition. It sequences after both sweeps — its passing state is only meaningful once every existing call site, server and browser alike, has moved.

*Success:*
- The guardrail fails on a planted raw `console.*` in a swept surface and passes clean on the codebase.
- CI check scripts are exempt and still pass.
- The change protocol is followed and the hard-constraint statement matches enforcement.
- `pnpm pre-push` is green.

### Epic 7: Log retention purge `Complete`

- **7.1 Logs purge on a schedule.** Logs older than the retention window are deleted by the database on a schedule, with the window read from settings so an admin changes it without a migration or a redeploy — the settings store's second real consumer. Scheduling is established by migration and tracked in source control like any other schema change, and setup docs note that it enables a database extension. Admin CLI privilege-change events get no exemption; retention is uniform.

*Success:*
- The scheduled job exists after migrations run.
- Rows older than the window are gone after a run; newer rows survive.
- Changing the retention setting changes what the next run deletes, with no migration or redeploy.
- Setup docs note the extension.
- `pnpm pre-push` is green.

### Epic 8: Logs page — browse `Complete`

- **8.1 Browse logs.** A new admin page lists logs newest-first — timestamp, level badge, tag, and a truncated single-line message — with a row expanding on click to reveal the full message and its context. Paging is cursor-based on the timestamp rather than offset, because the table is written to concurrently and offset paging drifts and slows under inserts. Mockup: `.mockups/admin_logs_page.html`.
- **8.2 Copy a row.** A row copies its message and formatted context to the clipboard, reusing the error panel's existing copy pattern, for pasting into an AI chat or elsewhere.
- **8.3 Sort direction.** The timestamp header flips between newest- and oldest-first. It's the only sort control on the page — no other column sorts, since paging depends on a single stable key and the filters cover what sorting would.

*Success:*
- Rows show timestamp, level, tag, and truncated message; expanding one reveals the full message and context.
- Paging stays consistent while rows are being inserted.
- Flipping direction re-pages correctly from the top.
- Copy places the message and formatted context on the clipboard.
- No column but timestamp offers any sort affordance.
- The page is admin-gated.
- `pnpm pre-push` is green.

### Epic 9: Logs page — triage `Complete`

- **9.0 Shared stat-tile filter primitive.** A reusable stat-tile component (label, count, color role, resting vs. selected visual state) and a `useToggleFilterSet<T>()` hook (a `Set` of active values, click-to-toggle, a designated "clear all" value) — extracted here since this is the first of two pages that need it. Epic 12 consumes both rather than re-implementing.
- **9.1 Stat-tile filters.** Six stat tiles built on 9.0's primitive replace the originally-planned multi-select chips — Total, Debug, Info, Warn, Error, Unread — each a global count unaffected by other active filters. Resting state: light tint background and thin (0.5px) border in role color — gray for Total/Debug, blue for Info, amber for Warn, red for Error, purple for Unread. Selected state: bold 2px border, same fill. Debug/Info/Warn/Error/Unread are independently multi-selectable; Total is never itself selected and clicking it clears any active selection among the other five. Tag stays a separate searchable dropdown, populated from tags actually present, composing with tile selections and search. Mockup: `.mockups/admin_logs_page.html`.
- **9.2 Search.** A free-text bar matches against message, context, and tag by substring — right-sized given the purge keeps the table small, revisited only if volume ever makes it slow. Tag is included so a cluster of one tag is findable by search, which is what a tag sort would otherwise have been for.
- **9.3 Read state.** Read/unread is global rather than per-admin, since a template can't know how many admins a spinoff has and shared read state is the simpler default. Unread rows use a light purple row tint and a purple dot in the leading column (matching the Unread tile). Opening the detail dialog marks an unread row read; the dot still supports mark-read without opening. Read logs can be set back to unread via a **Mark unread** control in the detail dialog. Bulk **Mark all as read** remains scoped to the current filter view (tiles + tag + search). Nothing auto-marks on page load or scroll.

*Success:*
- The shared stat-tile component and toggle-filter hook exist as consumable modules, not page-local code.
- Tile counts reflect global totals, not the filtered view.
- Level tiles and Unread toggle independently of each other; Total clears all tile selections.
- Tag search and free-text search compose with tile selections and paging.
- Unread rows are visually distinct (purple row tint and dot); opening a row marks it read; **Mark unread** in the detail dialog restores unread state; "mark all as read" affects only rows in the active filter view.
- Nothing auto-marks on page load or scroll.
- Search matches against message, context, and tag.
- `pnpm pre-push` is green.

### Epic 10: Debug logs at the three seams `Complete`

- **10.1 The session seam.** Session and proxy decisions emit debug logs — token refreshed versus reused, claims read while expired — so the boundary [ADR-0005](../adr/ADR-0005-proxy-as-sole-session-authority.md) settled can be watched live rather than inferred from a stack trace.
- **10.2 The settings seam.** Settings cache invalidations emit debug logs on save — so a stale-settings report is diagnosable instead of guessed at.
- **10.3 The avatar storage seam.** Avatar upload and delete emit debug logs covering the success path, including the case where a storage delete fails without blocking the profile update.

*Success:*
- With the threshold at debug, a single pass through sign-in, a settings save, and an avatar upload produces a legible trace on the logs page.
- With the threshold at info, none of them appear.
- No seam's control flow or behavior changes as a result of its logging.
- `pnpm pre-push` is green.

### Epic 11: Structured copy standardization

- **11.1 The shared primitive.** A new helper — `buildStructuredCopyText(fields: Record<string, unknown>)` — takes a plain object, omits any key whose value is `null` or `undefined`, and returns the result as pretty-printed JSON (2-space indent). This is the one place the omit-nullish + pretty-print logic lives.
- **11.2 `buildLogRowCopyText` moves onto the primitive.** Epic 8's log-copy helper keeps its own field shape (`timestamp`, `level`, `tag`, `message`, `context`) but delegates the omit + format step to `buildStructuredCopyText` instead of doing it inline. Behavior and output are unchanged — this is a refactor, not a format change.
- **11.3 `buildErrorCopyText` moves onto the primitive.** The error panel's clipboard helper delegates to `buildStructuredCopyText` instead of its current inline message + context text construction, carrying `message`, `code`, and `digest` as separate keys (rather than the UI's combined `code · digest` chip format) — `digest` omitted when absent. Unlike 11.2, this does change the output — from text to pretty-printed JSON — since the error helper isn't JSON-shaped today. Every `ErrorPanel` copy across the app (auth errors, admin route errors, form faults) picks up the new format automatically, since they all go through the one helper.

*Success:*
- `buildStructuredCopyText` omits nullish keys and pretty-prints JSON; both callers produce identical output to before the refactor (11.2) or the intended new shape (11.3).
- `buildLogRowCopyText`'s existing tests pass unchanged after delegating to the primitive.
- `buildErrorCopyText` output is valid, pretty-printed JSON with `message`, `code`, and (when present) `digest` as separate keys; existing `ErrorPanel` copy button behavior (Copy → Copied, `aria-live`) is unchanged — only the clipboard payload's shape changes.
- Every call site of `buildErrorCopyText` continues to compile and pass existing tests updated for the new shape.
- `pnpm pre-push` is green.

### Epic 12: Users page — stat tile filters

- **12.1 Stat tiles.** Three tiles above the users table — Total, Unverified, Banned — built on Epic 9.0's shared stat-tile primitive, each a global count unaffected by search or the other tile's state. Unverified and Banned toggle independently via the shared hook (a user can be both, however rare in practice). Total is unfiltered and clears both. Mockup: `.mockups/admin_users_page.html`.
- **12.2 Verified filter in `admin_list_users`.** The listing function gains an unverified-only filter flag, same treatment as Epic 14's banned flag (Phase 11): a signature change means the migration must drop and recreate the function (create-or-replace with new params creates an overload, not a replacement), and "verified" is derived once, read by both the new filter and the existing Verified column/sort.
- **12.3 Filter plumbing.** Both tile toggles travel from the table through the Server Action to the RPC, validated at the boundary, participate in the query cache key, and compose with search and paging. Banned + Unverified simultaneously is allowed, not blocked, and can legitimately return zero rows.
- **12.4 Retire the "Show banned" checkbox.** Remove Epic 14's checkbox (Phase 11) and its checked-by-default behavior — the Banned tile replaces it. Default view is Total: fully unfiltered, consistent with Epic 14's original "shows its full set unless asked otherwise" principle.

*Success:*
- No duplicate stat-tile or toggle-filter code exists between the logs and users pages — both consume Epic 9.0's primitives.
- Tiles show global Total/Unverified/Banned counts regardless of search or the other tile's state.
- Clicking a tile toggles it; Total clears both.
- Both filters compose with search and paging without breaking existing sort/paging behavior.
- Unverified + Banned can both be active and legitimately show zero rows.
- No "Show banned" checkbox remains anywhere in the UI; the default view is unfiltered.
- `pnpm pre-push` is green.

---

## Notes

- **Two ADRs written during this phase's planning** — [ADR-0006](../adr/ADR-0006-settings-reads-cached-under-one-coarse-tag.md) settles the caching design behind Epic 1.3. [ADR-0007](../adr/ADR-0007-client-log-relay-unauthenticated.md) settles Epic 5's relay: why it takes no session, why it's a route handler rather than a Server Action, and why the template ships no rate limit. Nothing else in the phase clears all three bars.
- **Dependencies:** Epic 1 before Epics 3.4 and 7 (both read settings). Epic 3 before Epics 4, 5, 7, and 10 (all need a wrapper). Epics 4 and 5 before Epic 6 — the guardrail's clean-pass criterion is meaningless until both sweeps have landed, and sequencing it after both means no swept site ever enters its exemption list. Epic 5 before Epic 10 — story 10.3's avatar upload path runs in the browser and needs the relay. Epic 8 before Epic 9 (same page). Epic 8 before Epic 11 — the shared primitive is extracted from `buildLogRowCopyText`, which Epic 8 creates. Epic 10 before Epic 11 (last): Epic 11 isn't observability-themed — it's a copy-format cleanup riding at the end of the phase since it's small and depends on Epic 8's helper existing. Epic 9 before Epic 12 — Epic 12 consumes the shared stat-tile component and toggle-filter hook that Epic 9.0 extracts; Epic 12 also depends on Epic 14 from Phase 11 (extends `admin_list_users`) but has no dependency on anything else in this phase.
- **Epics 8 and 9 deliberately split one page across two epics.** The logs page's scope is more than one context window holds. The intermediate state — a logs page with no filters — is real but harmless, since nothing ships to users mid-phase.
- **Epic 3.4's threshold criterion is server- and CLI-scoped.** "A below-threshold call produces neither console output nor a row" holds for `appLog` and `cliLog`. Epic 5's client mirror deliberately prints regardless of threshold — the browser console has its own per-developer level filter, and gating it on an admin setting would both invert that ownership and reintroduce the staleness window ADR-0006 exists to prevent. Epic 3 is shipped; its criterion isn't rewritten.
- **Known gap: nothing rate-limits the relay.** A closed key set, a context size cap, threshold gating, and Epic 7's purge all bound what a relayed row *is*; none bounds how many. Accepted at template scope and recorded in ADR-0007, which carries the rationale and the mitigation — so this is not a ROADMAP open question.
- **`src/utils/env.ts` (`loadServiceEnvForCli`) is permanently and correctly exempt.** Not deferred work — there is nothing to fix. It's a bootstrap-path log: it fires only when `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_SECRET_KEY` is missing, which are the same credentials the wrapper's threshold read and persisted write both depend on. Routing it through `cliLog` would replace a clean "add it to `.env.local`, exiting" message with an unhandled throw from `getServiceSupabaseEnv()`, at the exact moment a developer is trying to learn what they forgot — and the row could never persist anyway. Same category as `persist-app-log.ts`'s recursion guard: raw `console.*` is the correct answer, not a compromise. `logging.mdc` currently records the wrong reason for this exemption ("reachable from client bundle"); story 5.5 corrects it.
- **Epic 10.2 cache hit/miss dropped (settled at Epic 10 ship):** read-path hit/miss logging was scoped out because `appLog`'s threshold check reads `min_log_level` via `getAppSetting` → `getResolvedAppSettings`; instrumenting that read path would recurse through the logger itself. Invalidation-on-save remains the diagnostic surface.
- **Epic 10.3's avatar seam is split across environments.** The delete-failure case it names is already server-side in `updateProfileAction`. Avatar *upload* is browser → storage direct — the server never sees it — so its debug logs go through Epic 5's relay.
- **Hard-constraint changes in this phase:** Epic 5 widens the auth boundary for `/api/client-logs` ([ADR-0007](../adr/ADR-0007-client-log-relay-unauthenticated.md)). Epic 6's raw-console guardrail is a separate hard-constraint addition.
- **No new LEXICON terms.** Settings registry, wrapper, relay, and tag are implementation vocabulary, not domain terms meaningful to a domain expert.
- **Epic 3.4 CLI threshold read (settled at Epic 3 ship):** the CLI variant loads the threshold once at process start via a direct settings read — no request cache outside Next.js.
- **Epic 5 payload caps (settled at Epic 5 plan):** message length 2,000 characters; context JSON 8,192 bytes (deterministic key drop + `contextTruncated` flag when over cap).
