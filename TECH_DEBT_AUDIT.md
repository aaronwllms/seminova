# Tech Debt Audit — Seminova

Last full audit: 2026-07-21
Last synced: 2026-07-22 (sync — verified Open F053/F082/F095; Accepted markers unchanged; tooling counts refreshed)
Scope: Sync pass — no Open findings resolved; no full-repo rescan.

## Executive summary

- **Phase 14 cleared the actionable audit clusters** — shared debounce/query/unwrap helpers (Epic 1), admin table decomposition into thin components + state hooks (Epics 2–3), settings-registry type derivation and logs filter typing without production casts (Epic 4), actions-layer barrels and split tests (Epic 5), dependency/test/reference hygiene (Epic 6), sharp CVE override (Epic 7). Twenty-seven findings moved to Resolved; F066 reclassified as a deep module.
- **Open backlog is short** — client-log rate limit before production scale (F082), and CSP enforcement + style CSP (F053 / F095) deferred to a future security phase.
- **Accepted rows are not todos** — intentional design, ceiling-gated markers, and template-scale risks live under **Accepted** with reopen triggers.
- **Three declared `// debt:` markers in application code** — CSP (F053, Open/Deferred), duplicate profile providers (F061, Accepted), settings row dispatch switch (F062, Accepted).
- **Quality gates green** — `type-check`, `lint`, and `test:ci` pass (697 tests / 142 files). Coverage thresholds met. No circular deps (`madge src`).

## Architectural mental model

Seminova is a **Next.js 16 App Router template** with route groups: public `(marketing)/`, `auth/`, authenticated `(app)/` at `/home`, and `admin/` at `/admin/**`. Session gating runs in `src/proxy.ts` → `src/supabase/proxy.ts`; the **two-authority refresh model** (proxy on matched server requests + browser foreground auto-refresh) per ADR-0005 enables Supabase Realtime on `/admin/logs`.

Data access splits three ways: browser client (RLS), server session client, and secret-key service client for admin listing and log persistence. Admin surfaces were the prior complexity center; Phase 14 extracted shared helpers and split table orchestration into dedicated state hooks while preserving behavior.

**Hot paths:** `src/proxy.ts`, `require-auth.ts`, admin users/logs state hooks and their TanStack Query layers, `persistAppLogRow`, profile blur-save, avatar upload.

**Cold corners:** CSP nonce strategy (F053), MSW infrastructure (F072 — Accepted), rate limiting on `/api/client-logs` (F082 — Open/Deferred).

**Largest source files (LOC, excluding tests):** `workflow-diagram.tsx` (485), `banner-setting-row.tsx` (429), `reference-profile-settings-preview.tsx` (~340), `use-admin-users-table-state.ts` (385), `use-admin-logs-table-state.ts` (375).

**Git churn (6 months):** Phase 14 hardening concentrated in `src/app/admin/` helpers and table state hooks; planning docs continue to dominate commit volume.

**LOC scale:** ~21k lines of non-test TypeScript under `src/` — below the skill's subagent threshold.

## Open

Actionable backlog only. `Status`: `Do next` | `Deferred` | `Needs decision`.

| ID   | Status   | Category            | File:Line                                                             | Severity | Description                                                                                                                                                                          | Recommendation                                                                                                               | Effort |
| ---- | -------- | ------------------- | --------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | ------ |
| F082 | Deferred | Security hygiene    | `docs/adr/ADR-0007-client-log-relay-unauthenticated.md:7`             | Low      | Client log relay intentionally ships without rate limiting — public POST surface bounded by closed registry + same-origin check only.                                                | Add path-based rate limit (CDN or middleware) before production scale; ADR documents the seam. Home: pre-production gate.    | M      |
| F053 | Deferred | Declared debt       | `src/utils/security-headers.ts:1`                                     | Medium   | Template-default CSP ships report-only. Enforcing requires per-request nonce for Next.js inline scripts.                                                                             | Implement nonce in middleware before `CSP_ENFORCE=true`; tighten directives per surface. Home: future security phase.        | L      |
| F095 | Deferred | Security hygiene    | `src/utils/security-headers.ts:26`                                    | Low      | `style-src 'unsafe-inline'` required for Tailwind — not separately marked with `// debt:`; pairs with F053 enforcement work.                                                         | Revisit when CSP moves to enforcing; may need nonce/hash strategy for styles too. Home: same security phase as F053.         | L      |

