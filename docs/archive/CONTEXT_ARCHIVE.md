# CONTEXT_ARCHIVE.md — Shipped phase detail

**Append-only.** When a phase ships in full, move its epic/story detail here from [CONTEXT.md](CONTEXT.md). Never edit existing archive entries.

**Resolved decisions** from the planning brief also append here under `## Resolved decisions`.

---

## Phase 1 — Foundation & Cleanup `Shipped` (2026-06-18)

Get the cloned starter into a clean, opinionated baseline, make the inherited rule set correct and project-agnostic, and stand up the documentation layer. The rules work lands here (not at the end) because everything built in Phases 2–6 is expected to comply with these rules — they must be correct before they govern downstream work.

### Epic 1A — Foundation cleanup `Shipped`

- [x] **1A.1 — Remove starter scaffolding.** Delete the `tutorial/` components and any demo/test-example pages so projects spun from the template start clean.
- [x] **1A.2 — Standardize on pnpm.** Delete `package-lock.json` (created by an accidental `npm install`); use pnpm exclusively. Confirm `pnpm install` produces a clean tree.
- [x] **1A.3 — Dependency security pass.** Resolve the `npm audit` advisories by updating dev tooling **forward** (vitest / vite / esbuild to current; keep Next.js on its latest patch to clear the bundled `postcss` issue). **Do not** run `npm audit fix --force` — it would downgrade Next.js to 9 and break the app. Verify build + tests pass after.

### Epic 1B — Rules correctness & de-specialization `Shipped`

- [x] **1B.1 — Rules describe the template's actual stack and structure.** Vitest (not Jest), Next.js 16, `@/supabase/client` + `@/supabase/server`, `proxy.ts` auth boundary, `cn()` from `@/utils/tailwind`.
- [x] **1B.2 — Rule examples are project-agnostic and obey the locked principles.** Prior-project residue removed; rules-dir README de-specialized; semantic token examples throughout.

### Epic 1C — Docs `Shipped`

- [x] **1C.1 — Establish docs.** [CONTEXT.md](CONTEXT.md) (planning brief), [AGENTS.md](AGENTS.md) (doc map, agent workflow, schema authority), and a public-facing root [README.md](README.md). The rules-dir README is owned by 1B.2; 1C owns only the root README.

### Epic 1D — Dev tooling hygiene `Shipped`

- [x] **1D.1 — Husky hooks.** Pre-commit: lint-staged (ESLint + Prettier on staged JS/TS; Prettier on md/json/yaml/css) + type-check. Pre-push: `pnpm pre-push` mirrors CI (type-check → lint → format-check → test:ci with coverage).
- [x] **1D.2 — Coverage thresholds.** 80% minimum (lines, functions, branches, statements) in `vitest.config.ts`; `pnpm test:ci` runs with coverage; CI enforces via existing workflow. Baseline merit-based tests for auth forms, proxy, hooks, and utils. Coverage exclude set omits UI primitives, page/layout shells, thin providers, and client factories — not filler tests to hit the metric.
- [x] **1D.3 — `.prettierignore` and `.gitignore` audit.** Build output, lockfiles, env, and coverage ignored. Agent-authored top-level docs (`CONTEXT.md`, `AGENTS.md`, `CONTEXT_ARCHIVE.md`, `README.md`) and `.cursor` remain Prettier-ignored so whole-file agent syncs do not churn formatting.

---

## Phase 2 — Design-System Token Layer `Shipped` (2026-06-18)

Establish the token *definition* layer the rules already assume exists, and brand the template with its shipped default theme. **Theme: tweakcn Clean Slate** (indigo primary; Inter / Merriweather / JetBrains Mono). Token architecture documented in [DESIGN.md](DESIGN.md); values authoritative in `src/app/globals.css`.

### Story 1 — Clean Slate token system `Shipped`

- [x] **2.1 — Merge Clean Slate into globals.css.** Replaced stock neutral tokens with Clean Slate color (light + dark), typography, spacing, radius, and shadow. Preserved Seminova `radius-2xl`–`4xl` extensions. Added `--destructive-foreground` (resolves button/badge references). Deleted one-time `clean-slate-theme.css` input after verification.
- [x] **2.2 — Wire fonts.** Inter + JetBrains Mono via `next/font` in `layout.tsx`; Merriweather CSS serif fallback; removed orphaned `geist` package.

### Story 2 — Token conformance `Shipped`

