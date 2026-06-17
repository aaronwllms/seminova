# Sync tech debt audit — reference

## Document role

| Artifact               | Audience                     | Owns                                                                      |
| ---------------------- | ---------------------------- | ------------------------------------------------------------------------- |
| **TECH_DEBT_AUDIT.md** | PM, agents, refactor-cleaner | Cited findings, severity, effort, Quick wins, Top 5, open questions       |
| **AGENTS.md**          | Agents                       | Repo truth — doc-drift findings (F003-style) resolve when AGENTS is fixed |
| **`.cursor/plans/`**   | Planning                     | Epic scope referencing finding IDs — not shipped truth                    |

## TECH_DEBT_AUDIT.md section map

| Section                                    | Update when…                                                         |
| ------------------------------------------ | -------------------------------------------------------------------- |
| `Generated:`                               | Any content in the file changed                                      |
| Executive summary                          | High/Medium finding RESOLVED or NEW; quality-gate test count changes |
| Architectural mental model                 | Major layer or route change (rare in incremental sync)               |
| Findings table                             | Finding verified RESOLVED, stale, or NEW from recent work            |
| Top 5                                      | Item completed; promote next open high-impact finding                |
| Quick wins                                 | Checkbox matches verified fix                                        |
| Things that look bad but are actually fine | Recent change looks like debt but is intentional                     |
| Open questions                             | PM decision or code change answers a question                        |

## Finding status conventions

### RESOLVED in table

Append to Description or Recommendation column:

```text
RESOLVED (2026-06-02): generate-recipe-skills.ts deleted; no imports remain.
```

Or move row to appendix at file bottom:

```markdown
## Resolved (historical)

| ID   | Resolved   | Note                                    |
| ---- | ---------- | --------------------------------------- |
| F001 | 2026-06-02 | Action file deleted in Phase 7.5 Epic 1 |
```

Prefer inline `RESOLVED` for ≤10 items; appendix when table grows noisy.

### NEW findings

- Continue ID sequence (last ID + 1)
- Prefix Description with `NEW:` for first sync cycle
- Only add when recent work **introduced** material debt — not from backlog discovery

### Stale row updates

| Field       | Common drift                                  |
| ----------- | --------------------------------------------- |
| File:Line   | File moved, line shifted — re-read and update |
| Description | LOC count, import count, test file name       |
| Severity    | Usually unchanged unless scope grew/shrank    |

## Verification checklist by category

### Dead code

- [ ] `rg` symbol name across `src/` — zero importers
- [ ] File deleted or export removed
- [ ] No dynamic import / string reference

### Test debt

- [ ] Co-located test file exists
- [ ] Tests cover user-visible behavior (not just import smoke)
- [ ] Finding asked for specific scenarios — spot-check test names/assertions

### Documentation drift

- [ ] Read cited AGENTS.md / CONTEXT.md lines
- [ ] If fixed → RESOLVED audit row + run **sync-repo-docs** if AGENTS not yet updated
- [ ] If audit wrong but code fixed → stale row only

### Dependency / config

- [ ] `pnpm audit` output for advisory ID
- [ ] `package.json` version satisfies recommendation
- [ ] `vitest.config.ts` / CI workflow for coverage thresholds

### Architectural decay (LOC)

- [ ] `wc -l` on cited file
- [ ] Update Description LOC; split/refactor recommendations only if still >500 LOC

### Security hygiene

- [ ] Re-read cited route/policy code
- [ ] Cross-check `SECURITY_AUDIT.md` if finding references prior security audit

## Audit checklist (by change type)

### Deleted dead code / server action

- [ ] RESOLVED dead-code finding(s)
- [ ] Check Quick wins for matching `[ ]` items
- [ ] Update executive summary bullet if it mentioned orphaned actions
- [ ] F045-style cross-refs (security audit lists actions)

### Added tests for untested orchestrator

- [ ] RESOLVED test-debt finding(s)
- [ ] Check Top 5 if item listed there
- [ ] Quick wins `[x]`

### Dependency upgrade (Vitest, etc.)

- [ ] RESOLVED dependency rows if advisory cleared
- [ ] Re-run `pnpm test:ci` if verifying — agents use `pnpm test:ci` only

### Doc-only fix (AGENTS.md)

- [ ] RESOLVED doc-drift findings in audit
- [ ] Prefer **sync-repo-docs** for the doc edit; this skill updates audit state

### refactor-cleaner batch

- [ ] Read subagent summary for finding IDs
- [ ] Merge duplicate RESOLVED markers
- [ ] Refresh Quick wins and Top 5 in one pass

## When to escalate to full audit

Suggest `/tech-debt-audit` instead of sync when:

- No `TECH_DEBT_AUDIT.md` exists
- `Generated:` is >90 days old and many sections feel wrong
- Sync would add **>5 NEW** findings (recent work uncovered systemic issues)
- Architectural mental model no longer matches the product
- Major new subsystem shipped (whole new domain layer) with no prior findings

## Related skills

| Skill                     | When                                                                          |
| ------------------------- | ----------------------------------------------------------------------------- |
| `tech-debt-audit`         | Full repo health check; initial or quarterly audit                            |
| `archive-tech-debt-audit` | After all findings resolved — move audit to `archive/tech-debt-audits/`       |
| `archive-security-audit`  | After actionable findings resolved — move audit to `archive/security-audits/` |
| `refactor-cleaner`        | Hands-off cleanup after audit; commits + RESOLVED markers                     |
| `sync-repo-docs`          | AGENTS.md / README drift                                                      |
| `sync-context-md`         | Planning brief drift                                                          |