## Accepted

Deliberately not doing now. Not a todo list.

| ID   | Category              | File:Line                                                                 | Severity | Description                                                                                                                                                                | Why accepted                                                                                                              | Reopen when                                                                                          | Effort |
| ---- | --------------------- | ------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------ |
| F022 | Consistency rot       | `src/components/login-form.tsx:19-29` / `profile-settings-form.tsx:4-6`    | Low      | Auth forms use `useState`; profile uses RHF + zod. Two form stacks.                                                                                                        | Intentional per `forms.mdc`.                                                                                              | Product decision to unify form stacks.                                                               | —      |
| F060 | Architectural decay   | `src/components/site-header.tsx:29` / `site-footer.tsx:31`                | Low      | Identical `md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]` track string duplicated across header and footer — kept inline per Phase 14 Epic 1.                             | Paired intentional-duplication comments; constant extraction deferred until a third chrome surface.                       | A third chrome surface copies the same grid track.                                                   | S      |
| F061 | Declared debt         | `src/app/(app)/_components/app-header-account-nav.tsx:10`                 | Low      | Desktop and mobile marketing header slots each mount `ProfileDialogProvider` + dialog tree.                                                                                | Ceiling-gated marker — consolidate via `SiteHeader` API only if a third slot appears.                                     | A third provider/dialog slot appears.                                                                | M      |
| F062 | Declared debt         | `src/app/admin/settings/_components/app-setting-row.tsx:291`              | Low      | Two-type `if (valueType === …)` dispatch for logging settings; banner rows bypass this component entirely.                                                                 | Ceiling-gated marker — registry-driven dispatch when a third non-banner `valueType` lands.                                | A third non-banner `valueType` is added.                                                             | S      |
| F071 | Architectural decay   | `src/components/ui/dropdown-menu.tsx:1-257`                               | Low      | Radix re-export barrel still ~257 LOC with many re-exported sub-primitives.                                                                                                | shadcn ecosystem surface; splitting fights upstream updates.                                                              | Import-tree bloat matters or upstream splits the barrel.                                             | —      |
| F072 | Dependency & config   | `package.json:93` / `public/mockServiceWorker.js:1`                       | Low      | MSW v2 devDependency and generated service worker present; zero handlers, no test imports (`knip` flags `msw` unused).                                                     | AGENTS.md / `testing.mdc` defer global setup until HTTP handlers are needed; PM call: keep.                               | First HTTP integration test needs MSW handlers (or decide to remove scaffolding).                    | S      |
| F080 | Performance           | `src/app/(marketing)/workflow/_components/workflow-diagram.tsx:1-485`     | Low      | Large client component with hover/focus state machine — no code-splitting; loads with workflow page bundle.                                                                | Accept for marketing page; diagram is in coverage denominator.                                                            | Bundle analyzer shows a workflow-page regression.                                                    | —      |
| F089 | Reinventing platform  | `src/app/admin/logs/_components/logs-table.tsx` / `profile-theme-segment.tsx` | Low   | Manual hydration guards with `eslint-disable-next-line react-hooks/set-state-in-effect` for localStorage and next-themes.                                                  | Idiomatic for SSR hydration mismatches.                                                                                   | A third identical guard appears (then extract a shared primitive).                                   | —      |
| F091 | Error handling        | `src/utils/persist-app-log.ts:44-52`                                      | Low      | Persist failures log via raw `console.error` and silent-drop — intentional anti-recursion.                                                                                 | Anti-recursion design; raw `console.error` is the exempt surface per `logging.mdc`.                                       | Logs become production-critical and need metrics/alerts on persist failure rate.                     | —      |
| F100 | Declared debt         | `scripts/checks/a11y-structure.mjs:1` / `a11y-contrast.mjs:131`           | Low      | Hard-constraint checkers document static-analysis ceilings as `// debt:` — known false-negative surface for a11y gates.                                                   | Accept until a real miss escapes CI.                                                                                      | A real a11y miss escapes CI; then upgrade checkers rather than papering with more rules.             | M      |

