# Rule Audit — seminova

Last full audit: 2026-07-21
Last synced: 2026-07-21
Scope: `.cursor/rules/*.mdc` against the rule-authoring standard

## Executive summary

- **No open findings** — R028–R039 remediated 2026-07-21 (logging wording, MSW deferral qualifier, RORO cross-refs deleted, docs layout allowlist, a11y/nextjs/ui-styling trim, supabase anti-pattern narrowed).
- **Always Apply set still under budget** (~776 body words; accepted code-minimalism exception unchanged).
- **No rule file crosses the 300-line inspect trigger** (largest: `supabase.mdc` ~194 lines).
- **26 files, no invalid frontmatter keys**; activation modes match rule shape.
- **Deferred (not rule defects):** broad `src/**` globs; `check:auth-boundary` vs `pre-push` (WORKFLOW_BACKLOG).

## Orient

26 rule files audited. Activation modes resolved from frontmatter (no invalid keys like `autoAttach` found).

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
| `nextjs.mdc`                 | Auto Attached — `src/app/**`, `src/components/**`                                     |
| `notifications.mdc`          | Auto Attached — form/feedback surfaces (forms, actions, toast, tables, indicators)      |
| `project-standards.mdc`      | Agent Requested                                                                         |
| `react-tanstack-query.mdc`   | Auto Attached — hooks, components, ReactQueryProvider                                   |
| `rule-authoring-pointer.mdc` | Auto Attached — `.cursor/rules/**`                                                      |
| `security.mdc`               | Auto Attached — `src/**`, proxy, API, migrations                                        |
| `seo.mdc`                    | Auto Attached — app routes, site config, SEO utils, proxy matcher                       |
| `supabase.mdc`               | Auto Attached — `src/**`, proxy, migrations                                            |
| `supabase-sql.mdc`           | Auto Attached — `supabase/migrations/**/*.sql`                                          |
| `testing.mdc`                | Auto Attached — test files, test utils                                                    |
| `typescript.mdc`             | Auto Attached — `src/**/*.ts`, `src/**/*.tsx`, `scripts/**/*.ts`                        |
| `ui-accessibility.mdc`       | Auto Attached — components + app TSX                                                    |
| `ui-shadcn.mdc`              | Auto Attached — UI primitives + components + app                                        |
| `ui-styling.mdc`             | Auto Attached — components + app TSX                                                    |

## Findings

_(None open after 2026-07-21 remediation sync.)_

## Rules that are fine

- **`code-minimalism.mdc`** — Core ethos rule; always-on placement earned; cross-refs guards without duplicating them.
- **`do-migrations-pointer.mdc`** — Minimal always-on pointer; earns its token cost.
- **`do-migrations-agent.mdc`** — Clear agent/human split, correct globs, no duplicate SQL conventions.
- **`general-conventions.mdc`** — Appropriate always-on date/env awareness.
- **`pm-collaboration.mdc`** — Genuinely universal working-mode guidance.
- **`rule-authoring-pointer.mdc`** — Correct glob trigger for rule edits; minimal.
- **`data-tables.mdc`** — Tight, project-specific table conventions; shipped reference paths verified. Criterion considered: Reference density — waived (Reference Implementations entries each map to a distinct paging/shell/sort concern).
- **`error-handling.mdc`** — Canonical error taxonomy and UI surfaces; tag-first logging aligned with `logging.mdc`; envelope examples inline; test pointers current. Criterion considered: Reference density — waived (three test paths each map to a distinct error-testing pattern).
- **`forms.mdc`** — Strong ownership of save model and autofill conventions; cross-refs notifications/error-handling; blur-save inline shape present.
- **`notifications.mdc`** — Clear toast vs inline vs panel routing; defers errors to error-handling; routing table is inline canonical shape.
- **`logging.mdc`** — Focused level taxonomy and exempt-surface table; broad `src/**` glob acceptable at current size. Criterion considered: Repo-truth duplication — waived (exempt-surface table states principle + pointer to `eslint.config.mjs`; rows grouped by *why*, not a bare path inventory).
- **`typescript.mdc`** — Project-delta only; globs scoped to app + scripts; RORO deliberately omitted (cross-refs removed 2026-07-21).
- **`supabase-sql.mdc`** — Project-delta-only SQL conventions; cites shipped migrations.
- **`ui-shadcn.mdc`** — CLI flags, primitive-first workflow; non-interactive add discipline.
- **`ui-accessibility.mdc`** — Enforced vs guidance split; Tooltips high-signal; contrast inventory deferred to checker; manual checklist limited to flows `check:*` don't cover.
- **`ui-styling.mdc`** — Semantic tokens, `globals.css`, `DESIGN.md`; images deferred to `nextjs.mdc`.
- **`git-workflow.mdc`** — Husky/pre-push mirror, PR Why/What/Testing/Risk format, and agent commit exceptions are project-specific; pre-push check list matches `package.json`.
- **`nextjs.mdc`** — Server Actions default, Suspense/waterfall guidance; API Routes collapsed to cross-refs; SEO defers to `seo.mdc`.
- **`react-tanstack-query.mdc`** — Server Action mutation pattern; query-key guidance consolidated. Criterion considered: Reference density — waived (Reference Examples section: four entries map to distinct concerns).
- **`security.mdc`** — Trust-boundary guidance via principles + shipped file refs; auth-boundary route list is security-contextual (not a pure AGENTS duplicate).
- **`supabase.mdc`** — Storage, client usage, migration safety; anti-pattern narrowed to ad-hoc presentational queries (allows shared client helpers); broad glob acceptable at current size.
- **`seo.mdc`** — Metadata wire-up, crawler surface, Satori constraints; hard-constraint pointer correct.
- **`testing.mdc`** — H/I/B pattern, MSW deferral policy, API-routes MSW bullet qualified to match deferral; coverage gates and render-only rule are high-signal. Criterion considered: Reference density — waived (Examples section splits unit vs integration scopes).
- **`api-development.mdc`** — Path naming, DTO, auth checklist; logging via `appLog` + shipped client-logs schema path; defers envelopes to `error-handling.mdc`.
- **`documentation.mdc`** — Layout matches disk (workflow markdown, `claude-skills/`, `skill-feedback/`); closed-`archive/` rule; DOC_RULES pointer.
- **`project-standards.mdc`** — Agent Requested with specific description; Ousterhout depth heuristic is project-specific; no dead RORO cross-ref.

