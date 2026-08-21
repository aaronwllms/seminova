---
name: sync-repo-docs
description: >-
  Audits recent code and git changes against README.md, DESIGN.md, and the
  rules index, then proposes or applies minimal doc updates when those docs
  drift. Use when finishing feature work, before merge, after shipping a phase,
  when the user asks to sync/update/refresh README or related docs, or when
  docs may be stale.
---

# Sync repo docs

Keep the repo's **human- and design-facing docs** aligned with what the code actually does — [README.md](../../README.md) (human onboarding), [DESIGN.md](../../DESIGN.md) (token architecture ↔ `globals.css`), and [`.cursor/rules/README.md`](../../.cursor/rules/README.md) (rule-file index ↔ `.cursor/rules/*.mdc`). Do not duplicate `.cursor/rules/` guidance content. Do not edit [AGENTS.md](../../AGENTS.md) — hard-constraint list updates ride with enforcement changes per AGENTS.md change protocol, not via this skill.

## When to run

- End of a feature or bugfix that changed env, scripts, tokens, or rule files
- User says: sync docs, update README, refresh DESIGN, keep docs current
- Before opening a PR when setup, theming, or rule inventory changed
- After adding, removing, or reclassifying a `.cursor/rules/*.mdc` file
- After token or theme changes in `globals.css`, `components.json`, or font wiring in `layout.tsx`

Skip when changes are purely internal refactors with no README/DESIGN/rules-index impact.

## Workflow

Copy and track:

```
Doc sync progress:
- [ ] Step 1: Gather evidence of recent work
- [ ] Step 2: Diff docs vs reality
- [ ] Step 3: Classify each gap (route to the owning doc, or neither)
- [ ] Step 4: Propose minimal edits
- [ ] Step 5: Apply edits and summarize what changed
```

### Step 1 — Gather evidence

Inspect **recent work**, not the whole codebase. Prefer the smallest window that covers the change:

| Source                                                                | What to look for                                |
| --------------------------------------------------------------------- | ----------------------------------------------- |
| Current conversation                                                  | Env/scripts, tokens, rules discussed            |
| `git log --oneline -20` and `git diff main...HEAD` (or unstaged diff) | Commits and file changes                        |
| `package.json` scripts                                                | New/changed/removed commands                    |
| `.env.example` (if present)                                           | New required env vars                           |
| `src/app/globals.css`, `components.json`, `src/app/layout.tsx`        | Token names/groups, `baseColor`, font wiring — DESIGN.md truth |
| `.cursor/rules/*.mdc`                                                 | Rule files added/removed or mode/glob changed — rules-README index |
| Auth middleware / proxy (discover in repo)                            | Auth boundary drift — report only, do not edit AGENTS.md |

Do **not** treat `.cursor/plans/` or planning archives as shipped truth unless code confirms it.

### Step 2 — Diff docs vs reality

Read the relevant target doc(s) — README.md, DESIGN.md, or `.cursor/rules/README.md`. For each evidence item, ask: **Is this already documented accurately?**

Common drift patterns:

- New `pnpm` script missing from README scripts table
- New env var documented in neither README nor `.env.example`
- DESIGN.md token group or re-skin step no longer matches `globals.css` / `components.json`
- `.cursor/rules/README.md` rule table (row count or mode/glob columns) out of sync with the actual `.mdc` files
- Post-login default or auth boundary changed in code but not reflected in AGENTS.md hard constraints — **report only** under Needs your decision; the feature agent updates the list with the enforcement change

### Step 3 — Classify gaps

Use [reference.md](reference.md) for section ownership. Quick rules:

| Update                                                                                 | Target doc                                                   |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Stack, prerequisites, env setup, scripts table, contributing hooks, doc map for humans | **README.md**                                                |
| Token names/groups, re-skin workflow, theme provenance                                 | **DESIGN.md**                                                |
| Rule-file index — name, mode, glob, purpose (not the rule guidance itself)             | **`.cursor/rules/README.md`**                                |
| Coding style, testing policy, migrations how-to                                        | **`.cursor/rules/`** — not these docs                        |
| Hard constraints, implemented features, routes, data model                             | **Neither** — report auth-boundary drift; list updates ride with enforcement per change protocol |
| Phase / planning detail                                                                | **ROADMAP / active PRD** — only if explicitly asked          |

**Neither doc:** refactors, test-only changes, internal renames with no behavioral change.

### Step 4 — Propose minimal edits

Apply concise, factual updates that match existing tone and structure. Do not edit AGENTS.md.

Editing principles:

- **Minimal diff** — update only stale lines; do not rewrite unrelated sections
- **Factual** — describe what exists today, not roadmap
- **No duplication** — README points to AGENTS.md for agent governance; AGENTS.md points to README for env vars
- **Preserve tables and bullets** — match existing formatting

### Step 5 — Apply and report

After editing (or when only report-only gaps were found):

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

- [one line per touched doc — README.md, DESIGN.md, or `.cursor/rules/README.md` — with sections touched; omit docs left untouched]

### Needs your decision

- [hard-constraint / auth-boundary drift to fix via change protocol in the same change as enforcement, or scope changes awaiting approval, or "none"]

### Left unchanged (and why)

- [optional — e.g., plan-only work not shipped]
```

## Anti-patterns

- Do not edit AGENTS.md — not a sync target
- Do not move coding standards into README (use `.cursor/rules/`)
- Do not run `pnpm db:push` or edit generated `database.types.ts` as part of doc sync

## Related workflow

- After applying factual edits, chain [`github-docs-authoring`](../github-docs-authoring/SKILL.md) to confirm the touched docs still render on GitHub — this skill fixes facts, not formatting.

## Additional resources

- Section ownership and audit checklist: [reference.md](reference.md)
