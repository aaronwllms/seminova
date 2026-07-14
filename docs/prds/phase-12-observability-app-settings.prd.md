# PRD — Phase 12: Observability & App Settings

**Status:** `Draft`
**Last updated:** 2026-07-14

---

## Problem

Two related gaps. First: logs have a canonical taxonomy (`logging.mdc` — debug/info/warn/error, `[kebab-case-tag]` convention) but only ever surface in Vercel's log viewer — there's no in-app way to browse, filter, or triage them, and no persistence beyond whatever Vercel retains. Second: the template has no admin-editable configuration store at all. Any runtime toggle (starting with "is debug logging on") requires an env var and a redeploy to change — which doesn't fit a template meant to give every spun-off product a way to flip settings live.

This PRD was fully grilled in a planning chat before decomposition into epics/stories. What follows is the settled-decisions ledger from that session, in the order they were made, with rationale kept — not a summary. Epic/story decomposition happens next, via `/phase-planning`, using this ledger as its input.

## Goal

Ship a generic, admin-editable settings store (settings table + registry + admin page), and a log-persistence system (logs table + wrapper + admin page) whose first real consumer is the settings-driven debug toggle — proving the settings infrastructure works by using it for something real, not a demo.

## Out of scope

- `scripts/checks/*.mjs` (CI hard-constraint check scripts) — stay on plain `console.*`. Not application logs; muddies a page meant for runtime app behavior.
- Ad-hoc setting creation from the admin UI — the set of settings is fixed in code (a registry), admins edit values only.
- Per-admin read state on logs — read/unread is global, not per-user.
- General column sorting on the logs table — filters handle narrowing; sorting is scoped to a single newest/oldest timestamp toggle only (breaking this would break cursor pagination's stable sort key).

---

## Settled decisions (grilled, pre-decomposition)

1. **Two distinct capabilities, likely two epics minimum:** generic app-settings store, and log persistence + viewer. Not folded into Phase 11 — this is new capability, not correction/hardening.
2. **Two new admin pages:** one for settings, one for logs.
3. **Logs persist to a table**, not a relay of Vercel's log stream. Rationale: a stream-relay would depend on Vercel's log API/auth from inside the app, breaking portability the moment a spinoff deploys elsewhere. A table is Supabase-first, matching how everything else here works.
4. **Custom thin wrapper, not Pino/Winston.** Both libraries are built around a transport model (persistent worker thread/stream) that assumes a long-running process. Vercel functions are short-lived; an async transport can be torn down before it flushes, silently dropping log rows. Neither has a maintained Postgres/Supabase transport anyway. The wrapper is ~20-30 lines: do what `console.*` already does, plus a gated insert.
5. **Every existing `console.*` call site in scope gets routed through the wrapper** (see decision 26 for final scope), with a grep-based CI guardrail added afterward to prevent new raw `console.*` calls from creeping back in outside the wrapper itself.
6. **Generic key/value settings store.** Not boolean-only — value type varies per setting (the debug toggle is boolean, log retention window is a number, a future maintenance message would be a string). Stored as `key` (text) + `value` (jsonb), so new settings of any shape don't require a schema change. Logging's debug toggle is the first consumer, not the only one the design assumes.
7. **Dependency ordering:** settings infrastructure must land before the debug gate that reads from it. Settings-store epic(s) sequence ahead of the log-persistence debug-gate work.
8. **Retention: time-based auto-purge via `pg_cron`**, window stored as a settings value (dogfoods the settings store). `pg_cron` is enabled and the purge job is scheduled via a migration — plain SQL (`create extension if not exists pg_cron`, `cron.schedule(...)`), tracked in source control like any other migration. **No plan-tier gate** — verified directly against Supabase's own docs and user's own free-tier project; an earlier claim that pg_cron requires a Pro plan was wrong (traced to a low-quality third-party blog, not Supabase's docs) and has been retracted. No README caveat needed beyond noting the migration enables the extension as part of setup.
9. **Settings reads go through Next.js's tagged server data cache** (`revalidateTag`), one coarse `app-settings` tag over the whole settings set, invalidated by the settings-save mutation calling `revalidateTag('app-settings')`. Chosen over a plain time-based `revalidate` TTL because `revalidateTag`'s underlying cache is shared across serverless instances (unlike a hand-rolled in-memory cache, which is per-instance and can't be busted globally on write) — so an admin's save propagates near-instantly everywhere, not just to whichever instance handled the save request. Coarse (one tag for the whole settings set) rather than per-setting tags, because the settings table is small — reading the whole set on any single change costs almost nothing, and per-setting tags would add tag-management complexity to avoid a cost that rounds to zero. A future setting holding something large/expensive to compute could get its own finer tag later without unwinding this design.
   **→ ADR candidate, likely ADR-0006** (confirm actual next number against `docs/adr/` at write time). Qualifies on all three bars: hard to reverse (foundation every settings read and future toggle builds on), surprising without context (why cached this way, why one tag), real trade-off (coarse over-invalidation accepted for simplicity; tag-based chosen over TTL for cross-instance freshness).
10. **Error/context detail folds into one generic `context` jsonb column**, not a dedicated `error_detail` column. An `Error` or Supabase/Postgrest error is one shape of context, not a fundamentally different thing from arbitrary structured extras (`{ postId, userId }`) a call site might want to attach.
11. **Copy-row button on the logs page** reuses the existing `error-panel.tsx` copy pattern (copies `message` + formatted `context`) — no new column needed, purely a UI affordance for pasting into an AI chat or elsewhere for research.
12. **Read/unread tracking is global**, not per-admin: a single nullable `read_at` timestamp column on the log row. Rationale: this is a template and the number of admins per spinoff is unknown; global read state is the simpler default (same shape as a shared Slack channel vs. per-user read receipts), and most small teams don't need per-person read state on an internal tool. "Mark all as read" is a bulk update where `read_at is null`.
13. **Wrapper is fire-and-forget at the call site** (`void`, not `async` — no `await` added anywhere, no ripple making sync functions async). Internally, the wrapper does `console[level](...)` synchronously (unchanged from today) and defers the Supabase insert via Next.js's `after()` (from `next/server`, Next.js 15.1+). Verified: `after()` is built on Vercel's `waitUntil` primitive and works in both the Node.js and Edge runtimes — extends the function's lifetime just long enough for the deferred promise to settle, without blocking the response or requiring the caller to await anything. This avoids the same silent-drop risk that ruled out Pino/Winston's transport model (decision 4), without touching call-site control flow.
14. **`tag` is a required, explicit wrapper argument** — not parsed via regex from a bracketed message string. The sweep splits each call site's existing `[bracket-prefix]` out of the message into its own `tag` argument. Chosen over regex-parsing the bracket at insert time because a required argument makes a missing/malformed tag a compile-time TypeScript error at the call site, not a silent null/garbage value discovered later on the admin page — worth the extra per-site sweep editing given tag is a primary filter dimension on the logs page.
15. **Logs page filter bar:** level (multi-select colored chips matching row colors), tag (searchable dropdown, populated from distinct tags in the table), read status (All / Unread only), plus a "mark all as read" button scoped to the current filter view.
16. **Logs page row:** timestamp, level badge, tag, message (single line, truncated, expand-on-click to reveal full message + context), copy button (decision 11), unread visual indicator (bold/dot, same pattern as unread email).
17. **Cursor-based pagination on `created_at`**, newest-first by default. Chosen over offset pagination because the table is actively written to; offset pagination gets slow and inconsistent under concurrent inserts.
18. **Read marking is explicit only** — per-row click or the bulk "mark all as read" button. No auto-mark on scroll-into-view or on page load; auto-marking on view was explicitly rejected because it defeats the point of read/unread as a triage tool (everything would read as "read" the moment the page loads, whether actually looked at or not).
19. **Free-text search bar** on the logs page, searching `message` (and `context` cast to text) via `ILIKE '%term%'` — not Postgres full-text search (`tsvector`/`ts_rank`). `ILIKE` is right-sized given expected volume, especially with the retention purge (decision 8) actively keeping the table small; revisit only if the table ever grows large enough for `ILIKE` scans to become slow.
20. **No general column sorting** on the logs table. Filters (level/tag/read status) handle narrowing, which is the better fit for a triage tool than reordering a mixed list. Also a technical constraint: cursor pagination (decision 17) requires one stable sort key; supporting arbitrary sort columns would require rebuilding pagination around composite cursors for a need the filters already cover.
21. **Exception: a newest/oldest direction toggle on the Timestamp column header** (chevron/arrow, click to flip) — not a new sort dimension, just flipping direction on the one sort key that already exists. Cursor pagination handles a direction flip trivially (same key, opposite comparison).
22. **Settings are a fixed set — admin edits values only, no ad-hoc key creation from the UI.** A setting an admin invents from a generic "add setting" form is inert unless code somewhere actually reads that exact key; a free-form add-key UI also has no way to validate value shape (e.g. someone typing a string into what code expects as boolean). Store being flexible in *value type* (decision 6) doesn't imply it should be flexible in *what keys exist* — those are different axes.
23. **Settings are declared in a central registry** (e.g. `settings-registry.ts`): key, human-readable label, description, value type, default value. Single source of truth, same pattern as `AGENTS.md`'s canonical schema and `LEXICON.md`'s vocabulary. The settings admin page renders whatever's in the registry — a new setting is a registry entry, not a settings-page code change.
24. **Registry (code) and settings table (database) are companions, not alternatives.** Registry defines what's possible and supplies defaults; table holds actually-set live values per spinoff project. Settings page reads both (registry for metadata/shape, table for current value, falling back to the registry default if no row exists yet) and writes only to the table — saving never touches the registry.
25. **Settings page layout:** grouped list of setting blocks (label bold, description in muted text below, typed input control — toggle/number/text — aligned right), grouped by feature area once there's enough settings to warrant section headings (e.g. "Logging"). Not a table — settings have variable-length descriptions and heterogeneous controls, which don't fit uniform table columns the way logs' fixed-shape rows do. Per-row Save (not one page-wide save button), toast confirmation per save reusing the existing toast pattern (colored via the real `success` token from Phase 11 Epic 3).
26. **Sweep scope, finalized against real numbers** (console-call-site audit run 2026-07-14 — see appendix): `src/`'s 23 call sites via the main async-deferred wrapper (decision 13), plus `scripts/admin/`'s call sites — `promote-admin`, `demote-admin`, `list-admins`, and their shared `scripts/admin/lib/cli.ts` — via a second wrapper variant (decision 27). `scripts/checks/*.mjs` (CI hard-constraint scripts) stay out of scope and stay on plain `console.*` — these are CI/dev-facing output, not application runtime logs, and persisting them would muddy a page meant for "what's happening in my running app."
27. **Two wrapper variants**, not one stretched to fit both contexts: the request-context wrapper (decision 13, `after()`-deferred) for `src/`, used inside Next.js request handlers; and a simpler CLI variant for `scripts/admin/` that directly `await`s its Supabase insert — safe there because CLI scripts run to completion and exit, with no serverless teardown race to guard against, so `after()` isn't needed and doesn't apply (no Next.js request context to extend the life of).
28. **Non-conforming tags in `src/` need manual handling in the sweep, not mechanical find-replace:** `map-users-action-fault.ts:8` (first arg is a variable `logTag`, not a bracket-prefixed string literal) and `run-role-mutation.ts:92` (tag is interpolated mid-message, not a clean leading prefix). Both need the sweep to look at what the variable/interpolation actually holds and split it into a proper explicit `tag` argument.
29. **No retention exemption for admin-CLI audit events** (promote/demote/list-admins) — same purge schedule as all other logs (decision 8). Considered exempting privilege-change events from the purge as audit records, but decided uniform retention is fine.

---

## Appendix: console call-site audit (2026-07-14)

Scope: `src/`, `scripts/`. Excluded: `node_modules`, `.next`, build output, test/mock files. No matches in `proxy.ts`, `next.config.ts`, or `eslint-rules/`.

| Method | `src/` | `scripts/` | Total |
|---|---|---|---|
| `console.debug` | 0 | 0 | 0 |
| `console.info` | 0 | 0 | 0 |
| `console.warn` | 3 | 4 | 7 |
| `console.error` | 20 | 11 | 31 |
| `console.log` | 0 | 13 | 13 |
| **All methods** | **23** | **28** | **51** |

- Zero `console.debug`/`console.info` usage anywhere — the taxonomy's debug/info levels are currently unused in practice.
- `console.log` exists only in `scripts/` (CLI + CI check scripts); none in `src/`.
- No call site (of the 51) passes more than two arguments — confirms the wrapper's `(tag, message, context?)` signature covers every real case with no redesign needed.
- Non-conforming-tag call sites (5 total, repo-wide): `map-users-action-fault.ts:8`, `run-role-mutation.ts:92` (both in `src/`, in sweep scope — see decision 28), plus three in `scripts/` (`cli.ts:104`, `prompt.ts:9`, `vitest-file.mjs:7`) which fall outside the Phase 12 sweep scope (decision 26) except where they live in `scripts/admin/lib/cli.ts`, which *is* in scope as part of the promote/demote/list-admins sweep.
- Highest concentration: `scripts/admin/lib/cli.ts` (13 sites, in scope), `src/supabase/require-auth.ts` (4, in scope), `src/utils/avatar-storage.ts` (3, in scope).

---

## Next step

Run `/phase-planning` against this PRD to decompose the settled decisions above into epics and stories, following the same vertical-slice / single-source-of-truth conventions used in Phase 11.
