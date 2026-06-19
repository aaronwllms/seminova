# Cursor Rules — Seminova

Modular Cursor AI rules (`.mdc` format) for the Seminova template: an opinionated, AI-native starter built on Next.js 16, Supabase, Tailwind, shadcn/ui, Vitest, and TanStack Query v5.

**23 rule files** in this directory. See [`.cursor/README.md`](../README.md) for skills, agents, and planning doc layout.

## What this rule set covers

- **Stack accuracy** — patterns match the actual repo layout (`src/supabase/`, `proxy.ts`, Vitest, pnpm)
- **Template conventions** — primitive-first UI, semantic tokens, WCAG 2.1 AA, conventional commits
- **Agent workflow** — migration safety, testing minimalism, git hooks (see `git-workflow.mdc`)

Locked principles and roadmap live in [CONTEXT.md](../../CONTEXT.md). Repo truth for agents lives in [AGENTS.md](../../AGENTS.md).

## What we adopted

- DRY and SOLID principles
- 150-line component size guideline
- RORO pattern (Receive Object, Return Object)
- Arrow functions and named exports
- Conventional commits specification
- Mobile-first responsive design
- Minimize `use client` usage
- Supabase `@supabase/ssr` client patterns
- TanStack Query v5 guidance
- Vitest + React Testing Library + MSW v2 patterns
- pnpm package manager (exclusive)

## What we excluded

- PWA functionality
- Vercel AI SDK integration
- Monorepo structure
- Zustand (TanStack Query handles client data)
- nuqs for URL state (not in template)

## Rule files

### `typescript.mdc`

**Applies to:** All TypeScript files (`**/*.ts`, `**/*.tsx`)

- TypeScript strict mode conventions
- Interface vs type preferences
- Component prop typing patterns

### `nextjs.mdc`

**Applies to:** Next.js App Router files (`src/app/**/*`, `src/components/**/*`)

- Server vs Client Component patterns
- Next.js 16 conventions (`error.tsx`, `loading.tsx`, `route.ts`)
- Data fetching strategies and performance

### `supabase.mdc`

**Applies to:** Source files, `src/supabase/**`, `proxy.ts`, migrations

- Context-specific Supabase client usage (`@/supabase/client`, `@/supabase/server`)
- Auth proxy session handling
- Migration safety (agents write SQL only)

### `security.mdc`

**Applies to:** Source files, API routes, proxy, migrations

- Authentication and authorization patterns
- Input validation (Zod planned Phase 5)
- RLS policies, DTOs, OWASP patterns
- Auth proxy route protection

### `react-tanstack-query.mdc`

**Applies to:** `src/hooks/**/*`, `src/components/**/*`, `ReactQueryProvider.tsx`

- TanStack Query v5 patterns
- Custom hook creation and query keys
- Mutation patterns with cache invalidation

### `ui-shadcn.mdc` / `ui-styling.mdc` / `ui-accessibility.mdc`

**Applies to:** Component files

- shadcn/ui CLI usage, customization, composition
- Tailwind + semantic tokens + `cn()` from `@/utils/tailwind`
- WCAG 2.1 AA accessibility patterns

### `logging.mdc`

**Applies to:** `src/**/*.{ts,tsx}`, `scripts/**/*.ts`

- Console log level taxonomy (`error`, `warn`, `log`, `debug`)
- Bracket tag conventions (e.g. `[auth-login]`) for searchable Vercel logs
- Cross-reference: `error-handling.mdc` owns error taxonomy and response envelopes; `logging.mdc` owns level selection and tagging

### `error-handling.mdc`

**Applies to:** `src/**/*.{ts,tsx}`, `src/app/api/**/*.ts`, `src/app/**/error.tsx` (via `autoAttach`)

- Error taxonomy, response envelopes, user-facing vs developer errors
- Delegates log-level guidance to `logging.mdc`

### `data-tables.mdc`

**Applies to:** `*table*.tsx` under `src/components/**` and `src/app/**`

- Canonical data table pattern (single designated search column, Next/Previous pagination)
- Referenced by CONTEXT.md for admin and future table pages

### `documentation.mdc`

**Applies to:** `docs/**/*.md`, `docs/**/*.txt`

- `docs/` directory structure and archiving conventions
- Forward-looking — `docs/` does not exist in the repo yet

### `git-workflow.mdc`

**Applies to:** All files (`**/*` glob — broad attachment, not `alwaysApply`)

- Conventional commits, Husky hooks, PR format

### `api-development.mdc`

**Applies to:** `src/app/api/**/*`, `src/lib/api-contracts/**/*.ts` (via `autoAttach`)

- REST path naming, validation, DTOs, error envelopes

### Database / SQL (on-demand)

Loaded when agents or skills request them (e.g. `/create-migration`) — no globs, `alwaysApply: false`:

- `postgres-sql-style-guide.mdc` — SQL style for migrations
- `create-db-functions.mdc` — Supabase database function patterns
- `create-rls-policies.mdc` — Row Level Security policy authoring

### Always-on rules (`alwaysApply: true`)

- `project-standards.mdc` — coding conventions, imports, quality checks
- `pm-collaboration.mdc` — PM + AI partnership mode
- `general-conventions.mdc` — dates, migration timestamps
- `do-migrations-agent.mdc` — agent migration constraints (also globs migrations and plan files)
- `testing.mdc` — Vitest + RTL + MSW v2; minimalism-first philosophy; 80% coverage gates

### Context-attached rules (not global)

- `rule-authoring.mdc` — how to write and maintain rule files (globs: `.cursor/rules/**`)
- `git-workflow.mdc`, `error-handling.mdc`, `api-development.mdc` — see entries above

## How it works

Cursor loads rules based on:

1. **`alwaysApply: true`** — loaded in every session (five rules; see above)
2. **`globs` / `autoAttach`** — attached when you work on matching files
3. **On-demand** — database/SQL rules and skills (e.g. `/create-migration`) pull in guidance when needed

## Updating rules

1. Edit the relevant `.mdc` file
2. Changes take effect immediately in Cursor
3. Update this README when adding, removing, or reclassifying rule files
4. Commit so the team stays in sync

## Reference

- [Cursor Rules Documentation](https://docs.cursor.com/context/rules)
- [`.cursor/README.md`](../README.md) — skills, agents, planning layout
- [CONTEXT.md](../../CONTEXT.md) — roadmap and locked principles
- [AGENTS.md](../../AGENTS.md) — agent repo truth (implemented features, routes, data model)
- [DESIGN.md](../../DESIGN.md) — token architecture and re-skin workflow
