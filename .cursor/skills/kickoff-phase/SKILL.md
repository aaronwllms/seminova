---
name: kickoff-phase
description: >-
  Starts the next phase: creates the phase branch, flips the phase to
  Active, and commits the planning-doc updates. Run before plan-next-epic.
disable-model-invocation: true
---

# Kickoff Phase

Normal agent mode — this skill writes files and runs git. Do not run in Plan Mode.

## Read first

1. **[AGENTS.md](../../../AGENTS.md)** — hard constraints
2. **[ROADMAP.md](../../../ROADMAP.md)** — phase statuses; the target phase's PRD in [docs/prds/](../../../docs/prds/)

If these don't exist, ask the user where the product roadmap / phase scope lives.

## Identify the target phase

The target is the phase whose PRD carries `` `Ready` `` status.

- A phase is already `` `Active` ``: **halt** — report it; kickoff has already run.
- No PRD is `` `Ready` ``: **halt** and ask the user which phase to kick off.
- The target phase still has a stub in ROADMAP's **Upcoming phases** section (a `### {N} — …` block): **halt** — `phase-planning` removes it at the `Ready` flip ([DOC_RULES.md](../../../docs/DOC_RULES.md) rule 2), so a surviving stub means that flip didn't finish. Report it and ask the user to complete it there; do not remove it here.

## Branch setup

**Derive the expected branch** per [ship-phase reference](../ship-phase/reference.md) § Branch naming.

Check the current branch:

```bash
git branch --show-current
```

| Current branch | Action |
| -------------- | ------ |
| Matches `phase-{N}/{slug}` | Skip to status flip |
| `main` | Create or checkout the phase branch (see below) |
| Anything else | **Halt.** Report the expected branch name; ask the user to switch, stash, or commit first |

**On `main`:**

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

Confirm the output matches `phase-{N}/{slug}` exactly before proceeding. If it doesn't, halt and report — do not proceed on `main` or any other branch by assumption.

Request `git_write` for any checkout/create/delete above. Report which branch was created, checked out, or recreated.

## Flip status to Active

([DOC_RULES.md](../../../docs/DOC_RULES.md) rule 2.) Update the target PRD's `**Status:**` line and its ROADMAP row (Status table + any "Active phase" line) from `` `Ready` `` to `` `Active` ``. Confirm both files read `` `Active` `` before proceeding.

## Commit

Commit the planning-doc set as a `docs:` commit (request `git_write`). The planning session that produced this phase ran in Claude and left its writes uncommitted — the PRD and ROADMAP edits, plus everything else it touched on the way. All of it lands here.

Run `git status --porcelain`, then stage everything modified or untracked under:

- `docs/prds/` (the target PRD)
- `ROADMAP.md`
- `BACKLOG.md`
- `LEXICON.md`
- `docs/adr/`
- `docs/research/`
- `docs/mockups/`
- `docs/WORKFLOW_BACKLOG.md`

Anything changed outside that set is code or unrelated work — leave it unstaged and name it in the handoff so the user knows it's still there.

The skill never leaves planning-doc edits uncommitted.

**Do not push** — publishing the branch is separate (build work or `ship-phase`).

## Handoff

End the run by telling the user, substituting actual values:

*"Phase {N} is Active on `phase-{N}/{slug}`. Next: open a new agent window in **Plan Mode** and run `/plan-next-epic`."*
