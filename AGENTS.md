# AGENTS.md — Repo truth for coding agents

**Purpose:** What exists in this repo today — locked rules, implemented features, routes, data model, and where to look. For planning and roadmap, see [CONTEXT.md](CONTEXT.md). For human setup, see [README.md](README.md). For how to write code, see [.cursor/rules/](.cursor/rules/) (not duplicated here).

**Last updated:** 2026-06-18

---

## Documentation map

| Document | Audience | Role |
| -------- | -------- | ---- |
| [CONTEXT.md](CONTEXT.md) | PM + agents | Planning brief — roadmap, ACTIVE epics, open questions |
| [CONTEXT_ARCHIVE.md](CONTEXT_ARCHIVE.md) | PM + agents (on demand) | Shipped phase narratives — append-only |
| [README.md](README.md) | Humans | Clone, env setup, scripts, contributing |
| [AGENTS.md](AGENTS.md) | Agents | **This file** — repo truth, locked rules, what's implemented |
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

**Prerequisites:** Node `>=22.22.2` (see [.nvmrc](.nvmrc)), pnpm 11, Supabase project. Env vars in [.env.example](.env.example).

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
- **Agent guidance:** lives in `.cursor` (rules + skills) — not duplicated into product code.

**Change protocol:** edits to locked rules require PM approval. Update this section; CONTEXT.md §3 points here and needs no parallel edit unless its at-a-glance list changes.

---

## Implemented now

- **Foundation cleanup (Epic 1A):** starter tutorial/demo scaffolding removed; pnpm-only; Vitest 3 / Vite 6 / Next 16.2.x.
- **Rules correctness (Epic 1B):** `.cursor/rules/` stack-accurate and project-agnostic.
- **Docs (Epic 1C):** `AGENTS.md`, `CONTEXT.md`, `README.md`, and `CONTEXT_ARCHIVE.md` planning/doc layer.
- **Dev tooling hygiene (Epic 1D):** pre-push hook mirrors CI; 80% Vitest coverage thresholds; `.prettierignore` / lint-staged audit (agent-authored docs remain Prettier-ignored).
- **Auth:** Supabase email/password flows under `/auth/**` (login, sign-up, forgot/update password, confirm, error).
- **Session + route protection:** `proxy.ts` → `src/supabase/proxy.ts` — refreshes session; redirects unauthenticated users to `/auth/login`.
- **Product routes:**
  - `/` — public landing (starter shell; full landing page planned Phase 4)
  - `/auth/**` — public auth screens
  - `/protected` — authenticated (requires session)
- **UI primitives:** `src/components/ui/` (button, card, input, label, checkbox, badge, dropdown-menu).
- **Data fetching:** TanStack Query v5 provider configured.
- **Theming:** `next-themes` light/dark over CSS variables.
- **Testing:** Vitest + React Testing Library + MSW v2 (`src/test/`, `src/mocks/`); baseline unit/integration tests for auth forms, proxy, hooks, and utils; 80% coverage thresholds enforced via `pnpm test:ci`.
- **Hooks:** Husky pre-commit (lint-staged + type-check) and pre-push (`pnpm pre-push` mirrors CI including coverage).

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
| `src/app/auth/` | Auth screens and confirm route |
| `src/app/protected/` | Authenticated starter page |
| `src/supabase/` | `client.ts`, `server.ts`, `proxy.ts` |
| `proxy.ts` | Root auth proxy entry (delegates to `src/supabase/proxy.ts`) |
| `src/components/ui/` | Owned shadcn primitives |
| `src/components/` | App components (auth forms, theme toggle, etc.) |
| `src/hooks/` | Custom hooks |
| `src/test/` | Test utilities (`render` with providers) |
| `src/mocks/` | MSW handlers (testing only) |
| `src/app/globals.css` | Global styles and CSS variable tokens |
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