## Criterion review

Mandatory on full pass — one row per rule-authoring ownership-table owner. Retained from 2026-07-21 full pass; remediation sync cleared open results.

| Owner rule                 | Canonical shape                                      | Reference density                         | Repo-truth                         | Result                                                          |
| -------------------------- | ---------------------------------------------------- | ----------------------------------------- | ---------------------------------- | --------------------------------------------------------------- |
| `security.mdc`             | defers envelopes to `error-handling.mdc`             | —                                         | auth route list security-contextual | waived: trust-boundary principles + canonical assert-admin-caller pointer |
| `api-development.mdc`      | defers envelopes to `error-handling.mdc`             | —                                         | —                                  | waived (R028/R029/R031 fixed)                                   |
| `supabase.mdc`             | storage contract + client-usage examples inline      | —                                         | schema pointer to AGENTS.md        | waived (R039 fixed)                                             |
| `testing.mdc`              | H/I/B inline                                         | Examples section 4 paths                  | —                                  | waived (R030 fixed); reference density waived                   |
| `error-handling.mdc`       | inline envelopes + UI branch rules                   | 3 test paths                              | —                                  | waived (R032 fixed); reference density waived                   |
| `forms.mdc`                | inline blur-save + server-action steps               | —                                         | —                                  | waived: save-model table + client/server patterns inline        |
| `notifications.mdc`        | inline routing table + toast API pointer             | —                                         | —                                  | waived: what-goes-where table is canonical shape                |
| `react-tanstack-query.mdc` | mutation envelope prose                              | Reference Examples 4 entries              | —                                  | waived: defers envelope detail to `error-handling.mdc`; examples distinct |
| `data-tables.mdc`          | inline paging/sort/search contracts                  | Reference Implementations 6 entries       | —                                  | waived: each entry maps to distinct table concern               |
| `logging.mdc`              | inline tag + level taxonomy                          | —                                         | exempt-surface table               | waived: principle + enforcement pointer; why-grouped rows       |
| `seo.mdc`                  | checklist inline                                     | —                                         | indexing table contextual          | waived: defers a11y to `ui-accessibility.mdc`, SSR to `nextjs.mdc` |

## Open questions

- **Broad `src/**` globs:** no narrowing yet — revisit when any of `logging.mdc`, `security.mdc`, or `supabase.mdc` crosses 300 lines or a fourth broad rule is added. *(Confirmed defer 2026-07-21.)*
- **MSW global setup:** deferred until first HTTP-boundary test; per-test `server.use()` for overrides only (policy in `testing.mdc`; R030 wording aligned). *(Confirmed keep deferred 2026-07-21.)*
- **`check:auth-boundary` vs `pre-push`:** `git-workflow.mdc` accurately mirrors `package.json` pre-push (no dedicated `check:auth-boundary` step); auth-boundary coverage runs incidentally under `test:ci`. Tracked in `docs/WORKFLOW_BACKLOG.md` — not a rule-file inaccuracy. *(Confirmed leave on WORKFLOW_BACKLOG 2026-07-21; not a ROADMAP item.)*
- **RORO disposition:** ~~restore vs delete~~ — **resolved 2026-07-21:** delete dead cross-refs; do not restore RORO in `typescript.mdc`.

## Resolved

- 2026-07-21 — R028: `api-development.mdc` checklist uses `appLog.error` tag-first (no console prefix)
- 2026-07-21 — R029: schema co-locate points at shipped `client-logs/_lib/` schema
- 2026-07-21 — R030: `testing.mdc` API Routes MSW bullet qualifies deferral + `vi.mock` until infra ships
- 2026-07-21 — R031: removed stale `source` parameter bullet from `api-development.mdc`
- 2026-07-21 — R032: `error-handling.mdc` uses kebab-case tag wording + checklist aligned to `logging.mdc`
- 2026-07-21 — R033: deleted RORO cross-refs from `project-standards.mdc` and `.cursor/rules/README.md`
- 2026-07-21 — R034: `documentation.mdc` layout allowlists workflow markdown, `claude-skills/`, `skill-feedback/`
- 2026-07-21 — R035: trimmed Tools/Resources and checklist noise from `ui-accessibility.mdc`
- 2026-07-21 — R036: trimmed generic fetching / collapsed API Routes in `nextjs.mdc`
- 2026-07-21 — R037: `ui-styling.mdc` images → `nextjs.mdc` one-liner
- 2026-07-21 — R038: contrast pair inventory deferred to checker in `ui-accessibility.mdc`
- 2026-07-21 — R039: `supabase.mdc` anti-pattern narrowed (ad-hoc presentational vs shared client helpers)
