# Tech Debt Audit — Seminova

Last full audit: 2026-07-04
Last synced: 2026-07-11 (sync pass — proxy sole-auth review fixes; test count refresh)
Scope: Full repository pass — application code (`src/`, `scripts/`, `supabase/migrations/`), config, and agent docs cross-check. Prior audit (2026-06-23) was removed from the repo in commit `85301c2`; this pass re-establishes the artifact and re-verifies every prior finding in code.

## Executive summary

- **Wide-interface god files remain churn magnets** — `users-table.tsx` (231) and `dropdown-menu.tsx` (257) still carry width; profile form and admin actions decomposed in Phase 8 Epic 5; sidebar primitive decomposed in Phase 8 Epic 4. The old ≤150-line locked rule is gone (ADR-0001) but the width problem is real where it remains.
- **Session hardening landed since last audit** — `getDisplayAuthClaims()` + `read-auth-cookie.ts` fix refresh-token races and document the display-read vs `getUser` mutation split ([ADR-0005](docs/adr/ADR-0005-proxy-as-sole-session-authority.md)); route-group `error.tsx` boundaries now cover `(app)/`, `admin/`, and `auth/`. Proxy `/login` dead branch is gone.
- **One declared `// debt:` marker** — CSP report-only default in `security-headers.ts`; enforcing requires nonce strategy before `CSP_ENFORCE=true`.
- **Quality gates pass** — `pnpm audit` clean; `type-check`, `lint`, `test:ci` green (323 tests).
- **Three open findings remain** — F011 (marketing wrapper, intentional boundary), F022 (dual form stacks, intentional per `forms.mdc`), F053 (CSP report-only declared debt).

## Architectural mental model

Seminova is a **Next.js 16 App Router template** organized into route groups: public `(marketing)/` at `/`, `auth/` at `/auth/**`, authenticated `(app)/` at `/home`, and `admin/` at `/admin/**`. Session refresh and the auth boundary run in `src/proxy.ts` → `src/supabase/proxy.ts`; admin role gating is defense-in-depth in the proxy (redirect non-admins) and `AdminAuthGate` (layout gate via `getDisplayAuthClaims`). Data access splits three ways: browser client (`@/supabase/client` + RLS), server session client (`@/supabase/server`), and secret-key service client (`@/supabase/service`) for admin user listing and role mutations.

Since the June audit, auth read paths were tightened: layouts and profile reads use `getDisplayAuthClaims` (cookie JWT via `allowExpired`, no refresh in layout) while mutations still call `getUser()` at trust boundaries. UI is shadcn-owned primitives + shared chrome (`site-*`) + route-scoped `_components`. Config-driven identity lives in `src/config/site.ts` and `landing-content.ts`.

**Hot paths:** `src/proxy.ts`, `require-auth.ts`, auth forms, `getCurrentUserProfile`, profile blur-save, admin users table + server actions, avatar upload pipeline.

**Cold corners:** CSP nonce strategy (F053 deferred).

**Largest files (LOC):** `dropdown-menu.tsx` (257), `sidebar-menu.tsx` (274), `users-table.tsx` (234), `profile-password-dialog.tsx` (164), `avatar-storage.ts` (177).

**Git churn (6 months):** Planning docs (`AGENTS.md`, `ROADMAP.md`, `.cursor/skills/`, `.cursor/rules/`) dominate; feature churn concentrated in auth session hardening, security remediation (Phase 7), and doc/hard-constraint enforcement.

## Findings

| ID   | Category                       | File:Line                                                                        | Severity | Description                                                                                                                                                                                                                   | Recommendation                                                                                                                    | Effort |
| ---- | ------------------------------ | -------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------ |
| F011 | Architectural decay            | `src/app/(marketing)/_components/landing-container.tsx:1`                        | Low      | One-line re-export of `SiteContainer`; adds indirection without behavior (still imported by hero/features/tech-stack).                                                                                                        | Import `SiteContainer` directly in marketing components; delete alias.                                                            | S      |
| F022 | Consistency rot                | `src/components/login-form.tsx:19-29` / `profile-settings-form.tsx:4-6`          | Low      | Auth forms use `useState`; profile uses `react-hook-form` + zod. Two form stacks.                                                                                                                                             | **Intentional per `forms.mdc`** — no migration without cause.                                                                     | —      |
| F053 | Declared debt                  | `src/utils/security-headers.ts:1`                                                | Medium   | Template-default CSP ships report-only. Enforcing (`CSP_ENFORCE=true`) requires nonce-based script handling for Next.js inline bootstrap scripts.                                                                             | Implement per-request nonce in middleware before setting `CSP_ENFORCE=true`; tighten directives per product surface.              | L      |