- [x] **2.3 — Auth form errors.** Four `/auth/**` forms: `text-red-500` → `text-destructive` with `role="alert"`.
- [x] **2.4 — Top loader.** `NextTopLoader` color → `var(--primary)`.
- [x] **2.5 — Re-audit and cleanup.** Zero hardcoded color violations in `src/`; deleted one-time `audit-hardcoded-colors.md`.

### Story 3 — DESIGN.md `Shipped`

- [x] **2.6 — Design system documentation.** Root [DESIGN.md](DESIGN.md): token architecture, structure-vs-theme split, tweakcn re-skin workflow, Clean Slate provenance. Points to `globals.css` as authoritative values (no value duplication).
- [x] **2.7 — Repo truth sync.** AGENTS.md doc map + Implemented now (Clean Slate, Inter/JetBrains Mono); README + DESIGN.md cross-links; `components.json` `baseColor` → `slate`.

---

## Phase 3 — App Shell (Admin sidebar) + Auth restyle `Shipped` (2026-06-19)

Admin-scoped authenticated shell (sidebar pattern), first real data page, and token-compliant auth branding. Non-admin authenticated users still use the starter `/protected` shell until Phase 6.

### Epic 1 — Admin authentication `Shipped`

- [x] **3.1 — Admin CLI.** `pnpm promote-admin`, `pnpm demote-admin`, `pnpm list-admins` via `SUPABASE_SECRET_KEY`; y/N confirmation on promote/demote; idempotent promote; clear "sign up first" error when email missing.
- [x] **3.2 — Admin gate locked rule.** `app_metadata.role === 'admin'` on `auth.users` is canonical — set only via secret-key CLI; do not move to `profiles` without PM approval (AGENTS.md + `.cursor/rules/security.mdc`).

### Epic 2 — Admin app shell `Shipped`

- [x] **3.3 — Sidebar layout.** `(admin)` route group with `sidebar-07` baseline (`SidebarRail`, `SidebarTrigger` retained); dynamic breadcrumb; Users nav link to `/users`.
- [x] **3.4 — Nav user footer.** Avatar initials + email trigger; Sign out only (real Supabase `signOut()`); Account/Billing/Notifications stripped.
- [x] **3.5 — Post-login redirect.** Admins → `/users`; non-admins → `/protected` (login + password-update flows).

### Epic 3 — Users reference page `Shipped`

- [x] **3.6 — Users table.** Real `auth.admin.listUsers()` via gated Server Action; columns: Email, Verified, Created, Last sign-in, Role; read-only (CLI-only promotion).
- [x] **3.7 — Search and pagination.** Email-only search; Next/Previous, page size 50; canonical pattern in `.cursor/rules/data-tables.mdc` with real glob paths and `users-table.tsx` reference.

### Epic 4 — Auth screen restyle `Shipped`

- [x] **3.8 — Shared auth layout.** `src/app/auth/layout.tsx` — muted full-page shell (`bg-muted`), centered form, logo above forms; applied across all `/auth/**` screens.
- [x] **3.9 — Site identity config.** `src/config/site.ts` (`name` + `Logo`); `SeminovaLogo` reads site config (admin sidebar + auth layout); AGENTS.md + README cross-reference.

---

## Phase 4 — Landing Page `Shipped` (2026-06-19)

Styled public landing/marketing page as the canonical public entry point at `/`.

### Epic 1 — Header & Footer Chrome `Shipped`

- [x] **4.1 — Marketing route group.** `(marketing)` with sticky `LandingHeader`, document-flow `LandingFooter`, shared `LandingContainer` (`max-w-7xl`, `px-6 lg:px-8`).
- [x] **4.2 — Nav and chrome config.** Nav, social, and legal links in `src/config/site.ts`; Login/Sign Up to `/auth/**`; flat top-level nav (no dropdowns).
- [x] **4.3 — Mobile nav.** Sheet-based mobile navigation for small viewports.

### Epic 2 — Landing Page Content `Shipped`

- [x] **4.4 — Hero.** Centered hero with title, description, and CTA; copy in `src/config/landing-content.ts`.
- [x] **4.5 — Features grid.** Six-card grid (`id="features"`) with the planned differentiator copy.
- [x] **4.6 — Tech-stack marquee.** Six official brand SVGs in `public/tech/`; kibo-ui marquee primitives (`react-fast-marquee`); edge fades and pause on hover.

### Epic 3 — Site Identity Audit `Shipped`

- [x] **4.7 — Centralized metadata.** `description` + `getSiteMetadata()` in `site.ts`; root `layout.tsx` wired for browser tab title and SEO.
- [x] **4.8 — Protected shell label.** `/protected` nav reads `siteConfig.name`.
- [x] **4.9 — Metadata test.** `site.unit.test.ts` for `getSiteMetadata()` contract.

