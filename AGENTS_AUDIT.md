# AGENTS.md Audit — Seminova

Last full audit: 2026-08-06
Last synced: 2026-08-06
Scope: AGENTS.md at repo root, against the instruction-budget standard

## Executive summary

- Budget: **263 lines / ~7k tokens**, loaded on every request (**63 lines over the 200-line mechanical trigger**)
- Staleness: **1 broken reference of 110 checked** (~0.9%)
- **AG022** blocks the largest deletions: `DOC_RULES.md`, Change protocol, and `sync-repo-docs` still route shipped truth into AGENTS.md — decide slim-AGENTS vs current sync model before bulk delete
- **AG007–AG017**: `§ Implemented now` (~20% of file lines, ~150+ path citations) is a feature inventory most tasks never touch — highest budget waste
- **AG018–AG019**: Migration list + entity table + directory map are grep-derivable and drift on every schema or route change
- **AG003–AG005**: Skills table, scripts table, and prerequisites duplicate `.cursor/skills/`, `package.json`, and README
- **AG021**: `docs/mockups/archive/` is cited in Where things live but the directory does not exist yet
- **AG001**: Total file size alone fails the budget standard — severity scales with the 63-line excess
- Hard constraints, agent workflow gates, change protocol, and merge checklist **earn** every-request load — protect those through any slimming pass

## Orient

| Section                          | Share | Verdict                |
| -------------------------------- | ----- | ---------------------- |
| Preamble (purpose, last updated) | 3%    | relocate + delete      |
| § Agent workflow                 | 6%    | keep                   |
| § Agent skills                   | 14%   | delete                 |
| § Setup and quality commands     | 12%   | delete                 |
| § Hard constraints               | 8%    | keep (protected)       |
| § Implemented now                | 20%   | delete                 |
| § Data model (summary)           | 7%    | delete                 |
| § Where things live              | 15%   | delete                 |
| § Logging convention             | 2%    | delete                 |
| § Checklist before merging       | 3%    | keep                   |
| § Change protocol                | 4%    | keep (see AG022–AG024) |

Owners available:

- `docs/adr/` — ADR-0001 through ADR-0009 (+ README)
- `.cursor/rules/*.mdc` — 26 rules; always-apply: `code-minimalism`, `do-migrations-pointer`, `general-conventions`, `pm-collaboration`
- `LEXICON.md` — architectural vocabulary
- `DESIGN.md` — token architecture and re-skin workflow
- `README.md` — human onboarding, prerequisites, scripts table
- `.cursor/skills/*/` — 23 skills (including `sync-repo-docs`, `audit-agents-md`, `initialize-project`, `audit-seo`, planning-loop skills not listed in AGENTS.md inventory)

## Open

Actionable backlog only. `Status`: `Do next` | `Deferred` | `Needs decision`.

