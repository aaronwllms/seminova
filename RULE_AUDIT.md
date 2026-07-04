# Rule Audit — seminova

Last full audit: 2026-07-04
Last synced: 2026-07-04
Scope: `.cursor/rules/*.mdc` against the rule-authoring standard

## Executive summary

- **Always Apply set exceeds the ~800-word budget** (812 words combined). `code-minimalism.mdc` alone is 451 words — paid on every request and well above the per-file ~200-word justification threshold for always-on placement.
- **`testing.mdc` (340 lines) is the largest rule file** and reads like a testing tutorial: multiple good/bad comparison blocks and duplicated minimalism guidance. Likely to dilute compliance with the project's own minimalism ethos.
- **`typescript.mdc` globs are repo-wide** (`**/*.ts`, `**/*.tsx`) — Auto Attached on migrations, scripts, config, and test files where TypeScript conventions add little signal.
- **`react-tanstack-query.mdc` cites a dead demo** (`useGetMessage` → `/api/message`) as the primary query-hook reference; the route no longer exists, so new hooks may copy a removed pattern instead of Supabase-backed conventions.
- **Six rules share overlapping `src/**` globs\*\* (forms, notifications, logging, security, supabase, plus UI rules). Intentional per inline comments, but a typical profile or component edit can load 10+ rules at once — high context cost.
- **`postgres-sql-style-guide.mdc` contradicts itself** on whether `id` is an acceptable column name (Tables § requires an `id` column; Columns § says avoid generic names like `id`).
- **`git-workflow.mdc` PR body format** (`Why` / `What` / `Testing` / `Risk`) conflicts with the Cursor user rule for PR creation (`Summary` / `Test plan`) — agents following both get incompatible instructions.
- **Supabase SQL helper rules** (`create-rls-policies.mdc`, `create-db-functions.mdc`) are mostly upstream template content with many inline SQL examples — low project-specific signal relative to line count.
- **Generic tutorial rules** (`ui-accessibility.mdc`, `ui-styling.mdc`, parts of `ui-shadcn.mdc`) teach patterns the agent already knows; project-specific guidance (semantic tokens, shadcn CLI flags, reference files) is buried in noise.

## Orient

27 rule files audited. Activation modes resolved from frontmatter (no invalid keys like `autoAttach` found).

| File                           | Mode                                                                                    |
| ------------------------------ | --------------------------------------------------------------------------------------- |
| `code-minimalism.mdc`          | Always Apply                                                                            |
| `do-migrations-pointer.mdc`    | Always Apply                                                                            |
| `general-conventions.mdc`      | Always Apply                                                                            |
| `pm-collaboration.mdc`         | Always Apply                                                                            |
| `api-development.mdc`          | Auto Attached — `src/app/api/**`                                                        |
| `create-db-functions.mdc`      | Agent Requested                                                                         |
| `create-rls-policies.mdc`      | Agent Requested                                                                         |
| `data-tables.mdc`              | Auto Attached — `*table*.tsx` paths                                                     |
| `do-migrations-agent.mdc`      | Auto Attached — migrations + plan files                                                 |
| `documentation.mdc`            | Auto Attached — `docs/**`                                                               |
| `error-handling.mdc`           | Auto Attached — API routes, actions, error boundaries                                   |
| `forms.mdc`                    | Auto Attached — `src/**` (broad, documented)                                            |
| `git-workflow.mdc`             | Auto Attached — `.husky/**`, `.github/workflows/**`; Agent Requested for commit/PR work |
| `logging.mdc`                  | Auto Attached — `src/**`, `scripts/**`                                                  |
| `nextjs.mdc`                   | Auto Attached — `src/app/**`, `src/components/**`                                       |
| `notifications.mdc`            | Auto Attached — `src/**` (broad, documented)                                            |
| `postgres-sql-style-guide.mdc` | Agent Requested                                                                         |
| `project-standards.mdc`        | Agent Requested                                                                         |
| `react-tanstack-query.mdc`     | Auto Attached — hooks, components, ReactQueryProvider                                   |
| `rule-authoring-pointer.mdc`   | Auto Attached — `.cursor/rules/**`                                                      |
| `security.mdc`                 | Auto Attached — `src/**`, proxy, API, migrations                                        |
| `supabase.mdc`                 | Auto Attached — `src/**`, proxy, migrations                                             |
| `testing.mdc`                  | Auto Attached — test files, mocks, test utils                                           |
| `typescript.mdc`               | Auto Attached — `**/*.ts`, `**/*.tsx` (repo-wide)                                       |
| `ui-accessibility.mdc`         | Auto Attached — components + app TSX                                                    |
| `ui-shadcn.mdc`                | Auto Attached — UI primitives + components + app                                        |
| `ui-styling.mdc`               | Auto Attached — components + app TSX                                                    |