## Top 5

1. **F053 — CSP enforcement** — Requires per-request nonce strategy; deferred out of Phase 8 scope.

2. **F011 — LandingContainer wrapper** — Intentional marketing import boundary per audit assessment; low-priority cleanup only.

3. **F022 — Dual form stacks** — Intentional per `forms.mdc`; no migration without cause.

## Quick wins

- [x] F016: Gate `ReactQueryDevtools` behind development-only check (Phase 8 Epic 6)
- [x] F014: Remove duplicate `@radix-ui/react-*` packages (Phase 8 Epic 2)
- [x] F001–F003: Delete demo hook, test, and MSW handler (Phase 8 Epic 1)
- [x] F004: Delete unused `auth-button.tsx` (Phase 8 Epic 1)
- [x] F005: Delete unused `ThemeProvider.tsx` wrapper (Phase 8 Epic 1)
- [x] F010: Delete unused `landing-copyright.tsx` re-export (Phase 8 Epic 1)
- [x] F045: Document `VERCEL_URL` in `.env.example` (Phase 8 Epic 2)
- [x] F052: Remove dead `@/lib` alias from `components.json` (Phase 8 Epic 2)
- [x] F035: Surface avatar upload errors in `profile-avatar-field.tsx` catch block (Phase 8 Epic 6)
- [x] F017: Revoke object URLs after avatar preview (Phase 8 Epic 6)

## Things that look bad but are actually fine

- **Dual admin gating (`src/proxy.ts` + `AdminAuthGate`)** — Defense-in-depth by design: proxy rejects early at the edge; layout gate catches test/dev bypass. Keep both unless proxy becomes sole enforcement by explicit decision.

- **`getClaims()` on reads vs `getUser()` on mutations** — Documented in `require-auth.ts` and AGENTS.md § Auth & session. Supabase recommends JWT validation for session refresh paths; Auth server validation for sensitive writes.

- **Auth forms on `useState` while profile uses RHF+zod** — `forms.mdc` explicitly defers auth migration. Migrating login/sign-up to RHF would be churn without UX benefit.

- **Coverage exclusions for `page.tsx` / `layout.tsx` shells** — Thin re-exports with no logic; excluding them from the denominator is reasonable. Admin `_components` are now in-scope (F028 resolved Phase 8 Epic 3).

- **Bracket-tagged `console.error` instead of a logger module** — `AGENTS.md` and `logging.mdc` lock this pattern for Vercel searchability; not debt.

- **`APP_HOME === PROFILE_PATH` with comment about future divergence** — `app-paths.ts` documents the intentional collapse; acceptable until a separate app home exists.

- **`LandingContainer` one-liner wrappers (F011)** — Looks pointless but establishes a marketing import boundary for products that fork landing independently of shared chrome. Low priority cleanup only.

- **No `src/services/` repository layer yet** — `supabase.mdc` recommends it for future queries; only two tables exist. Premature abstraction would violate code-minimalism.

- **`require-auth.ts` + `read-auth-cookie.ts` added complexity** — Looks like over-engineering vs direct `getClaims()`, but fixes real refresh-token race bugs (commit `c3276dd`). Keep.

## Open questions

- **Phase 8 ship:** Phase 8 epics complete — run `ship-phase` when ready.

## Resolved

