# Archive security audit — reference

## Live vs archived

| State                 | Path                                                   | Used by                                                      |
| --------------------- | ------------------------------------------------------ | ------------------------------------------------------------ |
| **Live backlog**      | `SECURITY_AUDIT.md` (repo root)                        | `/security-audit` → Build, remediation tracking |
| **Archived snapshot** | `archive/security-audits/security-audit-YYYY-MM-DD.md` | History, compliance trail, agent context                     |

## SECURITY_AUDIT.md structure

Unlike `TECH_DEBT_AUDIT.md`, there is no Findings ID table, Quick wins, or Top 5.

| Section                                        | Archive role                                 |
| ---------------------------------------------- | -------------------------------------------- |
| `## Findings` → Critical / High / Medium / Low | **Actionable** — open `- [ ]` blocks archive |
| `## Findings` → Deferred / accepted risk       | **Accepted** — does not block archive        |
| `## Verified OK`                               | Historical positives — archive as-is         |
| `## Human / tooling follow-ups`                | Manual QA — does not block archive           |
| Amendment blockquotes                          | Context — does not block archive             |

## Parsing actionable findings

```markdown
### High

- [ ] **SSRF via server-side PDF fetch** — ... ← BLOCKS

- [x] **Fixed item** — ... ← OK

### Critical

_(none — ...)_ ← OK if no [ ] bullets
```

**Open finding:** `- [ ]` under Critical, High, Medium, or Low (including nested bullet content).

**Not open for archive purposes:** `- [ ]` under Deferred / accepted risk or Human / tooling follow-ups.

## Archive filename collision

```bash
# Prefer date from audit Generated: line
ARCHIVE="archive/security-audits/security-audit-2026-05-27.md"
# If exists:
ARCHIVE="archive/security-audits/security-audit-2026-05-27-2.md"
```

## security-audits/README.md template

If the folder has no README, create:

```markdown
# Security audit archives

Dated snapshots from **`/archive-security-audit`** when actionable findings were resolved.

| Live audit | `SECURITY_AUDIT.md` at repo root |
| Archive | This folder |
| New cycle | `/security-audit` → Build |

Naming: `security-audit-YYYY-MM-DD.md` (append `-2` if collision).
```

## Related skills

| Skill                         | When                                                  |
| ----------------------------- | ----------------------------------------------------- |
| `security-audit` | After archive — Plan Mode + Build for new cycle       |
| `archive-tech-debt-audit`     | Parallel pattern for tech debt (different checklist)  |
| `sync-context-md`             | After archive — update planning brief audit reference |
| `pre-release-review`          | Ongoing PR checks — not a substitute for archiving    |

## Typical end-of-cycle flow

```
/security-audit   → Plan + Build → SECURITY_AUDIT.md
[fix findings in separate work]
[mark [x] on resolved findings in SECURITY_AUDIT.md]
/archive-security-audit       → move to archive/security-audits/
/sync-context-md              → optional planning brief update
```

## Tech debt vs security archive (quick compare)

|                | Tech debt                                    | Security                               |
| -------------- | -------------------------------------------- | -------------------------------------- |
| Live file      | `TECH_DEBT_AUDIT.md`                         | `SECURITY_AUDIT.md`                    |
| Archive dir    | `archive/tech-debt-audits/`                  | `archive/security-audits/`             |
| Blocks archive | Findings table rows, Quick wins `[ ]`, Top 5 | `- [ ]` under Critical/High/Medium/Low |
| Does not block | Open questions                               | Deferred risk, Human follow-ups        |