## Top 5

1. **F053 — CSP enforcement** — Largest security ceiling. Middleware nonce before `CSP_ENFORCE=true`. Deferred to a future security phase (Open/Deferred with F095).
2. **F082 — Client-log rate limit** — ADR-0007 seam; add before production scale (Open/Deferred).
3. **F095 + F053 — Style CSP when enforcing** — Plan `unsafe-inline` for Tailwind with the script nonce work.

## Quick wins

- _(none — F081 cleared via temporary sharp override; Next bump tracked on ROADMAP)_

## Verified OK

- **Dual admin gating (`proxy.ts` + `AdminAuthGate`)** — Defense-in-depth; `AdminAuthGate` probes `hasServerAuthSession` before claims on cold cache (Phase 13 fix). Keep both.
- **Two refresh authorities (proxy + browser)** — Amended ADR-0005 + RESEARCH-0004; RSC refresh removed.
- **Reference demos (F090/F098 resolved)** — Table demo documents sanctioned client-side fixture pagination; profile preview documents showroom-only password stub.
- **`banner-setting-row.tsx` width (F066)** — Deep module per ADR-0001 / LEXICON: narrow interface, single responsibility, no co-change signal.
- **Admin state hooks (~375–385 LOC)** — Complexity moved out of table components by design (Epics 2–3); hooks own one surface's state with a narrow table interface.
- **Coverage exclusions for `page.tsx` / `layout.tsx` / UI primitives / static workflow sections** — Thin shells, vendored shadcn, or static marketing prose; interactive `workflow-diagram.tsx` is measured.
- **No `src/services/` layer** — Two tables + RPCs; premature per code-minimalism.
- **Authenticated banner in-memory dismissal** — Product spec (AGENTS.md § Banners); cookie dismissal is marketing-only for SSR correctness.
- **knip unused sidebar / table / Toggle exports** — shadcn primitive surface area kept for composition; not dead product code.

## Open questions

- _(none — MSW keep-until-handlers decision recorded on F072 Accepted)_

## Resolved

