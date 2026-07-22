# Test Audit — seminova

Last full audit: 2026-07-22
Last synced: 2026-07-22 (full pass)
Scope: test suite health and adherence to `.cursor/rules/testing.mdc`

## Executive summary

- Suite stable since the 2026-07-22 do-next wave: **145** test files, **688** tests, **87.83%** stmts/lines — ~8 pts above the 80% floor.
- Do-next wave (TS009–TS018) remains resolved; no new Critical or High findings.
- Open backlog is four **Deferred** coverage gaps (TS020–TS022, TS027) — settings merge faults, banner link rendering, logs tag combobox, and users refresh-hook timing.
- Auth, proxy, require-auth, profile mutations, client-logs relay, and admin action layers stay strong — see **Verified OK**.
- Three integration table/settings suites (`banner-setting-row`, `users-table`, `logs-table`) run 2.6–3.4s each with individual cases up to ~1s; Vitest slow-test output stays advisory only (no CI gate).
- Accepted over-testing on shared chrome render pins (TS025–TS026) and low-priority motion/wrapper gaps (TS023–TS024) unchanged.

## Suite mental model

| Metric                           | Value                                                            |
| -------------------------------- | ---------------------------------------------------------------- |
| Test files (Vitest)              | 145 (137 in `src/`, 7 in `scripts/`, 1 eslint boundary)          |
| Tests                            | 688 passed (145 files)                                           |
| Unit : integration (by filename) | 113 : 24 in `src/` (0 unsuffixed in `src/`)                      |
| Total test LOC                   | ~14.9k in `src/` + scripts                                       |
| CI command                       | `pnpm test:ci` (`vitest run --coverage`)                         |
| Coverage thresholds              | 80% lines / branches / functions / statements                    |
| Actual coverage                  | 87.83% stmts/lines                                               |
| Slow-test flag                   | Vitest default 300ms advisory only — **no CI fail-on-slow gate** |
| Skips / snapshots                | 0 skips; 0 snapshots (ESLint-enforced)                           |

**Shape:** Heavy unit coverage on utils, hooks, and admin `_lib/` helpers; integration coverage on auth forms, profile settings, confirm route, client-logs relay, landing auth slots, admin auth gate, session-flow, and admin UI tables/settings rows (correctly `.integration`). Marketing static sections correctly have no render tests. MSW global setup remains deferred; Supabase/auth use `vi.mock` at module level.

**Exclude list:** `vitest.config.ts` excludes pages/layouts/UI/providers/client factories; workflow static sections are named individually so `workflow-diagram.tsx` stays measured; all `reference/_components/**` demo shells are excluded while `reference/_lib/**` stays measured; OG segment files carry a `// debt:` note.

## Open

Actionable backlog only. `Status`: `Do next` | `Deferred` | `Needs decision`.

| ID    | Status   | Category      | File:Line                                                    | Severity | Description                                                                                                                                                                                                             | Recommendation                                                                                                                                                            |
| ----- | -------- | ------------- | ------------------------------------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TS020 | Deferred | Coverage gaps | `src/utils/app-settings.ts:24-26`, `37-41`, `77-82`          | Medium   | `app-settings.ts` at **80.7%** — `app-settings.unit.test.ts` covers happy merge only; DB select error, invalid stored value throw, and `getAppSetting` path still unhit.                                                | Two unit cases: select error propagates; bad stored value throws tagged message. Home: next threshold-pressure epic or when settings persistence changes.                 |
| TS021 | Deferred | Coverage gaps | `src/components/banner-message.tsx:19-38`                    | Medium   | Component **60.97%**; `parse-banner-message.unit.test.ts` thorough, but bold / internal `Link` / external `<a>` render branches (lines 20–39) unhit.                                                                    | One focused unit: message with bold + `/path` link + `https://` link asserts roles/hrefs. Home: next banner UX pass.                                                      |
| TS022 | Deferred | Coverage gaps | `src/app/admin/logs/_components/logs-tag-combobox.tsx:17-36` | Medium   | Tag combobox **35.87%** with no dedicated tests; `logs-table.integration.test.tsx` mocks tags but does not exercise open/filter/select/outside-click.                                                                   | Small integration: open → filter → select tag → `onTagChange`; outside click closes. Home: next logs-table trim so coverage isn’t duplicated.                             |
| TS027 | Deferred | Coverage gaps | `src/app/admin/users/_lib/use-admin-users-refresh.ts:16-42`  | Low      | Refresh hook **38.23%** with no dedicated tests; min-visible spinner delay (lines 29–41) untested while the parallel logs refresh path has fake-timer unit coverage in `use-admin-logs-realtime.unit.test.tsx:173-233`. | Add `use-admin-users-refresh.unit.test.tsx` mirroring the two refresh timing cases from `use-admin-logs-realtime.unit.test.tsx`. Home: next users-table maintenance pass. |

