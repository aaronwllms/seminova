---
name: archive-security-audit
description: >-
  Validates that all actionable SECURITY_AUDIT.md findings are resolved, then
  moves the audit to archive/security-audits/ as a dated archive. Use when the
  user asks to archive, close, or retire the security audit, or when every
  High/Medium/Low finding is fixed or explicitly accepted. Does not run if open
  actionable findings remain.
disable-model-invocation: true
---

# Archive SECURITY_AUDIT.md

Close a **completed** security audit cycle by moving [SECURITY_AUDIT.md](../../../SECURITY_AUDIT.md) from the repo root into [`archive/security-audits/`](../../../archive/security-audits/).

**Not the same as:**

- **`create-security-review-plan`** — Plan Mode + Build produces or refreshes the **live** root audit
- **`archive-tech-debt-audit`** — same archive pattern for `TECH_DEBT_AUDIT.md` (different closure rules)

If `SECURITY_AUDIT.md` is missing, stop — nothing to archive. Suggest `/create-security-review-plan` to start a new cycle.

## When to run

- User says: archive security audit, close the audit, retire SECURITY_AUDIT
- All **actionable** findings (Critical / High / Medium / Low) are fixed and marked done in the file
- End of a security remediation phase when the backlog is fully cleared

Do **not** archive while unchecked actionable findings remain under **Findings** (see closure checklist). **Human / tooling follow-ups** and **Deferred / accepted risk** do not block archive by themselves.

## Workflow

```
Archive progress:
- [ ] Step 1: Read SECURITY_AUDIT.md and run closure checklist
- [ ] Step 2: Stop with blockers OR confirm all actionable issues resolved
- [ ] Step 3: Move file to archive/security-audits/
- [ ] Step 4: Update cross-references (minimal)
- [ ] Step 5: Report and suggest next steps
```

### Step 1 — Closure checklist

Read `SECURITY_AUDIT.md` and evaluate each gate:

| Gate                               | Pass condition                                                                                                                                |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Critical / High / Medium / Low** | No open actionable items — every finding under these headings is `[x]`, removed, or section states _(none)_ with no unchecked `- [ ]` bullets |
| **Deferred / accepted risk**       | Does **not** block — may remain `[ ]` if product-accepted; archive as-is                                                                      |
| **Human / tooling follow-ups**     | Does **not** block — manual QA backlog; note open items in archive report                                                                     |
| **Verified OK**                    | No change required — historical record                                                                                                        |

**Parsing actionable findings:**

- Under `## Findings`, scan subsections **Critical**, **High**, **Medium**, **Low** only.
- `- [ ]` on a finding line → **blocks archive**
- `- [x]` or absence of checkbox on a resolved item → OK
- Bold title lines like `- [ ] **SSRF...**` count as open findings

**Does not block archive:**

- Amendment blocks at top (historical context)
- **Human / tooling follow-ups** checklists
- **Deferred / accepted risk** items (documented product acceptance)
- Stale surface map counts if findings are cleared — optional note in report only

If findings look stale (fixed in code but still `[ ]`), stop and tell the user to update `SECURITY_AUDIT.md` manually (no `/sync-security-audit` skill yet).

Optional verification (recommended before archive):

```bash
# Spot-check a sample of fixed findings in code
rg "fetch(appliance.pdfUrl)" src/app/kitchen/actions/   # SSRF finding — expect allowlist if resolved
test -f .env.example && echo "F010-style env template present"
pnpm test:ci                                            # quality gates green
```

### Step 2 — Stop or proceed

**If any gate fails**, stop. Report:

- Which severity sections still have `- [ ]` items
- Count of open actionable findings
- Suggest fixing in code, updating checkboxes in `SECURITY_AUDIT.md`, then re-run this skill

**If all gates pass**, proceed. Do not archive on user assertion alone — parse the file.

### Step 3 — Move to archive

1. Parse **`Generated:`** for ISO date (`YYYY-MM-DD`). Fallback: conversation system date.
2. Target path: `archive/security-audits/security-audit-{date}.md`
3. If that path exists, use `-2`, `-3`, … (same rule as [archive/security-audits/README.md](../../../archive/security-audits/README.md))
4. Prepend an archive header to the moved file (after the title):

```markdown
**Archived:** YYYY-MM-DD  
**Status:** Actionable findings resolved — live backlog cleared. Start a new cycle with `/create-security-review-plan`.
```

5. **Move** (prefer `git mv`) from repo root — do **not** copy and leave duplicate
6. Ensure [`archive/security-audits/README.md`](../../../archive/security-audits/README.md) exists (create from template in [reference.md](reference.md) if missing)
7. **Remove** root `SECURITY_AUDIT.md` — no stub file at root

### Step 4 — Cross-references (minimal)

Update only if the repo references the live root file:

| Location                                                | Action                                                              |
| ------------------------------------------------------- | ------------------------------------------------------------------- |
| `CONTEXT.md` (or planning brief from AGENTS.md doc map) | Replace live audit line with archive path + date; note cycle closed |
| `AGENTS.md`                                             | Update only if it explicitly points at root `SECURITY_AUDIT.md`     |
| `TECH_DEBT_AUDIT.md`                                    | Update amendment cross-refs if they cite live `SECURITY_AUDIT.md`   |

Do **not** rewrite `.cursor/plans/` history. Old plan links are historical.

### Step 5 — Report

```markdown
## Security audit archive summary

### Closure verification

- Actionable findings (Critical/High/Medium/Low): [clear / N open]
- Deferred / accepted risk: [noted, does not block]
- Human / tooling follow-ups: [N open, does not block]

### Archive

- Moved: `SECURITY_AUDIT.md` → `archive/security-audits/security-audit-YYYY-MM-DD.md`
- Root file: removed (start new cycle with `/create-security-review-plan`)

### Cross-references updated

- [paths touched, or "none"]

### Next steps

- [Optional `/sync-context-md` if planning brief updated]
- New security review: `/create-security-review-plan` when ready
```

Do **not** commit unless the user asks.

## Anti-patterns

- Do not archive with open `- [ ]` under Critical / High / Medium / Low
- Do not delete the audit without moving to `archive/security-audits/`
- Do not overwrite an existing archive filename — use `-2` suffix
- Do not treat cleared Human follow-ups as sufficient if actionable findings remain open
- Do not run `/create-security-review-plan` as part of archive — archive is terminal for this cycle

## Additional resources

- Closure parsing details and README template: [reference.md](reference.md)
