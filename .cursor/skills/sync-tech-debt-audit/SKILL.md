---
name: sync-tech-debt-audit
description: >-
  Audits recent code and git changes against TECH_DEBT_AUDIT.md, then proposes
  or applies minimal updates — resolve fixed findings, refresh stale ones, add
  NEW items from recent work. Use after feature work, refactor-cleaner batches,
  or when the user asks to sync/update/refresh the tech debt audit. Not a full
  re-audit — use tech-debt-audit for that.
disable-model-invocation: true
---

# Sync TECH_DEBT_AUDIT.md

Keep [TECH_DEBT_AUDIT.md](../../TECH_DEBT_AUDIT.md) aligned with what the repo actually contains **after recent changes**. This is an **incremental sync**, not a whole-repo audit.

**Not the same as:**

- **`tech-debt-audit`** — full deliberate audit across all dimensions; run quarterly or when debt is unknown
- **`sync-repo-docs`** / **`sync-context-md`** — AGENTS.md / README / planning brief only
- **`refactor-cleaner`** — removes code and may mark findings `RESOLVED`; run this skill after cleanup to refresh summary sections
- **`archive-tech-debt-audit`** — moves completed audit to `archive/tech-debt-audits/`; run when all findings are resolved
- **`archive-security-audit`** — same pattern for `SECURITY_AUDIT.md` → `archive/security-audits/`

If `TECH_DEBT_AUDIT.md` is missing, stop and tell the user to run `/tech-debt-audit` first.

## When to run

- After shipping work that may close audit findings (dead code removed, tests added, deps upgraded)
- After `/refactor-cleaner` batches to consolidate `RESOLVED` markers and check off Quick wins
- End of a phase epic that targeted specific finding IDs (e.g. Phase 7.5 epics)
- User says: sync tech debt audit, update TECH_DEBT_AUDIT, refresh audit findings
- Before planning the next debt epic — stale audit mis-prioritizes work

Skip when changes are comment-only or docs-only with no finding impact (use **sync-repo-docs** instead).

## Workflow

```
Audit sync progress:
- [ ] Step 1: Read TECH_DEBT_AUDIT.md and note finding IDs + Quick wins state
- [ ] Step 2: Gather evidence of recent work
- [ ] Step 3: Verify affected findings against current code
- [ ] Step 4: Apply minimal edits to the audit file
- [ ] Step 5: Summarize drift and suggest follow-ups
```

### Step 1 — Read the audit

Read `TECH_DEBT_AUDIT.md` fully. Capture:

- `Generated:` date
- Finding IDs in the table (F001…)
- Quick wins checkboxes (`[ ]` / `[x]`)
- Top 5 items and any inline status notes (e.g. `Done (Phase 7.5 Epic 5)`)
- Open questions that may have been resolved in conversation or code

Do **not** delete the audit and rewrite from scratch.

### Step 2 — Gather evidence

Inspect **recent work**, not the whole repo. Prefer the smallest window that covers the change:

| Source                                             | What to look for                                                          |
| -------------------------------------------------- | ------------------------------------------------------------------------- |
| Current conversation                               | Findings closed, tests added, files deleted, deps bumped                  |
| `git log --oneline -20` and `git diff main...HEAD` | Commits referencing finding IDs or audit areas                            |
| `git status` / unstaged diff                       | Work in progress that closes findings                                     |
| Target files from audit rows                       | File still exists? Line counts changed? Imports gone?                     |
| `pnpm audit`, `vitest.config.ts`, test file globs  | F019–F021 dependency/coverage drift                                       |
| [AGENTS.md](../../AGENTS.md)                       | Doc findings (F003–F006) — pair with **sync-repo-docs** if AGENTS changed |

Evidence commands (run as needed):

```bash
git log --oneline -20
git diff main...HEAD --stat
git diff --stat
# Verify a dead-code finding:
rg "generateRecipeSkillsAction|syncRecipeSkillAppliancesAction" src/
# Verify test files exist:
ls src/app/kitchen/_components/*.test.* src/app/kitchen/cook/setup/*.test.*
pnpm audit 2>/dev/null | head -30
```

### Step 3 — Verify findings

For each finding **likely affected** by recent evidence, re-check the cited file/line. Classify:

| Status         | When                                             | Audit action                                                                                                           |
| -------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| **RESOLVED**   | Root cause fixed in code or docs; cite evidence  | Mark row `RESOLVED (YYYY-MM-DD)` or remove from active table into a short **Resolved** appendix; check Quick win `[x]` |
| **Stale**      | Still debt but description/line/file/count wrong | Update row in place; keep same ID                                                                                      |
| **Still open** | Unchanged                                        | Leave row as-is                                                                                                        |
| **NEW**        | Significant debt introduced by recent work       | Append `F0xx \| NEW` with citation — only if material; do not re-scan entire repo                                      |

**Verification rules:**

- **Dead code (F001-style):** `rg` for symbol imports across `src/` — zero imports → RESOLVED if file deleted
- **Test debt:** co-located `*.unit.test.*` or `*.integration.test.*` exists and covers the orchestrator → RESOLVED
- **Doc drift:** if AGENTS.md was fixed, mark doc findings RESOLVED; if audit says stale but AGENTS still wrong, leave open and suggest **sync-repo-docs**
- **LOC / god-file:** re-count lines; update severity only if crossed a meaningful threshold (>500 LOC)
- **Dependency CVE:** re-run `pnpm audit`; RESOLVED if advisory no longer appears
- **Quick wins / Top 5:** sync checkbox and narrative with RESOLVED findings

Do **not** mark RESOLVED without verifying in current code — git commit messages alone are insufficient.

### Step 4 — Apply minimal edits

Update only what evidence supports:

1. Bump **`Generated:`** to today (ISO `YYYY-MM-DD`, use conversation system date) when any content changed
2. **Executive summary** — add/remove bullets for high-impact RESOLVED or NEW items; keep ≤10 bullets
3. **Findings table** — update, mark RESOLVED, or append NEW rows; preserve ID sequence (never reuse IDs)
4. **Top 5** — drop RESOLVED items or note completion; promote next highest-impact open finding if list shrinks
5. **Quick wins** — check `[x]` for completed items; uncheck if regression reopens debt
6. **Open questions** — note resolution with date when PM confirmed; remove answered questions
7. **Things that look bad but are actually fine** — add entries when recent code looks like debt but matches locked rules

**Requires maintainer approval before editing:**

- Changing **severity** or **effort** on open findings without code evidence
- Removing findings from the table entirely (prefer `RESOLVED` annotation or appendix)
- Promoting a **NEW** finding to Top 5 without user context

**Safe to apply without approval:**

- RESOLVED markers with evidence
- Stale line numbers, LOC counts, file paths
- Quick win checkboxes matching verified fixes
- Generated date bump
- Executive summary factual refresh

Editing principles:

- **Minimal diff** — touch only affected rows and summary bullets
- **Preserve IDs** — F016 stays F016 even after RESOLVED
- **Cite evidence** — RESOLVED notes include what changed (`file deleted`, `test added`, `Vitest 4.x`)
- **No full re-audit** — if >5 NEW findings or executive summary is mostly wrong, suggest `/tech-debt-audit` instead

### Step 5 — Report

After editing (or after proposing approval-gated changes):

1. Summarize RESOLVED, stale, NEW, and unchanged counts
2. If AGENTS.md / CONTEXT.md doc findings were involved, suggest **sync-repo-docs** or **sync-context-md**
3. If many findings remain open in one area, suggest scoped `/refactor-cleaner` or next epic
4. Do **not** commit unless the user asks

## Output format

```markdown
## Tech debt audit sync summary

### Evidence reviewed

- [git range, conversation, or files inspected]

### Findings updated

- **RESOLVED:** F00x — [one-line evidence]
- **Stale (corrected):** F00x — [what changed in the row]
- **NEW:** F0xx — [only if added]
- **Still open:** [count] unchanged

### Sections touched

- TECH_DEBT_AUDIT.md: [Executive summary / Findings / Quick wins / Top 5 / Open questions — or "none"]

### Needs your decision

- [severity changes, removals, or scope calls — or "none"]

### Suggested follow-ups

- [/tech-debt-audit | /refactor-cleaner F00x | /sync-repo-docs — or "none"]
```

## Anti-patterns

- Do not run a whole-repo audit under the guise of sync — delegate to **tech-debt-audit**
- Do not mark RESOLVED from commit message alone — verify files and imports
- Do not invent findings from `.cursor/plans/` without shipped code
- Do not fix product code as part of audit sync
- Do not treat locked AGENTS.md rules as debt to remove
- Do not pad NEW findings — one material regression beats five nitpicks
- Do not run `pnpm db:push` or edit generated types as part of audit sync

## Additional resources

- Finding categories, verification checklist, RESOLVED appendix format: [reference.md](reference.md)