## Accepted

Deliberately not doing now. Not a todo list.

| ID    | Category      | File:Line                                                                                      | Severity | Description                                                                                                                | Why accepted                                                                                         | Reopen when                                           |
| ----- | ------------- | ---------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| TS023 | Coverage gaps | `src/hooks/use-password-accordion-scroll.ts:26-87`                                             | Low      | Accordion scroll tween ~55%, untested.                                                                                     | UX motion helper, not a trust boundary; TypeScript + visual review suffice.                          | a11y/scroll bugs ship on password accordion           |
| TS024 | Coverage gaps | `src/components/authenticated-banner-slot-entry.tsx:7-25`; `public-banner-slot-entry.tsx:8-27` | Low      | 0% thin RSC entry wrappers.                                                                                                | Logic lives in `resolveLiveBannerSlot` + slot components (already tested).                           | entries gain branching or non-trivial props           |
| TS025 | Over-testing  | `src/components/seminova-logo.unit.test.tsx:6-11`; `site-header.unit.test.tsx:15-30`           | Low      | Render-only tests on shared chrome reachable in normal dev flow — conflicts with `testing.mdc` render-only rule.           | Cheap regression pins for wordmark/nav composition; low maintenance cost.                            | suite-trim pass or chrome layout regressions multiply |
| TS026 | Over-testing  | `src/app/(app)/_components/profile/profile-settings-form.integration.test.tsx:154-239`         | Low      | Duplicate in-flight blur-save cases for display name and bio; same contract already in `use-blur-save-field.unit.test.ts`. | Cross-field avatar↔name concurrency cases are the distinctive form-level risk; mild redundancy only. | trimming the 420-line profile integration suite       |

## Quick wins

_All Do-next quick wins through TS018 resolved 2026-07-22._

## Verified OK

