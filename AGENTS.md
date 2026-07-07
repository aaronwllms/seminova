# AGENTS.md — Repo truth for coding agents

**Purpose:** What exists in this repo today — hard-constraint governance, implemented features, routes, data model, and where to look. For planning and roadmap, see [ROADMAP.md](ROADMAP.md) and the per-phase PRDs in [docs/prds/](docs/prds/). For human setup, see [README.md](README.md). For how to write code, see [.cursor/rules/](.cursor/rules/) (not duplicated here).

**Last updated:** 2026-07-07

Document roles and the doc-maintenance procedure are authoritative in [docs/DOC_RULES.md](docs/DOC_RULES.md).

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

---

## Agent skills (.cursor/skills/)

Beyond `/sync-repo-docs` (above), the repo ships a library of invokable Cursor skills for repo maintenance and quality work. These are situational — invoke by name (`/skill-name`) when the task calls for it, not as part of every session.

For the planning-loop skills (`plan-next-epic`, `mark-epic-complete`, `ship-phase`) and the planning-system skill `lexicon-audit`, see [docs/WORKFLOW_GUIDE.md](docs/WORKFLOW_GUIDE.md) — those operate on the planning docs, not repo code.

### Quality & review

| Skill | Use when |
| ----- | -------- |
| `pre-release-review` | Finishing an epic or before opening a PR — quality gates, scoped code review, security check, hard-constraints check, manual test checklist |
| `audit-tech-debt` | Codebase health check or architecture review — full pass or sync → `TECH_DEBT_AUDIT.md` |
| `audit-tests` | Test suite health check — full pass or sync → `TEST_AUDIT.md` |
| `audit-rules` | Rules health check — full pass or sync → `RULE_AUDIT.md` |
| `audit-security` | Before launch, after auth/RLS changes, or periodic hygiene — full pass or sync → `SECURITY_AUDIT.md` |

### Design & copy

| Skill | Use when |
| ----- | -------- |
| `design-critique` | Reviewing a mockup, screenshot, or screen at any stage — usability, hierarchy, consistency, accessibility feedback |
| `ux-copy` | Writing or reviewing microcopy — CTAs, empty states, error messages, confirmation dialogs |
| `github-docs-authoring` | GitHub Docs Authoring — write or review repo markdown (README, workflow docs, PRDs) for GFM conventions and renderer gaps |

### Housekeeping

| Skill | Use when |
| ----- | -------- |
| `create-migration` | Adding tables, columns, indexes, or RLS policies — writes a correctly-named, RLS-compliant migration file |
| `archive-cursor-plans` | After a phase ships, or before a planning push — moves completed plans from `.cursor/plans/` to `.cursor/plans/archive/` |

All skills are read-only or scoped-write as documented in their own `SKILL.md` — see `.cursor/skills/<name>/SKILL.md` for full workflow detail. None auto-invoke except `sync-repo-docs`.

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
| `pnpm test` | Vitest run once (default; non-watch) |
| `pnpm test:watch` | Vitest watch mode (human dev only) |
| `pnpm test:file` | Run one test file or pattern (`pnpm test:file -- <path>`) |
| `pnpm test:ci` | Vitest run once with coverage gates (agents, CI, pre-push) |
| `pnpm pre-push` | Full CI mirror locally (type-check → hard-constraint checks → lint → format-check → test:ci) |
| `pnpm test:ui` | Vitest UI |
| `pnpm analyze` | Bundle analyzer |
| `pnpm promote-admin <email>` | Grant admin via secret key (`app_metadata.role`) |
| `pnpm demote-admin <email>` | Remove admin role |
| `pnpm list-admins` | List admin users (read-only) |
| `pnpm db:push` | Apply pending SQL migrations to linked Supabase project (human only; CLI prompts) |
| `pnpm db:types` | Regenerate `src/types/database.types.ts` from linked project schema |

