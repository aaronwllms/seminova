# Test Audit — seminova

Last full audit: 2026-07-22
Last synced: 2026-07-22 (TS009–TS018 Do-next wave resolved; TS019 prior)
Scope: test suite health and adherence to `.cursor/rules/testing.mdc`

## Executive summary

- Suite grew sharply since 2026-07-06 (62 → **145** files, 272 → **688** tests) — Phase 14 admin tables, banners, logs realtime, and reference demos drove most of the expansion; post-trim table suites and reference hook collapse net −9 tests vs pre-wave peak.
- Coverage remains **~88%** stmts/lines after excluding `reference/_components/**` demo shells (TS019 resolved) — ~8 pts above the 80% floor; `reference/_lib/**` stays measured.
- **Do-next wave (TS009–TS018) resolved 2026-07-22:** probeSessionAction and client-logs fault paths covered; logs action validation/fault gaps closed; same-origin helper unit file added; admin table suites trimmed and renamed `.integration`; `active-filter-chips` shared unit added; banner preview assertions behavior-only; reference shipments delay stubbed in hook tests with sort moved to data unit; interactive suites use `userEvent.setup({ delay: null })`; ESLint expanded for test-scope naming and class-probe bans.
- Auth forms, proxy, require-auth, profile mutations, and security utils remain strong — see **Verified OK**.

## Suite mental model

| Metric                           | Value                                                            |
| -------------------------------- | ---------------------------------------------------------------- |
| Test files                       | 145 (unit + integration; 0 unsuffixed)                           |
| Tests                            | 688 passed                                                       |
| Unit : integration (by filename) | Integration share up after admin UI renames (TS016)              |
| Total test LOC                   | Lower after logs/users table trim (~15k → reduced)               |
| CI command                       | `pnpm test:ci` (`vitest run --coverage`)                         |
| Coverage thresholds              | 80% lines / branches / functions / statements                    |
| Actual coverage                  | ~88% stmts/lines (denominator unchanged)                         |
| Slow-test flag                   | Vitest default 300ms advisory only — **no CI fail-on-slow gate** |
| Skips / snapshots                | 0 skips; 0 snapshots (ESLint-enforced)                           |

**Shape:** Heavy unit coverage on utils, hooks, and admin `_lib/` helpers; integration coverage on auth forms, profile settings, confirm route, client-logs relay, landing auth slots, admin auth gate, session-flow, and admin UI tables/settings rows (now correctly `.integration`). Marketing static sections correctly have no render tests. MSW global setup remains deferred; Supabase/auth use `vi.mock` at module level.

**Exclude list:** `vitest.config.ts` excludes pages/layouts/UI/providers/client factories; workflow static sections are named individually so `workflow-diagram.tsx` stays measured; all `reference/_components/**` demo shells are excluded while `reference/_lib/**` stays measured; OG segment files carry a `// debt:` note.

## Open

Actionable backlog only. `Status`: `Do next` | `Deferred` | `Needs decision`.

| ID    | Status   | Category      | File:Line                                                    | Severity | Description                                                                                                                                 | Recommendation                                                                                                                                            |
| ----- | -------- | ------------- | ------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TS020 | Deferred | Coverage gaps | `src/utils/app-settings.ts:24-26`, `37-41`, `77-82`          | Medium   | `app-settings.ts` at ~80.7% — happy merge covered; DB select error, invalid stored value throw, and thin `getAppSetting` path under-tested. | Two unit cases: select error propagates; bad stored value throws tagged message. Home: next threshold-pressure epic or when settings persistence changes. |
| TS021 | Deferred | Coverage gaps | `src/components/banner-message.tsx:19-38`                    | Medium   | Component ~61%; parser unit-tested thoroughly, but bold / internal `Link` / external `<a>` render branches largely unhit.                   | One focused unit: message with bold + `/path` link + `https://` link asserts roles/hrefs. Home: next banner UX pass.                                      |
| TS022 | Deferred | Coverage gaps | `src/app/admin/logs/_components/logs-tag-combobox.tsx:17-36` | Medium   | Tag combobox filter/select/outside-click at ~36% with no dedicated tests; only indirectly touched via logs table.                           | Small integration: open → filter → select tag → `onTagChange`; outside click closes. Home: next logs-table trim (TS015) so coverage isn’t duplicated.     |

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
- **Scripts tests outside coverage include:** Intentional — coverage scoped to `src/**`.
- **No quarantined skips, no snapshots:** ESLint `seminova-test/no-unquarantined-skips` and snapshot ban clean.
- **`vitest.setup.ts` global mocks** of `getAppSetting` / `persistAppLogRow` / `after` / `unstable_cache`: Appropriate suite-wide boundaries; `persist-app-log.unit.test.ts` uses `vi.unmock`.
- **Pyramid for forms/auth:** Login/sign-up/forgot/update-password, profile modal/password, confirm, client-logs, landing auth already `.integration` — skew is utils + correctly labeled admin UI integration.
- **`components/ui/sidebar/cookie.unit.test.ts`:** Owned cookie-parsing logic — reasonable despite `ui/` coverage exclusion.

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
- 2026-07-06 — TS001: `listUsersAction` action-layer tests added to `actions.unit.test.ts` (non-admin, validation, success, fault).
- 2026-07-06 — TS002: Malformed-URL `catch` test added to `is-safe-redirect.unit.test.ts` (`http://[%`).
- 2026-07-06 — TS003: `uploadUserAvatar` tests added for userId mismatch, storage error, and non-`AvatarUploadError` re-wrap.
- 2026-07-06 — TS004: Parameterized `route-error-boundaries.integration.test.tsx` covers app/admin/auth fault boundaries.
- 2026-07-06 — TS005: Six marketing config-echo smoke tests removed; `landing-auth-slot` retained with behavior-level integration tests only.
- 2026-07-06 — TS006: `toHaveClass` assertions removed from `landing-auth-slot`, `auth/layout`, and `data-table-skeleton-body` tests; behavior/a11y attributes asserted instead.
- 2026-07-06 — TS007: `admin-auth-gate` and `landing-auth-slot` renamed to `.integration.test.tsx`.
- 2026-07-06 — TS008: Empty MSW global `server.listen()` removed from `vitest.setup.ts`; `testing.mdc` documents deferred MSW until handlers exist.
- 2026-07-06 — TS010: `getUser` failure path tested via `listUsersAction` in `actions.unit.test.ts`; `assert-admin-caller.ts` at 100% coverage.