- **`extract-auth-form-error.unit.test.ts`:** Security-sensitive override table + logging contracts — appropriate depth.
- **`proxy.unit.test.ts` (41 tests) + `proxy.no-env` + `auth-session-flow.integration.test.ts`:** Auth boundary breadth is intentional; hard-constraint `check:auth-boundary` backed by these tests.
- **`require-auth.unit.test.ts` (~97%):** Display reads / expired-token probe paths covered.
- **`probe-session-action.unit.test.ts`:** Session trust probe at action boundary (success / error / null user).
- **`is-same-origin-relay-request.unit.test.ts` + extended `route.integration.test.ts`:** Malformed Origin, Referer-only, invalid JSON 400, session-probe catch 202, outer fault 500.
- **`logs/actions.unit.test.ts`:** Invalid sortDirection, invalid list filters, fault rejects per action family.
- **`avatar-cache-bust` / `avatar-storage` / `is-safe-redirect`:** Host spoofing, ownership, malformed URL — security utilities, not redundant permutations.
- **Profile `actions.unit.test.ts` + `profile-settings-form.integration.test.tsx`:** Partial updates, avatar ownership rejection, blur-save H/I/B — trust-boundary adequate (aside from mild TS026).
- **Admin users action layer** (`list-actions`, ban/role mutations): Gate, validation, success, fault covered at the action boundary.
- **`route-error-boundaries.integration.test.tsx`:** Parameterized app/admin/auth fault boundaries.
- **Marketing static / reference demo shells:** Correct per render-only rule; workflow static sections excluded by name so diagram stays measured; `reference/_components/**` excluded with `_lib` measured (TS019).
- **`users-table.integration.test.tsx` `toHaveClass('sr-only')` on loading label:** Allowlisted a11y contract pin (TS017 lint exception).
- **`active-filter-chips.unit.test.tsx`:** Shared chip show/remove/clear UX — table suites no longer duplicate chip matrices.
- **Admin table integration suites:** Trimmed to H/I/B representatives; `.integration` suffix after TS016 lint expansion.
- **`use-admin-logs-realtime.unit.test.tsx`:** Fake-timer refresh timing cases cover the logs-side min-visible spinner contract (parallel to TS027 gap on users hook).
- **Scripts tests outside coverage include:** Intentional — coverage scoped to `src/**`.
- **No quarantined skips, no snapshots:** ESLint `seminova-test/no-unquarantined-skips` and snapshot ban clean.
- **`vitest.setup.ts` global mocks** of `getAppSetting` / `persistAppLogRow` / `after` / `unstable_cache`: Appropriate suite-wide boundaries; `persist-app-log.unit.test.ts` uses `vi.unmock`.
- **Pyramid for forms/auth:** Login/sign-up/forgot/update-password, profile modal/password, confirm, client-logs, landing auth already `.integration` — skew is utils + correctly labeled admin UI integration.
- **`components/ui/sidebar/cookie.unit.test.ts`:** Owned cookie-parsing logic — reasonable despite `ui/` coverage exclusion.
- **High-churn sources (proxy, users-table, logs-table, login-form, require-auth):** All have dedicated integration or unit suites matching churn.
- **400+ line investigate signals** (`logs/actions.unit.test.ts`, `list-actions.unit.test.ts`, `profile-settings-form.integration.test.tsx`, `proxy.unit.test.ts`, `banner-setting-row.integration.test.tsx`): Read-through confirms H/I/B at action/UI boundaries, not duplicate permutations.

## Open questions

- ~~TS018 / TS009: Fail CI on any test ≥ 300ms unless allowlisted?~~ **Resolved:** keep Vitest advisory slow-test output only (no CI gate).
- ~~TS016: Rename `_lib/**` hook units mocking `@/supabase/client` to `.integration`?~~ **Resolved:** explicit `_lib/**` exclusion; only `_components/**` UI renames required.

## Resolved

- 2026-07-22 — **TS009:** `userEvent.setup({ delay: null })` applied across interactive suites; convention documented in `testing.mdc`.
- 2026-07-22 — **TS011:** `probe-session-action.unit.test.ts` — success, auth error, null user.
- 2026-07-22 — **TS012:** `route.integration.test.ts` — invalid JSON 400, session-probe catch 202, outer fault 500 + `appLog.error`.
- 2026-07-22 — **TS013:** `logs/actions.unit.test.ts` — invalid sortDirection, invalid list filters, fault reject per list/stats/tags/mark-read family.
- 2026-07-22 — **TS014:** `is-same-origin-relay-request.unit.test.ts` — malformed Origin, Referer-only allow, mismatched Referer deny.
- 2026-07-22 — **TS015:** Logs/users table suites trimmed (~25→11, ~21→11 tests); chip UX in `active-filter-chips.unit.test.tsx`.
- 2026-07-22 — **TS016:** `test-scope-naming` expanded (`@/supabase/client`, colocated `actions` under `_components/`); seven UI suites renamed `.integration`; `_lib/**` hook units stay `.unit`.
- 2026-07-22 — **TS017:** Banner preview/Save cases rewritten to role/name/text; ESLint bans `toHaveClass` and class-string `querySelector` in tests (sr-only allowlist).
- 2026-07-22 — **TS018:** Reference shipments sort in `reference-shipment-data.unit.test.ts`; hook suite ≤2 cases with `REFERENCE_SHIPMENTS_FETCH_DELAY_MS` stubbed to 0 under test.
- 2026-07-22 — TS019: Excluded `src/app/(marketing)/reference/_components/**` from coverage denominator (keep `reference/_lib/**`); coverage 82.33% → 88.26% stmts/lines; `testing.mdc` documents the pattern.
