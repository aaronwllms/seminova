# Test Audit — seminova

Last full audit: 2026-07-06
Last synced: 2026-07-06
Scope: test suite health and adherence to `.cursor/rules/testing.mdc`

## Executive summary

- **Remediation landed:** Nine of ten open findings from the 2026-07-06 full audit are verified fixed in code — admin `listUsersAction` tests, security utility gaps, route error boundaries, marketing over-testing, assertion-quality fixes, integration naming, MSW deferral, and `assertAdminCaller` `getUser` failure path.
- **Suite remains green:** 62 files, 272 tests, all passing; global coverage ~86% lines / ~84% branches — still above the 80% CI floor (coverage dipped slightly after removing config-echo marketing smoke tests).
- **Only open finding:** TS009 (slow integration tests) — unchanged; password dialog (~666ms / ~474ms), users-table (~420ms), and auth forms still exceed Vitest's 300ms threshold; not flaky.
- **Strong areas unchanged:** auth forms, proxy auth boundary, profile mutations, `extract-auth-form-error`, `avatar-cache-bust`, and admin actions now include full `listUsersAction` coverage.

## Suite mental model

| Metric                           | Value                                                     |
| -------------------------------- | --------------------------------------------------------- |
| Test files                       | 62 (59 under `src/`, 3 under `scripts/`)                  |
| Tests                            | 272                                                       |
| Unit : integration (by filename) | ~50 : 12 (~4.2 : 1; ~81% unit)                            |
| Total test LOC                   | ~5,396                                                    |
| CI command                       | `pnpm test:ci` (`vitest run --coverage`)                  |
| Coverage thresholds              | 80% lines / branches / functions / statements             |
| Actual coverage                  | 86.34% stmts, 84.45% branches, 88.83% funcs, 86.34% lines |
| Slow-test flag                   | Vitest default 300ms; ~12 tests exceed it (longest ~1.1s) |
| Skips / snapshots                | 0 skips; 0 snapshots (ESLint-enforced)                    |

**Shape:** Unit coverage on utils, hooks, server actions, and admin `_lib/` helpers; integration coverage on auth forms, profile settings, logout, `/auth/confirm`, route error boundaries, and session-aware marketing CTA. Marketing section components intentionally have no render tests per `testing.mdc`. MSW global setup deferred; Supabase/auth boundaries use `vi.mock` at module level.

**High-churn sources (6 months):** auth forms, `proxy.ts`, profile actions, admin users table — all have corresponding tests including `listUsersAction` at the action boundary.

## Findings

| ID    | Category            | File:Line                                                                             | Severity | Description                                                                                                                                                                                            | Recommendation                                                                                                                                                                                                                                    |
| ----- | ------------------- | ------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TS009 | Reliability & speed | `src/app/(app)/profile/_components/profile-password-dialog.integration.test.tsx:1-85` | Low      | Multiple integration tests exceed Vitest's 300ms slow threshold (longest ~1.1s for password dialog suite; login ~625ms; users-table ~420ms). Not flaky today, but slow tests lengthen CI and pre-push. | Profile password dialog: share one `render` + reuse form where cases are sequential validation (already partially done). Consider `userEvent` `{ delay: null }` if not set. Track in CI slow-test output; no quarantine unless flakiness appears. |

## Quick wins

- [ ] TS009: Profile password dialog already uses `userEvent.setup({ delay: null })` in route-error-boundaries; apply same pattern and shared `render` where password-dialog cases allow.

## Verified OK / looks bad but is fine

- **`extract-auth-form-error.unit.test.ts` (8 tests, 134 lines):** Looks like enumeration overkill, but maps a security-sensitive override table with logging contracts — appropriate depth per `testing.mdc` exception for auth sanitization.
- **`proxy.unit.test.ts` (25 tests, 217 lines):** Large, but auth boundary is a hard constraint enforced by `check:auth-boundary` — breadth is intentional.
- **`avatar-cache-bust.unit.test.ts` (10 tests):** Covers host spoofing and cross-user path rejection — security utility, not redundant validation permutations.
- **`profile/actions.unit.test.ts` (11 tests):** Exercises partial updates, avatar URL ownership rejection, and fault paths — matches trust-boundary needs.
- **`actions.unit.test.ts` `listUsersAction` block:** Five cases cover non-admin, `getUser` failure, validation, success, and fault — closes the prior action-layer gap.
- **`route-error-boundaries.integration.test.tsx`:** Parameterized `it.each` over app/admin/auth segments — one file, three boundaries, behavior-level assertions.
- **`users-table.unit.test.tsx:127` `sr-only` class:** Asserts loading text is screen-reader-only — borderline implementation detail, but pins an a11y contract for the loading state label.
- **Marketing components at 0% coverage:** `landing-hero`, `landing-features`, etc. are config-driven static sections — no render tests is correct per `testing.mdc` render-only rule.
- **Scripts tests outside coverage include:** `vitest.config.ts` scopes coverage to `src/**` and `proxy.ts` only — script checks are tested but don't affect the 80% gate; intentional.
- **Page/layout exclusions:** `page.tsx` and `layout.tsx` excluded from denominator — documented in `testing.mdc`; not threshold gaming.
- **No quarantined skips, no snapshots:** ESLint `seminova-test/no-unquarantined-skips` and snapshot ban are clean across the suite.
- **`components/ui/sidebar/cookie.unit.test.ts`:** Tests owned cookie-parsing logic colocated in the sidebar primitive — reasonable unit scope despite `ui/` coverage exclusion.

## Open questions

- TS009: Worth extracting a shared slow-integration test helper (shared `render`, `delay: null`) repo-wide, or leave per-file optimization as needed?

## Resolved

- 2026-07-06 — TS001: `listUsersAction` action-layer tests added to `actions.unit.test.ts` (non-admin, validation, success, fault).
- 2026-07-06 — TS002: Malformed-URL `catch` test added to `is-safe-redirect.unit.test.ts` (`http://[%`).
- 2026-07-06 — TS003: `uploadUserAvatar` tests added for userId mismatch, storage error, and non-`AvatarUploadError` re-wrap.
- 2026-07-06 — TS004: Parameterized `route-error-boundaries.integration.test.tsx` covers app/admin/auth fault boundaries.
- 2026-07-06 — TS005: Six marketing config-echo smoke tests removed; `landing-auth-slot` retained with behavior-level integration tests only.
- 2026-07-06 — TS006: `toHaveClass` assertions removed from `landing-auth-slot`, `auth/layout`, and `data-table-skeleton-body` tests; behavior/a11y attributes asserted instead.
- 2026-07-06 — TS007: `admin-auth-gate` and `landing-auth-slot` renamed to `.integration.test.tsx`.
- 2026-07-06 — TS008: Empty MSW global `server.listen()` removed from `vitest.setup.ts`; `testing.mdc` documents deferred MSW until handlers exist.
- 2026-07-06 — TS010: `getUser` failure path tested via `listUsersAction` in `actions.unit.test.ts`; `assert-admin-caller.ts` at 100% coverage.