---

## Phase 5 — Admin Surface Polish & Toasting `Shipped` (2026-06-22)

Retrofitted shared error/loading patterns and a toast system into the admin users surface and auth forms — not a standalone reference/demo page. Form/settings pattern deferred to Phase 6.

### Epic 1 — Shared Error State Component `Shipped`

- [x] **5.1 — Shared error wire-through.** Consolidated ad hoc inline errors across users table and four auth forms; captured raw Supabase `AuthError.code` (taxonomy mapping deferred to Phase 7). Interim single component superseded by Epic 2 severity split.

### Epic 2 — Error Severity Architecture `Shipped`

- [x] **5.2 — `kind: operational | fault` on error envelope.** `AppError` type; classification at producer/catcher — not inferred in UI.
- [x] **5.3 — `InlineError` + `ErrorPanel`.** Operational vs fault display components; retrofitted all five surfaces; `.cursor/rules/error-handling.mdc` updated.

### Epic 3 — Skeleton Loading State for Users Table `Shipped`

- [x] **5.4 — Users table + admin layout skeletons.** `DataTableShell` + `DataTableSkeletonBody` with per-column `skeletonClassName` meta; `AdminShellSkeleton` behind Suspense on admin layout; `.cursor/rules/data-tables.mdc` loading pattern.

### Epic 4 — Toast Notification System `Shipped`

- [x] **5.5 — Sonner toast system.** shadcn `Toaster` in root layout; `showSuccessToast` helper; errors never use toasts (see `.cursor/rules/notifications.mdc`).

### Epic 5 — In-App Admin Promote/Demote `Shipped`

- [x] **5.6 — Row actions on `/users`.** Confirmation dialog + success toast; shared mutation logic in `admin-role-mutations.ts`; CLI scripts delegate to same utils.
- [x] **5.7 — Locked-rule update.** AGENTS.md admin gate now permits in-app promote/demote (admin-gated server actions + service client) alongside secret-key CLI.

---

## Phase 6 — Data Model Foundation `Shipped` (2026-06-23)

First real migration and the authenticated end-user surface. Establishes `profiles` as the one assumed schema primitive, a real `/admin/*` console namespace, the shared-chrome shell pattern, the first Supabase Storage bucket, the canonical form stack, and bidirectional admin ↔ app nav switches. The generic `/protected` starter shell is removed.

### Epic 1 — Profiles Data Foundation `Shipped`

- [x] **6.1 — `profiles` table.** 1:1 with `auth.users`; columns `display_name`, `avatar_url`, `bio`; no `role` column (admin gate stays on `app_metadata.role`).
- [x] **6.2 — Signup trigger + RLS.** Auto-create profile on signup; owner-scoped SELECT/UPDATE; AGENTS.md data model seeded.

### Epic 2 — Admin Namespace Foundation `Shipped`

- [x] **6.3 — `/admin` URL segment.** Users table at `/admin/users`; `/admin` dashboard landing; blanket admin-role gating on `/admin/*`; post-login redirect for admins → `/admin`.

### Epic 3 — Shared Chrome + Authenticated Shell `Shipped`

- [x] **6.4 — Shared chrome primitives.** `SiteHeader`, `SiteFooter`, `SiteContainer`, etc.; marketing wrappers unchanged visually.
- [x] **6.5 — `(app)` route group.** `AppShell` with circle-avatar `AppNavUser` (profiles-aware); app logo/footer target `APP_HOME`; marketing section nav omitted on authenticated surfaces.

### Epic 4 — Avatar Storage `Shipped`

- [x] **6.6 — `avatars` bucket.** Public-read, owner-scoped writes; canonical storage pattern; client upload utils (`avatar-storage.ts`); reference in `profiles.avatar_url`.

### Epic 5 — Profile Page `Shipped`

- [x] **6.7 — `/profile` settings page.** Combined view+edit for display name, avatar, bio, password; `react-hook-form` + zod form stack codified in `.cursor/rules/forms.mdc`.
- [x] **6.8 — Post-login landing.** Non-admins → `/profile`; `/protected` removed; theme toggle on profile; marketing ↔ app round-trip (`LandingAuthSlot`, footer back link).

### Epic 6 — Profile Surface Redesign `Shipped`

- [x] **6.9 — Restrained layout + blur-save.** `max-w-prose` fields; display name/bio save on blur with inline indicator; avatar on upload; password in modal with `current_password`; `ToggleGroup` theme segment; conformant `forms.mdc` + `notifications.mdc` reference.

