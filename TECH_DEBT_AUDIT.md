# Tech Debt Audit — Seminova

Last full audit: 2026-07-04
Last synced: 2026-07-05
Scope: Full repository pass — application code (`src/`, `scripts/`, `supabase/migrations/`), config, and agent docs cross-check. Prior audit (2026-06-23) was removed from the repo in commit `85301c2`; this pass re-establishes the artifact and re-verifies every prior finding in code.

## Executive summary

- **Wide-interface god files remain churn magnets** — `users-table.tsx` (231) and `dropdown-menu.tsx` (257) still carry width; profile form and admin actions decomposed in Phase 8 Epic 5; sidebar primitive decomposed in Phase 8 Epic 4. The old ≤150-line locked rule is gone (ADR-0001) but the width problem is real where it remains.
- **`ReactQueryDevtools` ships unconditionally in root layout** — client bundle cost on every route including marketing.
- **Session hardening landed since last audit** — `require-auth.ts` + `read-auth-cookie.ts` fix refresh-token races and document the `getClaims` vs `getUser` split; `(app)/error.tsx` now exists. Proxy `/login` dead branch is gone.
- **One declared `// debt:` marker** — CSP report-only default in `security-headers.ts`; enforcing requires nonce strategy before `CSP_ENFORCE=true`.
- **Quality gates pass** — `pnpm audit` clean; `type-check`, `lint`, `test:ci` green (251 tests, ~91% statements / ~84% branches).
- **ROADMAP is stale on Phase 8** — still says the tech-debt audit has not been run.

## Architectural mental model

Seminova is a **Next.js 16 App Router template** organized into route groups: public `(marketing)/` at `/`, `auth/` at `/auth/**`, authenticated `(app)/` at `/profile`, and `admin/` at `/admin/**`. Session refresh and the auth boundary run in `proxy.ts` → `src/supabase/proxy.ts`; admin role gating is defense-in-depth in the proxy (redirect non-admins) and `AdminAuthGate` (layout gate via `requireAuthClaims`). Data access splits three ways: browser client (`@/supabase/client` + RLS), server session client (`@/supabase/server`), and secret-key service client (`@/supabase/service`) for admin user listing and role mutations.

Since the June audit, auth read paths were tightened: layouts and profile reads use `requireAuthClaims` (cookie JWT, no refresh in layout) while mutations still call `getUser()` at trust boundaries. UI is shadcn-owned primitives + shared chrome (`site-*`) + route-scoped `_components`. Config-driven identity lives in `src/config/site.ts` and `landing-content.ts`.

**Hot paths:** `proxy.ts`, `require-auth.ts`, auth forms, `getCurrentUserProfile`, profile blur-save, admin users table + server actions, avatar upload pipeline.

**Cold corners:** `types/profile.ts` aliases.

**Largest files (LOC):** `dropdown-menu.tsx` (257), `sidebar-menu.tsx` (274), `users-table.tsx` (231), `profile-password-dialog.tsx` (164), `avatar-storage.ts` (177).

**Git churn (6 months):** Planning docs (`AGENTS.md`, `ROADMAP.md`, `.cursor/skills/`, `.cursor/rules/`) dominate; feature churn concentrated in auth session hardening, security remediation (Phase 7), and doc/hard-constraint enforcement.

## Findings

