# Cursor Rules — Seminova

Modular Cursor AI rules (`.mdc` format) for the Seminova template: an opinionated, AI-native starter built on Next.js 16, Supabase, Tailwind, shadcn/ui, Vitest, and TanStack Query v5.

**26 rule files** in this directory. See [`.cursor/README.md`](../README.md) for skills, agents, and planning doc layout. Before creating or editing any rule, read [`.cursor/skills/rule-authoring/SKILL.md`](../skills/rule-authoring/SKILL.md) — `rule-authoring-pointer.mdc` triggers that read automatically.

## What this rule set covers

- **Stack accuracy** — patterns match the actual repo layout (`src/supabase/`, `proxy.ts`, Vitest, pnpm)
- **Template conventions** — primitive-first UI, semantic tokens, WCAG 2.1 AA, conventional commits
- **Agent workflow** — migration safety, testing minimalism, git hooks (see `git-workflow.mdc`)

> [!IMPORTANT]
> Hard constraints live in [AGENTS.md — Hard constraints](../../AGENTS.md#hard-constraints). Agents **write migration SQL only** — humans run `pnpm db:push` and `pnpm db:types`.

Roadmap and active build scope: [ROADMAP.md](../../ROADMAP.md) and [docs/prds/](../../docs/prds/). Repo truth for agents: [AGENTS.md](../../AGENTS.md).

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

| Rule | Mode | Globs (summary) | Purpose |
| ---- | ---- | --------------- | ------- |
| `code-minimalism.mdc` | Always on | — | Laziest-solution-that-works ladder |
| `do-migrations-pointer.mdc` | Always on | — | Stub → read `do-migrations-agent.mdc` before schema work |
| `general-conventions.mdc` | Always on | — | Dates, migration timestamps, environment awareness |
| `pm-collaboration.mdc` | Always on | — | PM + AI partnership mode |
| `project-standards.mdc` | Agent requested | — | File layout, module depth heuristic, utils placement |
| `api-development.mdc` | Auto attached | `src/app/api/**` | REST paths, validation, DTOs, error envelopes |
| `data-tables.mdc` | Auto attached | `*table*.tsx` | Canonical data table pattern (search column, pagination) |
| `do-migrations-agent.mdc` | Auto attached | `migrations/**`, `*.plan.md` | Agent migration protocol; no auto-push |
| `documentation.mdc` | Auto attached | `docs/**` | `docs/` layout and archiving guardrail |
| `error-handling.mdc` | Auto attached | `api/**`, `actions.ts`, `error.tsx` | Error taxonomy, envelopes, InlineError / ErrorPanel |
| `forms.mdc` | Auto attached | form-shaped paths | react-hook-form + zod, save models, autocomplete |
| `git-workflow.mdc` | Auto + Agent requested | `.husky/**`, `.github/workflows/**` | Conventional commits, hooks, PR format |
| `logging.mdc` | Auto attached | `src/**`, `scripts/**` | Log levels and bracket tags for Vercel search |
| `nextjs.mdc` | Auto attached | `src/app/**`, `src/components/**` | App Router, RSC patterns, Next 16 conventions |
| `notifications.mdc` | Auto attached | feedback surfaces | Toast vs inline routing; success taxonomy |
| `react-tanstack-query.mdc` | Auto attached | `hooks/**`, `components/**`, provider | TanStack Query v5 keys, hooks, mutations |
| `rule-authoring-pointer.mdc` | Auto attached | `.cursor/rules/**` | Stub → read rule-authoring skill before rule edits |
| `security.mdc` | Auto attached | `src/**`, `proxy.ts`, migrations | Auth, validation, RLS, OWASP patterns |
| `seo.mdc` | Auto attached | `src/app/**`, SEO utils, `site.ts` | Metadata wire-up, crawler surface, social previews |
| `supabase-sql.mdc` | Auto attached | `migrations/**` | Project SQL style, RLS, functions (deltas only) |
| `supabase.mdc` | Auto attached | `src/**`, `supabase/**`, `proxy.ts` | `@supabase/ssr` clients, auth proxy |
| `testing.mdc` | Auto attached | `*.test.*`, `src/test/**` | Vitest + RTL + MSW v2; 80% coverage gates |
| `typescript.mdc` | Auto attached | `src/**`, `scripts/**` | Strict TS, named exports, shared types |
| `ui-accessibility.mdc` | Auto attached | `components/**`, `app/**` | WCAG 2.1 AA patterns |
| `ui-shadcn.mdc` | Auto attached | `components/**`, `app/**` | shadcn/ui composition and customization |
| `ui-styling.mdc` | Auto attached | `components/**`, `app/**` | Tailwind, semantic tokens, `cn()` |

Per-rule detail (topics and cross-references):

<details>
<summary>TypeScript, Next.js, and data fetching</summary>

### `typescript.mdc`

**Applies to:** `src/**/*.ts`, `src/**/*.tsx`, `scripts/**/*.ts`

- TypeScript strict mode conventions
- Interface vs type preferences
- Component prop typing patterns

### `nextjs.mdc`

**Applies to:** `src/app/**/*`, `src/components/**/*`

- Server vs Client Component patterns
- Next.js 16 conventions (`error.tsx`, `loading.tsx`, `route.ts`)
- Data fetching strategies and performance

### `seo.mdc`

**Applies to:** `src/app/**`, `src/config/site.ts`, SEO utilities (`site-url`, `robots-policy`, `sitemap-routes`, `structured-data`, `og-image`, `discover-app-routes`, `proxy-matcher`)

- Metadata wire-up (`getSiteMetadata`, per-page `metadata` / `generateMetadata`)
- Crawler surface (`robots.ts`, `sitemap.ts`, JSON-LD)
- Dynamic social previews (`opengraph-image.tsx` convention)
- Cross-reference: `ui-accessibility.mdc` owns semantic HTML; `nextjs.mdc` owns App Router mechanics

### `react-tanstack-query.mdc`

**Applies to:** `src/hooks/**/*`, `src/components/**/*`, `ReactQueryProvider.tsx`

- TanStack Query v5 patterns
- Custom hook creation and query keys
- Mutation patterns with cache invalidation

</details>

<details>
<summary>Supabase, security, and migrations</summary>

### `supabase.mdc`

**Applies to:** `src/**/*.ts`, `src/**/*.tsx`, `src/supabase/**`, `proxy.ts`, migrations

- Context-specific Supabase client usage (`@/supabase/client`, `@/supabase/server`)
- Auth proxy session handling
- Migration safety (agents write SQL only)

### `security.mdc`

**Applies to:** `src/**`, `proxy.ts`, `src/app/api/**`, migrations

- Authentication and authorization patterns
- Input validation (Zod at server boundary — profile forms, server actions)
- RLS policies, DTOs, OWASP patterns
- Auth proxy route protection

### `supabase-sql.mdc`

**Applies to:** `supabase/migrations/**/*.sql`

- Project-specific SQL style, RLS, and function conventions (deltas only)

### `do-migrations-agent.mdc`

**Applies to:** `supabase/migrations/**/*.sql`, `**/*.plan.md`

- Agent constraints, file naming, post-migration steps
- Never run `pnpm db:push` or other human-only migration commands

</details>

<details>
<summary>UI, forms, and tables</summary>

### `ui-shadcn.mdc` / `ui-styling.mdc` / `ui-accessibility.mdc`

**Applies to:** Component and app route files (see table for glob overlap)

- shadcn/ui CLI usage, customization, composition
- Tailwind + semantic tokens + `cn()` from `@/utils/tailwind`
- WCAG 2.1 AA accessibility patterns

### `forms.mdc`

**Applies to:** Form-shaped paths (`*form*`, `actions.ts`, password/avatar components)

- Canonical form stack (`react-hook-form` + zod), save-model routing (blur-save vs explicit submit vs upload-on-complete)
- Password-field `autocomplete` conventions
- Cross-reference: `error-handling.mdc` owns error envelopes and `InlineError` / `ErrorPanel`; `notifications.mdc` owns toast vs inline-indicator success feedback

### `notifications.mdc`

**Applies to:** Feedback surfaces (forms, actions, toasts, table toasts, inline indicators)

- Toast vs inline indicator vs inline/panel routing; success/info/warning taxonomy
- Cross-reference: `error-handling.mdc` owns error surfaces; errors never toast. `forms.mdc` owns save-model that drives toast-vs-indicator choice.

### `data-tables.mdc`

**Applies to:** `*table*.tsx` under `src/components/**` and `src/app/**`

- Canonical data table pattern (single designated search column, Next/Previous pagination)
- Referenced by admin users-table epic in planning docs

</details>

<details>
<summary>Errors, logging, and API</summary>

### `logging.mdc`

**Applies to:** `src/**/*.ts`, `src/**/*.tsx`, `scripts/**/*.ts`

- Console log level taxonomy (`error`, `warn`, `log`, `debug`)
- Bracket tag conventions (e.g. `[auth-login]`) for searchable Vercel logs
- Cross-reference: `error-handling.mdc` owns error taxonomy and response envelopes; `logging.mdc` owns level selection and tagging

### `error-handling.mdc`

**Applies to:** `src/app/api/**/*.ts`, `src/app/**/actions.ts`, `src/app/**/error.tsx`

- Error taxonomy, response envelopes, user-facing vs developer errors
- Delegates log-level guidance to `logging.mdc`; defers toast routing to `notifications.mdc`

### `api-development.mdc`

**Applies to:** `src/app/api/**/*.ts`, `src/app/api/**/*.tsx` (schemas co-located in route `_lib/`)

- REST path naming, validation, DTOs, error envelopes

</details>

<details>
<summary>Docs, git, and testing</summary>

### `documentation.mdc`

**Applies to:** `docs/**/*.md`, `docs/**/*.txt`

- `docs/` directory structure and archiving conventions

### `git-workflow.mdc`

**Applies to:** `.husky/**`, `.github/workflows/**` (auto-attached); Agent Requested for commit/branch/PR work

- Conventional commits, Husky hooks, PR format

### `testing.mdc`

**Applies to:** `**/*.test.*`, `src/test/**`

- Vitest + RTL + MSW v2; minimalism-first philosophy; 80% coverage gates

</details>

<details>
<summary>Always-on, pointers, and agent-requested</summary>

### Always-on (`alwaysApply: true`)

- `general-conventions.mdc` — dates, migration timestamps
- `code-minimalism.mdc` — laziest-solution-that-works ladder for code generation
- `pm-collaboration.mdc` — PM + AI partnership mode
- `do-migrations-pointer.mdc` — stub that triggers a read of `do-migrations-agent.mdc` before schema work

### Agent Requested (no globs)

- `project-standards.mdc` — file layout, Ousterhout depth heuristic, utils placement; use when creating new files or restructuring modules

### Pointer stubs (auto-attached on matching paths)

- `rule-authoring-pointer.mdc` — triggers a read of the rule-authoring skill before any rule edit (globs: `.cursor/rules/**`)

</details>

## How it works

Cursor loads rules based on frontmatter — only three keys are real: `description`, `globs`, `alwaysApply`. Any other key is silently ignored. See the rule authoring standard in the opening paragraph for the full activation-mode taxonomy.

1. **`alwaysApply: true`** — loaded in every session (four rules; see table)
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
- Rule authoring standard — see opening paragraph
- [ROADMAP.md](../../ROADMAP.md) — roadmap and phase status
- [AGENTS.md](../../AGENTS.md) — hard constraints, implemented features, routes, data model
- [docs/DOC_RULES.md](../../docs/DOC_RULES.md) — doc maintenance procedure
- [DESIGN.md](../../DESIGN.md) — token architecture and re-skin workflow
