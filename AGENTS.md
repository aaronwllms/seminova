# AGENTS.md — Repo truth for coding agents

**Purpose:** What exists in this repo today — locked rules, implemented features, routes, data model, and where to look. For planning and roadmap, see [CONTEXT.md](CONTEXT.md). For human setup, see [README.md](README.md). For how to write code, see [.cursor/rules/](.cursor/rules/) (not duplicated here).

**Last updated:** 2026-06-23

| Document | Audience | Role |
| -------- | -------- | ---- |
| [CONTEXT.md](CONTEXT.md) | PM + agents | Planning brief — roadmap, ACTIVE epics, open questions |
| [DOC_RULES.md](DOC_RULES.md) | PM + agents | Doc maintenance procedure — write discipline, doc roles, archive policy |
| [CONTEXT_ARCHIVE.md](CONTEXT_ARCHIVE.md) | PM + agents (on demand) | Shipped phase narratives — append-only |
| [README.md](README.md) | Humans | Clone, env setup, scripts, contributing |
| [AGENTS.md](AGENTS.md) | Agents | **This file** — repo truth, locked rules, what's implemented |
| [DESIGN.md](DESIGN.md) | PM + agents | Token architecture, structure-vs-theme split, re-skin workflow |
| [.cursor/rules/](.cursor/rules/) | Agents | Coding standards (TypeScript, testing, Supabase, security) |
| [.cursor/skills/](.cursor/skills/) | Agents | User-triggered workflows (`/sync-repo-docs`, `/create-migration`, etc.) |
| [.cursor/plans/](.cursor/plans/) | Agents | Ephemeral epic plans — **not** shipped truth |

---

## Agent workflow

1. **Read** AGENTS.md + relevant `.cursor/rules/` and skills before coding.
2. **Migrations:** agents write SQL files in `supabase/migrations/` only. Humans run `pnpm db:push` and `pnpm db:types`. See [.cursor/rules/do-migrations-agent.mdc](.cursor/rules/do-migrations-agent.mdc).
3. **Quality bar** before finishing work:

   ```bash
   pnpm type-check && pnpm lint && pnpm format-check && pnpm test:ci
   ```

4. **Doc sync** after behavior, routes, schema, or env changes:
   - `/sync-repo-docs` — AGENTS.md + README.md
   - `/sync-context-md` — CONTEXT.md planning brief

---

## Setup and quality commands

| Command | Purpose |
| ------- | ------- |
| `pnpm dev` | Development server at `http://localhost:3000` |
| `pnpm build` | Production build |
| `pnpm start` | Run production build |
| `pnpm type-check` | TypeScript (`tsc --noEmit`) |
| `pnpm lint` | ESLint (repo-wide) |
| `pnpm lint-fix` | ESLint with auto-fix |
| `pnpm format` | Prettier write |
| `pnpm format-check` | Prettier check (CI) |
| `pnpm test` | Vitest watch mode (human dev only) |
| `pnpm test:ci` | Vitest run once with coverage gates (agents, CI, pre-push) |
| `pnpm pre-push` | Full CI mirror locally (type-check → lint → format-check → test:ci) |
| `pnpm test:ui` | Vitest UI |
| `pnpm analyze` | Bundle analyzer |
| `pnpm promote-admin <email>` | Grant admin via secret key (`app_metadata.role`) |
| `pnpm demote-admin <email>` | Remove admin role |
| `pnpm list-admins` | List admin users (read-only) |
| `pnpm db:push` | Apply pending SQL migrations to linked Supabase project (human only; CLI prompts) |
| `pnpm db:types` | Regenerate `src/types/database.types.ts` from linked project schema |

