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
2. **Planning brief** — discover path from AGENTS.md documentation map; if not listed, find root `CONTEXT.md` (exclude `node_modules`). Shipped phase detail: `CONTEXT_ARCHIVE.md` when present

If no planning brief exists, ask the user where product roadmap / phase scope lives before planning.

## Plan the next epic

Plan the **next uncompleted epic** in the current in-progress phase. Use the planning brief's conventions for scope (e.g. ACTIVE vs ARCHIVE sections, locked rules section) — adapt to whatever structure that file uses.

## Name the plan

Cursor derives the filename from the YAML `name` field. Lead with the **phase + epic prefix** (so files sort and archive correctly), then a **short description** for context:

`name: Phase {N} Epic {ID} {Short description}`  →  `phase_{n}_epic_{id}_{short_description}_<hash>.plan.md`

- `{N}` = current phase number from the brief's ACTIVE section (decimals OK: `7.5`)
- `{ID}` = epic id as written — lettered (`1A`) or numeric (`2`)
- `{Short description}` = a few words naming the epic; keep it concise (≈2–4 words). Avoid punctuation like `—`/`:` in `name` (it muddies the slug) — use it freely in the H1
- The H1 should match: `# Phase {N} Epic {ID} — {Short description}`
  (e.g. `name: Phase 1 Epic 1A Foundation Cleanup` + `# Phase 1 Epic 1A — Foundation Cleanup`)

## Choose plan structure

Decide whether this epic is better as a **sequential plan** or **structured for Build in Parallel**. Default to sequential unless there are clearly independent tracks with disjoint file ownership.

Write the plan according to that choice — sequential steps in dependency order, or a parallel structure with gates/tracks/file ownership if Build in Parallel.

Verify prerequisites against the codebase before planning.
