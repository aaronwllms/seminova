---
name: archive-tech-debt-audit
description: >-
  Validates that all TECH_DEBT_AUDIT.md findings are resolved, then moves the
  audit to archive/tech-debt-audits/ as a dated archive. Use when the user asks
  to archive, close, or retire the tech debt audit, or when every finding and
  quick win is marked fixed. Does not run if open findings remain.
disable-model-invocation: true
---

# Archive TECH_DEBT_AUDIT.md

Close a **completed** tech-debt audit cycle by moving [TECH_DEBT_AUDIT.md](../../../TECH_DEBT_AUDIT.md) from the repo root into [`archive/tech-debt-audits/`](../../../archive/tech-debt-audits/).

**Not the same as:**

- **`sync-tech-debt-audit`** — incremental updates while findings are still open
- **`tech-debt-audit`** — creates or refreshes the **live** root audit
- **`refactor-cleaner`** — fixes code; may resolve findings but does not archive
- **`archive-security-audit`** — same pattern for `SECURITY_AUDIT.md` (different closure checklist)

If `TECH_DEBT_AUDIT.md` is missing, stop — nothing to archive. Suggest `/tech-debt-audit` to start a new cycle.

## When to run

- User says: archive tech debt audit, close the audit, retire TECH_DEBT_AUDIT
- All Quick wins checked and Findings table is empty (everything in Resolved appendix)
- End of a debt-remediation phase when the backlog is fully cleared

Do **not** archive while open findings remain in the Findings table, unchecked Quick wins, or unresolved Top 5 items.

## Workflow

```
Archive progress:
- [ ] Step 1: Read TECH_DEBT_AUDIT.md and run closure checklist
- [ ] Step 2: Stop with blockers OR confirm all issues fixed
- [ ] Step 3: Move file to archive/tech-debt-audits/
- [ ] Step 4: Update cross-references (minimal)
- [ ] Step 5: Report and suggest next steps
```

### Step 1 — Closure checklist

Read `TECH_DEBT_AUDIT.md` and evaluate each gate:

| Gate                  | Pass condition                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------ |
| **Findings table**    | **Zero** open rows — table empty or section omitted; all IDs only in **Resolved** appendix |
| **Quick wins**        | Every item `[x]` — no `[ ]` entries                                                        |
| **Top 5**             | Empty, or every item explicitly marked done/resolved (e.g. `Done (Phase X)`)               |
| **Executive summary** | No bullets describing **open** High/Medium debt (resolved history OK)                      |

**Does not block archive:**

- **Open questions** — PM backlog; note in archive report they remain in CONTEXT or historical record
- **Things that look bad but are actually fine** — intentional design notes; archive as-is

If the audit looks stale (resolved items still in Findings table), run **`/sync-tech-debt-audit`** first, then re-run this skill.

Optional verification (recommended before archive):

```bash
# Spot-check a sample of Resolved appendix IDs still hold in code
rg "generateRecipeSkillsAction" src/   # expect no matches for deleted-action findings
pnpm test:ci                           # quality gates green
```

### Step 2 — Stop or proceed

**If any gate fails**, stop. Report:

- Which sections failed (Findings rows, unchecked Quick wins, open Top 5)
- Finding IDs still open
- Suggest `/refactor-cleaner` or manual fixes, then `/sync-tech-debt-audit`

**If all gates pass**, proceed. Do not archive on user assertion alone — parse the file.

### Step 3 — Move to archive

1. Parse **`Generated:`** for ISO date (`YYYY-MM-DD`). Fallback: conversation system date.
2. Target path: `archive/tech-debt-audits/tech-debt-audit-{date}.md`
3. If that path exists, use `-2`, `-3`, … (same rule as [archive/security-audits](../../../archive/security-audits/README.md))
4. Prepend an archive header to the moved file (after the title):

```markdown
**Archived:** YYYY-MM-DD  
**Status:** All findings resolved — live backlog cleared. Start a new cycle with `/tech-debt-audit`.
```

5. **Move** (prefer `git mv`) from repo root — do **not** copy and leave duplicate
6. Ensure [`archive/tech-debt-audits/README.md`](../../../archive/tech-debt-audits/README.md) exists (create from template in [reference.md](reference.md) if missing)
7. **Remove** root `TECH_DEBT_AUDIT.md` — no stub file at root

### Step 4 — Cross-references (minimal)

Update only if the repo references the live root file:

| Location                                                | Action                                                              |
| ------------------------------------------------------- | ------------------------------------------------------------------- |
| `CONTEXT.md` (or planning brief from AGENTS.md doc map) | Replace live audit line with archive path + date; note cycle closed |
| `AGENTS.md`                                             | Update only if it explicitly points at root `TECH_DEBT_AUDIT.md`    |

Do **not** rewrite `.cursor/plans/` history. Old plan links to root `TECH_DEBT_AUDIT.md` are historical.

### Step 5 — Report

```markdown
## Tech debt audit archive summary

### Closure verification

- Findings table: [empty / N blockers]
- Quick wins: [all checked / N open]
- Top 5: [all resolved / N open]

### Archive

- Moved: `TECH_DEBT_AUDIT.md` → `archive/tech-debt-audits/tech-debt-audit-YYYY-MM-DD.md`
- Root file: removed (start new cycle with `/tech-debt-audit`)

### Cross-references updated

- [paths touched, or "none"]

### Next steps

- [Optional `/sync-context-md` if planning brief updated]
- New debt work: `/tech-debt-audit` when ready
```

Do **not** commit unless the user asks.

## Anti-patterns

- Do not archive with open Findings table rows — sync or fix first
- Do not delete the audit without moving to `tech-debt-audits/`
- Do not overwrite an existing archive filename — use `-2` suffix
- Do not treat checked Quick wins as sufficient if Findings table still has rows
- Do not run `/tech-debt-audit` as part of archive — archive is terminal for this cycle

## Additional resources

- Closure parsing details and README template: [reference.md](reference.md)
