---
name: ship-phase
description: >-
  Release close-out for a completed phase — archive plans, sync repo docs, mark
  PRD/ROADMAP Shipped, push the phase branch, and open a PR (does not merge).
disable-model-invocation: true
---

# Ship Phase

**Invocation one of two.** Reversible prep (docs + branch + PR). The irreversible merge to `main` is invocation two — explicit human action only. This skill never merges, never prompts to merge, and never waits for a merge go-ahead.

Orchestrates phase close-out. Directly touches the active phase's PRD (`docs/prds/` → `docs/prds/archive/`), `ROADMAP.md`, and git/gh for push + PR. Chains two skills — `archive-cursor-plans` and `sync-repo-docs` — whose file changes ride in the single close-out commit. Does not touch `docs/archive/`.

**Read [DOC_RULES.md](../../../docs/DOC_RULES.md) rule 6 before executing.** Procedure detail: [prds/README.md](../../../docs/prds/README.md).

## When to run

Only when the user explicitly invokes `ship-phase` (or `/ship-phase`) after the phase's epics are implemented. Do not infer from conversation or run at epic boundaries — epic close-out is `mark-epic-complete`.

Prerequisite: run `pre-release-review` **before** `ship-phase`. It is a quality gate that can fail and spawn fix-work; it stays outside this skill. Ship-phase assumes the gate has already passed.

## Pre-flight (halt if any fail)

1. **Active PRD** — exactly one file in `docs/prds/` with status `Active`, excluding `docs/prds/archive/` (see [reference.md](reference.md) for how status appears). If zero or multiple, halt and report.
2. **Epics complete** — every `### Epic N:` heading in that PRD carries a `` `Complete` `` tag. If any epic is open, halt and list them.
3. **ROADMAP match** — the ROADMAP status-table row for that phase number reads `Active`. If it reads anything else, halt and report the mismatch (do not auto-correct).
4. **Branch** — current branch matches `phase-{N}/{slug}` for the phase being shipped (see [reference.md](reference.md)). If on `main` or a mismatched branch, halt and report expected branch name.
5. **Clean push path** — `git status` shows only the edits this skill and its chained skills will make (or already-committed work). Unrelated uncommitted changes outside scope → halt and ask the user to commit or stash first.

## Steps

Copy and track:

```
Ship-phase progress:
- [ ] Step 1: Run archive-cursor-plans skill
- [ ] Step 2: Run sync-repo-docs skill
- [ ] Step 3: Flip PRD status Active → Shipped
- [ ] Step 4: Move PRD to docs/prds/archive/
- [ ] Step 5: Mark ROADMAP row Shipped (+ update PRD column path)
- [ ] Step 6: Commit close-out changes
- [ ] Step 7: Push branch
- [ ] Step 8: Open PR
- [ ] Step 9: Report PR URL; merge is human-only; ask to switch to main
- [ ] Step 10: If yes — checkout main and pull
```

### Step 1 — Archive cursor plans

Run the `archive-cursor-plans` skill in full. Its moves within `.cursor/plans/` are committed in Step 6, not separately.

### Step 2 — Sync repo docs

Run the `sync-repo-docs` skill in full. Any `AGENTS.md` / `README.md` edits it applies are committed in Step 6, not separately.

### Step 3 — Flip PRD status

In the active PRD file (still in `docs/prds/` at this step):

- Change status from `Active` to `Shipped` wherever the PRD carries it (typically a `**Status:**` line or frontmatter — see [reference.md](reference.md)).
- If the PRD has a **Last updated** line, set it to today's date (ISO `YYYY-MM-DD`).

### Step 4 — Archive PRD file

Move the PRD from `docs/prds/` to `docs/prds/archive/` (create `docs/prds/archive/` if missing):

```bash
git mv docs/prds/<active-prd-file> docs/prds/archive/<active-prd-file>
```

The file leaves `docs/prds/` — shipped PRDs live only under `docs/prds/archive/`.

### Step 5 — Mark ROADMAP row Shipped

In [ROADMAP.md](../../../ROADMAP.md):

- In the **Status** table, set the matching phase row's Status column to `` `Shipped` `` (match by phase number, not name substring).
- Update the row's **PRD** column to `docs/prds/archive/<active-prd-file>` (e.g. `docs/prds/archive/phase-8-tech-debt-remediation.prd.md`).
- Update **Last updated** at the top if present.
- If a narrative line under the table still names this phase as the active one, revise it to reflect no active phase (point at the next upcoming phase — `Draft`, `Planning`, or `Ready` — if obvious from the table). Do not rewrite the Upcoming phases section's per-phase stubs.

### Step 6 — Commit

Stage all close-out changes: the archived PRD move (already staged if Step 4 used `git mv`), `ROADMAP.md`, plan moves under `.cursor/plans/`, and any `AGENTS.md` / `README.md` edits from Step 2:

```bash
git add ROADMAP.md AGENTS.md README.md .cursor/plans/
git commit -m "$(cat <<'EOF'
docs: ship phase {N} — close-out (PRD/ROADMAP Shipped, plans archived, docs synced)

Phase close-out per DOC_RULES rule 6; PRD moved to docs/prds/archive/;
cursor plans archived; AGENTS.md/README.md synced to repo truth.
EOF
)"
```

Replace `{N}` with the phase number.

### Step 7 — Push

```bash
git push -u origin HEAD
```

Request `git_write` and `full_network` permissions. If push fails on hooks, fix and create a **new** commit — do not amend unless the user explicitly requests it and amend rules apply.

### Step 8 — Open PR

Use `gh pr create` with an explicit title and body — **not** `--fill` or `--draft`. Follow [reference.md](reference.md) for the required body sections (`Why`, `What`, `Testing`, `Risk`).

```bash
gh pr create --title "feat: ship phase {N} — {short phase name}" --body "$(cat <<'EOF'
## Why
Phase {N} is complete; this PR merges the phase branch to main.

## What
- All epics for phase {N} implemented on the phase branch
- Active PRD status flipped to Shipped and moved to docs/prds/archive/
- ROADMAP phase row marked Shipped (PRD column path updated)
- Cursor plans for the phase archived to .cursor/plans/archive/
- AGENTS.md / README.md synced to repo truth

## Testing
- pnpm pre-push passed on the phase branch
- Manual smoke of phase deliverables per PRD success conditions

## Risk
LOW — phase branch accumulated reviewed work; doc-only delta in this commit
EOF
)"
```

Request `full_network` permissions. Capture the PR URL from output.

### Step 9 — Report and ask

**Do not merge.** Do not run `gh pr merge`. Do not ask whether to merge.

Output this message (fill in bracketed values):

```markdown
## Phase {N} ship prep complete

**PR open:** {pr_url}

**Branch pushed:** `{branch_name}`

### What this skill did
- Archived cursor plans (`archive-cursor-plans`) and synced repo docs (`sync-repo-docs`)
- Flipped `{prd_filename}` status `Active` → `Shipped` and moved it to `docs/prds/archive/`
- Marked phase {N} `Shipped` on ROADMAP.md (PRD column path updated)
- Pushed the branch and opened the PR

### What happens next (human only)
**Merge to `main` is a separate, explicit step on your go.** Review the PR, confirm CI, then merge when ready.
```

Then ask: **Ready to switch to main and pull? (requires the PR to be merged first)**

### Step 10 — Switch to main (if yes)

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
- Edit rules or code (doc edits happen only via the chained skills)
- Run `pre-release-review`, `mark-epic-complete`, or `phase-planning`
- Promote the next phase to `Active`

## Additional resources

- Branch naming, status-field patterns, PR template: [reference.md](reference.md)
