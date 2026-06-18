# Cursor Rules — Seminova

Modular Cursor AI rules (`.mdc` format) for the Seminova template: an opinionated, AI-native starter built on Next.js 16, Supabase, Tailwind, shadcn/ui, Vitest, and TanStack Query v5.

See [`.cursor/README.md`](../README.md) for skills, agents, and planning doc layout.

## What this rule set covers

- **Stack accuracy** — patterns match the actual repo layout (`src/supabase/`, `proxy.ts`, Vitest, pnpm)
- **Template conventions** — primitive-first UI, semantic tokens, WCAG 2.1 AA, conventional commits
- **Agent workflow** — migration safety, testing minimalism, git hooks (see `git-workflow.mdc`)

Locked principles and roadmap live in [CONTEXT.md](../../CONTEXT.md). Agent repo truth will live in [AGENTS.md](../../AGENTS.md) (Epic 1C).

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

**Applies to:** `src/hooks/**/*`, `src/components/**/*`

- TanStack Query v5 patterns
- Custom hook creation and query keys
- Mutation patterns with cache invalidation

### `ui-shadcn.mdc` / `ui-styling.mdc` / `ui-accessibility.mdc`

**Applies to:** Component files

- shadcn/ui CLI usage, customization, composition
- Tailwind + semantic tokens + `cn()` from `@/utils/tailwind`
- WCAG 2.1 AA accessibility patterns

### `testing.mdc`

**Applies to:** Test files, `src/mocks/**/*`, `src/test/**/*`

- Vitest + React Testing Library patterns
- MSW v2 API mocking
- Minimalism-first testing philosophy

### `git-workflow.mdc`

**Applies to:** Always active

- Conventional commits, Husky hooks, PR format

### `api-development.mdc`

**Applies to:** `src/app/api/**/*` (when added)

- REST path naming, validation, DTOs, error envelopes

### Other always-on rules

- `project-standards.mdc` — coding conventions, imports, quality checks
- `pm-collaboration.mdc` — PM + AI partnership mode
- `general-conventions.mdc` — dates, migrations timestamps
- `do-migrations-agent.mdc` — agent migration constraints
- `error-handling.mdc` — error taxonomy, logging, response envelopes
- `rule-authoring.mdc` — how to write and maintain rule files

## How it works

Cursor loads rules based on:

1. **File patterns** in each rule's `globs` frontmatter
2. **Context** of what you're working on
3. **`alwaysApply`** rules for global conventions

## Updating rules

1. Edit the relevant `.mdc` file
2. Changes take effect immediately in Cursor
3. Commit so the team stays in sync

## Reference

- [Cursor Rules Documentation](https://docs.cursor.com/context/rules)
- [`.cursor/README.md`](../README.md) — skills, agents, planning layout
- [CONTEXT.md](../../CONTEXT.md) — roadmap and locked principles
- [AGENTS.md](../../AGENTS.md) — agent repo truth (Epic 1C)
