---
name: plan-next-epic
description: >-
  Plan the next uncompleted epic using the repo planning brief and AGENTS.md.
  Use in Plan Mode when starting a new epic, when the user asks to plan the next
  epic, or before external planning sessions.
disable-model-invocation: true
---

# Plan Next Epic

Plan Mode only. Do not edit any files.

## Read first

1. **[AGENTS.md](../../../AGENTS.md)** — repo truth, locked rules, what's implemented
2. **Planning docs** — [ROADMAP.md](../../../ROADMAP.md) for phase status and the planning horizon; the active phase's PRD in [docs/prds/](../../../docs/prds/) for its epics and stories. Shipped phase detail: the shipped PRD in `docs/prds/`; `docs/archive/` for pre-restructure history

If these don't exist, ask the user where the product roadmap / phase scope lives before planning.

## Plan the next epic

Plan the **next uncompleted epic** in the active phase. The active phase's PRD holds its epics and stories — read it for scope and conventions.

Determine the next epic by reading the active phase's PRD: the first epic **without** a `` `Complete` `` tag is next. Do not verify against the codebase.

## Name the plan

Cursor derives the filename from the YAML `name` field. Lead with the **phase + epic prefix** (so files sort and archive correctly), then a **short description** for context:

`name: Phase {N} Epic {ID} {Short description}`  →  `phase_{n}_epic_{id}_{short_description}_<hash>.plan.md`

- `{N}` = current phase number from ROADMAP / the active PRD (decimals OK: `7.5`)
- `{ID}` = epic id as written — lettered (`1A`) or numeric (`2`)
- `{Short description}` = a few words naming the epic; keep it concise (≈2–4 words). Avoid punctuation like `—`/`:` in `name` (it muddies the slug) — use it freely in the H1
- The H1 should match: `# Phase {N} Epic {ID} — {Short description}`
  (e.g. `name: Phase 1 Epic 1A Foundation Cleanup` + `# Phase 1 Epic 1A — Foundation Cleanup`)

## Choose plan structure

Decide whether this epic is better as a **sequential plan** or **structured for Build in Parallel**. Default to sequential unless there are clearly independent tracks with disjoint file ownership.

Write the plan according to that choice — sequential steps in dependency order, or a parallel structure with gates/tracks/file ownership if Build in Parallel.

## Close the plan

End every generated plan with a final step instructing the implementing agent to run the **mark-epic-complete** skill once implementation is fully finished. This is how the epic gets tagged `` `Complete` `` in the active PRD — plan-next-epic itself never edits files.
