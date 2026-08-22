---
name: mark-epic-complete
description: >-
  Epic close-out — marks one epic Complete in the active phase's PRD, then
  commits the PRD update.
disable-model-invocation: true
---

# Mark Epic Complete

Epic close-out. Marks one epic `` `Complete` `` in the active phase's PRD (`docs/prds/`) and commits the PRD update. README, DESIGN.md, and rules-index drift waits for `ship-phase` (which chains `sync-repo-docs`).

Does not verify shipped state against the codebase. Does not touch `docs/archive/`.

Epic numbering and `` `Complete` `` tag rules: [DOC_RULES.md](../../../docs/DOC_RULES.md) rule 9.

## When to run

Manually invoked in a **fresh agent window** once `code-review`'s close-out gate is met — see [grading.md](../code-review/grading.md).

Takes **no arguments**. The epic to mark is the **first `### Epic` heading in the active phase's PRD without a `` `Complete` `` tag** — the same lookup `plan-next-epic` and `code-review` use. Never infer it from code inspection.

The user may override by naming one explicitly, e.g. `/mark-epic-complete for Epic 3`.

## Preconditions (halt if any fail)

1. **Clean tree** — `git status --porcelain --untracked-files=no` is empty. If dirty, halt and ask the user to commit outstanding work first. (Untracked files, e.g. the active plan file, are not a halt.)
2. **Epic resolves** — at least one `### Epic N: Name` heading in the active phase's PRD lacks a `` `Complete` `` tag; take the first. If every epic is already tagged, halt — the phase is done, and `/ship-phase` is the next step. On the override path, the named heading must exist.
3. **Status consistent** — neither the PRD's status nor its ROADMAP row reads `` `Draft` ``, `` `Planning` ``, or `` `Ready` ``. If either does, halt and report the inconsistency — do not change tags. Phase promotion (Ready→Active) is owned by `kickoff-phase` (see [DOC_RULES.md](../../../docs/DOC_RULES.md) rule 2).

Check all three before editing anything, so a halt never leaves a dirty tree behind.

## Steps

Copy and track:

```
Epic close-out progress:
- [ ] Step 1: Tag the epic Complete in the PRD
- [ ] Step 2: Update Last updated
- [ ] Step 3: Commit
- [ ] Step 4: Report
```

### Step 1 — Tag the epic

Append `` `Complete` `` to the epic heading: `### Epic N: Name` → ``### Epic N: Name `Complete` ``.

### Step 2 — Last updated

If the PRD carries a **Last updated** line, set it to today's date (ISO `YYYY-MM-DD`).

### Step 3 — Commit

Stage the PRD only, and commit as a `docs:` commit (request `git_write`). Stage nothing else.

```
docs: complete epic {N} — {epic name}
```

### Step 4 — Report

Report which epic was marked complete.

## Explicitly out of scope

- Do not mark a phase `Shipped` — phase-ship is a separate step at phase end (see [DOC_RULES.md](../../../docs/DOC_RULES.md) rule 6).
- Do not edit `docs/archive/`.
- Do not chain `sync-repo-docs` — README / DESIGN / rules-index sync waits for `ship-phase`.
- Do not infer "complete" from code inspection — resolve the epic from the PRD's `` `Complete` `` tags, never from the state of the codebase.
- Do not promote a phase (flip `Ready` → `Active`) — that is owned by `kickoff-phase`; halt and report if status is inconsistent (precondition 3).
