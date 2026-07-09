---
name: mark-epic-complete
description: >-
  Marks one epic as Complete in the active phase's PRD after its plan is fully
  implemented.
disable-model-invocation: true
---

# Mark Epic Complete

Single-purpose. Touches only the active phase's PRD in `docs/prds/`. Does not verify shipped state against the codebase, does not touch AGENTS.md, does not touch `docs/archive/`, does not run sync-repo-docs.

Epic numbering and `` `Complete` `` tag rules: [DOC_RULES.md](../../../docs/DOC_RULES.md) rule 9.

## When to run

Manually invoked in a **fresh agent window** after the epic is committed and `code-review` has passed (including any committed fixes).

The **epic identifier** comes from the user's invocation message (carried by the `code-review` breadcrumb), e.g. `/mark-epic-complete for Epic 3`. If missing, ask the user which epic to mark — **do not infer it from code inspection**.

## Preconditions

`git status --porcelain` must be empty before editing. If dirty, halt and ask the user to commit outstanding work first.

## Steps

1. Open the active phase's PRD in `docs/prds/`. Find the epic heading matching the invocation (`### Epic N: Name`).
2. Append `` `Complete` `` to that heading: `### Epic N: Name` → `### Epic N: Name \`Complete\``.
3. **Consistency check:** if the PRD's status OR its ROADMAP row still reads `` `Draft` ``, `` `Planning` ``, or `` `Ready` ``, halt and report the inconsistency — do not change tags. Phase promotion (Ready→Active) is owned by `plan-next-epic` (see [DOC_RULES.md](../../../docs/DOC_RULES.md) rule 2).
4. If the PRD carries a **Last updated** line, set it to the current date.
5. Commit the PRD edit as a `docs:` commit (request `git_write`). Commit **only** this edit.
6. Report: which epic was marked complete; if step 3 halted, report the Draft-tag inconsistency instead of completing.

## Explicitly out of scope

- Do not mark a phase `Shipped` — phase-ship is a separate step at phase end (see [DOC_RULES.md](../../../docs/DOC_RULES.md) rule 6).
- Do not edit `docs/archive/`.
- Do not edit AGENTS.md or README.md.
- Do not infer "complete" from code inspection — only act on explicit instruction from the user's invocation.
- Do not promote a phase (flip `Ready` → `Active`) — that is owned by `plan-next-epic`; halt and report if status is inconsistent (step 3).
