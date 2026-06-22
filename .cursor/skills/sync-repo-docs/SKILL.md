---
name: sync-repo-docs
description: >-
  Audits recent code and git changes against AGENTS.md and README.md, then
  proposes or applies minimal doc updates so repo truth stays accurate. Use when
  finishing feature work, before merge, after shipping a phase, when the user
  asks to sync/update/refresh AGENTS.md or README.md, or when docs may be stale.
---

# Sync AGENTS.md & README.md

Keep [AGENTS.md](../../AGENTS.md) and [README.md](../../README.md) aligned with what the repo actually does. AGENTS.md is **agent repo truth**; README.md is **human onboarding**. Do not duplicate `.cursor/rules/` content.

## When to run

- End of a feature or bugfix that changed behavior, routes, schema, env, or scripts
- User says: sync docs, update AGENTS, refresh README, keep docs current
- Before opening a PR when product behavior or setup changed
- After merging migrations or adding product routes

Skip when changes are purely internal refactors with no user-facing or agent-guardrail impact.

## Workflow

Copy and track:

```
Doc sync progress:
- [ ] Step 1: Gather evidence of recent work
- [ ] Step 2: Diff docs vs reality
- [ ] Step 3: Classify each gap (AGENTS / README / neither)
- [ ] Step 4: Propose minimal edits (locked rules mirror-only per change protocol)
- [ ] Step 5: Apply edits and summarize what changed
```

### Step 1 — Gather evidence

Inspect **recent work**, not the whole codebase. Prefer the smallest window that covers the change:

| Source                                                                | What to look for                                |
| --------------------------------------------------------------------- | ----------------------------------------------- |
| Current conversation                                                  | Features shipped, routes added, rules discussed |
| `git log --oneline -20` and `git diff main...HEAD` (or unstaged diff) | Commits and file changes                        |
| `src/app/`                                                            | New or renamed routes, redirects                |
| Auth middleware / proxy (discover in repo)                            | Auth defaults, public vs protected paths        |
| `supabase/migrations/`                                                | New tables, columns, RLS policy changes         |
| `package.json` scripts                                                | New/changed/removed commands                    |
| `.env.example` (if present)                                           | New required env vars                           |
| `src/services/`, `src/components/`                                    | Major feature surfaces (only if user-visible)   |

Do **not** treat `.cursor/plans/` or planning archives as shipped truth unless code confirms it.

### Step 2 — Diff docs vs reality

Read current [AGENTS.md](../../AGENTS.md) and [README.md](../../README.md). For each evidence item, ask: **Is this already documented accurately?**

Common drift patterns:

- New route not listed under product routes (or equivalent section)
- Feature shipped but "implemented" / shipped bullets unchanged
- Migration count or data-model summary stale
- New `pnpm` script missing from README scripts table
- New env var documented in neither README nor `.env.example`
- Post-login default or auth boundary changed in code but not in locked rules

### Step 3 — Classify gaps

Use [reference.md](reference.md) for section ownership. Quick rules:

| Update                                                                                 | Target doc                                                   |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Locked rules, implemented features, routes, data model, agent checklist                | **AGENTS.md**                                                |
| Stack, prerequisites, env setup, scripts table, contributing hooks, doc map for humans | **README.md**                                                |
| Coding style, testing policy, migrations how-to                                        | **`.cursor/rules/`** — not these docs                        |
| Phase archive / planning detail                                                        | **Planning brief or archive doc** — only if explicitly asked |

**Neither doc:** refactors, test-only changes, internal renames with no behavioral change.

### Step 4 — Propose minimal edits

Follow AGENTS.md **change protocol** if present:

- **Locked rules** — mirror a locked-rule change already made via AGENTS.md change protocol; never initiate one
- Everything else: apply concise, factual updates that match existing tone and structure

Editing principles:

- **Minimal diff** — update only stale lines; do not rewrite unrelated sections
- **Factual** — describe what exists today, not roadmap
- **No duplication** — README points to AGENTS.md for agent rules; AGENTS.md points to README for env vars
- **Preserve tables and bullets** — match existing formatting
- **Count migrations** from `supabase/migrations/*.sql`, not memory

### Step 5 — Apply and report

After editing (or after proposing locked-rule changes):

1. Summarize **what drift was found** and **what was updated**
2. Call out **intentional non-updates** (e.g., internal refactor, planned but unshipped)
3. Remind the user if **`.env.example`** should also be updated for new env vars
4. Do **not** commit unless the user asks

## Output format

When reporting to the user:

```markdown
## Doc sync summary

### Drift found

- [bullet per gap, with evidence source]

### Updates applied

- AGENTS.md: [sections touched, or "none"]
- README.md: [sections touched, or "none"]

### Needs your decision

- [locked-rule drift to mirror via change protocol, or scope changes awaiting approval, or "none"]

### Left unchanged (and why)

- [optional — e.g., plan-only work not shipped]
```

## Anti-patterns

- Do not add features to "implemented" sections based on plans alone
- Do not move coding standards into AGENTS.md (use `.cursor/rules/`)
- Do not inflate README with agent guardrails already in AGENTS.md
- Do not change locked rules — never initiate; mirror only per AGENTS.md change protocol
- Do not run `pnpm db:push` or edit generated `database.types.ts` as part of doc sync

## Additional resources

- Section ownership and audit checklist: [reference.md](reference.md)
