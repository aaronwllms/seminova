# Rule Audit — seminova

Last full audit: 2026-07-04
Last synced: 2026-07-04
Scope: `.cursor/rules/*.mdc` against the rule-authoring standard

## Executive summary

- **Always Apply set:** ~812 words combined (~12 over the ~800-word budget). Accepted as a documented exception — `code-minimalism.mdc` always-on placement justified as core ethos rule (see rule-authoring skill Size budgets).
- **`testing.mdc` trimmed** to ≤250 lines — over-testing examples collapsed, minimalism deduped, mocking policy preserved with handler pointer.
- **`typescript.mdc` globs narrowed** to `src/**/*.ts`, `src/**/*.tsx`, `scripts/**/*.ts`; generic TS tutorial content removed.
- **UI rules trimmed** (`ui-shadcn`, `ui-accessibility`, `ui-styling`) — project-specific guidance and file pointers only.
- **Three rules still share broad `src/**` globs** (logging, security, supabase). Forms and notifications were narrowed to form-shaped paths and feedback surfaces (2026-07-04 remediation).

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
| `testing.mdc`                | Auto Attached — test files, mocks, test utils                                           |
| `typescript.mdc`             | Auto Attached — `src/**/*.ts`, `src/**/*.tsx`, `scripts/**/*.ts`                        |
| `ui-accessibility.mdc`       | Auto Attached — components + app TSX                                                    |
| `ui-shadcn.mdc`              | Auto Attached — UI primitives + components + app                                        |
| `ui-styling.mdc`             | Auto Attached — components + app TSX                                                    |

## Findings

No open findings. All items from the 2026-07-04 audit are resolved (see Resolved table below).

## Rules that are fine

- **`data-tables.mdc`** — Tight, project-specific (search column flag, Next/Previous pagination, skeleton via `DataTableShell`). Cites shipped `users-table.tsx`. Good signal density.
- **`do-migrations-agent.mdc`** — Clear agent/human split, correct globs, points to create-migration skill and `supabase-sql.mdc`. No duplication with AGENTS.md beyond intentional cross-ref.
- **`do-migrations-pointer.mdc`** — Minimal always-on pointer; earns its token cost.
- **`forms.mdc`** — Strong ownership of save model and autofill conventions. Globs narrowed to form-shaped paths; frontmatter documents glob-maintenance obligation. Good cross-refs to notifications and error-handling.
- **`notifications.mdc`** — Clear toast vs inline vs panel routing. Globs narrowed to feedback surfaces. Complements `error-handling.mdc` without redefining error taxonomy.
- **`supabase-sql.mdc`** — Project-delta-only SQL conventions; cites shipped migrations; Auto Attached on migration globs. Replaces three upstream template rules.
- **`logging.mdc`** — Focused level taxonomy and tag convention. Correctly deferrals to error-handling for failure envelopes.
- **`documentation.mdc`** — Thin structural guardrail as intended. Paths verified (`WORKFLOW_BACKLOG.md`, `DOC_RULES.md`, `docs/prds/archive/` policy).
- **`rule-authoring-pointer.mdc`** — Correct glob trigger for rule edits; minimal.
- **`general-conventions.mdc`** — Appropriate always-on date/env awareness; within per-file word budget.
- **`project-standards.mdc`** — Agent Requested with specific description. Depth heuristic and `_lib/` vs `src/utils/` placement are project-specific and useful.
- **`api-development.mdc`** — Forward-looking (no API routes shipped yet) but well-scoped globs and strong cross-refs to error-handling. No restated hard constraints.
- **`nextjs.mdc`** — Reasonable App Router guidance with Server Actions default and cross-refs to supabase/RLS performance. Globs match relevance shape.
- **`pm-collaboration.mdc`** — Genuinely universal working-mode guidance; deserves always-on placement.
- **`code-minimalism.mdc`** — Core ethos rule; always-on placement documented as accepted exception in rule-authoring skill.
- **`supabase.mdc`** — Strong project-specific storage and client-usage sections. Migration safety correctly delegates to `do-migrations-agent.mdc`.
- **`error-handling.mdc`** — Canonical owner for error taxonomy, envelopes, and UI branching (`InlineError` / `ErrorPanel`). Logging defers to `logging.mdc`.
- **`security.mdc`** — Auth, DTO, and access-control guidance via principles + shipped file refs (`assertAdminCaller` in admin users actions). Cross-refs to error-handling and api-development.
- **`testing.mdc`** — Minimalism applied once; H/I/B, mocking policy, coverage gates, and authoring checklist intact. Over-testing guidance points at shipped tests.
- **`typescript.mdc`** — Project-delta only (named exports, Supabase types, shared-type placement). Globs scoped to app + scripts TypeScript.
- **`ui-shadcn.mdc`** — CLI `-y -o` flags, primitive-first workflow, customization via shipped `src/components/ui/` patterns.
- **`ui-accessibility.mdc`** — WCAG 2.1 AA target, Radix preservation, token-based focus rings; generic ARIA/keyboard tutorials removed.
- **`ui-styling.mdc`** — Semantic tokens, `globals.css`, `DESIGN.md`; generic breakpoint/cn() tutorials removed.
- **`react-tanstack-query.mdc`** — Supabase query-key principle; cites `use-sign-out.ts` for hook conventions.

