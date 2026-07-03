# Cursor Rules — Seminova

Modular Cursor AI rules (`.mdc` format) for the Seminova template: an opinionated, AI-native starter built on Next.js 16, Supabase, Tailwind, shadcn/ui, Vitest, and TanStack Query v5.

**27 rule files** in this directory. See [`.cursor/README.md`](../README.md) for skills, agents, and planning doc layout. Rule authoring standard lives in [`.cursor/skills/rule-authoring/SKILL.md`](../skills/rule-authoring/SKILL.md) — `rule-authoring-pointer.mdc` (see below) triggers a read of it before any rule file is created or edited.

## What this rule set covers

- **Stack accuracy** — patterns match the actual repo layout (`src/supabase/`, `proxy.ts`, Vitest, pnpm)
- **Template conventions** — primitive-first UI, semantic tokens, WCAG 2.1 AA, conventional commits
- **Agent workflow** — migration safety, testing minimalism, git hooks (see `git-workflow.mdc`)

Hard constraints live in [AGENTS.md § Hard constraints](../../AGENTS.md#hard-constraints); roadmap and active build scope in [ROADMAP.md](../../ROADMAP.md) and [docs/prds/](../../docs/prds/). Repo truth for agents lives in [AGENTS.md](../../AGENTS.md).

## What we adopted

- DRY and SOLID principles (scoped rules — not duplicated in always-on context)
- Module depth heuristic (Ousterhout): inspect at ~300–400 lines; split only when low-depth (god file or shallow/classitis), not on line count alone — see `project-standards.mdc`
- RORO pattern (Receive Object, Return Object) — owned by `typescript.mdc`
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
- Input validation (Zod at server boundary — profile forms, server actions)
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

**Applies to:** `src/**/*.ts`, `src/**/*.tsx`, `scripts/**/*.ts`

- Console log level taxonomy (`error`, `warn`, `log`, `debug`)
- Bracket tag conventions (e.g. `[auth-login]`) for searchable Vercel logs
- Cross-reference: `error-handling.mdc` owns error taxonomy and response envelopes; `logging.mdc` owns level selection and tagging

### `error-handling.mdc`

**Applies to:** `src/app/api/**/*.ts`, `src/app/**/actions.ts`, `src/app/**/error.tsx`

- Error taxonomy, response envelopes, user-facing vs developer errors
- Delegates log-level guidance to `logging.mdc`; defers toast routing to `notifications.mdc`

### `forms.mdc`

**Applies to:** `src/**/*.ts`, `src/**/*.tsx` (broad globs intentional — load-bearing on common edit paths)

- Canonical form stack (`react-hook-form` + zod), save-model routing (blur-save vs explicit submit vs upload-on-complete)
- Password-field `autocomplete` conventions
- Cross-reference: `error-handling.mdc` owns error envelopes and `InlineError` / `ErrorPanel`; `notifications.mdc` owns toast vs inline-indicator success feedback

### `notifications.mdc`

**Applies to:** `src/**/*.ts`, `src/**/*.tsx` (broad globs intentional — load-bearing on common edit paths)

- Toast vs inline indicator vs inline/panel routing; success/info/warning taxonomy
- Cross-reference: `error-handling.mdc` owns error surfaces; errors never toast. `forms.mdc` owns save-model that drives toast-vs-indicator choice.

### `data-tables.mdc`

**Applies to:** `*table*.tsx` under `src/components/**` and `src/app/**`

- Canonical data table pattern (single designated search column, Next/Previous pagination)
- Referenced by admin users-table epic in planning docs

### `documentation.mdc`

**Applies to:** `docs/**/*.md`, `docs/**/*.txt`

- `docs/` directory structure and archiving conventions

### `git-workflow.mdc`

**Applies to:** `.husky/**`, `.github/workflows/**` (auto-attached); Agent Requested for commit/branch/PR work

- Conventional commits, Husky hooks, PR format

### `api-development.mdc`

**Applies to:** `src/app/api/**/*.ts`, `src/app/api/**/*.tsx` (schemas co-located in route `_lib/`)

- REST path naming, validation, DTOs, error envelopes

### Database / SQL (on-demand)

Loaded when agents or skills request them (e.g. `/create-migration`) — no globs, `alwaysApply: false`:

- `postgres-sql-style-guide.mdc` — SQL style for migrations
- `create-db-functions.mdc` — Supabase database function patterns
- `create-rls-policies.mdc` — Row Level Security policy authoring

### Always-on rules (`alwaysApply: true`)

- `general-conventions.mdc` — dates, migration timestamps
- `code-minimalism.mdc` — laziest-solution-that-works ladder for code generation
- `pm-collaboration.mdc` — PM + AI partnership mode
- `do-migrations-pointer.mdc` — stub that triggers a read of `do-migrations-agent.mdc` before schema work

### Agent Requested rules (no globs)

- `project-standards.mdc` — file layout, Ousterhout depth heuristic, utils placement; use when creating new files or restructuring modules

### Context-attached rules (not global)

- `testing.mdc` — Vitest + RTL + MSW v2; minimalism-first philosophy; 80% coverage gates (test/mocks globs)
- `do-migrations-agent.mdc` — full agent migration protocol (globs: `supabase/migrations/**/*.sql`, `**/*.plan.md`)
- `rule-authoring-pointer.mdc` — stub that triggers a read of the `rule-authoring` skill before any rule edit (globs: `.cursor/rules/**`)
- `git-workflow.mdc`, `error-handling.mdc`, `api-development.mdc` — see entries above

## How it works

Cursor loads rules based on frontmatter — only three keys are real: `description`, `globs`, `alwaysApply`. Any other key is silently ignored. See [`rule-authoring`](../skills/rule-authoring/SKILL.md) for the full activation-mode taxonomy.

1. **`alwaysApply: true`** — loaded in every session (four rules; see above)
2. **`globs` set** — attached when you work on matching files (Auto Attached)
3. **No globs, `alwaysApply: false`, specific `description`** — agent decides at runtime whether it's relevant (Agent Requested)
4. **On-demand** — database/SQL rules and skills (e.g. `/create-migration`) pull in guidance when needed

## Updating rules

1. Edit the relevant `.mdc` file
2. Changes take effect immediately in Cursor
3. Update this README when adding, removing, or reclassifying rule files
4. Commit so the team stays in sync

## Reference

- [Cursor Rules Documentation](https://docs.cursor.com/context/rules)
- [`.cursor/README.md`](../README.md) — skills, agents, planning layout
- [`.cursor/skills/rule-authoring/SKILL.md`](../skills/rule-authoring/SKILL.md) — rule authoring standard
- [ROADMAP.md](../../ROADMAP.md) — roadmap and phase status
- [AGENTS.md](../../AGENTS.md) — hard constraints, implemented features, routes, data model
- [docs/DOC_RULES.md](../../docs/DOC_RULES.md) — doc maintenance procedure
- [DESIGN.md](../../DESIGN.md) — token architecture and re-skin workflow
