# Archive tech debt audit — reference

## Live vs archived

| State                 | Path                                                     | Used by                                                |
| --------------------- | -------------------------------------------------------- | ------------------------------------------------------ |
| **Live backlog**      | `TECH_DEBT_AUDIT.md` (repo root)                         | `/refactor-cleaner`, `/sync-tech-debt-audit`, planning |
| **Archived snapshot** | `archive/tech-debt-audits/tech-debt-audit-YYYY-MM-DD.md` | History, phase retros, agent context                   |

## Parsing the Findings table

The **Findings** section is a markdown table starting with `| ID |`.

**Open finding:** any row with an `F###` ID in the Findings table (not in Resolved appendix).

**Resolved finding:** row appears only under `## Resolved` appendix, or Findings table is empty.

Common mistake: Quick wins all `[x]` but Findings table still lists F011–F056 — **not archivable**.

## Parsing Quick wins

- `[ ]` → blocks archive
- `[x]` → OK
- Lines without checkboxes → ignore

## Parsing Top 5

Block archive if any numbered item lacks a done marker, e.g.:

- ✅ `Done (Phase 7.5 Epic 5)`, `(resolved)`, `RESOLVED`
- ❌ Action-only text with no completion note

If Top 5 lists finding IDs still in the Findings table, those block archive regardless of wording.

## Archive filename collision

```bash
# Prefer date from audit Generated: line
ARCHIVE="archive/tech-debt-audits/tech-debt-audit-2026-06-02.md"
# If exists:
ARCHIVE="archive/tech-debt-audits/tech-debt-audit-2026-06-02-2.md"
```

## tech-debt-audits/README.md template

If the folder has no README, create:

```markdown
# Tech debt audit archives

Dated snapshots from **`/archive-tech-debt-audit`** when all findings were resolved.

| Live audit | `TECH_DEBT_AUDIT.md` at repo root |
| Archive | This folder |
| New cycle | `/tech-debt-audit` |

Naming: `tech-debt-audit-YYYY-MM-DD.md` (append `-2` if collision).
```

## Related skills

| Skill                  | When                                                   |
| ---------------------- | ------------------------------------------------------ |
| `sync-tech-debt-audit` | Before archive — ensure Resolved appendix matches code |
| `tech-debt-audit`      | After archive — start next cycle                       |
| `refactor-cleaner`     | Before archive — clear remaining quick wins            |
| `sync-context-md`      | After archive — update planning brief audit reference  |

## Typical end-of-cycle flow

```
/refactor-cleaner              → fix remaining SAFE items
/sync-tech-debt-audit          → mark RESOLVED, empty Findings table
/archive-tech-debt-audit       → move to tech-debt-audits/
/sync-context-md               → optional planning brief update
```
