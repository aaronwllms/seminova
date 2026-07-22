# Tech Debt Audit — Seminova

Last full audit: 2026-07-21
Last synced: 2026-07-22 (Phase 14 Epics 1–6 — 26 findings resolved)
Scope: Sync pass — verified open findings from the 2026-07-21 full pass against the current tree after Phase 14 Tech Debt Hardening (Epics 1–6 complete). No full-repo rescan.

## Executive summary

- **Phase 14 cleared the actionable audit clusters** — shared debounce/query/unwrap helpers (Epic 1), admin table decomposition into thin components + state hooks (Epics 2–3), settings-registry type derivation and logs filter typing without production casts (Epic 4), actions-layer barrels and split tests (Epic 5), dependency/test/reference hygiene (Epic 6). Twenty-six findings moved to Resolved; F066 reclassified as a deep module.
- **CSP report-only remains the largest security ceiling** — `security-headers.ts` still ships template-default report-only CSP (F053); enforcing requires per-request nonce strategy (deferred to a future security phase per ROADMAP).
- **Toolchain audit surface shifted** — `pnpm audit` no longer reports brace-expansion / js-yaml (Epic 6); one high-severity `sharp` transitive path via Next.js remains (F081 updated).
- **Three declared `// debt:` markers in application code** — CSP (F053), duplicate profile providers (F061), settings row dispatch switch (F062). CLI catch duplication (F063) and registry hand-sync (F059) are resolved.
- **Admin tables are decomposed** — `users-table.tsx` (~168 LOC) and `logs-table.tsx` (~158 LOC) compose toolbar/shell/dialogs; state lives in `use-admin-users-table-state.ts` / `use-admin-logs-table-state.ts` (F064/F065 resolved).
- **Quality gates green** — `type-check`, `lint`, and `test:ci` pass (690 tests / 141 files). Coverage thresholds met. No circular deps (`madge src`).

## Architectural mental model

Seminova is a **Next.js 16 App Router template** with route groups: public `(marketing)/`, `auth/`, authenticated `(app)/` at `/home`, and `admin/` at `/admin/**`. Session gating runs in `src/proxy.ts` → `src/supabase/proxy.ts`; the **two-authority refresh model** (proxy on matched server requests + browser foreground auto-refresh) per ADR-0005 enables Supabase Realtime on `/admin/logs`.

Data access splits three ways: browser client (RLS), server session client, and secret-key service client for admin listing and log persistence. Admin surfaces were the prior complexity center; Phase 14 extracted shared helpers and split table orchestration into dedicated state hooks while preserving behavior.

**Hot paths:** `src/proxy.ts`, `require-auth.ts`, admin users/logs state hooks and their TanStack Query layers, `persistAppLogRow`, profile blur-save, avatar upload.

**Cold corners:** CSP nonce strategy (F053), MSW infrastructure (F072), rate limiting on `/api/client-logs` (F082 — accepted per ADR-0007).

**Largest source files (LOC, excluding tests):** `workflow-diagram.tsx` (485), `banner-setting-row.tsx` (429), `reference-profile-settings-preview.tsx` (~340), `use-admin-users-table-state.ts` (385), `use-admin-logs-table-state.ts` (375).

**Git churn (6 months):** Phase 14 hardening concentrated in `src/app/admin/` helpers and table state hooks; planning docs continue to dominate commit volume.

**LOC scale:** ~21k lines of non-test TypeScript under `src/` — below the skill's subagent threshold.

## Findings

