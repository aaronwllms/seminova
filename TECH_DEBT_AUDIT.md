# Tech Debt Audit — Seminova

Last full audit: 2026-07-21
Last synced: 2026-07-21 (Batch 0 / Phase 13 ship — F083, F084, F096 resolved)
Scope: Full repository pass — application code (`src/`, `scripts/`, `supabase/migrations/`), config, agent docs cross-check. Replaces the prior 2026-07-21 full pass on the same calendar day (re-verified against current tree). Resolved appendix pruned of entries older than the previous full-audit date (2026-07-21).

## Executive summary

- **Admin table orchestrators remain the primary god files** — `users-table.tsx` (466 LOC) and `logs-table.tsx` (428 LOC) each own filters, debounced search, paging, dialogs, and mutations. They co-changed 12× in six months; shared extraction is overdue.
- **Phase 12–13 added width without decomposition** — `banner-setting-row.tsx` (425 LOC), `logs/actions.ts` (369 LOC), and `workflow-diagram.tsx` (485 LOC) join the large-file list. Sidebar and profile decompositions from Phase 8 held; admin surfaces did not get the same treatment.
- **Six declared `// debt:` markers in application code** — CSP report-only (F053), app-settings registry hand-sync (F059), chrome grid coupling (F060), duplicate profile providers (F061), settings row dispatch switch (F062), plus CLI catch duplication in `scripts/admin/` (F063).
- **Supabase query typing relies on casts** — `FilterableAppLogsQuery` plus `as unknown as` chains in `list-app-logs.ts` and `mark-app-logs-read.ts` (F074–F076) are a type-debt cluster waiting on generated filter types or RPC.
- **Dependency hygiene is noisy in the toolchain** — `pnpm audit` reports 4 high-severity issues: three `brace-expansion` DoS paths plus transitive `js-yaml` (F081). MSW v2 and `public/mockServiceWorker.js` ship with zero handlers (F072).
- **Phase 13 planning close-out is done** — Epic 3 amended for users Refresh, ADR-0005 renamed, PRD/ROADMAP shipped (F083 / F084 / F096 resolved in Batch 0).
- **Quality gates green** — `type-check`, `lint`, and `test:ci` pass (665 tests / 133 files). Coverage thresholds met. No circular deps (`madge src`).

## Architectural mental model

Seminova is a **Next.js 16 App Router template** with route groups: public `(marketing)/`, `auth/`, authenticated `(app)/` at `/home`, and `admin/` at `/admin/**`. Session gating runs in `src/proxy.ts` → `src/supabase/proxy.ts`; Phase 13 restored the **two-authority refresh model** (proxy on matched server requests + browser foreground auto-refresh) per amended ADR-0005, enabling Supabase Realtime on `/admin/logs`.

Data access splits three ways: browser client (RLS), server session client, and secret-key service client for admin listing and log persistence. Admin surfaces are the current complexity center: users table (offset paging + RPC sort + focus refetch + manual refresh), logs table (cursor paging + Realtime INSERT invalidation + localStorage live toggle), settings registry (cached reads + per-row save), and banner engine (SSR cookie dismissal on marketing, in-memory on authenticated).

**Hot paths:** `src/proxy.ts`, `require-auth.ts`, admin users/logs tables and their TanStack Query hooks, `persistAppLogRow`, profile blur-save, avatar upload.

**Cold corners:** CSP nonce strategy (F053), MSW infrastructure (F072), rate limiting on `/api/client-logs` (F082 — accepted per ADR-0007).

**Largest source files (LOC, excluding tests):** `workflow-diagram.tsx` (485), `users-table.tsx` (466), `logs-table.tsx` (428), `banner-setting-row.tsx` (425), `logs/actions.ts` (369), `reference-profile-settings-preview.tsx` (340).

**Git churn (6 months):** Planning docs dominate; feature churn concentrated in Phase 12 observability (logs, settings, banners) and Phase 13 (Realtime, session refresh, admin UX polish). Highest `src/` churn: `proxy.ts` (20), login-form tests (15), `users-table` / `logs-table` (12 each) — strongest co-change signal in `src/app/admin/`.

**LOC scale:** ~21k lines of non-test TypeScript under `src/` — below the skill’s subagent threshold; this pass ran serially.

## Findings

