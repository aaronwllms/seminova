# AGENTS.md — Repo truth for coding agents

**Purpose:** What exists in this repo today — locked rules, implemented features, routes, data model, and where to look. For planning and roadmap, see [CONTEXT.md](CONTEXT.md). For human setup, see [README.md](README.md). For how to write code, see [.cursor/rules/](.cursor/rules/) (not duplicated here).

**Last updated:** 2026-06-19

---

## Documentation map

| Document | Audience | Role |
| -------- | -------- | ---- |
| [CONTEXT.md](CONTEXT.md) | PM + agents | Planning brief — roadmap, ACTIVE epics, open questions |
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

**Prerequisites:** Node `>=22.22.2` (see [.nvmrc](.nvmrc)), pnpm 11, Supabase project. Env vars in [.env.example](.env.example) (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` for admin CLI). `next-env.d.ts` is Next.js-generated and gitignored — run `pnpm dev` or `pnpm build` once after clone if `pnpm type-check` reports a missing file.

---

## Locked rules

**Canonical home for the locked rules** — these must not be violated. Consumption detail lives in `.cursor/rules/`; CONTEXT.md §3 is a pointer back here. When a locked rule changes (PM approval required), edit this section.

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
- **Admin gate:** `app_metadata.role === 'admin'` on `auth.users` is the canonical admin check — set only via secret-key CLI (`pnpm promote-admin`, `SUPABASE_SECRET_KEY`). Do not move this to a `profiles` column without PM approval.
- **Agent guidance:** lives in `.cursor` (rules + skills) — not duplicated into product code.

**Change protocol:** edits to locked rules require PM approval. Update this section; CONTEXT.md §3 points here and needs no parallel edit unless its at-a-glance list changes.

---

## Implemented now

- **Foundation cleanup (Epic 1A):** starter tutorial/demo scaffolding removed; pnpm-only; Vitest 3 / Vite 6 / Next 16.2.x.
- **Rules correctness (Epic 1B):** `.cursor/rules/` stack-accurate and project-agnostic.
- **Docs (Epic 1C):** `AGENTS.md`, `CONTEXT.md`, `README.md`, and `CONTEXT_ARCHIVE.md` planning/doc layer.
- **Dev tooling hygiene (Epic 1D):** pre-push hook mirrors CI; 80% Vitest coverage thresholds; `.prettierignore` / lint-staged audit (agent-authored docs remain Prettier-ignored).
- **Auth:** Supabase email/password flows under `/auth/**` (login, sign-up, forgot/update password, confirm, error); shared auth layout (`bg-muted`, centered shell, logo above forms).
- **Session + route protection:** `proxy.ts` → `src/supabase/proxy.ts` — refreshes session; redirects unauthenticated users to `/auth/login`.
- **Product routes:**
  - `/` — public landing with hero, features grid, and tech-stack marquee (`(marketing)` route group)
  - `/auth/**` — public auth screens
  - `/users` — admin-only users table (real Supabase Auth data; search + pagination)
  - `/protected` — authenticated non-admin landing (starter shell until Phase 6)
- **Post-login redirect:** admins → `/users`; non-admins → `/protected` (login and password-update flows).
- **UI primitives:** `src/components/ui/` (button, card, input, label, checkbox, badge, dropdown-menu, sidebar, avatar, breadcrumb, separator, sheet, tooltip, collapsible, skeleton).
- **Data fetching:** TanStack Query v5 provider configured.
- **Design-system token layer (Phase 2):** tweakcn **Clean Slate** default theme in `src/app/globals.css`; semantic tokens via `@theme inline` + `next-themes` class-based light/dark. **Inter** + **JetBrains Mono** via `next/font` in `layout.tsx` (Merriweather CSS serif fallback). Auth forms and layout chrome conform to semantic tokens (no hardcoded theme colors). See [DESIGN.md](DESIGN.md) for architecture and re-skin workflow.
- **Testing:** Vitest + React Testing Library + MSW v2 (`src/test/`, `src/mocks/`); baseline unit/integration tests for auth forms, proxy, hooks, and utils; 80% coverage thresholds enforced via `pnpm test:ci`.
- **Hooks:** Husky pre-commit (lint-staged + type-check) and pre-push (`pnpm pre-push` mirrors CI including coverage).
- **Admin CLI (Phase 3 Epic 1):** `pnpm promote-admin`, `pnpm demote-admin`, `pnpm list-admins` — secret-key scripts in `scripts/admin/`; sets `app_metadata.role` on `auth.users`.
- **Admin app shell (Phase 3 Epic 2):** `(admin)` route group with sidebar layout (`sidebar-07` baseline), dynamic breadcrumb, nav-user sign-out; `src/utils/admin.ts` + shared `ADMIN_ROLE` in `src/constants/admin-role.ts`; `SeminovaLogo` placeholder component.
- **Users admin table (Phase 3 Epic 3):** `/users` lists real Supabase Auth users via gated Server Action + `src/supabase/service.ts`; email search, Next/Previous pagination (page size 50); canonical data-table pattern in `src/app/(admin)/users/_components/users-table.tsx` and [`.cursor/rules/data-tables.mdc`](.cursor/rules/data-tables.mdc).
- **Auth restyle + app identity (Phase 3 Epic 4):** `src/config/site.ts` (`name` + `Logo`); `SeminovaLogo` reads site config (admin sidebar + auth layout); [`src/app/auth/layout.tsx`](src/app/auth/layout.tsx) provides muted full-page shell.
- **Landing chrome (Phase 4 Epic 1):** `(marketing)` route group with sticky `LandingHeader`, document-flow `LandingFooter`, shared `LandingContainer` (`max-w-7xl`); nav/social/legal config in [`src/config/site.ts`](src/config/site.ts).
- **Landing content (Phase 4 Epic 2):** hero, six-card features grid (`id="features"`), and tech-stack marquee on `/` (six logos with icon+name cells, edge fades, pause on hover); copy and stack logos in [`src/config/landing-content.ts`](src/config/landing-content.ts); SVG assets in `public/tech/`; marquee primitive in [`src/components/kibo-ui/marquee/`](src/components/kibo-ui/marquee/).
- **Site identity audit (Phase 4 Epic 3):** all user-visible app names and root metadata wired through [`src/config/site.ts`](src/config/site.ts) (`description`, `getSiteMetadata()` for browser tab title and SEO); protected-shell nav label reads `siteConfig.name` — re-skin from one config file.

---

## Data model (summary)

**Custom migrations:** 0 — no files in `supabase/migrations/` yet.

| Entity | Table | Notes |
| ------ | ----- | ----- |
| User | `auth.users` | Supabase built-in; available via auth |
| Profile | `public.profiles` | **Not built** — planned Phase 6 (1:1 with user, owner-scoped RLS) |

Schema authority for shipped tables lives in this section once migrations land. Do not duplicate per-table detail in CONTEXT.md.

---

## Where things live

| Path | Purpose |
| ---- | ------- |
| `src/app/` | App Router pages and layouts |
| `src/app/(marketing)/` | Public landing route group (`/` — header, hero, features, tech stack, footer) |
| `src/app/auth/` | Auth screens, shared layout, confirm route |
| `src/config/site.ts` | App name, description, logo, metadata (`getSiteMetadata()`), landing nav/social/legal links |
| `src/config/landing-content.ts` | Landing hero, features, and tech-stack copy/assets config |
| `src/components/kibo-ui/marquee/` | Marquee primitives (`Marquee`, `MarqueeContent`, `MarqueeFade`, `MarqueeItem`) for landing tech-stack strip |
| `src/app/(admin)/` | Admin sidebar shell (`/users`; gated by `isAdmin`) |
| `src/app/protected/` | Non-admin authenticated starter page |
| `src/constants/admin-role.ts` | Shared `ADMIN_ROLE` constant (app + CLI) |
| `src/utils/admin.ts` | `isAdmin()`, post-auth redirect helper |
| `src/supabase/` | `client.ts`, `server.ts`, `service.ts` (secret key), `proxy.ts` |
| `proxy.ts` | Root auth proxy entry (delegates to `src/supabase/proxy.ts`) |
| `src/components/ui/` | Owned shadcn primitives |
| `src/components/` | App components (auth forms, theme toggle, etc.) |
| `src/hooks/` | Custom hooks |
| `src/test/` | Test utilities (`render` with providers) |
| `src/mocks/` | MSW handlers (testing only) |
| `scripts/admin/` | Admin CLI (`promote-admin`, `demote-admin`, `list-admins`) |
| `src/app/globals.css` | Global styles and CSS variable tokens (authoritative token values) |
| `DESIGN.md` | Token architecture and re-skin workflow (names only — values in globals.css) |
| `supabase/migrations/` | SQL migrations (empty until Phase 6) |
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