| ID   | Resolved | Notes |
| ---- | -------- | ----- |
| F011 | 2026-07-22 | `LandingContainer` alias deleted; marketing components import `SiteContainer` directly. |
| F059 | 2026-07-22 | `AppSettingKey` / `AppSettingValueMap` derived from `APP_SETTINGS_REGISTRY`; compile-time default validation added. |
| F063 | 2026-07-22 | Shared `runCliScript` in `scripts/admin/lib/cli.ts`; all four entry scripts use it. |
| F064 | 2026-07-22 | Users table decomposed — thin component + `use-admin-users-table-state.ts` (Epic 2). |
| F065 | 2026-07-22 | Logs table decomposed — thin component + `use-admin-logs-table-state.ts` (Epic 3). |
| F067 | 2026-07-22 | Logs mark-read actions in `_lib/mark-read-actions.ts`; `actions.ts` is a barrel (Epic 5). |
| F068 | 2026-07-22 | Shared `useDebouncedValue` in `src/hooks/`; users table, logs table, and reference demo consume it. |
| F069 | 2026-07-22 | Shared `adminActionQueryRetry` / `ADMIN_ACTION_QUERY_RETRY_DELAY` in `admin-query-options.ts`. |
| F070 | 2026-07-22 | Single generic `unwrapActionResult` in `unwrap-action-result.ts`; old unwrap helpers removed. |
| F073 | 2026-07-22 | Workflow coverage exclude narrowed — static sections excluded; `workflow-diagram.tsx` measured. |
| F074 | 2026-07-22 | Production `as unknown as` cast chain removed from `list-app-logs.ts`. |
| F075 | 2026-07-22 | Production casts removed from `mark-app-logs-read.ts`; generic filter helper retained. |
| F076 | 2026-07-22 | `FilterableAppLogsQuery` duck-type replaced by `LogListFilterMethods` + generic `applyLogListFilters<T>`. |
| F077 | 2026-07-22 | `isAppError` / `toAppError` in `src/utils/is-app-error.ts`; hooks use guard at error surfaces. |
| F078 | 2026-07-22 | Monolithic `users/actions.unit.test.ts` split into `_lib/*-actions.unit.test.ts` files (Epic 5). |
| F079 | 2026-07-22 | `env.unit.test.ts` covers `getPublicSupabaseEnv` throw branches (Epic 6). |
| F081 | 2026-07-22 | Temporary `sharp: ^0.35.3` override in `pnpm-workspace.yaml` (Epic 7); remove when stable Next ships sharp ≥0.35 (ROADMAP). |
| F083 | 2026-07-21 | Phase 13 `ship-phase` — ROADMAP `Shipped`, PRD archived. |
| F084 | 2026-07-21 | ADR-0005 renamed to `ADR-0005-proxy-session-gate-two-authority-refresh.md`; links + adr README note updated. |
| F086 | 2026-07-22 | `package.json` author updated to current maintainer. |
| F087 | 2026-07-22 | Users actions thinned to barrel re-exports (Epic 5). |
| F088 | 2026-07-22 | `unwrapMutationResult` folded into generic `unwrapActionResult`. |
| F090 | 2026-07-22 | Reference table demo uses shared debounce hook; inline fixture documentation added (Epic 6). |
| F092 | 2026-07-22 | Direct `@eslint/eslintrc` devDependency removed; eslint still resolves it transitively (Epic 6). |
| F093 | 2026-07-22 | `persist-app-log.unit.test.ts` covers array/primitive context shapes and circular refs (Epic 6). |
| F094 | 2026-07-22 | `use-admin-log-tags.ts` merged into `use-admin-logs-table-state.ts` (Epic 3). |
| F096 | 2026-07-21 | Epic 3 amended: users Refresh is intentional catch-up; no connection indicator. |
| F097 | 2026-07-22 | Edge reads route through `getSupabaseOrigin()` / `getSupabaseProjectRef()`; no direct env reads outside `env.ts`. |
| F098 | 2026-07-22 | Reference profile preview documents intentional showroom fixture (Epic 6). |
| F099 | 2026-07-22 | Inaccurate workflow `_components/**` blanket exclude and debt comment fixed; OG exclude unchanged. |

_(Resolved entries from the 2026-07-21 full pass not listed above were pruned on that date. Historical Phase 8 remediations remain in git history and archived Phase 8 PRD.)_

## Tooling notes

| Tool                       | Result                                                                                                      |
| -------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `pnpm audit`               | No known vulnerabilities (`sharp@0.35.3` via workspace override; brace-expansion / js-yaml cleared) |
| `pnpm type-check`          | Pass                                                                                                        |
| `pnpm lint`                | Pass                                                                                                        |
| `pnpm test:ci`             | 697 tests / 142 files pass; coverage thresholds met                                                         |
| `npx knip`                 | Unused exports dominated by shadcn sidebar/table surface; `msw` flagged unused devDependency                |
| `npx madge --circular src` | No circular dependencies                                                                                    |

Adapted from [ksimback/tech-debt-skill](https://github.com/ksimback/tech-debt-skill) (MIT).
