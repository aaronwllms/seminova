---
name: plan-next-epic
description: >-
  Plans the next uncompleted epic from the repo brief and AGENTS.md; creates the
  phase branch on the first epic of a phase.
disable-model-invocation: true
---

# Plan Next Epic

Plan Mode only. Do not edit planning or repo files (exceptions for first-epic setup: git branch checkout/create, and the `Active` status flip below).

## Read first

1. **[AGENTS.md](../../../AGENTS.md)** — repo truth, hard constraints, what's implemented
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

Check whether the branch already exists:

```bash
git show-ref --verify --quiet refs/heads/phase-{N}/{slug}
```

- **Doesn't exist:** `git checkout -b phase-{N}/{slug}` — safe, always fresh.
- **Exists:** before checking out, compare it against `main`:

  ```bash
  git log main..phase-{N}/{slug} --oneline
  ```

  - **No commits ahead:** the branch is fresh (created but never built on). Safe to check out: `git checkout phase-{N}/{slug}`.
  - **Commits ahead:** unexpected for a first epic — this branch likely holds abandoned or superseded work. **Halt.** Report the branch name and commit count, and ask the user whether to (a) delete and recreate it fresh, (b) check out and continue from that work, or (c) something else. Do not check out automatically.

**After checkout or creation, always verify:**

```bash
git branch --show-current
```

Confirm the output matches `phase-{N}/{slug}` exactly before proceeding. If it doesn't, halt and report — do not proceed onto `main` or any other branch by assumption.

**Flip status to Active (first epic only).** After branch verification, update the active PRD's `**Status:**` line and its ROADMAP row (Status table + any "Active phase" line) from `` `Ready` `` to `` `Active` ``. Confirm both files read `` `Active` `` before proceeding to plan generation.

Request `git_write` for any checkout/create/delete above. Report which branch was created, checked out, or recreated. **Do not push** — publishing the branch is separate (build work or `ship-phase`).

**Branch setup must complete before plan generation.** If you cannot execute the checkout/create yourself (e.g. `git_write` is unavailable or denied), **halt** and ask the user to switch branches before continuing. Never silently defer branch setup into the generated plan — the plan may be executed later by an agent that resolves branch state incorrectly.

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

On a **first epic**, open the generated plan with a branch precondition — a verification check only, never checkout or branch-resolution logic:

> **Precondition:** confirm `git branch --show-current` outputs `phase-{N}/{slug}` (substitute the actual branch name). If it doesn't match, halt and ask the user — do not switch branches.

End every generated plan with a final step instructing the implementing agent to run the **mark-epic-complete** skill once implementation is fully finished. This is how the epic gets tagged `` `Complete` `` in the active PRD — plan-next-epic itself never edits files.
