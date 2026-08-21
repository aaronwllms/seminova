# AGENTS.md Audit — Seminova

Last full audit: 2026-08-21
Last synced: 2026-08-21
Scope: AGENTS.md at repo root, against the instruction-budget standard

## Executive summary

- Budget: **6,418 characters / ~1.6k tokens**, loaded on every request (**under the 10,000-character mechanical trigger**)
- Staleness: **0 broken references of 45 checked** (13 markdown file/dir targets, 12 named commands / `check:*` scripts, 11 concrete paths, 9 cited routes)
- **No Open findings.** AG001–AG025 are verified resolved in `AGENTS.md`, `docs/DOC_RULES.md`, and `.cursor/skills/sync-repo-docs/SKILL.md`. AG022 no longer blocks anything.
- The file is the charter: preamble, agent workflow gates, hard constraints, merge checklist, and change protocol. Inventories (skills tables, command table, § Implemented now, data model, directory map, logging pointer) are gone.
- Hard constraints are now ~53% of the file — expected after deletion; the section is protected.
- Two enforcement-wiring gaps remain as Open questions only (not AGENTS.md staleness): `check:auth-boundary` is not a named `pre-push` step; `check:admin-gate` is not a named CI step. Both still run today via `test:ci` / named `pre-push`. Do not treat them as broken references.

## Orient

| Section                    | Share | Verdict          |
| -------------------------- | ----- | ---------------- |
| Preamble (H1 + intro)      | 16%   | keep             |
| § Agent workflow           | 11%   | keep             |
| § Hard constraints         | 53%   | keep (protected) |
| § Checklist before merging | 7%    | keep             |
| § Change protocol          | 13%   | keep             |

Owners available:

- `docs/adr/` — ADR-0001 through ADR-0010 (+ README)
- `.cursor/rules/*.mdc` — 26 rules; always-apply: `code-minimalism`, `do-migrations-pointer`, `general-conventions`, `pm-collaboration`
- `LEXICON.md` — architectural vocabulary
- `DESIGN.md` — token architecture and re-skin workflow
- `README.md` — human onboarding, prerequisites, scripts table
- `.cursor/skills/*/` — 23 skills (including `sync-repo-docs`, `audit-agents-md`, `initialize-project`, `audit-seo`, planning-loop skills)

## Open

Actionable backlog only. `Status`: `Do next` | `Deferred` | `Needs decision`.

Nothing material — no Open findings this pass.

Categories: `Budget`, `Stale`, `Drift risk`, `Derivable`, `Contradiction`, `No-op`.

## Accepted

Content the tests say should go, deliberately kept. Not a todo list.

Nothing material — no PM acceptance recorded.

## Quick wins

Nothing material — no Open findings.

## Content that earns every-request load

- **Preamble** — passes Test 1: one-sentence project description plus the charter and anti-catalog instruction are live on every request; without them the file re-accretes inventories. Waiver: the “Where to look” paths are owner destinations (anti-catalog), not a structure inventory — DOC_RULES already holds the full roles table; this paragraph only names where to orient instead of cataloging.
- **§ Hard constraints** — passes Test 1: any code change can cross pnpm-only, semantic tokens, auth boundary, admin gate, SEO URL, a11y checks, or logging wrappers. Protected; read as source of truth by `audit-rules` and `pre-release-review`. Waiver: 3+ file paths are the subject of the constraints themselves.
- **§ Agent workflow** — passes Test 1: every agent run must respect the migration human-only gate, `pnpm pre-push` quality bar, and doc-sync trigger after env / scripts / token / rule-file changes. Paths named here are the workflow’s actual targets.
- **§ Checklist before merging** — passes Test 1: merge-boundary checks (quality bar, auth-boundary alignment, public-route list update, RLS, README, human `db:push`) apply to every shipping task.
- **§ Change protocol** — passes Test 1: every hard-constraint or shipped-surface edit routes through an explicit owner; sync skills are mirror-only for constraints. Implemented features / routes / data model point at the code and migrations, not back into this file.
- **Hard-constraint ecosystem-alignment principle** (in § Hard constraints) — passes Test 1: judgment applied across UI, framework, and Supabase choices on most implementation tasks; not mechanically enforced elsewhere at always-load scope.

