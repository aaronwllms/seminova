# Tech Debt Audit — Reference

Human documentation for installing, using, and maintaining this skill. The agent reads [SKILL.md](SKILL.md) only when `/tech-debt-audit` is invoked.

## Installation

**Project install** (recommended — shared with the repo):

```bash
# Already at .cursor/skills/tech-debt-audit/ when copied with the portable .cursor stack
```

**Personal install** (available across all projects):

```bash
mkdir -p ~/.cursor/skills/tech-debt-audit
cp .cursor/skills/tech-debt-audit/SKILL.md ~/.cursor/skills/tech-debt-audit/
cp .cursor/skills/tech-debt-audit/reference.md ~/.cursor/skills/tech-debt-audit/
```

Project-level skills in `.cursor/skills/` override or complement personal skills for that repo.

## Usage

In **Agent mode**, in the repo you want audited:

```
/tech-debt-audit
```

Output goes to `TECH_DEBT_AUDIT.md` in the repo root. First run takes 5–20 minutes depending on repo size; subsequent runs in repeat-run mode are faster.

Optional scoping for very large repos:

```
/tech-debt-audit src/payments
```

## Philosophy

Most "code review" prompts produce a bulleted list of generic best-practice violations dressed up as findings. This skill avoids that failure mode with three design choices:

**Forced orientation before judgment.** Phase 1 isn't optional decoration. Without a real mental model of the architecture, every Phase 2 finding is just pattern-matching against generic heuristics. Reading `git log` for churn data surfaces the files that _actually_ have debt versus the files that just look messy.

**File citations on every finding.** A finding without a citation is a vibe. Vibes don't get fixed.

**The "looks bad but is actually fine" section is required.** Forcing the model to surface the calls it considered making and chose not to separates a real audit from a checklist regurgitation. If that section is empty, the audit is shallow.

The skill also forbids recommending rewrites and forbids padding categories — both common LLM failure modes.

## Related skills

| Skill                         | When to use instead                                                              |
| ----------------------------- | -------------------------------------------------------------------------------- |
| `pre-release-review`          | Before a PR — scoped diff, quality gates, manual test checklist                  |
| `security-audit` | Full-repo security audit via Plan Mode → Build                                   |
| `sync-repo-docs`              | AGENTS.md / README drift after a feature                                         |
| `sync-context-md`             | Planning brief drift after a phase                                               |
| `sync-tech-debt-audit`        | Incremental TECH_DEBT_AUDIT.md refresh after shipped work or refactor-cleaner    |
| `archive-tech-debt-audit`     | Archive to `archive/tech-debt-audits/` when all findings resolved                |
| `archive-security-audit`      | Archive to `archive/security-audits/` when actionable security findings resolved |

## Adaptation notes

**Project-level overrides.** A `.cursor/skills/tech-debt-audit/SKILL.md` in a specific repo overrides a global copy. Useful when a project needs custom dimensions — e.g. prompt injection surface area for LLM apps.

**Mid-audit course correction.** After Phase 1 completes, interrupt with: _"Before Phase 2, tell me what surprised you in Phase 1 and what you want to investigate that isn't in the dimensions list."_

**Tuning severity calibration.** Edit the Phase 2 dimensions list to add explicit thresholds. Example: change "god files (>500 LOC)" to ">800 LOC" if your codebase has a higher baseline.

**Adding categories.** The 9 dimensions are a starting point. Add domain-specific ones — accessibility for frontend, IaC drift for infra, prompt versioning for LLM apps.

**Splitting supporting files.** As this skill grows, extract sections into sibling files and reference them from SKILL.md.

## Limitations

- Static audit, not a penetration test — catches obvious security hygiene, not threat modeling
- Won't catch business-logic bugs without domain knowledge
- Can't tell intentional simplicity from accidental simplicity — use "open questions"
- Very large repos (>200k LOC) may need module scoping

## Credits

Adapted from [ksimback/tech-debt-skill](https://github.com/ksimback/tech-debt-skill) for Cursor Agent Skills. MIT.