| ID   | Category                       | File:Line                                                                        | Severity | Description                                                                                                                                                                                                                   | Recommendation                                                                                                                    | Effort |
| ---- | ------------------------------ | -------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------ |
| F009 | Architectural decay            | `src/components/data-table1.tsx:1-175`                                           | Low      | Non-descriptive filename from shadcnblocks install (`data-table1`); canonical pattern but opaque to newcomers.                                                                                                                | Rename to `data-table-shell.tsx` (or similar) and update imports/docs in one pass.                                                | S      |
| F011 | Architectural decay            | `src/app/(marketing)/_components/landing-container.tsx:1`                        | Low      | One-line re-export of `SiteContainer`; adds indirection without behavior (still imported by hero/features/tech-stack).                                                                                                        | Import `SiteContainer` directly in marketing components; delete alias.                                                            | S      |
| F016 | Performance & resource hygiene | `src/app/layout.tsx:53`                                                          | Medium   | `ReactQueryDevtools` rendered unconditionally in root layout for all routes.                                                                                                                                                  | Wrap in `process.env.NODE_ENV === 'development'` guard or dynamic import.                                                         | S      |
| F017 | Performance & resource hygiene | `src/app/(app)/profile/_components/profile-avatar-field.tsx:56`                  | Medium   | `URL.createObjectURL(file)` for preview never revoked — leaks object URLs on repeated uploads.                                                                                                                                | Call `URL.revokeObjectURL` on cleanup/replace.                                                                                    | S      |
| F018 | Performance & resource hygiene | `src/utils/avatar-storage.ts:128-129`                                            | Low      | Canvas resize-to-WebP runs synchronously on main thread during upload.                                                                                                                                                        | Acceptable for 256px cap today; document limit or move to worker if large uploads become common.                                  | M      |
| F021 | Consistency rot                | `src/supabase/require-auth.ts:52-58` vs `src/app/(app)/profile/actions.ts:56`    | Low      | `getClaims(jwt)` on read paths vs `getUser()` on mutations — now documented in `require-auth.ts` but not in `AGENTS.md` auth section; easy to regress when adding routes.                                                     | Add one paragraph to AGENTS.md § Auth & session mirroring the require-auth docblock.                                              | S      |
| F022 | Consistency rot                | `src/components/login-form.tsx:19-29` / `profile-settings-form.tsx:4-6`          | Low      | Auth forms use `useState`; profile uses `react-hook-form` + zod. Two form stacks.                                                                                                                                             | **Intentional per `forms.mdc`** — no migration without cause.                                                                     | —      |
| F023 | Consistency rot                | `src/components/data-table1.tsx:38`                                              | Low      | `UseDataTableOptions` / `useDataTable` naming vs file `data-table1`.                                                                                                                                                          | Rename with F009 for consistency.                                                                                                 | S      |
| F024 | Type & contract debt           | `src/types/profile.ts:3-5`                                                       | Low      | `Profile` / `ProfileUpdate` aliases defined but **never imported**; pages use inline selects or local types like `CurrentUserProfile`.                                                                                        | Use `Profile` in `getCurrentUserProfile` return type and actions, or delete until a second consumer exists.                       | S      |
| F025 | Type & contract debt           | `src/utils/admin.ts:5`                                                           | Low      | `AppMetadata = Record<string, unknown>` — role check is string compare only; loose for admin gate.                                                                                                                            | Narrow to `{ role?: string }` or parse `app_metadata` at boundary.                                                                | S      |
| F027 | Type & contract debt           | `src/supabase/proxy.ts:77`                                                       | Low      | `user as JwtClaims` cast — claims shape not validated beyond truthiness.                                                                                                                                                      | Validate `sub` + `app_metadata.role` shape or use typed helper when available.                                                    | S      |
| F035 | Error handling & observability | `src/app/(app)/profile/_components/profile-avatar-field.tsx:58-63`               | Medium   | Upload `catch` resets preview but **swallows error** — no `onFileError` call; user gets silent failure.                                                                                                                       | Propagate error message to `onFileError` in catch block.                                                                          | S      |
| F037 | Error handling & observability | `src/app/(app)/_lib/get-current-user-profile.ts:30-39`                           | Low      | Profile read failure returns partial profile silently — user sees empty name/avatar without explanation.                                                                                                                      | Optional inline fault banner when `profileError` set.                                                                             | S      |
| F038 | Error handling & observability | `src/app/admin/layout.tsx:10`                                                    | Medium   | **`error.tsx` only exists under `(app)/`** — admin and auth route groups still fall through to Next default on unhandled server errors.                                                                                       | Add `error.tsx` at `admin/` and `auth/` route groups per `error-handling.mdc`.                                                    | M      |
| F039 | Security hygiene               | `src/supabase/proxy.ts:14-16`                                                    | Medium   | When `hasPublicSupabaseEnv` is false, **all auth proxy checks skipped** — every route public until env configured.                                                                                                              | Document in README; consider fail-closed in production via `NODE_ENV`.                                                            | S      |
| F041 | Documentation drift            | `.cursor/plans/archive/phase_5_epic_4_toast_720328a7.plan.md:155`                | Low      | Archived epic plans still reference `src/app/(admin)/` paths removed in Phase 6.                                                                                                                                              | Bulk-find/replace in archive or add archive header noting path migration.                                                         | M      |
| F042 | Documentation drift            | `docs/archive/CONTEXT_ARCHIVE.md`                                                | Low      | Archive narrative may still reference `(admin)` route group — verify on doc sync.                                                                                                                                             | Update archive to `/admin` namespace or add footnote.                                                                             | S      |
| F047 | Architectural decay            | `src/providers/ReactQueryProvider.tsx:6-7`                                       | Low      | `QueryClient` constructed with **default options** — no `staleTime`/`retry` tuning for template.                                                                                                                              | Set conservative defaults when real client queries ship.                                                                          | S      |
| F048 | Architectural decay            | `src/components/seminova-logo.tsx:15`                                            | Low      | Default `href={ADMIN_HOME}` — correct for admin sidebar but every consumer must override for marketing/app.                                                                                                                   | Consider required `href` prop to force explicit targeting.                                                                        | S      |
| F050 | Performance & resource hygiene | `src/app/opengraph-image.png:1`                                                  | Low      | ~479 KB static OG image in app dir — large for a template repo.                                                                                                                                                               | Compress or generate from vector; document re-skin step.                                                                          | S      |
| F053 | Declared debt                  | `src/utils/security-headers.ts:1`                                                | Medium   | Template-default CSP ships report-only. Enforcing (`CSP_ENFORCE=true`) requires nonce-based script handling for Next.js inline bootstrap scripts.                                                                             | Implement per-request nonce in middleware before setting `CSP_ENFORCE=true`; tighten directives per product surface.              | L      |
| F054 | Documentation drift            | `ROADMAP.md:35`                                                                  | Low      | Phase 8 stub says tech-debt audit "has not yet been run" — false after this pass.                                                                                                                                             | Update Phase 8 stub on next planning sync.                                                                                        | S      |