- 2026-07-05 — **F054:** ROADMAP Phase 8 stub and PRD now reference the 2026-07-04 full audit; stale "has not yet been run" copy removed at planning time (`ROADMAP.md:35`, `docs/prds/phase-8-tech-debt-remediation.prd.md:4`).
- 2026-07-05 — **F009:** Renamed `data-table1.tsx` → `data-table-shell.tsx`; updated imports and living docs (Phase 8 Epic 7).
- 2026-07-05 — **F021:** Mirrored read-vs-mutation auth split into AGENTS.md § Auth & session (Phase 8 Epic 7).
- 2026-07-05 — **F023:** Renamed `useDataTable` → `useDataTableShell` and `UseDataTableOptions` → `UseDataTableShellOptions` with F009 (Phase 8 Epic 7).
- 2026-07-05 — **F024:** Wired `Profile` / `ProfileUpdate` in `getCurrentUserProfile`, profile actions, and `profile.ts` mappers; `CurrentUserProfile` composes from `ProfileFieldsView` (Phase 8 Epic 7).
- 2026-07-05 — **F025:** Typed `AppMetadata` with `role?: string | null | undefined`; runtime gate in `isAdminFromAppMetadata`; `parseAppMetadata` at auth redirect boundaries (Phase 8 Epic 7).
- 2026-07-05 — **F027:** Added `parseJwtClaims` / `parseAuthenticatedClaims`; proxy fail-closed on unparseable claims; replaced bare casts in require-auth, assert-admin-caller, admin users page (Phase 8 Epic 7).
- 2026-07-05 — **F041:** Added `.cursor/plans/archive/README.md` path-migration header instead of bulk-editing archived plans (Phase 8 Epic 7).
- 2026-07-05 — **F042:** Added post–Phase 6 path footnote to `docs/archive/CONTEXT_ARCHIVE.md` (Phase 8 Epic 7).
- 2026-07-05 — **F016:** Gated `ReactQueryDevtools` behind `ReactQueryDevtoolsPanel` development-only wrapper in `src/providers/react-query-devtools.tsx`.
- 2026-07-05 — **F017:** Avatar preview object URLs revoked on replace, unmount, and after successful upload in `profile-avatar-field.tsx`.
- 2026-07-05 — **F018:** Documented `AVATAR_MAX_DIMENSION` (256px) as intentional main-thread resize bound in `avatar-storage.ts` (resolved under PRD story 6.5).
- 2026-07-05 — **F035:** Removed silent `catch` in avatar field; upload errors surface via `useProfileAvatarUpload` → `InlineError` / `ErrorPanel`.
- 2026-07-05 — **F037:** `getCurrentUserProfile` sets `profileLoadFailed`; profile page renders `ErrorPanel` when profile read fails.
- 2026-07-05 — **F038:** Added `admin/error.tsx` and `auth/error.tsx` route boundaries; completes prior partial resolution from 2026-07-04.
- 2026-07-05 — **F039:** Production returns 503 when Supabase env missing; dev bypass preserved; README documents clone-and-configure behavior.
- 2026-07-05 — **F047:** Set conservative `QueryClient` defaultOptions in `ReactQueryProvider.tsx` (resolved under PRD story 6.5).
- 2026-07-05 — **F048:** `SeminovaLogo` requires explicit `href: string | null`; admin sidebar passes `ADMIN_HOME` (resolved under PRD story 6.5).
- 2026-07-05 — **F050:** Compressed `opengraph-image.png` and `twitter-image.png` (~479 KB → ~105 KB); README re-skin note added.
- 2026-07-05 — F007: Extracted `useBlurSaveField`, `useProfileAvatarUpload`, and parameterized `profile-text-field.tsx`; `profile-settings-form.tsx` is now a thin orchestrator (~125 LOC).
- 2026-07-05 — F008: Extracted `assert-admin-caller.ts`, `map-users-action-fault.ts`, and `run-role-mutation.ts` to `admin/users/_lib/`; `actions.ts` holds thin exports only.
- 2026-07-05 — F026: Replaced non-null env assertions in `client.ts` and `server.ts` with `getPublicSupabaseEnv()` from shared `utils/env.ts`.
- 2026-07-05 — F049: Promote and demote share `runRoleMutation` envelope in `run-role-mutation.ts`.
- 2026-07-05 — F055: Consolidated service env loading into `getServiceSupabaseEnv()` in `utils/env.ts`; app `service.ts` and CLI `scripts/admin/lib/env.ts` both consume it.
- 2026-07-05 — F057: Removed `getServiceEnvForFetch` passthrough alias; `list-admin-users.ts` calls `getServiceSupabaseEnv()` directly.
- 2026-07-05 — F058: Consolidated env validation into `utils/env.ts` with layered helpers (`hasPublicSupabaseEnv`, `getPublicSupabaseEnv`, `getServiceSupabaseEnv`, `loadServiceEnvForCli`).
- 2026-07-05 — F006: Decomposed `sidebar.tsx` monolith into `src/components/ui/sidebar/` focused modules (provider, shell, controls, layout, group, menu); public `@/components/ui/sidebar` import path unchanged.
- 2026-07-05 — F028: Removed four admin `_components` from `vitest.config.ts` coverage exclude list; added smoke/integration tests for admin chrome.
- 2026-07-05 — F029: Added `service.unit.test.ts` covering `getServiceEnv` throw paths and happy path for `createServiceClient` / `getServiceEnvForFetch`.
- 2026-07-05 — F030: Extended `actions.unit.test.ts` with promote/demote `not_found` and service-client catch branches.
- 2026-07-05 — F031: Added `app-shell.unit.test.tsx` rendering async shell with mocked profile.
- 2026-07-05 — F032: Fixed users-table debounce test — real timers + `waitFor` flush; no `act(...)` warnings.
- 2026-07-05 — F033: Fixed profile blur-save in-flight tests — await state flush after resolving mock save.
- 2026-07-05 — F034: Site-footer tests wrap `SiteFooter` in Suspense matching production; sync `SiteCopyright` mock eliminates async client-tree warnings.
- 2026-07-05 — F051: Added `admin-auth-gate.unit.test.tsx` covering unauthenticated redirect, non-admin redirect, and admin happy path.
- 2026-07-05 — F014: Removed unused `@radix-ui/react-dropdown-menu`, `@radix-ui/react-label`, `@radix-ui/react-slot`; umbrella `radix-ui` is sole Radix dependency.
- 2026-07-05 — F015: Wired `tailwindcss-animate` via `@plugin` in `globals.css` after visual QA confirmed dialog/sheet/dropdown/alert-dialog/tooltip animations need the plugin on TW4.
- 2026-07-05 — F045: Documented optional `VERCEL_URL` in `.env.example` (auto-set on Vercel; local dev falls back to localhost).
- 2026-07-05 — F052: Removed stale `"lib": "@/lib"` alias from `components.json`.
- 2026-07-05 — F001: Demo `useGetMessage` hook and test deleted; `react-tanstack-query.mdc` cites `use-sign-out.ts`.
- 2026-07-05 — F002: `axios` dependency removed (sole consumer was demo hook).
- 2026-07-05 — F003: `/api/message` MSW handler removed; MSW node infra retained.
- 2026-07-05 — F004: Unused `auth-button.tsx` deleted; vitest coverage exclude removed.
- 2026-07-05 — F005: Unused `ThemeProvider.tsx` wrapper deleted; layout uses `next-themes` directly.
- 2026-07-05 — F010: Unused `landing-copyright.tsx` re-export deleted.
- 2026-07-05 — F012: Unused `checkbox.tsx` primitive deleted; `@radix-ui/react-checkbox` removed from manifest.
- 2026-07-05 — F013: Unused `collapsible.tsx` primitive deleted.
- 2026-07-05 — F019: camelCase demo hook filename resolved by deletion (F001).
- 2026-07-05 — F020: Default-export demo hook resolved by deletion (F001).
- 2026-07-05 — F043: Stale `use-get-message` test path in `testing.mdc` resolved by deletion + example update.
- 2026-07-05 — F044: Misleading comment on dead `auth-button.tsx` resolved by deletion (F004).
- 2026-07-05 — F046: Unused MSW browser worker entry (`browser.ts`, `index.ts`) deleted.
- 2026-07-05 — F056: Checkbox Radix split pattern mooted by deleting unused primitive (F012).
- 2026-07-04 — F036: `getCurrentUserProfile` no longer returns empty profile on missing auth — now calls `getDisplayAuthClaims` which throws on invariant violation (proxy owns gating).
- 2026-07-04 — F040: Stale `/login` proxy path check removed; public routes are `/` and `/auth/**` only.

## Tooling notes

| Tool                       | Result                                                                                                                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm audit`               | No known vulnerabilities                                                                                                                                                              |
| `pnpm type-check`          | Pass                                                                                                                                                                                  |
| `pnpm lint`                | Pass                                                                                                                                                                                  |
| `pnpm test:ci`             | 323 tests pass; coverage thresholds met                                                                                                                                               |
| `npx knip`                 | No unused profile type consumers (F024 resolved) |
| `npx madge --circular src` | Not run (optional; repo ~13k LOC — below subagent threshold)                                                                                                                          |

Adapted from [ksimback/tech-debt-skill](https://github.com/ksimback/tech-debt-skill) (MIT).
