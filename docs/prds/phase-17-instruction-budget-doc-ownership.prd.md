# PRD — Phase 17: Instruction Budget & Doc Ownership

**Status:** `Active`
**Last updated:** 2026-08-21

---

## Problem

`AGENTS.md` loads on every agent request, whether or not it is relevant. It currently runs ~13k tokens — a feature inventory, a route catalog, a data-model summary, a directory map, a command table, and a skills list, none of which most tasks touch and all of which every task pays for.

The growth was automated, not accidental. `sync-repo-docs` routes shipped truth into `AGENTS.md`, and `mark-epic-complete` chains it on every epic. Across sixteen phases the file only ever grew: nothing in the workflow removes from it. The `audit-agents-md` skill has flagged this since its first run, but its largest recommendations were blocked on a contradiction it could not resolve itself — `docs/DOC_RULES.md` assigns `AGENTS.md` ownership of exactly the content the instruction-budget standard rejects, and the skill correctly lets the convention win.

A separate correctness bug surfaced in the same audit: the quality bar in § Agent workflow omits the hard-constraint `check:*` scripts that `pnpm pre-push` and CI run. An agent that follows the documented bar can finish green and still fail the hook.

This PRD was fully grilled in a planning chat before decomposition into epics/stories. `AGENTS_AUDIT.md` (full pass, 2026-08-21) is the enumerated finding set; ADR-0010 records the charter decision.

## Goal

Cut `AGENTS.md` to what earns every-request load, and close the generators that refill it.

The charter, settled in planning and recorded in ADR-0010: `AGENTS.md` holds the one-line project description, the package manager and quality-bar commands, § Hard constraints, § Agent workflow, § Checklist before merging, and § Change protocol — plus a handful of prose breadcrumbs pointing at the directories that own everything else. Nothing more.

Deleted content is **not** relocated into a new architecture doc. A *what* is derivable from the code and goes. A *why* routes to the owner that already holds whys — an ADR, a scoped rule, or `LEXICON.md` — with rule files accepting only claims that change what an agent *does* in that domain. The audit's why-hunt across § Implemented now found zero unique whys, so the expected harvest is empty; the discipline exists for anything that surfaces during the pass.

Order matters: generators are rewired before a line is deleted. Slimming first would be undone by the next epic close-out.

## Out of scope

- **A `docs/ARCHITECTURE.md` or equivalent.** Considered and rejected in planning — a fourth intake valve with no glob, no immutability, and no skill owning its accuracy. Rationale in ADR-0010.
- **Mechanical enforcement of the file's size.** A byte ceiling failing `pre-push` was considered and declined as too blunt to distinguish accretion from a legitimate hard-constraint addition. The guards are ADR-0010, the `docs/DOC_RULES.md` roles table, and a pointer at the top of `AGENTS.md`.
- **Retiring `sync-repo-docs`.** README, `DESIGN.md`, and the rules index remain real sync targets with real drift. Only `AGENTS.md` leaves its scope.
- **Fixing the two enforcement gaps themselves.** `check:auth-boundary` is not a named `pre-push` step and `check:admin-gate` is not a named CI step; both are recorded as `// debt:` markers here, not repaired. Repair is CI work with no relationship to instruction budget.
- **Slimming the always-apply `.cursor/rules/`.** Four rules load on every request and also spend budget. Real, but a separate pass with its own standard (`rule-authoring`).
- **The admin-shell feature copy revisit** carried over from Phase 10 loose ends. Still waiting on shipped state to settle.

---

## Epics & stories

### Epic 1: Charter rewiring

- **1.1 The documented quality bar matches what the hook enforces.** § Agent workflow's finish-work command becomes `pnpm pre-push` rather than the four-command chain, so an agent following it cannot pass the documented bar and then fail on a hard-constraint check. The human-only migration gate stays a separate step. *(AG025)*

- **1.2 `AGENTS.md` stops owning repo truth, in the documents that say it does.** The `docs/DOC_RULES.md` document-roles row and write-discipline rule 3 reassign the file to hard constraints, workflow gates, and change protocol. `AGENTS.md` § Change protocol stops routing implemented-feature, route, and data-model updates back into itself, pointing those at the owners that actually hold them. *(AG022, AG023)*

- **1.3 No skill writes to `AGENTS.md` any more.** `sync-repo-docs` drops the file from its targets — the classify-gaps routing table, the `AGENTS.md` section map in its reference, and every `AGENTS.md` row in the per-change-type audit checklist. `mark-epic-complete` stops chaining `sync-repo-docs` and becomes tag-the-epic plus commit; `ship-phase` remains the sync point, with its framing prose, commit message, and PR body no longer claiming an `AGENTS.md` sync that will not happen. *(AG024)*

*Success:*
- No skill in `.cursor/skills/` names `AGENTS.md` as a write target.
- `docs/DOC_RULES.md` and `AGENTS.md` § Change protocol state the same charter; neither routes repo truth to `AGENTS.md`.
- The finish-work command in § Agent workflow is the same command the pre-push hook runs.
- `pnpm pre-push` is green.

### Epic 2: Audit tooling and enforcement markers

