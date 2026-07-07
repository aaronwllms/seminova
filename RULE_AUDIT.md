# Rule Audit — seminova

Last full audit: 2026-07-07
Last synced: 2026-07-07
Scope: `.cursor/rules/*.mdc` against the rule-authoring standard

## Executive summary

- **All open findings (R014–R023) remediated** in `.cursor/rules/` on 2026-07-07.
- **MSW policy locked:** deferred until first HTTP-boundary test; global setup (`handlers.ts` + `server.ts` + `vitest.setup.ts`) on trigger; per-test `server.use()` for overrides only.
- **Broad `src/**` globs on `logging.mdc`, `security.mdc`, `supabase.mdc`:** no change — acceptable until a file crosses 300 lines or a fourth broad rule is added.
- **Always Apply set under budget** (~776 words combined).

## Orient

25 rule files audited. Activation modes resolved from frontmatter (no invalid keys like `autoAttach` found).

| File                         | Mode                                                                                    |
| ---------------------------- | --------------------------------------------------------------------------------------- |
| `code-minimalism.mdc`        | Always Apply                                                                            |
| `do-migrations-pointer.mdc`  | Always Apply                                                                            |
| `general-conventions.mdc`    | Always Apply                                                                            |
| `pm-collaboration.mdc`       | Always Apply                                                                            |
| `api-development.mdc`        | Auto Attached — `src/app/api/**`                                                        |
| `data-tables.mdc`            | Auto Attached — `*table*.tsx` paths                                                     |
| `do-migrations-agent.mdc`    | Auto Attached — migrations + plan files                                                 |
| `documentation.mdc`          | Auto Attached — `docs/**`                                                               |
| `error-handling.mdc`         | Auto Attached — API routes, actions, error boundaries                                   |
| `forms.mdc`                  | Auto Attached — `*form*`, `actions.ts`, password-dialog, avatar-field paths             |
| `git-workflow.mdc`           | Auto Attached — `.husky/**`, `.github/workflows/**`; Agent Requested for commit/PR work |
| `logging.mdc`                | Auto Attached — `src/**`, `scripts/**`                                                  |
| `nextjs.mdc`                 | Auto Attached — `src/app/**`, `src/components/**`                                       |
| `notifications.mdc`          | Auto Attached — form/feedback surfaces (forms, actions, toast, tables, indicators)      |
| `project-standards.mdc`      | Agent Requested                                                                         |
| `react-tanstack-query.mdc`   | Auto Attached — hooks, components, ReactQueryProvider                                   |
| `rule-authoring-pointer.mdc` | Auto Attached — `.cursor/rules/**`                                                      |
| `security.mdc`               | Auto Attached — `src/**`, proxy, API, migrations                                        |
| `supabase.mdc`               | Auto Attached — `src/**`, proxy, migrations                                             |
| `supabase-sql.mdc`           | Auto Attached — `supabase/migrations/**/*.sql`                                          |
| `testing.mdc`                | Auto Attached — test files, test utils                                                    |
| `typescript.mdc`             | Auto Attached — `src/**/*.ts`, `src/**/*.tsx`, `scripts/**/*.ts`                        |
| `ui-accessibility.mdc`       | Auto Attached — components + app TSX                                                    |
| `ui-shadcn.mdc`              | Auto Attached — UI primitives + components + app                                        |
| `ui-styling.mdc`             | Auto Attached — components + app TSX                                                    |

## Findings

No open findings.

## Rules that are fine