## Findings

| ID   | Category                   | File:Line                                                                                           | Severity | Description                                                                                                                                                                                                                                                                                                           | Recommendation                                                                                                                                                                                                                 |
| ---- | -------------------------- | --------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R001 | Size budget (Always Apply) | `code-minimalism.mdc:1-54`, `pm-collaboration.mdc:1-34`, set total                                  | High     | Combined Always Apply word count is **812** (budget ~800). `code-minimalism.mdc` is **451 words** and `pm-collaboration.mdc` is **204 words** — both exceed the ~200-word per-file threshold for always-on rules. This cost is paid every request.                                                                    | Trim `code-minimalism.mdc` to principles + cross-refs only, or demote to Agent Requested with a specific description. Keep `pm-collaboration.mdc` always-on but trim to decision/communication bullets if over budget matters. |
| R002 | Signal-to-noise            | `testing.mdc:181-256`                                                                               | High     | 340 lines (inspect trigger at 300). ~75 lines are good/bad comparison blocks with full code samples for over-testing — three near-duplicate didactic examples. Duplicates minimalism guidance already in the file header and in `code-minimalism.mdc`.                                                                | Collapse examples to one principle paragraph; point at shipped tests (`extract-auth-form-error.unit.test.ts`, `login-form.integration.test.tsx`) instead of inline ContactForm samples. Target ≤250 lines.                     |
| R003 | Mode fit                   | `typescript.mdc:3-5`                                                                                | Medium   | Globs `**/*.ts` and `**/*.tsx` match the entire repo — migrations, scripts, Husky hooks, Vitest config, and `.cursor/` paths — not just application TypeScript. Auto Attached where relevance is thin adds noise on non-app edits.                                                                                    | Narrow to `src/**/*.ts`, `src/**/*.tsx`, and optionally `scripts/**/*.ts`. Keep Agent Requested fallback via description if repo-wide TS work is needed.                                                                       |
| R004 | Currency (stale reference) | `react-tanstack-query.mdc:22-38`                                                                    | Medium   | Primary query-hook example is `useGetMessage` calling `/api/message` via axios. **`src/app/api/message` does not exist.** Hook file remains as legacy demo. Agents may copy a dead REST/axios pattern instead of Supabase client + descriptive query keys (described two lines later but secondary to the example).   | Replace example block with a file reference to a shipped pattern (or add a real Supabase query hook and cite it). Remove axios demo once reference is updated.                                                                 |
| R005 | Contradiction              | `postgres-sql-style-guide.mdc:27-28`, `postgres-sql-style-guide.mdc:34-35`                          | Medium   | Tables section: "Always add an `id` column." Columns section: "Use singular names and **avoid generic names like 'id'**." Same file gives conflicting guidance for the most common PK column name.                                                                                                                    | Pick one convention (this project uses `id bigint generated always as identity` in shipped migrations) and delete the conflicting bullet.                                                                                      |
| R006 | Context stacking           | `forms.mdc:4-6`, `notifications.mdc:4-6`, `logging.mdc:4-6`, `security.mdc:4-9`, `supabase.mdc:4-8` | Medium   | Five rules intentionally share broad `src/**` globs (comments acknowledge this). A single edit under `src/app/(app)/profile/` can simultaneously load forms, notifications, logging, security, supabase, plus nextjs, typescript, and three UI rules — 10+ files. High token cost even when only one concern applies. | Consider narrowing load-bearing rules to paths where the concern is actionable (`**/actions.ts`, `**/*form*`, profile route) or merge forms + notifications feedback routing into one owner file with a single glob.           |
| R007 | Contradiction              | `git-workflow.mdc:146-173` vs Cursor user rule `creating-pull-requests`                             | Medium   | Repo rule requires PR bodies with **Why / What / Testing / Risk**. Cursor user rule requires **Summary / Test plan** and a different `gh pr create` body template. Agents load both; PR output format is ambiguous.                                                                                                   | Align `git-workflow.mdc` with the user rule, or add an explicit precedence note ("user rule wins for PR format") in `git-workflow.mdc`.                                                                                        |
| R008 | Signal-to-noise            | `create-rls-policies.mdc:46-113`, `create-db-functions.mdc:46-136`                                  | Low      | Both are Agent Requested Supabase templates with many full SQL examples (correct/incorrect pairs, MFA, performance). Little is project-specific beyond Supabase defaults; `security.mdc` and `supabase.mdc` already own RLS workflow cross-refs.                                                                      | Trim to project deltas (owner-scoped `auth.uid()` pattern from shipped migrations, link to `create-rls-policies` skill workflow). Replace inline SQL blocks with links to Supabase docs or one canonical migration file.       |
| R009 | Signal-to-noise            | `ui-shadcn.mdc:59-213`, `ui-accessibility.mdc:36-153`, `ui-styling.mdc:23-127`                      | Low      | Large generic tutorial sections (cva customization, responsive breakpoints, ARIA keyboard patterns, `cn()` usage) that duplicate ecosystem docs. High-signal project content (CLI `-y -o` flags, semantic tokens, reference paths) is a minority of each file.                                                        | Keep project-specific sections; cut or replace generic blocks with pointers to `src/components/ui/`, `globals.css`, and `DESIGN.md`.                                                                                           |
| R010 | Single ownership           | `error-handling.mdc:2`, `error-handling.mdc:70-72`                                                  | Low      | Description says "logging, and monitoring" but logging levels/tags are owned by `logging.mdc` (cross-ref exists). "Monitoring" is not covered. Minor scope creep in the title/description may cause agents to treat this file as the logging owner.                                                                   | Shorten description to error taxonomy, envelopes, and UI surfaces only. Remove "monitoring" unless content is added.                                                                                                           |
| R011 | Single ownership           | `security.mdc:27-43`, `security.mdc:94-112`                                                         | Low      | Duplicates auth-check and DTO code blocks also shown in `error-handling.mdc` and `api-development.mdc`. Cross-refs exist but full examples repeat.                                                                                                                                                                    | Replace inline blocks with one-line principles + file references (`src/app/admin/users/actions.ts`, `security.mdc`-adjacent shipped patterns).                                                                                 |
| R012 | Mode fit                   | `create-rls-policies.mdc:1-4`, `create-db-functions.mdc:1-5`, `postgres-sql-style-guide.mdc:1-5`    | Low      | Agent Requested with adequate descriptions, but no globs on `supabase/migrations/**/*.sql` where they are most relevant. Agents editing migrations get `do-migrations-agent.mdc` and `supabase.mdc` but not SQL style/RLS helpers unless they infer relevance.                                                        | Add `supabase/migrations/**/*.sql` globs (Auto Attached) or tighten descriptions to mention migration file edits explicitly.                                                                                                   |
| R013 | Internal inconsistency     | `create-rls-policies.mdc:27`, `create-rls-policies.mdc:143-150`                                     | Low      | Body discourages `RESTRICTIVE` policies, then MFA section shows `as restrictive` as the example pattern without noting it as a rare exception.                                                                                                                                                                        | Add one line: "MFA example is an exception; default remains PERMISSIVE." or swap example to a permissive pattern.                                                                                                              |

