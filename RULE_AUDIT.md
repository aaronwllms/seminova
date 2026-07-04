# Rule Audit — seminova

Last full audit: 2026-07-04
Last synced: 2026-07-04
Scope: `.cursor/rules/*.mdc` against the rule-authoring standard

## Executive summary

- **Always Apply set exceeds the ~800-word budget** (812 words combined). `code-minimalism.mdc` alone is 451 words — paid on every request and well above the per-file ~200-word justification threshold for always-on placement.
- **`testing.mdc` (340 lines) is the largest rule file** and reads like a testing tutorial: multiple good/bad comparison blocks and duplicated minimalism guidance. Likely to dilute compliance with the project's own minimalism ethos.
- **`typescript.mdc` globs are repo-wide** (`**/*.ts`, `**/*.tsx`) — Auto Attached on migrations, scripts, config, and test files where TypeScript conventions add little signal.
- **Four rules still share broad `src/**` globs** (logging, security, supabase, plus UI rules). Forms and notifications were narrowed to form-shaped paths and feedback surfaces (2026-07-04 remediation).
- **Generic tutorial rules** (`ui-accessibility.mdc`, `ui-styling.mdc`, parts of `ui-shadcn.mdc`) teach patterns the agent already knows; project-specific guidance (semantic tokens, shadcn CLI flags, reference files) is buried in noise.

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
| `typescript.mdc`             | Auto Attached — `**/*.ts`, `**/*.tsx` (repo-wide)                                       |
| `ui-accessibility.mdc`       | Auto Attached — components + app TSX                                                    |
| `ui-shadcn.mdc`              | Auto Attached — UI primitives + components + app                                        |
| `ui-styling.mdc`             | Auto Attached — components + app TSX                                                    |

## Findings

| ID   | Category         | File:Line                                          | Severity | Description                                                                                                                                                                                                                                                                                         | Recommendation                                                                                                                                                                                                                 |
| ---- | ---------------- | -------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R001 | Size budget (Always Apply) | `code-minimalism.mdc:1-54`, `pm-collaboration.mdc:1-34`, set total | High     | Combined Always Apply word count is **812** (budget ~800). `code-minimalism.mdc` is **451 words** and `pm-collaboration.mdc` is **204 words** — both exceed the ~200-word per-file threshold for always-on rules. This cost is paid every request.                                                  | Trim `code-minimalism.mdc` to principles + cross-refs only, or demote to Agent Requested with a specific description. Keep `pm-collaboration.mdc` always-on but trim to decision/communication bullets if over budget matters. |
| R002 | Signal-to-noise  | `testing.mdc:181-256`                              | High     | 340 lines (inspect trigger at 300). ~75 lines are good/bad comparison blocks with full code samples for over-testing — three near-duplicate didactic examples. Duplicates minimalism guidance already in the file header and in `code-minimalism.mdc`.                                              | Collapse examples to one principle paragraph; point at shipped tests (`extract-auth-form-error.unit.test.ts`, `login-form.integration.test.tsx`) instead of inline ContactForm samples. Target ≤250 lines.                     |
| R003 | Mode fit         | `typescript.mdc:3-5`                               | Medium   | Globs `**/*.ts` and `**/*.tsx` match the entire repo — migrations, scripts, Husky hooks, Vitest config, and `.cursor/` paths — not just application TypeScript. Auto Attached where relevance is thin adds noise on non-app edits.                                                                  | Narrow to `src/**/*.ts`, `src/**/*.tsx`, and optionally `scripts/**/*.ts`. Keep Agent Requested fallback via description if repo-wide TS work is needed.                                                                       |
| R009 | Signal-to-noise  | `ui-shadcn.mdc:59-213`, `ui-accessibility.mdc:36-153`, `ui-styling.mdc:23-127` | Low      | Large generic tutorial sections (cva customization, responsive breakpoints, ARIA keyboard patterns, `cn()` usage) that duplicate ecosystem docs. High-signal project content (CLI `-y -o` flags, semantic tokens, reference paths) is a minority of each file.                                      | Keep project-specific sections; cut or replace generic blocks with pointers to `src/components/ui/`, `globals.css`, and `DESIGN.md`.                                                                                           |
| R010 | Single ownership | `error-handling.mdc:2`, `error-handling.mdc:70-72` | Low      | Description says "logging, and monitoring" but logging levels/tags are owned by `logging.mdc` (cross-ref exists). "Monitoring" is not covered. Minor scope creep in the title/description may cause agents to treat this file as the logging owner.                                                 | Shorten description to error taxonomy, envelopes, and UI surfaces only. Remove "monitoring" unless content is added.                                                                                                           |
| R011 | Single ownership | `security.mdc:27-43`, `security.mdc:94-112`        | Low      | Duplicates auth-check and DTO code blocks also shown in `error-handling.mdc` and `api-development.mdc`. Cross-refs exist but full examples repeat.                                                                                                                                                  | Replace inline blocks with one-line principles + file references (`src/app/admin/users/actions.ts`, `security.mdc`-adjacent shipped patterns).                                                                                 |

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
- **`pm-collaboration.mdc`** — Genuinely universal working-mode guidance; deserves always-on placement despite word count (see R001 for trim-only recommendation).
- **`supabase.mdc`** — Strong project-specific storage and client-usage sections. Migration safety correctly delegates to `do-migrations-agent.mdc`.
- **`error-handling.mdc`** — Canonical owner for error taxonomy, envelopes, and UI branching. Cross-refs to logging/notifications are correct; minor description creep only (R010).
- **`react-tanstack-query.mdc`** — Supabase query-key principle; cites `use-sign-out.ts` for hook conventions.

## Resolved

| ID   | Verification note |
| ---- | ----------------- |
| R004 | `useGetMessage` hook + test deleted; orphaned `axios` and `/api/message` MSW handler removed; `react-tanstack-query.mdc` cites Supabase query-key principle + `use-sign-out.ts`; `pnpm test:ci` passes |
| R005 | Conflicting "avoid id" bullet removed via consolidation; convention is `id bigint generated always as identity` |
| R006 | `forms.mdc` and `notifications.mdc` globs narrowed; all shipped consumers verified against new patterns |
| R007 | Precedence line added to `git-workflow.mdc` PR Description |
| R008 | Three template SQL rules replaced by project-delta-only `supabase-sql.mdc` |
| R012 | `supabase-sql.mdc` Auto Attached on `supabase/migrations/**/*.sql` |
| R013 | PERMISSIVE default documented; MFA restrictive noted as rare exception |

### Open questions — answered (2026-07-04)

| Question | Resolution |
| -------- | ---------- |
| Broad `src/**` globs | Narrowing forms + notifications to form-shaped paths, actions, and feedback call sites is acceptable; implemented in R006 fix |
| Legacy demo cleanup | Remove `useGetMessage` + test, orphaned `axios` dep, and `/api/message` MSW handler; update rule references (R004 fix) |
| PR format authority | Repo `git-workflow.mdc` Why/What/Testing/Risk format wins; explicit precedence line added (R007 fix) |
| SQL helper rules | Consolidated into `supabase-sql.mdc` with migration globs (R005/R008/R012/R013 fix) |