| ID    | Status         | Category        | File:Line                                    | Severity | Description                                                                                                                                                                                                                   | Recommendation                                                                                                                                                                                                  | Destination                              |
| ----- | -------------- | --------------- | -------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| AG001 | Do next        | `Budget`        | 1:263:AGENTS.md                              | High     | File is 263 lines — 63 lines over the 200-line mechanical trigger. Most excess is inventory prose, not hard constraints or governance.                                                                                        | Delete inventory sections per AG003–AG021; target ≤120 lines retaining workflow, hard constraints, checklist, and change protocol.                                                                              | delete                                   |
| AG002 | Do next        | `Budget`        | 3:3:AGENTS.md                                | Medium   | Purpose line advertises AGENTS.md as a catalog of implemented features, routes, data model, and where to look — that framing justifies the bloat and contradicts the instruction-budget standard.                             | Replace with one sentence: agent repo truth for hard constraints, workflow gates, and change protocol; point to README, rules, and LEXICON for everything else.                                                 | delete                                   |
| AG003 | Do next        | `Derivable`     | 30:65:AGENTS.md                              | Medium   | Full skills inventory (three tables, 12 named skills) fails Test 1; list is incomplete vs the 23 skills on disk (`audit-agents-md`, `initialize-project`, `audit-seo`, planning-loop skills missing).                         | Delete tables. One line: situational skills live in `.cursor/skills/`; planning-loop skills in `docs/WORKFLOW_GUIDE.md`.                                                                                        | delete                                   |
| AG004 | Do next        | `Derivable`     | 68:96:AGENTS.md                              | Medium   | 25-row command table is reproducible from `package.json` scripts; README § Scripts already owns human-facing script docs.                                                                                                     | Delete table. Quality-bar one-liner already lives in § Agent workflow step 3.                                                                                                                                   | delete                                   |
| AG005 | Do next        | `Derivable`     | 98:98:AGENTS.md                              | Low      | Prerequisites paragraph (Node, pnpm, env vars, `next-env.d.ts` note) duplicates README § Prerequisites and Quick start.                                                                                                       | Delete. README remains canonical for human setup.                                                                                                                                                               | delete                                   |
| AG006 | Do next        | `Derivable`     | 129:131:AGENTS.md                            | Medium   | Foundation & tooling subsection is version inventory and doc-pointer prose — not live on every task.                                                                                                                          | Delete entire subsection.                                                                                                                                                                                       | delete                                   |
| AG007 | Do next        | `Budget`        | 133:135:AGENTS.md                            | High     | Auth & session paragraph (~2k tokens of path-dense prose): session gate mechanics, read vs mutation split, stray-code branch, 503 dev behavior. Whys already in ADR-0003, ADR-0005, ADR-0007 and LEXICON auth-boundary entry. | Delete. No relocate — destinations already hold the whys. Hard-constraint auth-boundary bullet (lines 112–112) stays.                                                                                           | delete                                   |
| AG008 | Do next        | `Derivable`     | 137:139:AGENTS.md                            | Medium   | Admin console subsection is shipped-feature inventory (users table UX, logs live feed, settings rows, nav chrome).                                                                                                            | Delete entire subsection.                                                                                                                                                                                       | delete                                   |
| AG009 | Do next        | `Derivable`     | 141:143:AGENTS.md                            | Medium   | App home & profile subsection duplicates profile-modal ADR-0004 and scattered rules (`forms.mdc`, avatar utils).                                                                                                              | Delete entire subsection.                                                                                                                                                                                       | delete                                   |
| AG010 | Do next        | `Derivable`     | 145:147:AGENTS.md                            | Medium   | Landing page subsection is marketing surface inventory with 40+ file paths — re-skin pointers already in README § Starting your own product.                                                                                  | Delete entire subsection.                                                                                                                                                                                       | delete                                   |
| AG011 | Do next        | `Derivable`     | 149:151:AGENTS.md                            | Medium   | Banners subsection describes registry keys, dismissal cookies, and component wiring — all discoverable from code and `app-settings-registry.ts`.                                                                              | Delete entire subsection.                                                                                                                                                                                       | delete                                   |
| AG012 | Do next        | `Derivable`     | 153:155:AGENTS.md                            | Medium   | SEO & metadata subsection duplicates `seo.mdc` ownership table and README re-skin pointers.                                                                                                                                   | Delete entire subsection.                                                                                                                                                                                       | delete                                   |
| AG013 | Do next        | `Derivable`     | 157:159:AGENTS.md                            | Medium   | Design system subsection duplicates DESIGN.md and `ui-styling.mdc`; primitive list is grep-derivable from `src/components/ui/`.                                                                                               | Delete entire subsection.                                                                                                                                                                                       | delete                                   |
| AG014 | Do next        | `Derivable`     | 161:163:AGENTS.md                            | Medium   | Error handling subsection duplicates `error-handling.mdc` and `notifications.mdc` (toast routing, AppErrorSurface branching).                                                                                                 | Delete entire subsection.                                                                                                                                                                                       | delete                                   |
| AG015 | Do next        | `Derivable`     | 165:167:AGENTS.md                            | Low      | Security subsection CSP report-only note already in `security.mdc` with the same `// debt:` pointer.                                                                                                                          | Delete entire subsection.                                                                                                                                                                                       | delete                                   |
| AG016 | Do next        | `Derivable`     | 169:171:AGENTS.md                            | Medium   | Data & storage subsection is migration count + logging pipeline inventory — derivable from migrations dir and `logging.mdc`.                                                                                                  | Delete entire subsection.                                                                                                                                                                                       | delete                                   |
| AG017 | Do next        | `Derivable`     | 173:175:AGENTS.md                            | Low      | Testing & data fetching subsection duplicates `testing.mdc` and `react-tanstack-query.mdc`.                                                                                                                                   | Delete entire subsection.                                                                                                                                                                                       | delete                                   |
| AG018 | Do next        | `Derivable`     | 179:195:AGENTS.md                            | High     | Data model section: 13-filename migration inventory + six-row entity table with column-level detail. Reproducible via `ls supabase/migrations/`, generated types, and migration SQL.                                          | Delete entire section. Schema-change agents read migrations and `database.types.ts` directly.                                                                                                                   | delete                                   |
| AG019 | Do next        | `Derivable`     | 197:235:AGENTS.md                            | High     | Where things live directory map (25 rows) is a path catalog — `src/app/` route groups and top-level docs are discoverable without memorization.                                                                               | Delete entire section.                                                                                                                                                                                          | delete                                   |
| AG020 | Do next        | `No-op`         | 238:241:AGENTS.md                            | Low      | Logging convention is a four-line pointer to `logging.mdc` — hard constraints already cite `logging.mdc` for wrapper exemptions.                                                                                              | Delete section.                                                                                                                                                                                                 | delete                                   |
| AG021 | Do next        | `Stale`         | 231:231:AGENTS.md                            | Medium   | Where things live cites `docs/mockups/archive/` but that directory does not exist (`docs/mockups/` has 11 HTML files, no `archive/` child).                                                                                   | Delete row when § Where things live is removed (AG019). If section is kept interim, remove the archive row or create the directory per DOC_RULES.                                                               | delete                                   |
| AG022 | Needs decision | `Contradiction` | 19:19:docs/DOC_RULES.md                      | High     | DOC_RULES document-roles table assigns AGENTS.md ownership of "implemented features, routes, data model" — the instruction-budget standard and `rule-authoring` both reject repo-truth catalogs at root.                      | PM chooses: (A) slim AGENTS.md per this audit and update DOC_RULES row to hard constraints + workflow + change protocol only, or (B) keep current scope and accept the budget cost (move findings to Accepted). | `docs/DOC_RULES.md`                      |
| AG023 | Needs decision | `Contradiction` | 259:259:AGENTS.md                            | High     | Change protocol routes "Implemented features, routes, data model" updates to AGENTS.md via `/sync-repo-docs` — directly opposes AG001–AG019 deletions.                                                                        | If choosing slim AGENTS (AG022 option A): change this row to README + LEXICON + rules/ADRs as appropriate; retire `sync-repo-docs` AGENTS inventory updates.                                                    | `AGENTS.md` § Change protocol            |
| AG024 | Needs decision | `Contradiction` | 12:12:.cursor/skills/sync-repo-docs/SKILL.md | Medium   | `sync-repo-docs` skill description and workflow still treat AGENTS.md as the agent repo-truth dump for routes, schema, and behavior surfaces.                                                                                 | If choosing slim AGENTS: narrow skill scope to hard-constraint mirrors, workflow/checklist alignment, and README/DESIGN/rules README — not feature inventories.                                                 | `.cursor/skills/sync-repo-docs/SKILL.md` |