| ID   | Category            | File:Line                                                                 | Severity | Description                                                                                                                                                                                                 | Recommendation                                                                                                                                  | Effort |
| ---- | ------------------- | ------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| F022 | Consistency rot     | `src/components/login-form.tsx:19-29` / `profile-settings-form.tsx:4-6`    | Low      | Auth forms use `useState`; profile uses RHF + zod. Two form stacks.                                                                                                                                           | **Intentional per `forms.mdc`** — no migration without cause.                                                                                   | —      |
| F053 | Declared debt       | `src/utils/security-headers.ts:1`                                         | Medium   | Template-default CSP ships report-only. Enforcing requires per-request nonce for Next.js inline scripts.                                                                                                      | Implement nonce in middleware before `CSP_ENFORCE=true`; tighten directives per surface.                                                        | L      |
| F060 | Architectural decay | `src/components/site-header.tsx:29` / `site-footer.tsx:31`                | Low      | Identical `md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]` track string duplicated across header and footer — intentionally kept inline per Phase 14 Epic 1 (constant extraction deferred).                  | Extract shared grid class constant if a third chrome surface copies the pattern; until then the paired inline comment is sufficient.              | S      |
| F061 | Declared debt       | `src/app/(app)/_components/app-header-account-nav.tsx:10`                 | Low      | Desktop and mobile marketing header slots each mount `ProfileDialogProvider` + dialog tree.                                                                                                                   | Consolidate via `SiteHeader` API if a third slot appears (marker's ceiling).                                                                    | M      |
| F062 | Declared debt       | `src/app/admin/settings/_components/app-setting-row.tsx:291`              | Low      | Two-type `if (valueType === …)` dispatch for logging settings; banner rows bypass this component entirely.                                                                                                  | Refactor to registry-driven dispatch when a third non-banner `valueType` lands.                                                                  | S      |
| F071 | Architectural decay | `src/components/ui/dropdown-menu.tsx:1-257`                               | Low      | Radix re-export barrel still ~257 LOC with many re-exported sub-primitives (carried from prior audit).                                                                                                        | Accept as shadcn ecosystem surface unless a future shadcn update splits it; no action unless import tree bloat matters.                           | —      |
| F072 | Dependency & config | `package.json:93` / `public/mockServiceWorker.js:1`                       | Low      | MSW v2 devDependency and generated service worker present; zero handlers, no test imports (`knip` flags `msw` unused).                                                                                      | Remove MSW + worker until HTTP mocking is needed, or add first handler + setup in one PR (AGENTS.md defers intentionally).                      | S      |
| F080 | Performance         | `src/app/(marketing)/workflow/_components/workflow-diagram.tsx:1-485`     | Low      | Large client component with hover/focus state machine, step panels, and SVG layout — no code-splitting; loads with workflow page bundle.                                                                    | Accept for marketing page; `dynamic()` split only if bundle analyzer shows regression.                                                            | —      |
| F081 | Dependency & config | `pnpm audit` (sharp via Next.js)                                          | Medium   | 1 high-severity CVE path: `sharp` <0.35.0 (libvips inherited vulnerabilities) via `next`, `@vercel/analytics>next`, and `nextjs-toploader>next`. Prior brace-expansion / js-yaml advisories cleared in Phase 14 Epic 6. | `pnpm update` / overrides to patched `sharp@>=0.35.0` when Next.js toolchain permits; re-run audit before release.                                | S      |
| F082 | Security hygiene    | `docs/adr/ADR-0007-client-log-relay-unauthenticated.md:7`               | Low      | Client log relay intentionally ships without rate limiting — public POST surface bounded by closed registry + same-origin check only.                                                                         | Add path-based rate limit (CDN or middleware) before production scale; ADR documents the seam.                                                  | M      |
| F085 | Documentation drift | `README.md:11`                                                            | Low      | Hero screenshot TODO comment — landing page renders without committed marketing asset.                                                                                                                      | Capture light/dark hero PNG to `public/images/` and remove TODO.                                                                                | S      |
| F089 | Reinventing platform | `src/app/admin/logs/_components/logs-table.tsx` / `profile-theme-segment.tsx` | Low | Manual hydration guards with `eslint-disable-next-line react-hooks/set-state-in-effect` for localStorage and next-themes — no shared primitive.                                                              | Accept as idiomatic for SSR hydration mismatches; extract only if a third guard appears.                                                        | —      |
| F091 | Error handling      | `src/utils/persist-app-log.ts:44-52`                                      | Low      | Persist failures log via raw `console.error` and silent-drop — intentional anti-recursion, but rows are lost with no admin surfacing.                                                                       | Accept for template; add metrics/alert on persist failure rate if logs become production-critical.                                              | —      |
| F095 | Security hygiene    | `src/utils/security-headers.ts:38`                                        | Low      | `style-src 'unsafe-inline'` required for Tailwind — not separately marked with `// debt:`; pairs with F053 enforcement work.                                                                                 | Revisit when CSP moves to enforcing; may need nonce/hash strategy for styles too.                                                                 | L      |
| F100 | Declared debt       | `scripts/checks/a11y-structure.mjs:1` / `a11y-contrast.mjs:131`           | Low      | Hard-constraint checkers document static-analysis ceilings (barrel imports, dynamic `alt`, OKLCH alpha, `var()` indirection) as `// debt:` — known false-negative surface for a11y gates.                   | Accept until a real miss escapes CI; then upgrade checkers rather than papering with more rules.                                                | M      |

## Top 5

1. **F053 — CSP enforcement** — Still the largest security ceiling. Requires middleware nonce threaded into `script-src` and Next.js bootstrap before `CSP_ENFORCE=true`. Deferred to a future security phase per ROADMAP; no shortcut.

2. **F081 — Sharp transitive CVE** — Phase 14 cleared brace-expansion / js-yaml; audit now surfaces one high via Next.js's `sharp` dependency. Patch or override before release.

3. **F085 — Hero screenshot** — README still carries a TODO; needs a captured light/dark asset and design judgement (manual PM/design task per Phase 14 PRD).

4. **F061 + F062 — Declared marketing/settings ceilings** — Duplicate profile providers and settings-row dispatch switch are pre-declared; act only when a third slot or value type appears.

5. **F095 + F053 — Style CSP when enforcing** — `unsafe-inline` for Tailwind pairs with the script nonce work; plan both before flipping enforcement.

## Quick wins

- [ ] F081: Patch or override transitive `sharp` to `>=0.35.0`; re-run `pnpm audit`
- [ ] F085: Capture hero screenshot and remove README TODO
- [ ] F060: Extract shared header/footer grid class constant (optional — deferred intentionally in Epic 1)

## Things that look bad but are actually fine

- **Dual admin gating (`proxy.ts` + `AdminAuthGate`)** — Defense-in-depth; `AdminAuthGate` probes `hasServerAuthSession` before claims on cold cache (Phase 13 fix). Keep both.

- **Two refresh authorities (proxy + browser)** — Amended ADR-0005 + RESEARCH-0004; RSC refresh removed. Filename matches (`ADR-0005-proxy-session-gate-two-authority-refresh.md`).

- **Auth forms on `useState` vs profile RHF** — `forms.mdc` intentional (F022).

- **MSW deferred (F072)** — AGENTS.md explicitly documents global setup deferred until HTTP handlers needed; removing now saves little vs future test work.

- **`persistAppLogRow` silent drop (F091)** — Anti-recursion design; raw `console.error` is the exempt surface per `logging.mdc`.

- **Client log relay without session (F082)** — ADR-0007 accepted; closed registry + same-origin + size caps bound abuse for template scale.

- **Reference demos (F090/F098 resolved)** — Table demo documents sanctioned client-side fixture pagination; profile preview documents showroom-only password stub and `referenceDemoPersist`. Both consume shared helpers where applicable.

- **`dropdown-menu.tsx` width (F071)** — shadcn ecosystem re-export barrel; splitting fights upstream updates.

- **Workflow diagram bundle size (F080)** — Marketing explainer page; integration test covers a11y; now in coverage denominator (F073 resolved); code-split only on evidence.

- **`banner-setting-row.tsx` width (F066)** — Phase 14 PRD re-examined against ADR-0001 / LEXICON deep-module definition: narrow interface (4 props), single responsibility (edit one banner setting), no co-change signal. Deep module, not a god file.

- **Admin state hooks (~375–385 LOC)** — Complexity moved out of table components by design (Epics 2–3); hooks own one surface's state with a narrow table interface. Not the same width problem as the pre-Phase-14 orchestrators.

- **Coverage exclusions for `page.tsx` / `layout.tsx` / UI primitives / static workflow sections** — Thin shells, vendored shadcn, or static marketing prose; interactive `workflow-diagram.tsx` is now measured (F073/F099 resolved).

- **No `src/services/` layer** — Two tables + RPCs; premature per code-minimalism.

- **Authenticated banner in-memory dismissal** — Product spec (AGENTS.md § Banners); cookie dismissal is marketing-only for SSR correctness.

- **690 tests across split action test files (F078 resolved)** — Higher count reflects Phase 11–14 hardening; split layout mirrors `_lib/` modules.

- **knip unused sidebar / table / Toggle exports** — shadcn primitive surface area kept for composition; not dead product code.

## Open questions

- **MSW:** Remove dead scaffolding (F072) vs keep for imminent HTTP integration tests — PM call: keep until HTTP handlers are needed.

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
| `pnpm audit`               | 1 high (`sharp` <0.35.0 via Next.js transitive paths); brace-expansion / js-yaml cleared since prior sync |
| `pnpm type-check`          | Pass                                                                                                        |
| `pnpm lint`                | Pass                                                                                                        |
| `pnpm test:ci`             | 690 tests / 141 files pass; coverage thresholds met                                                         |
| `npx knip`                 | Unused exports dominated by shadcn sidebar/table surface; `msw` flagged unused devDependency                |
| `npx madge --circular src` | No circular dependencies                                                                                    |

Adapted from [ksimback/tech-debt-skill](https://github.com/ksimback/tech-debt-skill) (MIT).