## Rules that are fine

- **`data-tables.mdc`** — Tight, project-specific (search column flag, Next/Previous pagination, skeleton via `DataTableShell`). Cites shipped `users-table.tsx`. Good signal density.
- **`do-migrations-agent.mdc`** — Clear agent/human split, correct globs, points to create-migration skill. No duplication with AGENTS.md beyond intentional cross-ref.
- **`do-migrations-pointer.mdc`** — Minimal always-on pointer; earns its token cost.
- **`forms.mdc`** — Strong ownership of save model and autofill conventions. Broad glob is documented and load-bearing. Good cross-refs to notifications and error-handling.
- **`notifications.mdc`** — Clear toast vs inline vs panel routing. Complements `error-handling.mdc` without redefining error taxonomy.
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

## Open questions

- **Broad `src/**`globs:** Are forms + notifications + logging intentionally load-bearing on every src edit, or is narrowing to`actions.ts` / form components acceptable without missing feedback-routing guidance?
- **Legacy demo cleanup:** Should `useGetMessage` and its test be removed from the codebase as part of fixing R004, or kept with a renamed "legacy" rule callout?
- **PR format authority:** Should repo `git-workflow.mdc` adopt the Cursor user-rule PR template, or should the user rule defer to the repo for this project?
- **SQL helper rules:** Keep three separate Supabase SQL Agent Requested rules, or consolidate style + RLS + functions into one migration-scoped rule with globs?

## Resolved

<!-- First full audit — no prior resolved entries. -->