## Resolved

| ID   | Verification note |
| ---- | ----------------- |
| R001 | Accepted exception — set ~12 words over budget; code-minimalism always-on justified as core ethos rule; exception recorded in rule-authoring skill Size budgets |
| R002 | Over-testing examples collapsed; minimalism deduped; file ≤250 lines; mocking policy preserved with handler pointer to `src/mocks/handlers.ts` |
| R003 | Globs narrowed to `src/**/*.ts`, `src/**/*.tsx`, `scripts/**/*.ts`; generic TS tutorial cut; glob rationale in frontmatter |
| R004 | `useGetMessage` hook + test deleted; orphaned `axios` and `/api/message` MSW handler removed; `react-tanstack-query.mdc` cites Supabase query-key principle + `use-sign-out.ts`; `pnpm test:ci` passes |
| R005 | Conflicting "avoid id" bullet removed via consolidation; convention is `id bigint generated always as identity` |
| R006 | `forms.mdc` and `notifications.mdc` globs narrowed; all shipped consumers verified against new patterns |
| R007 | Precedence line added to `git-workflow.mdc` PR Description |
| R008 | Three template SQL rules replaced by project-delta-only `supabase-sql.mdc` |
| R009 | ui-shadcn, ui-accessibility, ui-styling trimmed to project-specific guidance + file pointers |
| R010 | error-handling description scoped to taxonomy/envelopes/UI; logging defers to logging.mdc |
| R011 | security auth/DTO inline blocks replaced with principles + shipped file refs (`assertAdminCaller` in `src/app/admin/users/actions.ts`) |
| R012 | `supabase-sql.mdc` Auto Attached on `supabase/migrations/**/*.sql` |
| R013 | PERMISSIVE default documented; MFA restrictive noted as rare exception |

### Open questions — answered (2026-07-04)

| Question | Resolution |
| -------- | ---------- |
| Broad `src/**` globs | Narrowing forms + notifications to form-shaped paths, actions, and feedback call sites is acceptable; implemented in R006 fix |
| Legacy demo cleanup | Remove `useGetMessage` + test, orphaned `axios` dep, and `/api/message` MSW handler; update rule references (R004 fix) |
| PR format authority | Repo `git-workflow.mdc` Why/What/Testing/Risk format wins; explicit precedence line added (R007 fix) |
| SQL helper rules | Consolidated into `supabase-sql.mdc` with migration globs (R005/R008/R012/R013 fix) |
