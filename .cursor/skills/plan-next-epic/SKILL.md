---
name: plan-next-epic
description: >-
  Plans the next uncompleted epic from the active phase's PRD. On a phase's
  first epic, run kickoff-phase first.
disable-model-invocation: true
---

# Plan Next Epic

Plan Mode only.

## Read first

1. **Planning docs** — [ROADMAP.md](../../../ROADMAP.md) for phase status and the planning horizon; the active phase's PRD in [docs/prds/](../../../docs/prds/) for its epics and stories.

If these don't exist, ask the user where the product roadmap / phase scope lives before planning.

## Kickoff gate (first epic only)

If no PRD is `` `Active` ``, **halt**: tell the user to run `/kickoff-phase` in a normal (non-Plan-Mode) agent window, then re-run this skill.

**Detect first epic:** no `### Epic` heading in the active PRD carries a `` `Complete` `` tag yet. If any prior epic is complete, skip this section.

**Verify kickoff completed:** derive the expected branch per [ship-phase reference](../ship-phase/reference.md) § Branch naming, then confirm `git branch --show-current` matches `phase-{N}/{slug}`. If it doesn't, **halt**: tell the user to run `/kickoff-phase` first. Never perform branch or status setup yourself, and never defer it into the generated plan.

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

## Decompose stories into plan steps

Stories define **what ships**, not build order. The epic's success criteria define **how it's verified** — never story-by-story gates. The epic lands as a single commit, so the plan must not construct interim states with no consumer outside the executing agent — temporary wiring built for a later story to replace, or test expectations that hold only between stories.

Where stories touch the same file or component, build the end state directly and verify it once. Verification checkpoints (running tests after a risky change before layering more on top) are not interim states.

## Frame the plan

Open every generated plan with a tracking line at the very top of the body, before the branch precondition below:

> **Track progress:** as you complete each step, update the corresponding `todos` entry's `status` to `completed` in this plan's frontmatter.

On a **first epic**, open the generated plan with a branch precondition — a verification check only, never checkout or branch-resolution logic:

> **Precondition:** confirm `git branch --show-current` outputs `phase-{N}/{slug}` (substitute the actual branch name). If it doesn't match, halt and ask the user — do not switch branches.

Every generated plan must also include this precondition near the top of the body (after the tracking line and any branch precondition):

> **Precondition:** `git status --porcelain` must be empty before the first implementation edit. If dirty, halt and ask the user to commit or stash. The epic must land as a single commit containing only this epic's work — `code-review` derives its range from that commit.

## Generated plan todos (frontmatter)

After the story-level todos, always append these two entries. The list ends there — epic close-out is prompted in the Handoff section rather than tracked as a todo.

| Todo id | Purpose |
|---------|---------|
| `quality-gate` | Run `pnpm pre-push` |
| `commit-epic` | Conventional commit for this epic's changes |

## Generated plan closing sections (body)

Always append these three sections at the end of every generated plan, in order:

### Verification

Quality bar. Stop on failure:

```bash
pnpm pre-push
```

### Commit epic

Authorized by this approved plan:

1. Review diff; stage only files in scope for this epic.
2. Write a conventional commit message (`feat`/`fix`/`docs`/etc.). It **must** end with an `Epic:` git trailer — this is the only thing `code-review` uses to find the commit:

   ```
   feat(phase-10): app home and profile modal

   Epic: 10.1
   ```

   Format is `Epic: {phase}.{id}` — phase number as written in ROADMAP (decimals OK: `7.5`), epic id as written (`1`, `1A`). Blank line before the trailer, nothing after it. Exactly one commit in the repo may carry a given `Epic:` value.
3. Commit (request `git_write`). Pre-commit hook runs automatically — if it fails, **fix and retry the commit** (a failed pre-commit hook aborts the commit, so there is nothing to amend).
4. Verify `git status --porcelain` is empty after commit.

**Do not push** — push remains `ship-phase`.

### Handoff

Report the epic is committed, then ask the user: *"Mark this epic complete?"*

On confirmation, read `.cursor/skills/mark-epic-complete/SKILL.md` and follow it in full, preconditions included — it is user-invoked, so reading the file is this run's only route to it. Without confirmation, end the run; the user can type `/mark-epic-complete` later.
