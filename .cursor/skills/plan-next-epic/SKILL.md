---
name: plan-next-epic
description: >-
  Plans the next uncompleted epic from the active phase's PRD; on a phase's
  first epic, creates the phase branch and flips the phase Active.
disable-model-invocation: true
---

# Plan Next Epic

Plan Mode only. Do not edit planning or repo files (exceptions for first-epic setup: git branch checkout/create, and the `Active` status flip + stub removal below).

## Read first

1. **[AGENTS.md](../../../AGENTS.md)** — repo truth, hard constraints, what's implemented
2. **Planning docs** — [ROADMAP.md](../../../ROADMAP.md) for phase status and the planning horizon; the active phase's PRD in [docs/prds/](../../../docs/prds/) for its epics and stories. Shipped phase detail: the shipped PRD in `docs/prds/`; `docs/archive/` for pre-restructure history

If these don't exist, ask the user where the product roadmap / phase scope lives before planning.

## Branch setup (first epic only)

Run **before** generating the plan when this is the **first epic** in the active phase.

**Detect first epic:** no `### Epic` heading in the active PRD carries a `` `Complete` `` tag yet. If any prior epic is complete, skip this section — the phase branch should already exist from Epic 1.

**Derive the expected branch** per [ship-phase reference](../ship-phase/reference.md) § Branch naming.

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

- **Doesn't exist:** `git checkout -b phase-{N}/{slug}`
- **Exists:** before checking out, compare it against `main`:

  ```bash
  git log main..phase-{N}/{slug} --oneline
  ```

  - **No commits ahead:** the branch is fresh (created but never built on). Safe to check out: `git checkout phase-{N}/{slug}`.
  - **Commits ahead:** **Halt.** Report the branch name and commit count, and ask the user whether to (a) delete and recreate it fresh, (b) check out and continue from that work, or (c) something else. Do not check out automatically.

**After checkout or creation, always verify:**

```bash
git branch --show-current
```

Confirm the output matches `phase-{N}/{slug}` exactly before proceeding. If it doesn't, halt and report — do not proceed onto `main` or any other branch by assumption.

**Flip status to Active (first epic only)** ([DOC_RULES.md](../../../docs/DOC_RULES.md) rule 2). After branch verification, update the active PRD's `**Status:**` line and its ROADMAP row (Status table + any "Active phase" line) from `` `Ready` `` to `` `Active` ``. Confirm both files read `` `Active` `` before proceeding to plan generation.

**Remove the phase stub (first epic only).** In the same ROADMAP pass, delete this phase's stub from the **Upcoming phases** section — the entire `### Phase {N} — …` block, through the line before the next `###` heading (or the section's end). Remove only this phase's block; leave every other phase's stub intact.

**Commit the status flip (first epic only).** Immediately after the Active flip and stub removal, commit those planning-doc edits as a `docs:` commit (request `git_write`). Stage only the PRD and ROADMAP edits from this step. The skill never leaves its own edits uncommitted.

Request `git_write` for any checkout/create/delete/commit above. Report which branch was created, checked out, or recreated. **Do not push** — publishing the branch is separate (build work or `ship-phase`).

**Branch setup must complete before plan generation.** If you cannot execute the checkout/create yourself (e.g. `git_write` is unavailable or denied), **halt** and ask the user to switch branches before continuing. Never defer branch setup into the generated plan.

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

Before writing the plan, assess whether this epic has clearly independent tracks with disjoint file ownership. If so, add a note at the top of the generated plan: "This epic is a good candidate for Build in Parallel." Otherwise say nothing — sequential is the default. Either way, write the plan sequentially.

## Frame the plan

Open every generated plan with a tracking line at the very top of the body, before the branch precondition below:

> **Track progress:** as you complete each step, update the corresponding `todos` entry's `status` to `completed` in this plan's frontmatter.

On a **first epic**, open the generated plan with a branch precondition — a verification check only, never checkout or branch-resolution logic:

> **Precondition:** confirm `git branch --show-current` outputs `phase-{N}/{slug}` (substitute the actual branch name). If it doesn't match, halt and ask the user — do not switch branches.

Every generated plan must also include these preconditions near the top of the body (after the tracking line and any branch precondition):

> **Precondition:** `git status --porcelain` must be empty before recording the epic baseline. If dirty, halt and ask the user to commit or stash.
>
> **Epic baseline:** Run `git rev-parse HEAD` immediately before the first implementation edit. Record the SHA in the plan body (e.g. `**Epic baseline:** abc1234`) — this is the fixed point for `code-review`.

## Generated plan todos (frontmatter)

After the story-level todos, always append these two entries. Do **not** include `code-review` or `mark-epic-complete` todos — those are manual follow-ups in fresh agent windows.

| Todo id | Purpose |
|---------|---------|
| `quality-gate` | Run `pnpm type-check && pnpm lint && pnpm format-check && pnpm test:ci` |
| `commit-epic` | Conventional commit for this epic's changes |

## Generated plan closing sections (body)

Always append these three sections at the end of every generated plan, in order:

### Verification

Quality bar — same commands as [WORKFLOW_GUIDE Step 5 exit condition](../../../docs/WORKFLOW_GUIDE.md). Stop on failure:

```bash
pnpm type-check && pnpm lint && pnpm format-check && pnpm test:ci
```

### Commit epic

Authorized by this approved plan:

1. Review diff; stage only files in scope for this epic.
2. Write a conventional commit message (`feat`/`fix`/`docs`/etc.) referencing phase + epic id.
3. Commit (request `git_write`). Pre-commit hook runs automatically — if it fails, **fix and retry the commit** (a failed pre-commit hook aborts the commit, so there is nothing to amend).
4. Verify `git status --porcelain` is empty after commit.

**Do not push** — push remains `ship-phase`.

### Handoff

End the run by telling the user, including the epic baseline SHA and epic identifier from the plan (substitute actual values), e.g.:

*"Epic committed. Next: open a new agent window and run `/code-review` — epic baseline `<sha>`, Epic `<id>`."*