- **2.1 The budget audit measures the right unit.** `audit-agents-md` records budget in characters rather than lines, and its mechanical trigger threshold moves with it. The file's prose sections run one line per paragraph, so a line count under-reads the real spend by roughly half — the metric that was supposed to catch the bloat was itself reporting it as smaller than it was.

- **2.2 Declared debt is harvestable wherever it lives.** `audit-tech-debt`'s declared-debt harvest widens beyond `src/` to the whole repo, excluding dependencies. Enforcement scripts, check scripts, and root config currently cannot carry a discoverable marker at all, so debt at those sites is invisible to the audit that exists to find it.

- **2.3 The two enforcement gaps are declared where they live.** A `// debt:` marker at each site records that `check:auth-boundary` runs only as a side effect of the test suite rather than as a named `pre-push` step, and that `check:admin-gate`'s scanner is never invoked by CI. Each names its upgrade path. The auth-boundary entry leaves `docs/WORKFLOW_BACKLOG.md` in the same pass — one record of a gap, not two.

*Success:*
- `audit-agents-md` reports budget as a character count.
- Both new markers appear in an `audit-tech-debt` declared-debt harvest.
- No duplicate record of the auth-boundary gap survives in `docs/WORKFLOW_BACKLOG.md`.

### Epic 3: Deletion pass and why-harvest

- **3.1 `AGENTS.md` is cut to the charter.** The audit's enumerated deletions (AG002 through AG020) are applied: the skills tables, the command table and prerequisites, every § Implemented now subsection, § Data model, § Where things live, and § Logging convention. The purpose line stops advertising the file as a feature catalog. AG022 is resolved — the charter is settled input, not a gate — so the deletions proceed without re-opening the decision.

- **3.2 Deleted sections are harvested for whys before they go.** Each section is checked for a claim that is both non-derivable from code and not already held by an ADR, a rule, or `LEXICON.md`. Survivors route to the owner that fits; a rule file accepts a claim only when it changes what an agent does in that domain, not when it merely explains why code looks as it does. The audit's why-hunt found none, so an empty harvest is the expected and acceptable result — anything found is reported rather than dropped.

- **3.3 The slimmed file points somewhere and defends itself.** Directory-level prose breadcrumbs replace the deleted directory map — where coding standards, decision history, and vocabulary live, at directory granularity rather than file paths that rot. A note at the top of the file points at ADR-0010 before anyone adds to it, placed where the temptation occurs rather than in a governance doc nobody opens mid-edit.

- **3.4 `archive-cursor-plans` selective matcher.** When § Implemented now is deleted in 3.1, replace the plan-matching heuristic that currently reads `AGENTS.md` "Implemented now" — until then the heuristic still works; Epic 1 leaves it unchanged.

*Success:*
- No route list, migration inventory, data-model table, directory map, skills table, or shipped-feature prose remains in `AGENTS.md`.
- § Hard constraints is unchanged, character for character.
- Every harvested why has a named home, or the harvest is reported as empty.
- Every breadcrumb resolves to a directory that exists.
- `pnpm pre-push` is green.

### Epic 4: Downstream surfaces and re-baseline

- **4.1 The public workflow page stops describing a workflow the repo no longer runs.** The `/workflow` documents table's `AGENTS.md` row corrects its writer and its purpose, and the Cursor environment card drops repo-truth sync from what Cursor owns. The co-located content test moves with it. The page's whole claim is that the documented workflow is the real one; a stale row there is the exact failure it exists to disprove.

- **4.2 No remaining doc describes `AGENTS.md` as owning repo truth.** The stale role claims are swept from `ROADMAP.md`'s intro line, `README.md`'s documentation table, the rules index, and `docs/WORKFLOW_GUIDE.md`.

- **4.3 The audit is re-baselined against the slimmed file.** A full `audit-agents-md` pass replaces `AGENTS_AUDIT.md` — a sync pass would verify findings against content that no longer exists. This is also the first run where the skill's standard and the document-roles table agree, so its findings are the first that reflect a coherent convention.

*Success:*
- No doc or shipped surface describes `AGENTS.md` as owning implemented features, routes, or the data model.
- `AGENTS_AUDIT.md` carries a current full-pass date, a character-based budget number, and no finding blocked on AG022.
- `pnpm pre-push` is green.

---

## Notes

- **Epic order is load-bearing between 1 and 3.** Deleting before the generators are rewired invites the next epic close-out to restore what was cut. Epic 2 must precede Epic 4, or the closing full pass re-baselines in the wrong unit. Epic 2 before Epic 3 is not strictly required but lets Epic 3 report an honest before/after.
- **The delete list is enumerated, not derived.** `AGENTS_AUDIT.md` cites line ranges current as of 2026-08-21. If `AGENTS.md` is edited between now and Epic 3 beyond what Epic 1 does, the citations need re-checking before the pass.
- **Deletions are recoverable.** Everything cut stays in git history. The one irreversible act is dropping a why with no owner, which is what the harvest in 3.2 guards against.
- **ADR and lexicon work is already done.** ADR-0010 and the `LEXICON.md` "Instruction budget" entry were written during planning, not deferred to an epic.
- **This is template work.** Every spinoff inherits `AGENTS.md`, the skills, and the document-roles table. A spinoff currently inherits Seminova's feature inventory as its own repo truth, which is wrong on their first commit — the deletion fixes that as a second-order effect.
