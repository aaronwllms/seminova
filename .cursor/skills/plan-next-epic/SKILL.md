---
name: plan-next-epic
description: >-
  Plan the next uncompleted epic using the repo planning brief and AGENTS.md.
  On the first epic of a phase, creates or checks out the phase branch from main.
  Use in Plan Mode when starting a new epic, when the user asks to plan the next
  epic, or before external planning sessions.
disable-model-invocation: true
---

# Plan Next Epic

Plan Mode only. Do not edit planning or repo files (git branch checkout/create for first-epic setup is allowed).

## Read first

1. **[AGENTS.md](../../../AGENTS.md)** — repo truth, locked rules, what's implemented
2. **Planning docs** — [ROADMAP.md](../../../ROADMAP.md) for phase status and the planning horizon; the active phase's PRD in [docs/prds/](../../../docs/prds/) for its epics and stories. Shipped phase detail: the shipped PRD in `docs/prds/`; `docs/archive/` for pre-restructure history

If these don't exist, ask the user where the product roadmap / phase scope lives before planning.

## Plan the next epic

Plan the **next uncompleted epic** in the active phase. The active phase's PRD holds its epics and stories — read it for scope and conventions.

Determine the next epic by reading the active phase's PRD: the first epic **without** a `` `Complete` `` tag is next. Do not verify against the codebase.

## Branch setup (first epic only)

Run **before** generating the plan when this is the **first epic** in the active phase.

**Detect first epic:** no `### Epic` heading in the active PRD carries a `` `Complete` `` tag yet. If any prior epic is complete, skip this section — the phase branch should already exist from Epic 1.

**Derive the expected branch** (same convention as [ship-phase reference](../ship-phase/reference.md)):

- Pattern: `phase-{N}/{short-kebab-slug}`
- `{N}` = phase number from the PRD / ROADMAP
- `{short-kebab-slug}` = slug segment from the PRD filename `phase-{N}-{slug}.prd.md` (e.g. `phase-8-tech-debt-remediation.prd.md` → `phase-8/tech-debt-remediation`)

Check the current branch:

```bash
git branch --show-current
```

| Current branch | Action |
| -------------- | ------ |
| Matches `phase-{N}/{slug}` | Proceed to plan |
| `main` | Create or checkout the phase branch (see below) |
| Anything else | **Halt.** Report the expected branch name; ask the user to switch, stash, or commit first |

**On `main` for the first epic:**

```bash
# If the branch already exists locally:
git checkout phase-{N}/{slug}

# If it does not exist locally:
git checkout -b phase-{N}/{slug}
```

Use `git show-ref --verify --quiet refs/heads/phase-{N}/{slug}` to choose checkout vs `-b`. Request `git_write`. Report which branch was created or checked out. **Do not push** — publishing the branch is separate (build work or `ship-phase`).

## Name the plan

Cursor derives the filename from the YAML `name` field. Lead with the **phase + epic prefix** (so files sort and archive correctly), then a **short description** for context:

`name: Phase {N} Epic {ID} {Short description}`  →  `phase_{n}_epic_{id}_{short_description}_<hash>.plan.md`

- `{N}` = current phase number from ROADMAP / the active PRD (decimals OK: `7.5`)
- `{ID}` = epic id as written — lettered (`1A`) or numeric (`2`)
- `{Short description}` = a few words naming the epic; keep it concise (≈2–4 words). Avoid punctuation like `—`/`:` in `name` (it muddies the slug) — use it freely in the H1
- The H1 should match: `# Phase {N} Epic {ID} — {Short description}`
  (e.g. `name: Phase 1 Epic 1A Foundation Cleanup` + `# Phase 1 Epic 1A — Foundation Cleanup`)

## Choose plan structure

Before writing the plan, assess whether this epic has clearly independent tracks with disjoint file ownership. If so, add a note at the top of the generated plan: "This epic is a good candidate for Build in Parallel." Otherwise say nothing — sequential is the default. Either way, write the plan sequentially.

## Close the plan

End every generated plan with a final step instructing the implementing agent to run the **mark-epic-complete** skill once implementation is fully finished. This is how the epic gets tagged `` `Complete` `` in the active PRD — plan-next-epic itself never edits files.