## Section ledger

Mandatory on full pass — one row per top-level section.

| Section                    | Test 1 (relevance)                        | Test 2 (irreducibility)                                | Verdict | Result     |
| -------------------------- | ----------------------------------------- | ------------------------------------------------------ | ------- | ---------- |
| Preamble                   | passes — charter + anti-catalog every run | owner pointers not derivable as a keep-out instruction | keep    | earns load |
| § Agent workflow           | passes — every run                        | migration human-only why not in package.json           | keep    | earns load |
| § Hard constraints         | passes (protected)                        | enforcement list is the irreducible contract           | keep    | earns load |
| § Checklist before merging | passes — every merge                      | checklist items are governance gates                   | keep    | earns load |
| § Change protocol          | passes — governance edits                 | table is the irreducible routing contract              | keep    | earns load |

Why-hunt: no long inventory section remains. Paragraph granularity inside § Hard constraints: each bullet is a named constraint plus its `check:*` enforcement — none are grep-derivable catalogs. Finding none unique-to-relocate is the result.

## Open questions

- `check:auth-boundary` is not a named step in `pnpm pre-push` — it runs only because `test:ci` includes `proxy.unit.test.ts`. Tracked in `docs/WORKFLOW_BACKLOG.md`. Not a staleness finding today (0 broken refs); the claim that every constraint fails pre-push remains true via `test:ci`.
- `check:admin-gate` is a named `pre-push` step (scanner + unit test) but is **not** a named step in `.github/workflows/pull-request.yaml` — CI relies on `test:ci` for the unit test and never runs `scripts/checks/no-profiles-role.mjs`. Same class of fragility as auth-boundary; not a broken AGENTS.md reference today.

## Resolved

- 2026-08-21 — AG001: file is 6,418 characters, under the 10,000-character trigger; inventory sections deleted.
- 2026-08-21 — AG002: purpose line states the charter (hard constraints, workflow gates, merge checklist, change protocol) and rejects a feature/schema catalog.
- 2026-08-21 — AG003: skills inventory tables deleted from AGENTS.md.
- 2026-08-21 — AG004: command table deleted from AGENTS.md.
- 2026-08-21 — AG005: prerequisites paragraph deleted from AGENTS.md.
- 2026-08-21 — AG006: Foundation & tooling subsection deleted with § Implemented now.
- 2026-08-21 — AG007: Auth & session inventory deleted with § Implemented now.
- 2026-08-21 — AG008: Admin console inventory deleted with § Implemented now.
- 2026-08-21 — AG009: App home & profile inventory deleted with § Implemented now.
- 2026-08-21 — AG010: Landing page inventory deleted with § Implemented now.
- 2026-08-21 — AG011: Banners inventory deleted with § Implemented now.
- 2026-08-21 — AG012: SEO & metadata inventory deleted with § Implemented now.
- 2026-08-21 — AG013: Design system inventory deleted with § Implemented now.
- 2026-08-21 — AG014: Error handling inventory deleted with § Implemented now.
- 2026-08-21 — AG015: Security inventory deleted with § Implemented now.
- 2026-08-21 — AG016: Data & storage inventory deleted with § Implemented now.
- 2026-08-21 — AG017: Testing & data fetching inventory deleted with § Implemented now.
- 2026-08-21 — AG018: § Data model deleted from AGENTS.md.
- 2026-08-21 — AG019: § Where things live deleted from AGENTS.md.
- 2026-08-21 — AG020: § Logging convention deleted from AGENTS.md.
- 2026-08-21 — AG021: `docs/mockups/archive/` exists on disk (carried forward; citation lived in the deleted directory map).
- 2026-08-21 — AG022: `docs/DOC_RULES.md` document-roles row owns hard constraints, agent workflow gates, merge checklist, and change protocol — not implemented features / routes / data model.
- 2026-08-21 — AG023: AGENTS.md § Change protocol routes implemented features, routes, and data model to the code and `supabase/migrations/`, not back into AGENTS.md.
- 2026-08-21 — AG024: `sync-repo-docs` does not edit AGENTS.md; classify-gaps sends hard constraints / features / routes / data model to Neither.
- 2026-08-21 — AG025: § Agent workflow quality bar is `pnpm pre-push`.