### Epic 7 — Admin Profile Link `Shipped`

- [x] **6.10 — Admin → profile link.** `AdminNavUser` Profile → `/profile`; shared `useSignOut` hook extracted for all sign-out paths.

### Epic 8 — Auth Form Password-Manager Affordances `Shipped`

- [x] **6.11 — Auth form `autocomplete`.** Four auth forms retrofitted per `forms.mdc`; update-password adds hidden paired username from recovery session.

### Epic 9 — App-to-Admin Console Switch `Shipped`

- [x] **6.12 — App → admin link.** Admin-gated "Admin console" in `AppNavUser` → `/admin`; `isAdmin` derived server-side from `app_metadata`; mirror of Epic 7 admin → app leg.

---

## Phase 7 — Security Audit Remediation `Shipped` (2026-06-24)

Remediation pass over `SECURITY_AUDIT.md` findings (no Critical or High). Four independent epics: open-redirect hardening, server-side avatar URL scoping, report-only security headers, and fallback-first auth error taxonomy deferred from Phase 5.

### Epic 1 — Open-redirect fix on /auth/confirm `Shipped`

- [x] **7.1 — Same-origin redirect validation on confirm.** `/auth/confirm` validates `next` via `isSafeRedirect`; off-origin targets fall back to role-based post-auth path; regression test for rejected off-origin `next`. (Audit: Medium)

### Epic 2 — Server-side avatar URL scoping `Shipped`

- [x] **7.2 — Reject non-owned avatar URLs in `updateProfileAction`.** `isOwnedAvatarStorageUrl` gates `avatar_url` persistence; external or other-user URLs omitted; versioned cache-bust preserved. Third migration adds public SELECT on `storage.objects` for avatars upsert. (Audit: Low)

### Epic 3 — Security headers `Shipped`

- [x] **7.3 — Security-headers module with env-driven CSP.** `src/utils/security-headers.ts` wired via `next.config.ts`; CSP report-only by default (`CSP_ENFORCE` opt-in); `// debt:` marker for nonce strategy before enforcement; AGENTS.md records convention.

### Epic 4 — AuthError taxonomy mapping `Shipped`

- [x] **7.4 — Fallback-first `extractAuthFormError`.** `AUTH_ERROR_OVERRIDES` for known Supabase codes; unmapped codes → generic operational copy, never raw Supabase messages; bracket-tagged log on fallback path only; convention canonized in `error-handling.mdc`.

---

## Resolved decisions

**Auth screens — restyle vs rebuild** (resolved 2026-06-18, Phase 3 planning)
Restyle in place, not rebuild. Phase 2 validated in-place token swaps work; Phase 3 applies the shadcn `-03` pattern (muted background, centered form, no side image) uniformly across all `/auth/**` screens using existing token values. Form fields and flows are unchanged.

**Utilities location:** `cn` stays at `@/utils/tailwind` (consistent with the named-directory taxonomy; no catch-all `lib/`). Dead `src/lib/utils.ts` shadcn scaffold deleted.

**Phase 5 scope — admin polish vs standalone reference page** (resolved 2026-06-19, Phase 5 planning)
Renamed from "Reference Implementations" to "Admin Surface Polish & Toasting". Patterns ship in real surfaces (users table, auth forms) rather than a dedicated demo page; form/settings pattern owned by Phase 6.

**In-app admin promote/demote** (resolved 2026-06-22, Phase 5 Epic 5)
Admin gate locked rule expanded: `app_metadata.role` may be set via in-app promote/demote on `/users` (admin-gated server actions + service client) or secret-key CLI (`pnpm promote-admin`, `pnpm demote-admin`). Role must not move to a `profiles` column without PM approval.

**Forms stack** (resolved 2026-06-22, Phase 6 planning)
Adopt `react-hook-form` + `zod` as the canonical template form stack — the standard shadcn/Next pairing (shadcn's `Form` is built on RHF), satisfying ecosystem alignment over divergence. Established as a real convention by Phase 6 Epic 4 (the first real form) and documented in `.cursor/rules/` as a coding standard.

**Profiles in template vs per-product** (resolved 2026-06-22, Phase 6 planning)
Ship the `profiles` migration in the template by default as the one assumed schema primitive — "users must exist" is universal, and leaving it per-product would force every spinoff to re-derive the same table + trigger + RLS. Columns scoped to `display_name`, `avatar_url`, `bio`; no `role` column (admin gate stays on `app_metadata.role` per locked rule).