- **`code-minimalism.mdc`** — Core ethos rule; always-on placement earned.
- **`do-migrations-pointer.mdc`** — Minimal always-on pointer; earns its token cost.
- **`do-migrations-agent.mdc`** — Clear agent/human split, correct globs.
- **`general-conventions.mdc`** — Appropriate always-on date/env awareness.
- **`pm-collaboration.mdc`** — Genuinely universal working-mode guidance.
- **`rule-authoring-pointer.mdc`** — Correct glob trigger for rule edits; minimal.
- **`data-tables.mdc`** — Tight, project-specific table conventions.
- **`documentation.mdc`** — Thin structural guardrail; paths verified.
- **`forms.mdc`** — Strong ownership of save model and autofill conventions.
- **`notifications.mdc`** — Clear toast vs inline vs panel routing.
- **`logging.mdc`** — Focused level taxonomy; broad `src/**` glob acceptable.
- **`project-standards.mdc`** — Agent Requested with specific description.
- **`typescript.mdc`** — Project-delta only; globs scoped to app + scripts.
- **`supabase-sql.mdc`** — Project-delta-only SQL conventions; cites shipped migrations.
- **`ui-shadcn.mdc`** — CLI flags, primitive-first workflow.
- **`ui-accessibility.mdc`** — WCAG 2.1 AA target, Radix preservation.
- **`ui-styling.mdc`** — Semantic tokens, `globals.css`, `DESIGN.md`.
- **`api-development.mdc`** — Forward-looking API route guidance; envelope shapes defer to error-handling.
- **`error-handling.mdc`** — Canonical error taxonomy and UI surfaces; logging boundaries cross-referenced.
- **`git-workflow.mdc`** — Conventional commits and PR format with precedence line.
- **`nextjs.mdc`** — Server Actions default, Suspense/waterfall guidance, project cross-refs.
- **`react-tanstack-query.mdc`** — Server Action mutation pattern; Supabase query-key conventions.
- **`security.mdc`** — Trust-boundary guidance via principles + shipped file refs; broad glob acceptable.
- **`supabase.mdc`** — Storage, client usage, migration safety; broad glob acceptable.
- **`testing.mdc`** — MSW deferred policy documented; mocking policy intact.

## Open questions

None — both resolved 2026-07-07 (see Resolved).

## Resolved

- 2026-07-07 — R014: `testing.mdc` — removed stale `src/mocks` glob; MSW deferred + global-setup-on-trigger policy documented
- 2026-07-07 — R015: `git-workflow.mdc` — commit examples updated to shipped surfaces (profile avatar, admin users, login-form)
- 2026-07-07 — R016: `react-tanstack-query.mdc` — mutation example replaced with Server Action + invalidation pointer
- 2026-07-07 — R017: `error-handling.mdc` — good/bad message comparison block collapsed to one principle line
- 2026-07-07 — R018: `error-handling.mdc` — never-log list removed; cross-ref to `logging.mdc` / `security.mdc`
- 2026-07-07 — R019: `nextjs.mdc` — generic Server/Client and Web Vitals tutorial trimmed; project-delta retained
- 2026-07-07 — R020: `supabase.mdc` — generic Production Operations section removed; dashboard cross-ref kept
- 2026-07-07 — R021: `security.mdc` — SSRF inline code block replaced with principle + `is-safe-redirect.ts` pointer
- 2026-07-07 — R022: `api-development.mdc` — duplicate envelope code blocks removed; cross-ref to error-handling retained
- 2026-07-07 — R023: `git-workflow.mdc` — duplicate commit format template removed
- 2026-07-07 — Open question (MSW): deferred until first HTTP-boundary test; global setup on trigger; per-test `server.use()` for overrides only
- 2026-07-07 — Open question (broad globs): no narrowing; revisit when any file crosses 300 lines or a fourth broad `src/**` rule is added
- 2026-07-04 — R001: Always Apply set over budget — now ~776 words (under ~800)
- 2026-07-04 — R002: `testing.mdc` trimmed to ≤250 lines
- 2026-07-04 — R003: `typescript.mdc` globs narrowed; generic TS tutorial cut
- 2026-07-04 — R004: demo `useGetMessage` / `/api/message` cleanup (mutation example regressed in R016, fixed 2026-07-07)
- 2026-07-04 — R005: SQL `id` convention consolidated
- 2026-07-04 — R006: `forms.mdc` and `notifications.mdc` globs narrowed
- 2026-07-04 — R007: PR format precedence line in `git-workflow.mdc`
- 2026-07-04 — R008: template SQL rules replaced by `supabase-sql.mdc`
- 2026-07-04 — R009: UI rules trimmed to project-specific guidance
- 2026-07-04 — R010: error-handling description scoped; logging ownership clarified
- 2026-07-04 — R011: security auth/DTO blocks replaced with principles + file refs
- 2026-07-04 — R012: `supabase-sql.mdc` Auto Attached on migration globs
- 2026-07-04 — R013: PERMISSIVE default documented in `supabase-sql.mdc`