**Prerequisites:** Node `>=22.22.2` (see [.nvmrc](.nvmrc)), pnpm 11, Supabase project. Env vars in [.env.example](.env.example) (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` for admin CLI). `next-env.d.ts` is Next.js-generated and gitignored — run `pnpm dev` or `pnpm build` once after clone if `pnpm type-check` reports a missing file.

---

## Hard constraints

Non-negotiable constraints, each enforced deterministically — a violation fails `pnpm pre-push` and CI.

- **pnpm only** — never npm or yarn; one lockfile (`pnpm-lock.yaml`). **Enforced:** `check:pnpm-only`.
- **UI is primitive-first** — own shadcn/ui components in `src/components/ui`; extend via `cva`; compose with Radix `asChild`/`Slot`; never install shadcn as an npm package. **Enforced:** `check:no-shadcn-pkg` (ESLint `no-restricted-imports`).
- **Theming via semantic tokens only** — `bg-background`, `text-foreground`, etc.; never raw hex or numeric Tailwind color scales for themeable color; tokens in `src/app/globals.css`. **Enforced:** `check:semantic-tokens` (custom ESLint rule; see documented limitation in `eslint-rules/semantic-tokens.mjs`).
- **Auth boundary** — public routes are `/` and `/auth/**` only; all others require a session; enforced in `proxy.ts` → `src/supabase/proxy.ts`. **Enforced:** `check:auth-boundary` (discovered-route proxy tests).
- **Admin gate** — `app_metadata.role === 'admin'` on `auth.users` is the canonical admin check, set via in-app promote/demote on `/admin/users` or secret-key CLI. Never a `profiles` column. **Enforced:** `check:admin-gate` (source contract test + migration scanner).

**Planning / judgment principle (not mechanically enforced):** **Ecosystem alignment over aesthetic divergence** — Don't canonize a non-standard convention for tidiness or taste alone. Diverge from an ecosystem default (shadcn, Next.js, Supabase) only when our way has a real, articulable benefit — clarity, safety, consistency — that outweighs the cost of fighting it: tooling that assumes the standard, AI agents trained on it, and copy-paste examples that won't match. When it's a wash, follow the standard. A template multiplies both the benefit and the cost across every spinoff.

Consumption detail for demoted guidance lives in `.cursor/rules/`. **Change protocol:** edits to hard constraints route through the [Change protocol](#change-protocol) table below.

---

## Implemented now

Grouped by feature area. History of which phase/epic shipped what lives in git and in the archived PRDs (`docs/prds/archive/`) — this section describes current state only.

**Foundation & tooling.** Starter tutorial/demo scaffolding removed; pnpm-only; Vitest 3 / Vite 6 / Next 16.2.x. `.cursor/rules/` stack-accurate and project-agnostic. Pre-push hook mirrors CI (`pnpm pre-push`: type-check → hard-constraint checks → lint → format-check → `test:ci`); 80% Vitest coverage thresholds; `.prettierignore` / lint-staged audit (agent-authored docs remain Prettier-ignored). Planning layer is `ROADMAP.md` + per-phase PRDs in `docs/prds/`; doc roles in `docs/DOC_RULES.md`; hard constraints in this file (enforced via `check:*` scripts); architectural vocabulary in `LEXICON.md`; ADR process in `docs/adr/`.

**Auth & session.** Supabase email/password flows under `/auth/**` (login, sign-up, forgot/update password, confirm, error) with shared auth layout. `proxy.ts` → `src/supabase/proxy.ts` refreshes the session, redirects unauthenticated users to `/auth/login`, and redirects non-admins from `/admin/**` to `/profile`. When public Supabase env is unset, the proxy skips session checks in development only; production returns **503**. Post-login redirect: admins → `/admin`, non-admins → `/profile`. **Read vs mutation split:** layouts, server components, and gates (`AdminAuthGate`, `getCurrentUserProfile`) read via `requireAuthClaims` / `hasServerAuthSession` from [`require-auth.ts`](src/supabase/require-auth.ts) and [`server.ts`](src/supabase/server.ts) — these validate the cookie-read access token via `getClaims(accessToken)` and never refresh; refresh is proxy-only ([ADR-0003](docs/adr/ADR-0003-no-refresh-in-rsc-auth-reads.md)). Server actions use `getUser()` at the trust boundary so the Auth server validates the access token (see [`updateProfileAction`](src/app/(app)/profile/actions.ts) and [`forms.mdc`](.cursor/rules/forms.mdc) step 1). Do not call bare `getClaims()` or `getSession()` on RSC read paths. [`extractAuthFormError`](src/utils/extract-auth-form-error.ts) is fallback-first — enumerated `AUTH_ERROR_OVERRIDES` for known Supabase codes, generic operational copy for unmapped codes, never raw Supabase messages. Four auth forms carry `autocomplete` tokens per [`forms.mdc`](.cursor/rules/forms.mdc); update-password includes a hidden paired username field from the recovery session. [`/auth/confirm`](src/app/auth/confirm/route.ts) validates an optional `next` query param via [`isSafeRedirect`](src/utils/is-safe-redirect.ts) (same-origin only) before redirecting, falling back to the role-based post-auth path.

**Admin console.** `/admin` route segment — dashboard landing plus `/admin/users` — gated by `proxy.ts` + [`AdminAuthGate`](src/app/admin/_components/admin-auth-gate.tsx); sidebar layout (`sidebar-07` baseline) with dynamic breadcrumb and nav-user profile link + sign-out; path constants in [`src/constants/admin-paths.ts`](src/constants/admin-paths.ts). Admin CLI (`pnpm promote-admin` / `demote-admin` / `list-admins`, secret-key scripts in `scripts/admin/`) and in-app promote/demote (row actions on `/admin/users` with confirmation dialog + toasts) share mutation logic in [`src/utils/admin-role-mutations.ts`](src/utils/admin-role-mutations.ts). Users table lists real Supabase Auth users via a gated Server Action (caller gate in [`assert-admin-caller.ts`](src/app/admin/users/_lib/assert-admin-caller.ts)) + `src/supabase/service.ts`; email search, Next/Previous pagination (page size 50), canonical data-table pattern (see [`.cursor/rules/data-tables.mdc`](.cursor/rules/data-tables.mdc)), skeleton loading via [`DataTableShell`](src/components/data-table-shell.tsx) + [`DataTableSkeletonBody`](src/components/data-table-skeleton-body.tsx). [`AdminNavUser`](src/app/admin/_components/admin-nav-user.tsx) dropdown links to Profile; [`AppNavUser`](src/app/(app)/_components/app-nav-user.tsx) dropdown adds an admin-gated Admin console link for admins — `isAdmin` derived server-side via `isAdminFromAppMetadata`.

**Profile / account settings.** [`/profile`](src/app/(app)/profile/page.tsx) under the `(app)` shell — combined settings surface using `react-hook-form` + zod (see [`forms.mdc`](.cursor/rules/forms.mdc)). `public.profiles` is 1:1 with `auth.users`, owner-scoped RLS, auto-created via a signup trigger; no `role` column (admin gate stays on `app_metadata.role`). Display name and bio are blur-save with per-field in-flight guards and inline `FieldSaveIndicator` (hooks in [`src/app/(app)/profile/_lib/`](src/app/(app)/profile/_lib/)); avatar upload is upload-on-complete (validate → resize to WebP 256px cap → fixed `{userId}/avatar.webp` path → versioned public URL via `withAvatarCacheBust`; client pipeline in [`avatar-storage.ts`](src/utils/avatar-storage.ts)); password change happens in [`ProfilePasswordDialog`](src/app/(app)/profile/_components/profile-password-dialog.tsx) requiring `current_password`; theme toggle via [`ProfileThemeSegment`](src/app/(app)/profile/_components/profile-theme-segment.tsx) (`ToggleGroup` Light/Dark/System). Partial-only [`updateProfileAction`](src/app/(app)/profile/actions.ts) persists `avatar_url` only for owned storage paths via [`isOwnedAvatarStorageUrl`](src/utils/avatar-cache-bust.ts) — external or other-user URLs are omitted. Shared [`useSignOut`](src/hooks/use-sign-out.ts) hook used by `AppNavUser`, `AdminNavUser`, and [`LogoutButton`](src/components/logout-button.tsx).

**Landing page.** `(marketing)` route group at `/`: hero, six-card features grid (`id="features"`), and a tech-stack marquee (six logos, icon+name cells, edge fades, pause on hover; SVG assets in `public/tech/`; marquee primitive in [`src/components/kibo-ui/marquee/`](src/components/kibo-ui/marquee/)). Shared chrome — [`SiteHeader`](src/components/site-header.tsx), [`SiteFooter`](src/components/site-footer.tsx), [`SiteContainer`](src/components/site-container.tsx) (`max-w-7xl`), `SiteNavLinks`, `SiteCopyright` — is reused by both the marketing surface and the `(app)` shell. Session-aware header CTA via PPR-safe [`LandingAuthSlot`](src/app/(marketing)/_components/landing-auth-slot.tsx) in Suspense — probes session with `hasServerAuthSession` (read mechanics in Auth & session above). All user-visible identity (name, description, logo, nav/social/legal links, `getSiteMetadata()` for tab title and SEO) is driven from [`src/config/site.ts`](src/config/site.ts); hero/features/tech-stack copy lives in [`src/config/landing-content.ts`](src/config/landing-content.ts) — re-skin from these two files.

**Design system & theming.** tweakcn **Clean Slate** default theme in `src/app/globals.css`; semantic tokens via `@theme inline` + `next-themes` class-based light/dark. **Inter** + **JetBrains Mono** via `next/font` (Merriweather CSS serif fallback). UI primitives in `src/components/ui/` (alert-dialog, avatar, badge, breadcrumb, button, card, dialog, dropdown-menu, form, input, label, separator, sheet, sidebar, skeleton, sonner, table, textarea, toggle, toggle-group, tooltip) — sidebar implementation split under [`src/components/ui/sidebar/`](src/components/ui/sidebar/) and re-exported from [`sidebar.tsx`](src/components/ui/sidebar.tsx). See [DESIGN.md](DESIGN.md) for architecture and re-skin workflow.

**Error handling & feedback.** Errors are classified by `kind: 'operational' | 'fault'` on [`AppError`](src/types/app-error.ts) — [`InlineError`](src/components/inline-error.tsx) for expected failures, [`ErrorPanel`](src/components/error-panel.tsx) for faults (copy-to-clipboard). Server actions return a typed response envelope (`{success, data}` / `{success: false, error}`). Route-level fault boundaries at [`src/app/admin/error.tsx`](src/app/admin/error.tsx) and [`src/app/auth/error.tsx`](src/app/auth/error.tsx) render `ErrorPanel` with retry and escape links. Toasts (sonner via shadcn [`Toaster`](src/components/ui/sonner.tsx), [`showSuccessToast`](src/utils/app-toast.ts)) are for success confirmations only — errors always render inline or in a panel, never as a toast (see [`.cursor/rules/error-handling.mdc`](.cursor/rules/error-handling.mdc)).

**Security.** Security headers via [`src/utils/security-headers.ts`](src/utils/security-headers.ts), wired through [`next.config.ts`](next.config.ts); CSP is report-only by default — flipping to enforcing (`CSP_ENFORCE=true`) requires nonce-based script handling, not just directive tightening (see the `// debt:` marker in that file). Avatar and redirect handling are covered under Profile and Auth above (`isOwnedAvatarStorageUrl`, `isSafeRedirect`).

**Data & storage.** Three custom migrations — filenames and per-table detail in [Data model](#data-model-summary) below. `avatars` storage bucket is public-read with owner-scoped write RLS. Types generated to [`src/types/database.types.ts`](src/types/database.types.ts) via `pnpm db:types`; domain aliases in [`src/types/profile.ts`](src/types/profile.ts).

**Testing & data fetching.** Vitest + React Testing Library (`src/test/`); Supabase/auth boundaries use `vi.mock` at module level; MSW v2 is a dev dependency with global setup deferred until HTTP handlers are needed (see [`.cursor/rules/testing.mdc`](.cursor/rules/testing.mdc)); unit/integration tests across auth, admin, profile, proxy, hooks, and utils; 80% coverage thresholds enforced via `pnpm test:ci`; ESLint enforces snapshot ban, unquarantined-skip quarantine, and test-scope file naming in test files. TanStack Query v5 provider configured for client-side data fetching; devtools lazy-loaded via [`react-query-devtools.tsx`](src/providers/react-query-devtools.tsx).

---

## Data model (summary)

**Custom migrations:** 3 — [`20260622120000_create_profiles.sql`](supabase/migrations/20260622120000_create_profiles.sql), [`20260623120000_create_avatars_bucket.sql`](supabase/migrations/20260623120000_create_avatars_bucket.sql), [`20260623130000_add_avatars_select_policy.sql`](supabase/migrations/20260623130000_add_avatars_select_policy.sql)

| Entity | Table / bucket | Notes |
| ------ | -------------- | ----- |
| User | `auth.users` | Supabase built-in; available via auth |
| Profile | `public.profiles` | 1:1 with `auth.users` (`profiles.id` FK). Columns: `display_name`, `avatar_url`, `bio` (all nullable). **No `role` column** — admin gate stays on `app_metadata.role`. Auto-created on signup via `handle_new_user` trigger; backfills existing users. Owner-scoped RLS: authenticated SELECT/UPDATE own row only (`using` + `with check` on UPDATE). Types: [`Profile`](src/types/profile.ts). |
| Avatar files | `storage.avatars` | Public-read bucket; path `{user_id}/avatar.webp`. Owner-scoped INSERT/UPDATE/DELETE on `storage.objects` (first path segment = `auth.uid()`); public SELECT policy required for upsert. Versioned public URL stored in `profiles.avatar_url` (e.g. `…/avatar.webp?v={timestamp}`); server action rejects external or other-user URLs via [`isOwnedAvatarStorageUrl`](src/utils/avatar-cache-bust.ts). Upload: [`avatar-storage.ts`](src/utils/avatar-storage.ts). |

Schema authority for shipped tables lives in this section once migrations land. Do not duplicate per-table detail in PRDs or ROADMAP.

---

## Where things live

Directory-level map. File-level detail lives in the [Implemented now](#implemented-now) prose links — not here.

| Path | Purpose |
| ---- | ------- |
| `src/app/(marketing)/` | Public landing route group (`/`) |
| `src/app/(app)/` | Authenticated user surfaces (`/profile`) with shared marketing chrome |
| `src/app/admin/` | Admin console (`/admin`, `/admin/users`) |
| `src/app/auth/` | Auth screens, shared layout, confirm route |
| `src/app/globals.css` | Global styles and CSS variable tokens (authoritative token values) |
| `src/components/ui/` | Owned shadcn primitives (sidebar decomposed under `ui/sidebar/`) |
| `src/components/` | App components and shared chrome (site header/footer/container, error UI, data-table shell) |
| `src/components/kibo-ui/` | Vendored kibo-ui primitives (marquee) |
| `src/config/` | Product identity and landing content — re-skin surface |
| `src/constants/` | Route, storage, and admin-role constants |
| `src/hooks/` | Custom hooks |
| `src/providers/` | Client providers (TanStack Query + devtools) |
| `src/supabase/` | `client.ts`, `server.ts`, `service.ts` (secret key), `proxy.ts`, `require-auth.ts` |
| `proxy.ts` | Root auth proxy entry (delegates to `src/supabase/proxy.ts`) |
| `src/types/` | Shared types (`app-error.ts`, generated `database.types.ts`, `profile.ts`) |
| `src/utils/` | Shared utilities (auth error mapping, redirect/avatar guards, security headers, admin helpers, toasts, env) |
| `src/test/` | Test utilities (`render` with providers) |
| `scripts/admin/` | Admin CLI (promote / demote / list) |
| `supabase/migrations/` | SQL migrations (list in [Data model](#data-model-summary)) |
| `supabase/config.toml` | Supabase CLI project config |
| `ROADMAP.md` | Phase status and planning horizon stubs |
| `LEXICON.md` | Architectural vocabulary |
| `docs/DOC_RULES.md` | Doc roles and maintenance procedure |
| `docs/prds/` | Per-phase PRDs (`docs/prds/archive/` when shipped) |
| `docs/adr/` | Architecture Decision Records |
| `DESIGN.md` | Token architecture and re-skin workflow (names only — values in globals.css) |
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

- [ ] Quality bar passes ([Agent workflow](#agent-workflow) step 3)
- [ ] New routes align with the auth boundary ([§ Hard constraints](#hard-constraints))
- [ ] New tables have RLS (when migrations exist)
- [ ] AGENTS.md / README updated if routes, schema, env, or scripts changed
- [ ] Human runs `pnpm db:push` after migrations (agents do not)

---

## Change protocol

| Change type | Action |
| ----------- | ------ |
| Hard constraints | Decided in PM/Claude chat with PM approval. Changing a hard constraint means changing its enforcement (check script, lint rule, or test) and the AGENTS.md § Hard constraints list together — never the list alone. |
| Implemented features, routes, data model | Update AGENTS.md via `/sync-repo-docs` |
| Planning / roadmap | Update [ROADMAP.md](ROADMAP.md) and the active PRD in [docs/prds/](docs/prds/) |
| Coding standards | Update `.cursor/rules/` — not AGENTS.md |

`/sync-repo-docs` never initiates hard-constraint changes — it mirrors changes already made through this protocol.