| ID   | Category            | File:Line                                                                 | Severity | Description                                                                                                                                                                                                 | Recommendation                                                                                                                                  | Effort |
| ---- | ------------------- | ------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| F011 | Architectural decay | `src/app/(marketing)/_components/landing-container.tsx:1`                 | Low      | One-line re-export of `SiteContainer`; still imported by 9 marketing components.                                                                                                                            | Import `SiteContainer` directly; delete alias unless a spinoff needs the boundary.                                                               | S      |
| F022 | Consistency rot     | `src/components/login-form.tsx:19-29` / `profile-settings-form.tsx:4-6`    | Low      | Auth forms use `useState`; profile uses RHF + zod. Two form stacks.                                                                                                                                           | **Intentional per `forms.mdc`** — no migration without cause.                                                                                   | —      |
| F053 | Declared debt       | `src/utils/security-headers.ts:1`                                         | Medium   | Template-default CSP ships report-only. Enforcing requires per-request nonce for Next.js inline scripts.                                                                                                      | Implement nonce in middleware before `CSP_ENFORCE=true`; tighten directives per surface.                                                        | L      |
| F059 | Declared debt       | `src/config/app-settings-registry.ts:23`                                  | Medium   | `AppSettingKey` / `AppSettingValueMap` and `APP_SETTINGS_REGISTRY` kept in sync by hand — a new registry entry can compile with wrong types.                                                                | Derive key union and value map from the registry const (marker's upgrade path).                                                                 | M      |
| F060 | Declared debt       | `src/components/site-header.tsx:29` / `site-footer.tsx:31`                | Low      | Identical `md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]` track string duplicated across header and footer.                                                                                               | Extract shared grid class constant in one module; import in both chrome files.                                                                  | S      |
| F061 | Declared debt       | `src/app/(app)/_components/app-header-account-nav.tsx:10`                 | Low      | Desktop and mobile marketing header slots each mount `ProfileDialogProvider` + dialog tree.                                                                                                                   | Consolidate via `SiteHeader` API if a third slot appears (marker's ceiling).                                                                    | M      |
| F062 | Declared debt       | `src/app/admin/settings/_components/app-setting-row.tsx:290`              | Low      | Two-type `if (valueType === …)` dispatch for logging settings; banner rows bypass this component entirely.                                                                                                  | Refactor to registry-driven dispatch when a third non-banner `valueType` lands.                                                                  | S      |
| F063 | Declared debt       | `scripts/admin/promote-admin.ts:5`                                        | Low      | Identical async catch-and-exit wrapper duplicated across four admin CLI entry scripts.                                                                                                                      | Extract shared `runCliScript(promise, tag)` in `scripts/admin/lib/cli.ts`.                                                                      | S      |
| F064 | Architectural decay | `src/app/admin/users/_components/users-table.tsx:67-466`                  | Medium   | ~400 LOC orchestrator: paging, debounced search, tile filters, sort mapping, three confirmation dialogs, ban/unban/role mutations, stat tiles, toolbar, empty state — wide interface, many responsibilities. | Extract `useAdminUsersTableState` (filters + paging + dialogs) mirroring logs decomposition pattern; leave JSX composition thin.                | M      |
| F065 | Architectural decay | `src/app/admin/logs/_components/logs-table.tsx:55-428`                    | Medium   | Parallel god file: cursor stack, live toggle + localStorage, Realtime subscription, mark-read mutations, stat tiles, detail dialog, toolbar — same width problem as users table.                             | Same as F064 — shared admin-table primitives (`useDebouncedValue`, filter chip wiring) then logs-specific cursor/live layers.                  | M      |
| F066 | Architectural decay | `src/app/admin/settings/_components/banner-setting-row.tsx:56-425`        | Medium   | Accordion form, schedule fields, preview theme toggle, live banner preview, save/error/footer — single component owns full banner editing UX.                                                                  | Split preview island and form fields into subcomponents; keep row as accordion shell only.                                                      | M      |
| F067 | Architectural decay | `src/app/admin/logs/actions.ts:1-369`                                     | Low      | Six exported server actions (list, stats, tags, mark read/unread, mark-all-read) plus re-exports in one file — manageable today but widening with each logs feature.                                        | Group mark-read mutations into `_lib/mark-read-actions.ts`; keep `actions.ts` as thin re-export barrel.                                          | S      |
| F068 | Architectural decay | `src/app/admin/users/_components/users-table.tsx:50-160` / `logs-table.tsx:53-92` | Medium | Duplicate search debounce effect (`SEARCH_DEBOUNCE_MS = 300`, `useEffect` + `setTimeout`) copied across users table, logs table, and reference demo — co-change cluster from git stat.                      | Add `useDebouncedValue(value, ms)` in `src/hooks/`; replace three call sites.                                                                   | S      |
| F069 | Architectural decay | `src/app/admin/users/_lib/use-admin-users-list.ts:59-66`                  | Low      | Fault-only retry + `AppError` cast pattern duplicated identically in `use-admin-logs-list`, `use-admin-user-stats`, and `use-admin-log-stats` (4 hooks).                                                    | Extract `useAdminQueryOptions()` returning `{ retry, selectError }` or a thin `useAdminActionQuery` wrapper.                                    | S      |
| F070 | Architectural decay | `src/app/admin/_lib/unwrap-stats-action-result.ts:7-15` / `unwrap-users-action.ts:14-22` | Low | Two unwrap helpers with identical throw-on-error semantics; `unwrapMutationResult` adds a third variant in the same file.                                                                                   | Consolidate to one generic `unwrapActionResult<T>(result)` in `src/app/admin/_lib/`.                                                             | S      |
| F071 | Architectural decay | `src/components/ui/dropdown-menu.tsx:1-257`                               | Low      | Radix re-export barrel still ~257 LOC with many re-exported sub-primitives (carried from prior audit).                                                                                                        | Accept as shadcn ecosystem surface unless a future shadcn update splits it; no action unless import tree bloat matters.                           | —      |
| F072 | Dependency & config | `package.json:94` / `public/mockServiceWorker.js:1`                       | Low      | MSW v2 devDependency and generated service worker present; zero handlers, no test imports (`knip` flags `msw` unused).                                                                                      | Remove MSW + worker until HTTP mocking is needed, or add first handler + setup in one PR (AGENTS.md defers intentionally).                      | S      |
| F073 | Test debt           | `vitest.config.ts:33`                                                     | Low      | Entire `src/app/(marketing)/workflow/_components/**` tree excluded from coverage denominator — includes interactive `workflow-diagram.tsx` (485 LOC) that already has an integration test file.              | Stop excluding the diagram (or narrow exclude to static section files only); update the `// debt:` comment which currently claims “static.”      | S      |
| F074 | Type & contract     | `src/app/admin/logs/_lib/list-app-logs.ts:29-34`                          | Medium   | Supabase client `.from('app_logs')` cast through `unknown` to a hand-rolled `AppLogsListQuery` interface — bypasses generated Database types.                                                               | Use generated `Database['public']['Tables']['app_logs']` builder types or move list to RPC with typed return.                                   | M      |
| F075 | Type & contract     | `src/app/admin/logs/_lib/mark-app-logs-read.ts:47-76`                     | Medium   | Chained `as unknown as MarkAllReadQuery` / `FilterableAppLogsQuery as UnreadCountQuery` to reuse filter helper on update/count builders.                                                                   | Same root fix as F074 — typed query helper or RPC for filtered mark-all/count.                                                                    | M      |
| F076 | Type & contract     | `src/app/admin/logs/_lib/log-list-filters.ts:82-88`                       | Low      | `FilterableAppLogsQuery` is a minimal duck-type interface driving the casts in F074–F075 — no link to Supabase's actual builder.                                                                            | Collapse into one typed module once F074 approach is chosen; until then document as intentional seam.                                           | S      |
| F077 | Type & contract     | `src/app/admin/users/_lib/use-admin-users-list.ts:66`                     | Low      | `query.error as unknown as AppError` assumes server actions always throw typed errors — no runtime guard if TanStack surfaces a network Error. No `isAppError` helper exists in `src/`.                      | Add `isAppError()` type guard and use it at hook error surfaces, or throw only `AppError` from unwrap helpers.                                    | S      |
| F078 | Test debt           | `src/app/admin/users/actions.unit.test.ts:1-767`                          | Low      | Users actions test file (767 LOC) exceeds its subject `actions.ts` (300 LOC) — high maintenance surface on a churn-heavy module.                                                                              | Split by action group (list vs mutations) mirroring `_lib/` layout.                                                                             | S      |
| F079 | Test debt           | `src/utils/env.ts:27-30`                                                  | Low      | `getPublicSupabaseEnv` throw branches for missing URL/key at 78% line coverage — env validation is security-adjacent but undertested.                                                                        | Add `env.unit.test.ts` cases for each throw path (pattern exists for service env).                                                              | S      |
| F080 | Performance         | `src/app/(marketing)/workflow/_components/workflow-diagram.tsx:1-485`     | Low      | Large client component with hover/focus state machine, step panels, and SVG layout — no code-splitting; loads with workflow page bundle.                                                                    | Accept for marketing page; `dynamic()` split only if bundle analyzer shows regression.                                                            | —      |
| F081 | Dependency & config | `pnpm audit` (brace-expansion + js-yaml)                                  | Medium   | 4 high-severity CVE paths: brace-expansion DoS (3 advisory rows via eslint/vitest toolchain) and js-yaml merge-key quadratic CPU via `@eslint/eslintrc`.                                                     | `pnpm update` / pnpm overrides to patched `brace-expansion` and `js-yaml@>=4.3.0` when toolchain permits; re-run audit before release.          | S      |
| F082 | Security hygiene    | `docs/adr/ADR-0007-client-log-relay-unauthenticated.md:7`               | Low      | Client log relay intentionally ships without rate limiting — public POST surface bounded by closed registry + same-origin check only.                                                                         | Add path-based rate limit (CDN or middleware) before production scale; ADR documents the seam.                                                  | M      |
| F085 | Documentation drift | `README.md:11`                                                            | Low      | Hero screenshot TODO comment — landing page renders without committed marketing asset.                                                                                                                      | Capture light/dark hero PNG to `public/images/` and remove TODO.                                                                                | S      |
| F086 | Documentation drift | `package.json:6` / `README.md:4`                                           | Low      | `package.json` author is legacy template attribution (`Michael Troya`); README/GitHub org is `aaronwllms/seminova`.                                                                                         | Update `author` field to current maintainer or remove if template spinoffs should replace it.                                                   | S      |
| F087 | Consistency rot     | `src/app/admin/users/actions.ts:1-300`                                    | Low      | Users actions file still monolithic (list + stats + promote/demote/ban/unban) though `_lib/` helpers exist — less severe than logs but same pattern.                                                          | Optional: thin `actions.ts` re-export only (Phase 8 pattern for users partially applied).                                                       | S      |
| F088 | Speculative flex    | `src/app/admin/users/_lib/unwrap-users-action.ts:24-30`                   | Low      | `unwrapMutationResult` generic exported alongside list unwrap — only consumed by role/ban mutation hooks; could inline.                                                                                     | Keep until a third mutation hook appears; otherwise fold into shared unwrap (F070).                                                             | S      |
| F089 | Reinventing platform | `src/app/admin/logs/_components/logs-table.tsx:83-84` / `profile-theme-segment.tsx:16` | Low | Manual hydration guards with `eslint-disable-next-line react-hooks/set-state-in-effect` for localStorage and next-themes — no shared primitive.                                                              | Accept as idiomatic for SSR hydration mismatches; extract only if a third guard appears.                                                        | —      |
| F090 | Architectural decay | `src/app/(marketing)/reference/_components/reference-table-demo.tsx:22-42` | Low     | Reference fixture table re-implements production debounce/search/pagination patterns separately from admin tables — drift risk on convention changes.                                                       | Document as intentional demo isolation in `data-tables.mdc`; optionally consume shared debounce hook after F068.                                  | S      |
| F091 | Error handling      | `src/utils/persist-app-log.ts:44-52`                                      | Low      | Persist failures log via raw `console.error` and silent-drop — intentional anti-recursion, but rows are lost with no admin surfacing.                                                                       | Accept for template; add metrics/alert on persist failure rate if logs become production-critical.                                              | —      |
| F092 | Dependency & config | `pnpm audit` / `knip`                                                     | Low      | `@eslint/eslintrc` flagged unused by knip — likely pulled for ESLint flat-config compat; verify before removal.                                                                                               | Confirm eslint.config.mjs dependency graph; remove if truly orphaned.                                                                           | S      |
| F093 | Test debt           | `src/utils/persist-app-log.ts:15-16`                                      | Low      | `toJsonSafeContext` array branch returns `{ value }` wrapper — 90% coverage; edge cases for circular refs partially tested.                                                                                 | Extend `persist-app-log` unit tests for array/primitive context shapes.                                                                           | S      |
| F094 | Shallow module      | `src/app/admin/logs/_lib/use-admin-log-tags.ts:1-40`                      | Low      | Thin TanStack wrapper (~40 LOC) over `listLogTagsAction` — interface nearly equals implementation; co-changes with `logs-table.tsx` on filter work.                                                           | Merge into table hook or tags combobox only if F065 extraction happens; otherwise acceptable.                                                   | —      |
| F095 | Security hygiene    | `src/utils/security-headers.ts:38`                                        | Low      | `style-src 'unsafe-inline'` required for Tailwind — not separately marked with `// debt:`; pairs with F053 enforcement work.                                                                                 | Revisit when CSP moves to enforcing; may need nonce/hash strategy for styles too.                                                                 | L      |
| F097 | Consistency rot     | `src/supabase/read-auth-cookie.ts:10` / `avatar-cache-bust.ts:44` / `security-headers.ts:24` | Low | Three call sites still read `process.env.NEXT_PUBLIC_SUPABASE_URL` directly instead of `getPublicSupabaseEnv()` / a shared origin helper — Phase 8 env consolidation incomplete at the edges.                | Route URL-only reads through a small `getSupabaseOrigin()` (or tolerate URL-only optional reads with one documented helper).                    | S      |
| F098 | Architectural decay | `src/app/(marketing)/reference/_components/reference-profile-settings-preview.tsx:1-340` | Low | 340 LOC reference demo re-implements profile save models (blur-save, avatar, password accordion, theme) as a parallel form — high drift risk vs production profile dialog.                                  | Prefer composing real profile subcomponents with demo stubs (partially done) or mark as intentional parity fixture in AGENTS `/reference` prose. | M      |
| F099 | Declared debt       | `vitest.config.ts:32-33`                                                  | Low      | Coverage excludes OG segment files and the entire workflow `_components` tree via `// debt:` markers — one claim (“static marketing sections”) is inaccurate for the interactive diagram (see F073).         | Narrow the workflow exclude; keep OG exclude until threshold pressure returns.                                                                  | S      |
| F100 | Declared debt       | `scripts/checks/a11y-structure.mjs:1` / `a11y-contrast.mjs:136`           | Low      | Hard-constraint checkers document static-analysis ceilings (barrel imports, dynamic `alt`, OKLCH alpha, `var()` indirection) as `// debt:` — known false-negative surface for a11y gates.                   | Accept until a real miss escapes CI; then upgrade checkers rather than papering with more rules.                                                | M      |

## Top 5

1. **F064 + F065 — Admin table god files** — Extract shared debounce hook (F068) first as a quick win, then `useAdminUsersTableState` / `useAdminLogsTableState` to collapse the 400+ LOC orchestrators. Sketch: move dialog state + filter composition into hooks; tables become toolbar + `DataTableShell` + dialog mounts.

2. **F074 + F075 + F076 — Logs query typing cluster** — The cast chain exists because `FilterableAppLogsQuery` duck-types Supabase builders. Fix: either (a) add `admin_list_logs` RPC returning typed rows + filter params (matches users pattern), or (b) generate a narrow Postgrest builder type from `database.types.ts` once per operation shape.

3. **F053 — CSP enforcement** — Still the largest security ceiling. Requires middleware nonce threaded into `script-src` and Next.js bootstrap before `CSP_ENFORCE=true`. Deferred to a future security phase per ROADMAP; no shortcut.

4. **F059 — App settings registry type drift** — Hand-synced types will bite when Phase 15+ adds settings keys (magic link toggle, blog, pricing). Derive `AppSettingKey` from `APP_SETTINGS_REGISTRY` now while the registry is small (4 keys).

5. **F081 — Toolchain CVEs** — Patch transitive brace-expansion / js-yaml before release (`pnpm audit` still reports 4 high).

## Quick wins

- [ ] F011: Delete `LandingContainer` alias; update 9 imports to `SiteContainer`
- [ ] F060: Extract shared header/footer grid class constant
- [ ] F063: Extract CLI catch-and-exit helper (4 one-line entry script edits)
- [ ] F068: Add `useDebouncedValue` hook; dedupe three debounce effects
- [ ] F069: Extract shared admin query retry/error options
- [ ] F070: Consolidate unwrap helpers to one generic
- [ ] F073 / F099: Narrow workflow coverage exclude to static files only
- [ ] F081: Patch brace-expansion / js-yaml transitive dependencies

## Things that look bad but are actually fine

- **Dual admin gating (`proxy.ts` + `AdminAuthGate`)** — Defense-in-depth; `AdminAuthGate` probes `hasServerAuthSession` before claims on cold cache (Phase 13 fix). Keep both.

- **Two refresh authorities (proxy + browser)** — Amended ADR-0005 + RESEARCH-0004; RSC refresh removed. Filename now matches (`ADR-0005-proxy-session-gate-two-authority-refresh.md`).

- **Auth forms on `useState` vs profile RHF** — `forms.mdc` intentional (F022).

- **MSW deferred (F072)** — AGENTS.md explicitly documents global setup deferred until HTTP handlers needed; removing now saves little vs future test work.

- **`persistAppLogRow` silent drop (F091)** — Anti-recursion design; raw `console.error` is the exempt surface per `logging.mdc`.

- **Client log relay without session (F082)** — ADR-0007 accepted; closed registry + same-origin + size caps bound abuse for template scale.

- **Reference table client-side pagination** — Sanctioned fixture exception in `data-tables.mdc`.

- **`dropdown-menu.tsx` width (F071)** — shadcn ecosystem re-export barrel; splitting fights upstream updates.

- **Workflow diagram bundle size (F080)** — Marketing explainer page; integration test covers a11y; code-split only on evidence.

- **Coverage exclusions for `page.tsx` / `layout.tsx` / UI primitives** — Thin shells or vendored shadcn; enforced elsewhere.

- **No `src/services/` layer** — Two tables + RPCs; premature per code-minimalism.

- **Authenticated banner in-memory dismissal** — Product spec (AGENTS.md § Banners); cookie dismissal is marketing-only for SSR correctness.

- **665 tests with large test files (F078)** — High count reflects Phase 11–13 hardening; file size is maintenance cost, not wrong coverage strategy.

- **knip unused sidebar / table / Toggle exports** — shadcn primitive surface area kept for composition; not dead product code.

## Open questions

- **Admin table extraction timing:** Fold into Phase 14 landing work, or a dedicated hardening epic before magic-link auth adds more admin settings? (PM decision: dedicated hardening epic / Batch 2.)
- **MSW:** Remove dead scaffolding (F072) vs keep for imminent HTTP integration tests — PM call: keep until HTTP handlers are needed.

## Resolved

| ID   | Resolved | Notes |
| ---- | -------- | ----- |
| F083 | 2026-07-21 | Phase 13 `ship-phase` — ROADMAP `Shipped`, PRD archived. |
| F084 | 2026-07-21 | ADR-0005 renamed to `ADR-0005-proxy-session-gate-two-authority-refresh.md`; links + adr README note updated. |
| F096 | 2026-07-21 | Epic 3 amended: users Refresh is intentional catch-up; no connection indicator. |

_(Older Resolved entries predated the previous full-audit date of 2026-07-21 and were pruned. Historical Phase 8 remediations remain in git history and archived Phase 8 PRD.)_

## Tooling notes

| Tool                       | Result                                                                                                      |
| -------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `pnpm audit`               | 4 high (brace-expansion ×3 advisory rows + js-yaml via eslint/vitest toolchain)                            |
| `pnpm type-check`          | Pass                                                                                                        |
| `pnpm lint`                | Pass                                                                                                        |
| `pnpm test:ci`             | 665 tests / 133 files pass; coverage thresholds met                                                         |
| `npx knip`                 | Unused exports dominated by shadcn sidebar/table surface; `msw` + `@eslint/eslintrc` flagged unused         |
| `npx madge --circular src` | No circular dependencies                                                                                    |

Adapted from [ksimback/tech-debt-skill](https://github.com/ksimback/tech-debt-skill) (MIT).