## Top 5

1. **F016 — Gate React Query Devtools** — Wrap `src/app/layout.tsx:53` in a development-only check or dynamic import. Immediate production bundle win with zero product behavior change.

2. **F035 + F037 — Surface swallowed errors** — Avatar upload catch and profile read failure should produce visible user-facing feedback.

3. **F038 — Error boundaries for admin and auth** — Add route-group `error.tsx` segments per `error-handling.mdc`.

## Quick wins

- [ ] F016: Gate `ReactQueryDevtools` behind development-only check
- [x] F014: Remove duplicate `@radix-ui/react-*` packages (Phase 8 Epic 2)
- [x] F001–F003: Delete demo hook, test, and MSW handler (Phase 8 Epic 1)
- [x] F004: Delete unused `auth-button.tsx` (Phase 8 Epic 1)
- [x] F005: Delete unused `ThemeProvider.tsx` wrapper (Phase 8 Epic 1)
- [x] F010: Delete unused `landing-copyright.tsx` re-export (Phase 8 Epic 1)
- [x] F045: Document `VERCEL_URL` in `.env.example` (Phase 8 Epic 2)
- [x] F052: Remove dead `@/lib` alias from `components.json` (Phase 8 Epic 2)
- [ ] F035: Surface avatar upload errors in `profile-avatar-field.tsx` catch block
- [ ] F017: Revoke object URLs after avatar preview

## Things that look bad but are actually fine

- **Dual admin gating (`proxy.ts` + `AdminAuthGate`)** — Defense-in-depth by design: proxy rejects early at the edge; layout gate catches test/dev bypass. Keep both unless proxy becomes sole enforcement by explicit decision.

- **`getClaims()` on reads vs `getUser()` on mutations** — Now documented in `require-auth.ts`. Supabase recommends JWT validation for session refresh paths; Auth server validation for sensitive writes. Sound split — only needs AGENTS.md mirror (F021).

- **Auth forms on `useState` while profile uses RHF+zod** — `forms.mdc` explicitly defers auth migration. Migrating login/sign-up to RHF would be churn without UX benefit.

- **`data-table1.tsx` filename** — Ugly, but AGENTS.md and `data-tables.mdc` canonize it as the reference implementation; renaming is cosmetic (F009), not structural debt.

- **Coverage exclusions for `page.tsx` / `layout.tsx` shells** — Thin re-exports with no logic; excluding them from the denominator is reasonable. Admin `_components` are now in-scope (F028 resolved Phase 8 Epic 3).

- **Bracket-tagged `console.error` instead of a logger module** — `AGENTS.md` and `logging.mdc` lock this pattern for Vercel searchability; not debt.

- **`APP_HOME === PROFILE_PATH` with comment about future divergence** — `app-paths.ts` documents the intentional collapse; acceptable until a separate app home exists.

- **`LandingContainer` one-liner wrappers (F011)** — Looks pointless but establishes a marketing import boundary for products that fork landing independently of shared chrome. Low priority cleanup only.

- **No `src/services/` repository layer yet** — `supabase.mdc` recommends it for future queries; only two tables exist. Premature abstraction would violate code-minimalism.

- **`require-auth.ts` + `read-auth-cookie.ts` added complexity** — Looks like over-engineering vs direct `getClaims()`, but fixes real refresh-token race bugs (commit `c3276dd`). Keep.

## Open questions

- **`Profile` type alias (F024):** Keep as forward-looking API surface for spinoffs, or delete until a second consumer appears?
- **Production fail-closed on missing env (F039):** Should Vercel production builds hard-fail without Supabase env vars, or is permissive proxy correct for template clone-and-configure UX?
- **Phase 8 scope:** Should remediation follow severity order (demo purge → coverage → god files) or batch by route area?

## Resolved

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
- 2026-07-04 — F036: `getCurrentUserProfile` no longer returns empty profile on missing auth — now calls `requireAuthClaims` which redirects.
- 2026-07-04 — F040: Stale `/login` proxy path check removed; public routes are `/` and `/auth/**` only.
- 2026-07-04 — F038 (partial): `(app)/error.tsx` added; admin and auth segments still open (finding retained as F038 with reduced scope).

## Tooling notes

| Tool                       | Result                                                                                                                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm audit`               | No known vulnerabilities                                                                                                                                                              |
| `pnpm type-check`          | Pass                                                                                                                                                                                  |
| `pnpm lint`                | Pass                                                                                                                                                                                  |
| `pnpm test:ci`             | 251 tests pass; ~91.45% statements / 83.89% branches (thresholds met)                                                                                                               |
| `npx knip`                 | Unused: `profile.ts` type consumers |
| `npx madge --circular src` | Not run (optional; repo ~13k LOC — below subagent threshold)                                                                                                                          |

Adapted from [ksimback/tech-debt-skill](https://github.com/ksimback/tech-debt-skill) (MIT).
