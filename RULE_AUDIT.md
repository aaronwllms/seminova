# Rule Audit — seminova

Last full audit: 2026-07-22
Last synced: 2026-07-22
Scope: `.cursor/rules/*.mdc` against the rule-authoring standard

## Executive summary

- **R040 (Low):** `testing.mdc` Run Tests table labels `pnpm test` as the agent/automation default, but `AGENTS.md` assigns agents to `pnpm test:ci` (coverage gates) — agents may skip the quality bar if they follow the table row alone.
- **Rules unchanged since 2026-07-21 remediation** — no `.cursor/rules/` commits since the prior full pass; R028–R039 fixes verified still in place.
- **Always Apply set still under budget** (~776 body words; accepted `code-minimalism.mdc` exception unchanged).
- **No rule file crosses the 300-line inspect trigger** (largest: `supabase.mdc` 194 lines).
- **26 files, no invalid frontmatter keys**; activation modes match rule shape.
- **All cited production paths spot-checked** — no stale or missing references found.
- **Deferred (not rule defects):** broad `src/**` globs; `check:auth-boundary` vs `pre-push` step list (WORKFLOW_BACKLOG).

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

| ID   | Category      | File:Line | Severity | Description | Recommendation |
| ---- | ------------- | --------- | -------- | ----------- | -------------- |
| R040 | Contradiction | `testing.mdc`:56–58 | Low | Run Tests table row **Default (agents, automation, one-shot) → `pnpm test`** conflicts with `AGENTS.md` Setup table (`pnpm test:ci` — “agents, CI, pre-push”) and `git-workflow.mdc` Before Committing (“never bare `pnpm test` in agent terminals”). Same file later says “Before merge: run `pnpm test:ci`,” but the table row is what agents load first when editing tests. | Split the table: e.g. **Quick one-shot (no coverage)** → `pnpm test` / `pnpm test:file`; **Agent quality bar / CI / pre-push** → `pnpm test:ci`. Drop “agents” from the `pnpm test` row label. |

## Rules that are fine

- **`code-minimalism.mdc`** — Core ethos rule; always-on placement earned per rule-authoring accepted exception; cross-refs guards without duplicating them. (436 body words — justified always-on; set total ~776 ≤ budget.)
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
- **`typescript.mdc`** — Project-delta only; globs scoped to app + scripts.
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
- **`api-development.mdc`** — Path naming, DTO, auth checklist; logging via `appLog` + shipped client-logs schema path; defers envelopes to `error-handling.mdc`. Criterion considered: Fictional example — waived (`/api/posts`/`/api/users` are illustrative REST naming in Path Naming Standards; shipped `client-logs` is the canonical real route; `nextjs.mdc` defaults internal work to Server Actions).
- **`documentation.mdc`** — Layout matches disk (workflow markdown, `claude-skills/`, `skill-feedback/`); closed-`archive/` rule; DOC_RULES pointer.
- **`project-standards.mdc`** — Agent Requested with specific description; Ousterhout depth heuristic is project-specific.

## Criterion review

Mandatory on full pass — one row per rule-authoring ownership-table owner.

| Owner rule                 | Canonical shape                                      | Reference density                         | Repo-truth                         | Result                                                          |
| -------------------------- | ---------------------------------------------------- | ----------------------------------------- | ---------------------------------- | --------------------------------------------------------------- |
| `security.mdc`             | defers envelopes to `error-handling.mdc`             | —                                         | auth route list security-contextual | waived: trust-boundary principles + canonical assert-admin-caller pointer |
| `api-development.mdc`      | defers envelopes to `error-handling.mdc`             | —                                         | —                                  | waived: fictional REST names illustrative; client-logs canonical |
| `supabase.mdc`             | storage contract + client-usage examples inline      | —                                         | schema pointer to AGENTS.md        | waived: one avatar storage reference, not a catalog             |
| `testing.mdc`              | H/I/B inline                                         | Examples section 4 paths                  | —                                  | **R040** (agent default row vs AGENTS.md); reference density waived |
| `error-handling.mdc`       | inline envelopes + UI branch rules                   | 3 test paths                              | —                                  | waived; reference density waived (distinct patterns)            |
| `forms.mdc`                | inline blur-save + server-action steps               | —                                         | —                                  | waived: save-model table + client/server patterns inline        |
| `notifications.mdc`        | inline routing table + toast API pointer             | —                                         | —                                  | waived: what-goes-where table is canonical shape                |
| `react-tanstack-query.mdc` | mutation envelope prose                              | Reference Examples 4 entries              | —                                  | waived: defers envelope detail to `error-handling.mdc`; examples distinct |
| `data-tables.mdc`          | inline paging/sort/search contracts                  | Reference Implementations 6 entries       | —                                  | waived: each entry maps to distinct table concern               |
| `logging.mdc`              | inline tag + level taxonomy                          | —                                         | exempt-surface table               | waived: principle + enforcement pointer; why-grouped rows       |
| `seo.mdc`                  | checklist inline                                     | —                                         | indexing table contextual          | waived: defers a11y to `ui-accessibility.mdc`, SSR to `nextjs.mdc` |

## Open questions

- **Broad `src/**` globs:** no narrowing yet — revisit when any of `logging.mdc`, `security.mdc`, or `supabase.mdc` crosses 300 lines or a fourth broad rule is added.
- **MSW global setup:** deferred until first HTTP-boundary test; per-test `server.use()` for overrides only (policy in `testing.mdc`; `vitest.setup.ts` comment aligned).
- **`check:auth-boundary` vs `pre-push`:** `git-workflow.mdc` accurately mirrors `package.json` pre-push (no dedicated `check:auth-boundary` step); auth-boundary coverage runs under `test:ci` via `src/supabase/proxy.unit.test.ts`. Tracked in `docs/WORKFLOW_BACKLOG.md` — not a rule-file inaccuracy.
- **RORO disposition:** resolved 2026-07-21 — delete dead cross-refs; do not restore RORO in `typescript.mdc`.

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