Categories: `Budget`, `Stale`, `Drift risk`, `Derivable`, `Contradiction`, `No-op`.

## Accepted

Content the tests say should go, deliberately kept. Not a todo list.

Nothing material — no PM acceptance recorded yet.

## Quick wins

- [ ] AG020: Delete § Logging convention (four lines, pure duplicate pointer)
- [ ] AG005: Delete prerequisites paragraph (README already owns)
- [ ] AG003: Delete skills inventory tables (incomplete catalog, situational)
- [ ] AG004: Delete scripts table (package.json + README own it)
- [ ] AG002: Rewrite purpose line to stop advertising feature inventory

## Content that earns every-request load

- **§ Hard constraints** — passes Test 1: any code change can cross pnpm-only, semantic tokens, auth boundary, admin gate, SEO URL, a11y checks, or logging wrappers. Protected; read as source of truth by `audit-rules` and `plan-review`.
- **§ Agent workflow** — passes Test 1: every agent run must respect migration human-only gate, quality-bar commands, and doc-sync trigger after behavior/schema changes.
- **§ Checklist before merging** — passes Test 1: merge-boundary checks (quality bar, auth boundary alignment, RLS, doc sync, human `db:push`) apply to every shipping task.
- **§ Change protocol** — passes Test 1: every hard-constraint or doc-role edit routes through explicit protocol; sync skills are mirror-only for constraints.
- **Hard-constraint ecosystem-alignment principle** (lines 119–119) — passes Test 1: judgment applied across UI, framework, and Supabase choices on most implementation tasks; not mechanically enforced elsewhere at always-load scope.

## Section ledger

| Section                      | Test 1 (relevance)                              | Test 2 (irreducibility)                         | Verdict           | Result       |
| ---------------------------- | ----------------------------------------------- | ----------------------------------------------- | ----------------- | ------------ |
| Preamble                     | fails — describes file contents, not task gates | purpose framing is derivable from DOC_RULES     | relocate + delete | AG002        |
| § Agent workflow             | passes — every run                              | migration human-only why not in package.json    | keep              | earns load   |
| § Agent skills               | fails — situational                             | inventory grep-derivable from `.cursor/skills/` | delete            | AG003        |
| § Setup and quality commands | fails — mostly reference                        | README + package.json own commands and prereqs  | delete            | AG004, AG005 |
| § Hard constraints           | passes (protected)                              | enforcement list is the irreducible contract    | keep              | earns load   |
| § Implemented now            | fails — most tasks touch none                   | whys in ADRs/rules; rest derivable              | delete            | AG006–AG017  |
| § Data model (summary)       | fails — schema work only                        | migration list + table detail grep-derivable    | delete            | AG018        |
| § Where things live          | fails — navigation aid                          | directory tree grep-derivable                   | delete            | AG019, AG021 |
| § Logging convention         | fails — logging tasks only                      | duplicate of hard constraints + logging.mdc     | delete            | AG020        |
| § Checklist before merging   | passes — every merge                            | checklist items are governance gates            | keep              | earns load   |
| § Change protocol            | passes — governance edits                       | table is the irreducible routing contract       | keep              | AG022–AG024  |

## Open questions

- Should `sync-repo-docs` continue updating AGENTS.md after slimming, or become README/LEXICON/rules-only? (Blocked on AG022 PM decision.)
- Is a minimal "public route allowlist" pointer outside § Hard constraints worth keeping for agents who never open `src/constants/app-paths.ts`? Audit verdict: no — hard-constraint bullet plus `check:auth-boundary` suffice; LEXICON carries narrative if needed.

## Resolved

Nothing material — first full audit.
