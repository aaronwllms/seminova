---
name: ship-phase
description: >-
  Release close-out for a completed phase: flip the active PRD and ROADMAP row to
  Shipped, push the phase branch, and open a PR — then stop. Does not merge to main.
  Use when a phase is fully built and the user invokes ship-phase, /ship-phase, or
  asks to ship or close out the current phase.
disable-model-invocation: true
---

# Ship Phase

**Invocation one of two.** Reversible prep (docs + branch + PR). The irreversible merge to `main` is invocation two — explicit human action only. This skill never merges, never prompts to merge, and never waits for a merge go-ahead.

Single-purpose. Touches only the active phase's PRD (`docs/prds/` → `docs/prds/archive/`), `ROADMAP.md`, and git/gh for push + PR. Does not run `sync-repo-docs`, does not edit `AGENTS.md` or `README.md`, does not touch `docs/archive/`.

**Read [DOC_RULES.md](../../../docs/DOC_RULES.md) rule 6 before executing.** Procedure detail: [prds/README.md](../../../docs/prds/README.md).

## When to run

Only when the user explicitly invokes `ship-phase` (or `/ship-phase`) after the phase's epics are implemented. Do not infer from conversation or run at epic boundaries — epic close-out is `mark-epic-complete`.

Recommended order: run `sync-repo-docs` and `pre-release-review` **before** `ship-phase` if repo truth or quality gates may be stale. Those are separate skills; this skill does not run them.

## Pre-flight (halt if any fail)

1. **Active PRD** — exactly one file in `docs/prds/` with status `Active`, excluding `docs/prds/archive/` (see [reference.md](reference.md) for how status appears). If zero or multiple, halt and report.
2. **Epics complete** — every `### Epic N:` heading in that PRD carries a `` `Complete` `` tag. If any epic is open, halt and list them.
3. **ROADMAP match** — the ROADMAP status-table row for that phase number reads `Active`. If it reads anything else, halt and report the mismatch (do not auto-correct).
4. **Branch** — current branch matches `phase-{N}/{slug}` for the phase being shipped (see [reference.md](reference.md)). If on `main` or a mismatched branch, halt and report expected branch name.
5. **Clean push path** — `git status` shows only the doc edits this skill will make (or already-committed work). Unrelated uncommitted changes outside scope → halt and ask the user to commit or stash first.

## Steps

Copy and track:

```
Ship-phase progress:
- [ ] Step 1: Flip PRD status Active → Shipped
- [ ] Step 2: Move PRD to docs/prds/archive/
- [ ] Step 3: Mark ROADMAP row Shipped (+ update PRD column path)
- [ ] Step 4: Commit doc changes
- [ ] Step 5: Push branch
- [ ] Step 6: Open PR
- [ ] Step 7: Report PR URL; merge is human-only; ask to switch to main
- [ ] Step 8: If yes — checkout main and pull
```

### Step 1 — Flip PRD status

In the active PRD file (still in `docs/prds/` at this step):

- Change status from `Active` to `Shipped` wherever the PRD carries it (typically a `**Status:**` line or frontmatter — see [reference.md](reference.md)).
- If the PRD has a **Last updated** line, set it to today's date (ISO `YYYY-MM-DD`).

### Step 2 — Archive PRD file

Move the PRD from `docs/prds/` to `docs/prds/archive/` (create `docs/prds/archive/` if missing):

```bash
git mv docs/prds/<active-prd-file> docs/prds/archive/<active-prd-file>
```

The file leaves `docs/prds/` — shipped PRDs live only under `docs/prds/archive/`.

### Step 3 — Mark ROADMAP row Shipped

In [ROADMAP.md](../../../ROADMAP.md):

- In the **Status** table, set the matching phase row's Status column to `` `Shipped` `` (match by phase number, not name substring).
- Update the row's **PRD** column to `docs/prds/archive/<active-prd-file>` (e.g. `docs/prds/archive/phase-8-tech-debt-remediation.prd.md`).
- Update **Last updated** at the top if present.
- If a narrative line under the table still names this phase as the active one, revise it to reflect no active phase (point at the next `Draft` / `Ready` phase if obvious from the table). Do not rewrite draft-phase stub sections.

### Step 4 — Commit

Stage the archived PRD move and `ROADMAP.md` (if Step 2 used `git mv`, the move is already staged):

```bash
git add ROADMAP.md
git commit -m "$(cat <<'EOF'
docs: ship phase {N} — flip PRD and ROADMAP to Shipped

Phase close-out per DOC_RULES rule 6; PRD moved to docs/prds/archive/.
EOF
)"
```

Replace `{N}` with the phase number.

### Step 5 — Push

```bash
git push -u origin HEAD
```

Request `git_write` and `full_network` permissions. If push fails on hooks, fix and create a **new** commit — do not amend unless the user explicitly requests it and amend rules apply.

### Step 6 — Open PR

Use `gh pr create` with an explicit title and body — **not** `--fill` or `--draft`. Follow [reference.md](reference.md) for the required body sections (`Why`, `What`, `Testing`, `Risk`).

```bash
gh pr create --title "feat: ship phase {N} — {short phase name}" --body "$(cat <<'EOF'
## Why
Phase {N} is complete; this PR merges the phase branch to main.

## What
- All epics for phase {N} implemented on the phase branch
- Active PRD status flipped to Shipped and moved to docs/prds/archive/
- ROADMAP phase row marked Shipped (PRD column path updated)

## Testing
- pnpm pre-push passed on the phase branch
- Manual smoke of phase deliverables per PRD success conditions

## Risk
LOW — phase branch accumulated reviewed work; doc-only delta in this commit
EOF
)"
```

Request `full_network` permissions. Capture the PR URL from output.

### Step 7 — Report and ask

**Do not merge.** Do not run `gh pr merge`. Do not ask whether to merge.

Output this message (fill in bracketed values):

```markdown
## Phase {N} ship prep complete

**PR open:** {pr_url}

**Branch pushed:** `{branch_name}`

### What this skill did
- Flipped `{prd_filename}` status `Active` → `Shipped` and moved it to `docs/prds/archive/`
- Marked phase {N} `Shipped` on ROADMAP.md (PRD column path updated)
- Pushed the branch and opened the PR

### What happens next (human only)
**Merge to `main` is a separate, explicit step on your go.** Review the PR, confirm CI, then merge when ready.
```

Then ask: **Ready to switch to main and pull? (requires the PR to be merged first)**

### Step 8 — Switch to main (if yes)

If the user confirms, run:

```bash
git checkout main && git pull
```

Request `git_write` and `full_network` permissions. Then stop.

If the user declines or does not confirm, stop without running the command.

## Explicitly out of scope

- Merge to `main` or prompt to merge
- Move the PRD anywhere other than `docs/prds/archive/`
- Append to or edit `docs/archive/`
- Edit `AGENTS.md`, `README.md`, `.cursor/plans/`, rules, or code
- Run `sync-repo-docs`, `mark-epic-complete`, or `phase-planning`
- Promote the next phase to `Active`

## Additional resources

- Branch naming, status-field patterns, PR template: [reference.md](reference.md)
