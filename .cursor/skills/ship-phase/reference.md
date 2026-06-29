# Ship phase — reference

## Two-invocation model

| Invocation | Who | What |
| ---------- | --- | ---- |
| **1 — `ship-phase`** | Agent (this skill) | Reversible: flip PRD + ROADMAP → `Shipped`, commit, push, open PR, **stop** |
| **2 — merge** | Human | Irreversible: review PR, confirm CI, merge to `main` on explicit go |

Nothing stays running between invocations. The skill cannot wait for merge approval.

## Active PRD discovery

- **Location:** `docs/prds/*.prd.md`
- **Active signal:** status field reads `Active` (not `Planning`, `Ready`, or `Shipped`)
- **Typical shapes** (exact format is defined by `phase-planning`; match what exists):
  - `**Status:** Active`
  - YAML frontmatter: `status: Active`
- **Filename convention:** `phase-{N}-{short-slug}.prd.md` (e.g. `phase-8-tech-debt-remediation.prd.md`)
- **Exactly one** `Active` PRD should exist. Zero or multiple → halt.

## ROADMAP status table

Match the phase by **phase number** in the first column, not by name substring:

```markdown
| Phase | Name | Status | PRD |
| ----- | ---- | ------ | --- |
| 8     | Tech Debt Audit Remediation | `Active` | phase-8-tech-debt-remediation.prd.md |
```

Flip only the **Status** column for that row: `` `Active` `` → `` `Shipped` ``.

Status vocabulary is shared between ROADMAP and PRD — see [DOC_RULES.md](../../../docs/DOC_RULES.md) § Phase status vocabulary.

## Branch naming

One branch per phase; all epics accumulate on it until phase-end merge.

**Pattern:** `phase-{N}/{short-kebab-slug}`

**Examples from this repo:**

| Phase | Branch |
| ----- | ------ |
| 1 | `phase-1/foundation-cleanup` |
| 7 | `phase-7/security-audit-remediation` |
| 8 | `phase-8/tech-debt-remediation` |

Derive expected branch from the active PRD's phase number and slug (filename or ROADMAP PRD column). Halt if `git branch --show-current` does not match.

## Epic completeness gate

Every epic heading must carry the `` `Complete` `` tag before ship:

```markdown
### Epic 1: Foundation Cleanup `Complete`
```

Format per [DOC_RULES.md](../../../docs/DOC_RULES.md) rule 9. Open epics → halt; do not ship.

## PR body template (required)

Per `.cursor/rules/git-workflow.mdc` — all four sections required:

```markdown
## Why
[Problem / why this phase exists and why it's ready to merge]

## What
- [2–4 bullets: major deliverables on the branch]
- Active PRD flipped to Shipped (stays in docs/prds/)
- ROADMAP phase row marked Shipped

## Testing
[How to verify — pre-push, manual smoke, key routes]

## Risk
LOW/MEDIUM/HIGH — [brief rationale]
```

**Title:** conventional commit style, e.g. `feat: ship phase 8 — tech debt audit remediation`

## DOC_RULES rule 6 (authoritative)

> When a phase ships, flip its PRD status to `Shipped` (the file stays in prds/) and mark the phase `Shipped` on ROADMAP in the same pass. Do not append to the archive.

## Suggested pre-ship checklist (not run by this skill)

Human or separate agent turns before invoking `ship-phase`:

- [ ] `sync-repo-docs` — AGENTS.md reflects shipped behavior
- [ ] `pre-release-review` or `pnpm pre-push` — quality gates pass
- [ ] All epics tagged `` `Complete` `` via `mark-epic-complete`
- [ ] On the correct `phase-{N}/…` branch
