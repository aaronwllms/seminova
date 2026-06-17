---
name: refactor-cleaner
description: >-
  Post-audit hands-off dead code cleanup. User invokes after /tech-debt-audit.
  Delegates to the refactor-cleaner subagent to act on TECH_DEBT_AUDIT.md
  findings and commit in batches. Use when the user runs /refactor-cleaner or
  asks for hands-off cleanup after a tech debt audit. Does not auto-invoke.
  Not for use during active feature development.
disable-model-invocation: true
---

# Refactor Cleaner (skill → subagent)

Thin entry point for **hands-off cleanup** after a tech debt audit. This skill does **not** do the cleanup itself — it validates prerequisites and **delegates to the `refactor-cleaner` subagent** via the Task tool.

**Agent mode required.** Do not run in Ask mode.

**Prerequisite:** Run `/tech-debt-audit` first and review `TECH_DEBT_AUDIT.md`.

**Not the same as:**

- **`/tech-debt-audit`** — produces the audit report only; no code removal
- **Main agent ad-hoc cleanup** — use this skill so batch commits follow [git-workflow.mdc](../../rules/git-workflow.mdc) subagent exception

Subagent definition: [.cursor/agents/refactor-cleaner.md](../../agents/refactor-cleaner.md)

---

## Workflow

### 1. Hard stop checks

Before delegating:

1. Confirm **`TECH_DEBT_AUDIT.md`** exists at repo root. If missing, stop and tell the user to run `/tech-debt-audit` first.
2. If the user has uncommitted feature work or is mid-epic, warn and ask for confirmation before proceeding.
3. Parse optional scope from the user's message (e.g. "Quick wins only", "F001–F010"). Default: full audit-driven cleanup starting with Quick wins → Top 5 → SAFE items.

### 2. Delegate to subagent

Use the **Task** tool:

```
subagent_type: refactor-cleaner
prompt: |
  User invoked /refactor-cleaner for hands-off cleanup. This authorizes batch commits.

  Scope: [Quick wins only | specific finding IDs | full audit-driven cleanup — from step 1]

  Read TECH_DEBT_AUDIT.md and AGENTS.md locked rules.
  Follow .cursor/agents/refactor-cleaner.md workflow:
  - Work audit findings only
  - Remove in batches (deps → exports → files → duplicates)
  - Run pnpm type-check, pnpm lint, pnpm test:ci after each batch
  - Commit after each passing batch (refactor:/chore:, cite finding IDs)
  - Update TECH_DEBT_AUDIT.md with RESOLVED items
  - Never push unless user asks separately
  - Report summary when done
```

If the Task tool is unavailable, tell the user to use Agent mode with a model that supports subagent delegation (Cursor 2.4+).

### 3. After delegation

When the subagent completes, give the user a brief summary: batches committed, finding IDs resolved, deferred items, and suggested manual verification.

If the subagent did not fully refresh summary sections, suggest **`/sync-tech-debt-audit`** to consolidate Quick wins, Top 5, and executive summary.

Do **not** duplicate cleanup work in the main agent if the subagent succeeded.

---

## Typical flow

```
/tech-debt-audit          → TECH_DEBT_AUDIT.md (review)
/refactor-cleaner         → hands-off cleanup + batch commits
```

Optional scope: `/refactor-cleaner Quick wins only` or `/refactor-cleaner F001 F042`