**Prerequisites:** Node `>=22.22.2` (see [.nvmrc](.nvmrc)), pnpm 11, Supabase project. Env vars in [.env.example](.env.example) (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` for admin CLI). `next-env.d.ts` is Next.js-generated and gitignored — run `pnpm dev` or `pnpm build` once after clone if `pnpm type-check` reports a missing file.

---

## Locked rules

**Canonical home for the locked rules** — these must not be violated. Consumption detail lives in `.cursor/rules/`; CONTEXT.md §3 is a pointer back here. When a locked rule changes (PM approval required), edit this section.

- **Ecosystem alignment over aesthetic divergence:** Don't canonize a non-standard convention for tidiness or taste alone. Diverge from an ecosystem default (shadcn, Next.js, Supabase) only when our way has a real, articulable benefit — clarity, safety, consistency — that outweighs the cost of fighting it: tooling that assumes the standard, AI agents trained on it, and copy-paste examples that won't match. When it's a wash, follow the standard. A template multiplies both the benefit and the cost across every spinoff.
- **Package manager:** pnpm only — never npm or yarn. One lockfile (`pnpm-lock.yaml`); no `package-lock.json`.
- **UI is primitive-first:** own shadcn/ui components in `src/components/ui`; extend via `cva`; compose with Radix `asChild`/`Slot`. Never install shadcn as an npm package.
- **Theming via semantic tokens only:** `bg-background`, `text-foreground`, `ring-ring`, `text-destructive`, etc. Never hardcode colors — no raw hex or `color-500` utilities for themeable color. Tokens in `src/app/globals.css`.
- **Structure is fixed; theme is swappable:** token architecture and accessibility rules are inherited; token values are re-skinned per product.
- **Mobile-first responsive:** design from smallest breakpoint up.
- **Component size:** ≤150 lines; extract subcomponents when larger.
- **Accessibility:** WCAG 2.1 AA — semantic HTML first, ARIA only when needed; visible `focus-visible` states using token rings.
- **shadcn CLI:** always non-interactive — `pnpm dlx shadcn@latest add <component> -y -o`. Use `--dry-run`/`--diff` before overwriting customized components.
- **Images:** `next/image` with explicit dimensions.
- **Auth boundary:** public routes are `/` and `/auth/**` only; all other routes require a session. Enforced in `proxy.ts` → `src/supabase/proxy.ts`.
- **Admin gate:** `app_metadata.role === 'admin'` on `auth.users` is the canonical admin check — set via in-app promote/demote on `/admin/users` (admin-gated server actions + service client) **or** secret-key CLI (`pnpm promote-admin`, `pnpm demote-admin`). Do not move this to a `profiles` column without PM approval.
- **Agent guidance:** lives in `.cursor` (rules + skills) — not duplicated into product code.

**Change protocol:** edits to locked rules require PM approval. Update this section; CONTEXT.md §3 points here and needs no parallel edit unless its at-a-glance list changes.

---

## Implemented now

- **Foundation cleanup (Epic 1A):** starter tutorial/demo scaffolding removed; pnpm-only; Vitest 3 / Vite 6 / Next 16.2.x.
- **Rules correctness (Epic 1B):** `.cursor/rules/` stack-accurate and project-agnostic.
- **Docs (Epic 1C):** `AGENTS.md`, `CONTEXT.md`, `README.md`, and `CONTEXT_ARCHIVE.md` planning/doc layer.
- **Dev tooling hygiene (Epic 1D):** pre-push hook mirrors CI; 80% Vitest coverage thresholds; `.prettierignore` / lint-staged audit (agent-authored docs remain Prettier-ignored).
- **Auth:** Supabase email/password flows under `/auth/**` (login, sign-up, forgot/update password, confirm, error); shared auth layout (`bg-muted`, centered shell, logo above forms).
- **Session + route protection:** `proxy.ts` → `src/supabase/proxy.ts` — refreshes session; redirects unauthenticated users to `/auth/login`; redirects non-admins from `/admin` and `/admin/**` to `/profile`.
- **Product routes:**
  - `/` — public landing with hero, features grid, and tech-stack marquee (`(marketing)` route group); session-aware header CTA via PPR-safe `LandingAuthSlot` in Suspense
  - `/auth/**` — public auth screens
  - `/admin` — admin console dashboard (admin role required)
  - `/admin/users` — admin users table (real Supabase Auth data; search, pagination, in-app promote/demote)
  - `/profile` — authenticated non-admin settings page under `(app)` shell (display name, avatar upload, bio, password, theme toggle)
- **Post-login redirect:** admins → `/admin`; non-admins → `/profile` (login and password-update flows).
- **UI primitives:** `src/components/ui/` (button, card, input, label, checkbox, badge, dropdown-menu, sidebar, avatar, breadcrumb, separator, sheet, tooltip, collapsible, skeleton, sonner, alert-dialog, form, textarea).
- **Data fetching:** TanStack Query v5 provider configured.
- **Design-system token layer (Phase 2):** tweakcn **Clean Slate** default theme in `src/app/globals.css`; semantic tokens via `@theme inline` + `next-themes` class-based light/dark. **Inter** + **JetBrains Mono** via `next/font` in `layout.tsx` (Merriweather CSS serif fallback). Auth forms and layout chrome conform to semantic tokens (no hardcoded theme colors). See [DESIGN.md](DESIGN.md) for architecture and re-skin workflow.
- **Testing:** Vitest + React Testing Library + MSW v2 (`src/test/`, `src/mocks/`); baseline unit/integration tests for auth forms, proxy, hooks, and utils; 80% coverage thresholds enforced via `pnpm test:ci`.
- **Hooks:** Husky pre-commit (lint-staged + type-check) and pre-push (`pnpm pre-push` mirrors CI including coverage).
- **Admin CLI (Phase 3 Epic 1):** `pnpm promote-admin`, `pnpm demote-admin`, `pnpm list-admins` — secret-key scripts in `scripts/admin/`; sets `app_metadata.role` on `auth.users`.
- **Admin app shell (Phase 3 Epic 2):** `src/app/admin/` with sidebar layout (`sidebar-07` baseline), dynamic breadcrumb, nav-user profile link + sign-out; `src/utils/admin.ts` + shared `ADMIN_ROLE` in `src/constants/admin-role.ts`; `SeminovaLogo` placeholder component.
- **Users admin table (Phase 3 Epic 3):** `/admin/users` lists real Supabase Auth users via gated Server Action + `src/supabase/service.ts`; email search, Next/Previous pagination (page size 50); canonical data-table pattern in `src/app/admin/users/_components/users-table.tsx` and [`.cursor/rules/data-tables.mdc`](.cursor/rules/data-tables.mdc).
- **In-app admin promote/demote (Phase 5 Epic 5):** row actions on `/admin/users` with confirmation dialog + success toasts; shared mutation logic in [`src/utils/admin-role-mutations.ts`](src/utils/admin-role-mutations.ts); server actions in [`src/app/admin/users/actions.ts`](src/app/admin/users/actions.ts); CLI scripts delegate to the same utils.
- **Auth restyle + app identity (Phase 3 Epic 4):** `src/config/site.ts` (`name` + `Logo`); `SeminovaLogo` reads site config (admin sidebar + auth layout); [`src/app/auth/layout.tsx`](src/app/auth/layout.tsx) provides muted full-page shell.
- **Landing chrome (Phase 4 Epic 1):** `(marketing)` route group with thin wrappers over shared [`SiteHeader`](src/components/site-header.tsx) / [`SiteFooter`](src/components/site-footer.tsx) and [`SiteContainer`](src/components/site-container.tsx) (`max-w-7xl`); nav/social/legal config in [`src/config/site.ts`](src/config/site.ts).
- **Landing content (Phase 4 Epic 2):** hero, six-card features grid (`id="features"`), and tech-stack marquee on `/` (six logos with icon+name cells, edge fades, pause on hover); copy and stack logos in [`src/config/landing-content.ts`](src/config/landing-content.ts); SVG assets in `public/tech/`; marquee primitive in [`src/components/kibo-ui/marquee/`](src/components/kibo-ui/marquee/).
- **Site identity audit (Phase 4 Epic 3):** all user-visible app names and root metadata wired through [`src/config/site.ts`](src/config/site.ts) (`description`, `getSiteMetadata()` for browser tab title and SEO); re-skin from one config file.
- **Error severity UI (Phase 5 Epics 1–2):** operational vs fault errors via `kind: 'operational' | 'fault'` on [`AppError`](src/types/app-error.ts); [`InlineError`](src/components/inline-error.tsx) for expected failures, [`ErrorPanel`](src/components/error-panel.tsx) for faults (copy-to-clipboard); auth forms use [`extractAuthFormError`](src/utils/extract-auth-form-error.ts); users table surfaces server-action error envelopes.
- **Admin loading states (Phase 5 Epic 3):** [`AdminShellSkeleton`](src/app/admin/_components/admin-shell-skeleton.tsx) behind Suspense in admin layout; users table skeleton rows via [`DataTableShell`](src/components/data-table1.tsx) + [`DataTableSkeletonBody`](src/components/data-table-skeleton-body.tsx) with per-column `skeletonClassName` meta (see [`.cursor/rules/data-tables.mdc`](.cursor/rules/data-tables.mdc)).
- **Toast system (Phase 5 Epic 4):** sonner via shadcn [`Toaster`](src/components/ui/sonner.tsx) in root layout; [`showSuccessToast`](src/utils/app-toast.ts) for success confirmations; errors remain `InlineError` / `ErrorPanel` (see [`.cursor/rules/error-handling.mdc`](.cursor/rules/error-handling.mdc)).
- **Profiles data foundation (Phase 6 Epic 1):** first migration [`supabase/migrations/20260622120000_create_profiles.sql`](supabase/migrations/20260622120000_create_profiles.sql) — `public.profiles` 1:1 with `auth.users`, signup trigger, owner-scoped RLS; `pnpm db:push` / `pnpm db:types` scripts; types in [`src/types/database.types.ts`](src/types/database.types.ts) and [`src/types/profile.ts`](src/types/profile.ts).
- **Admin namespace foundation (Phase 6 Epic 2):** real `/admin` URL segment with dashboard landing; users table at `/admin/users`; blanket admin-role gating in `proxy.ts` + `AdminAuthGate`; path constants in [`src/constants/admin-paths.ts`](src/constants/admin-paths.ts); post-login redirect for admins → `/admin`.
- **Shared chrome + authenticated shell (Phase 6 Epic 3):** shared site chrome in `src/components/site-*.tsx` (`SiteHeader`, `SiteFooter`, `SiteContainer`, `SiteNavLinks`, `SiteCopyright`); marketing wrappers unchanged visually; `(app)` route group with [`AppShell`](src/app/(app)/_components/app-shell.tsx) (profile-aware circle-avatar [`AppNavUser`](src/app/(app)/_components/app-nav-user.tsx)); app logo/footer target `APP_HOME`; app footer omits marketing section nav; path constants in [`src/constants/app-paths.ts`](src/constants/app-paths.ts); [`getCurrentUserProfile`](src/app/(app)/_lib/get-current-user-profile.ts) with React `cache()`.
- **Avatar storage (Phase 6 Epic 4):** [`supabase/migrations/20260623120000_create_avatars_bucket.sql`](supabase/migrations/20260623120000_create_avatars_bucket.sql) — public-read `avatars` bucket, owner-scoped write RLS; client upload utils in [`src/utils/avatar-storage.ts`](src/utils/avatar-storage.ts) (validate → resize to WebP 256px cap → fixed `{userId}/avatar.webp` path; `withAvatarCacheBust` for versioned `avatar_url`); constants in [`src/constants/storage-paths.ts`](src/constants/storage-paths.ts).
- **Profile page (Phase 6 Epic 5):** [`/profile`](src/app/(app)/profile/page.tsx) — combined settings surface (`react-hook-form` + zod via [`forms.mdc`](.cursor/rules/forms.mdc)); `updateProfileAction` server action; avatar upload persists versioned public URL (`?v=` query param); password change via client Supabase; `APP_HOME` = `/profile`; `/protected` removed; app footer "Back to website" link; marketing header `LandingAuthSlot` in Suspense (PPR-safe).
- **Profile surface redesign (Phase 6 Epic 6):** blur-save display name + bio with per-field in-flight guards and inline `FieldSaveIndicator`; avatar persists on upload completion; partial-only [`updateProfileAction`](src/app/(app)/profile/actions.ts); restrained `max-w-prose` layout; password change in [`ProfilePasswordDialog`](src/app/(app)/profile/_components/profile-password-dialog.tsx) with `current_password` + toast (`secure_password_change` in [`supabase/config.toml`](supabase/config.toml)); [`ProfileThemeSegment`](src/app/(app)/profile/_components/profile-theme-segment.tsx) (`ToggleGroup` Light/Dark/System); conformant reference for [`forms.mdc`](.cursor/rules/forms.mdc) + [`notifications.mdc`](.cursor/rules/notifications.mdc).
- **Admin profile link + shared sign-out (Phase 6 Epic 7):** [`AdminNavUser`](src/app/admin/_components/admin-nav-user.tsx) dropdown adds Profile → `/profile` (`PROFILE_PATH`); shared [`useSignOut`](src/hooks/use-sign-out.ts) hook (`createClient` → `signOut` → `/auth/login`) used by `AppNavUser`, `AdminNavUser`, and [`LogoutButton`](src/components/logout-button.tsx).
- **Auth form password-manager affordances (Phase 6 Epic 8):** four auth forms (`login-form`, `sign-up-form`, `forgot-password-form`, `update-password-form`) carry `autocomplete` tokens per [`forms.mdc`](.cursor/rules/forms.mdc); update-password adds a hidden paired username field from the recovery session.
- **App-to-admin console switch (Phase 6 Epic 9):** [`AppNavUser`](src/app/(app)/_components/app-nav-user.tsx) dropdown adds admin-gated Admin console → `/admin` (`ADMIN_HOME`); `isAdmin` derived server-side in [`getCurrentUserProfile`](src/app/(app)/_lib/get-current-user-profile.ts) via `isAdminFromAppMetadata`; non-admin menu unchanged (mirror of Epic 7's admin → profile leg).

---

## Data model (summary)

**Custom migrations:** 2 — [`20260622120000_create_profiles.sql`](supabase/migrations/20260622120000_create_profiles.sql), [`20260623120000_create_avatars_bucket.sql`](supabase/migrations/20260623120000_create_avatars_bucket.sql)

| Entity | Table / bucket | Notes |
| ------ | -------------- | ----- |
| User | `auth.users` | Supabase built-in; available via auth |
| Profile | `public.profiles` | 1:1 with `auth.users` (`profiles.id` FK). Columns: `display_name`, `avatar_url`, `bio` (all nullable). **No `role` column** — admin gate stays on `app_metadata.role`. Auto-created on signup via `handle_new_user` trigger; backfills existing users. Owner-scoped RLS: authenticated SELECT/UPDATE own row only (`using` + `with check` on UPDATE). Types: [`Profile`](src/types/profile.ts). |
| Avatar files | `storage.avatars` | Public-read bucket; path `{user_id}/avatar.webp`. Owner-scoped INSERT/UPDATE/DELETE on `storage.objects` (first path segment = `auth.uid()`). Versioned public URL stored in `profiles.avatar_url` (e.g. `…/avatar.webp?v={timestamp}`). Upload: [`avatar-storage.ts`](src/utils/avatar-storage.ts). |

Schema authority for shipped tables lives in this section once migrations land. Do not duplicate per-table detail in CONTEXT.md.

---

## Where things live

| Path | Purpose |
| ---- | ------- |
| `src/app/` | App Router pages and layouts |
| `src/app/(app)/` | Authenticated user surfaces (`/profile`) with shared marketing chrome; `AppNavUser` reads `profiles` and admin role |
| `src/app/(marketing)/` | Public landing route group (`/` — header, hero, features, tech stack, footer) |
| `src/app/auth/` | Auth screens, shared layout, confirm route |
| `src/config/site.ts` | App name, description, logo, metadata (`getSiteMetadata()`), landing nav/social/legal links |
| `src/config/landing-content.ts` | Landing hero, features, and tech-stack copy/assets config |
| `src/components/kibo-ui/marquee/` | Marquee primitives (`Marquee`, `MarqueeContent`, `MarqueeFade`, `MarqueeItem`) for landing tech-stack strip |
| `src/app/admin/` | Admin console (`/admin` dashboard, `/admin/users`; gated by `AdminAuthGate` + `isAdmin` + proxy) |
| `src/app/admin/_components/admin-auth-gate.tsx` | Admin session + role gate; redirects non-admins to `/profile` |
| `src/app/admin/_components/admin-shell-skeleton.tsx` | Suspense fallback skeleton for admin layout |
| `src/app/admin/_components/admin-nav-user.tsx` | Sidebar footer user menu (profile link + sign-out) |
| `src/components/site-header.tsx`, `site-footer.tsx`, `site-container.tsx`, `site-nav-links.tsx`, `site-copyright.tsx` | Shared public/app chrome primitives |
| `src/app/(app)/_components/app-nav-user.tsx` | Circle-avatar header menu (profile link, admin-gated admin console link, sign-out) |
| `src/app/(app)/_lib/get-current-user-profile.ts` | Cached server read of current user's `profiles` row + `isAdmin` from `app_metadata` |
| `src/components/inline-error.tsx`, `error-panel.tsx` | Operational vs fault error UI |
| `src/components/data-table1.tsx`, `data-table-skeleton-body.tsx` | Canonical data-table shell + skeleton loading pattern |
| `src/types/app-error.ts` | Shared `AppError` / `ErrorKind` types |
| `src/types/database.types.ts` | Generated Supabase schema types (`pnpm db:types`) |
| `src/types/profile.ts` | `Profile` / `ProfileUpdate` aliases for `public.profiles` |
| `src/utils/extract-auth-form-error.ts` | Maps Supabase auth errors to `AppError` with `kind` |
| `src/utils/app-toast.ts` | Success toast helper (`showSuccessToast`) |
| `src/utils/admin-role-mutations.ts` | Shared promote/demote logic (app + CLI) |
| `src/constants/app-paths.ts` | `APP_HOME` (`/profile`), `PROFILE_PATH` route constants |
| `src/constants/storage-paths.ts` | `AVATAR_BUCKET`, input limits, `buildAvatarStoragePath` (`{userId}/avatar.webp`) |
| `src/utils/avatar-storage.ts` | Client avatar validate → resize-to-WebP → Supabase upload (`uploadUserAvatar`, `withAvatarCacheBust`) |
| `src/app/(app)/profile/` | Profile settings page (blur-save, password dialog, theme segment), partial-only `updateProfileAction`, zod schemas |
| `src/app/(marketing)/_components/landing-auth-slot.tsx` | PPR-safe session-aware marketing header CTA (Suspense streamed) |
| `src/utils/user-initials.ts` | `getEmailInitials`, `getProfileInitials` for avatar fallbacks |
| `src/constants/admin-role.ts` | Shared `ADMIN_ROLE` constant (app + CLI) |
| `src/constants/admin-paths.ts` | `ADMIN_HOME`, `ADMIN_USERS` route constants |
| `src/utils/admin.ts` | `isAdmin()`, post-auth redirect helper |
| `src/supabase/` | `client.ts`, `server.ts`, `service.ts` (secret key), `proxy.ts` |
| `proxy.ts` | Root auth proxy entry (delegates to `src/supabase/proxy.ts`) |
| `src/components/ui/` | Owned shadcn primitives |
| `src/components/` | App components (auth forms, theme toggle, etc.) |
| `src/hooks/` | Custom hooks (`use-sign-out`, `use-mobile`, etc.) |
| `src/hooks/use-sign-out.ts` | Shared client sign-out (`useSignOut` → Supabase `signOut` + redirect to `/auth/login`) |
| `src/test/` | Test utilities (`render` with providers) |
| `src/mocks/` | MSW handlers (testing only) |
| `scripts/admin/` | Admin CLI (`promote-admin`, `demote-admin`, `list-admins`) |
| `src/app/globals.css` | Global styles and CSS variable tokens (authoritative token values) |
| `DESIGN.md` | Token architecture and re-skin workflow (names only — values in globals.css) |
| `supabase/migrations/` | SQL migrations (`20260622120000_create_profiles.sql`, `20260623120000_create_avatars_bucket.sql`) |
| `supabase/config.toml` | Supabase CLI project config |
| `.cursor/rules/` | Agent coding standards |
| `.cursor/skills/` | Agent workflows |

---

## Logging convention

No `@/utils/logger` module. Use bracket-tagged `console.*` so Vercel logs are searchable:

```typescript
console.error('[auth-login] Sign-in failed', error)
```

See [.cursor/rules/error-handling.mdc](.cursor/rules/error-handling.mdc). Never log passwords, tokens, or API keys.

---

## Checklist before merging

- [ ] `pnpm type-check && pnpm lint && pnpm format-check && pnpm test:ci` pass
- [ ] New routes align with auth boundary (public: `/`, `/auth/**` only)
- [ ] New tables have RLS (when migrations exist)
- [ ] AGENTS.md / README updated if routes, schema, env, or scripts changed
- [ ] Human runs `pnpm db:push` after migrations (agents do not)

---

## Change protocol

| Change type | Action |
| ----------- | ------ |
| Locked rules | Decided in PM/Claude chat with PM approval. **Text-only edit** → land directly in AGENTS.md (update CONTEXT.md §3 at-a-glance only if the topic list changes). **Requires code conformance** → create a CONTEXT ACTIVE story that updates AGENTS.md + `.cursor/rules/` + affected code together |
| Implemented features, routes, data model | Update AGENTS.md via `/sync-repo-docs` |
| Planning / roadmap | Update CONTEXT.md via `/sync-context-md` |
| Coding standards | Update `.cursor/rules/` — not AGENTS.md |

Sync skills (`sync-context-md`, `sync-repo-docs`) never initiate locked-rule changes — they mirror changes already made through this protocol.
