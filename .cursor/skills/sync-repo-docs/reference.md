# Sync repo docs — reference

## Document roles

| Document             | Audience                 | Owns                                                                                                                 |
| -------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| **AGENTS.md**        | Cursor / coding agents   | Repo truth, locked rules, what's implemented, data model summary, where code lives, merge checklist, change protocol |
| **README.md**        | Humans cloning the repo  | Product pitch, stack, prerequisites, env vars, scripts table, import alias, contributing/hooks, doc map              |
| **.cursor/rules/**   | Agents (style & process) | How to write code, test, migrate — not product truth                                                                 |
| **Planning archive** | PM / planning            | Vision and phase specs — path varies by repo; not agent truth                                                        |

## AGENTS.md section map (typical — adapt to each repo)

| Section                        | Update when…                                              |
| ------------------------------ | --------------------------------------------------------- |
| Documentation map              | New top-level doc agents should know about                |
| Setup and quality commands     | New/changed quality or install commands in `package.json` |
| Locked rules (each subsection) | **Product decision only** — follow change protocol        |
| Implemented / shipped          | Shipped user-facing features, product routes, nav         |
| Data model (summary)           | New tables/columns, ownership changes                     |
| Where things live              | New top-level `src/` directories or major relocations     |
| Checklist before merging       | New merge gate tied to product rules (rare)               |
| Change protocol                | Rare — only if the governance process itself changes      |

## README.md section map

| Section                | Update when…                                            |
| ---------------------- | ------------------------------------------------------- |
| Opening paragraph      | Core product loop or phase status changes for humans    |
| Stack                  | Major dependency additions (framework, DB, test runner) |
| Prerequisites          | Node version (`.nvmrc`), pnpm, Supabase setup changes   |
| Environment            | New/changed `.env.local` variables                      |
| Scripts table          | Any `package.json` script added, renamed, or removed    |
| Troubleshooting        | New common setup failure modes worth documenting        |
| Import paths           | Alias changes in `tsconfig`                             |
| Contributing & quality | Husky hook behavior or CI workflow changes              |
| Documentation table    | New human-facing docs worth linking                     |

## Audit checklist (by change type)

### New product route

- [ ] AGENTS.md → implemented → product routes
- [ ] AGENTS.md → locked rules → auth (if public/protected boundary changed)
- [ ] README opening paragraph if it names primary sections
- [ ] Verify auth middleware/proxy matches documented boundary

### Database migration

- [ ] AGENTS.md → migration count
- [ ] AGENTS.md → data model table (new table, column, or ownership)
- [ ] AGENTS.md → locked rules → RLS if policies added/changed
- [ ] Do not claim migration is applied — user runs `pnpm db:push`

### New env variable

- [ ] README → Environment section
- [ ] `.env.example` if the repo maintains one
- [ ] AGENTS.md only if the var affects agent behavior (rare)

### New npm/pnpm script

- [ ] README → Scripts table
- [ ] AGENTS.md → Setup and quality commands (if it's a standard pre-finish command)

### Shipped feature (UI/behavior)

- [ ] AGENTS.md → implemented → feature bullets (concise, user-facing)
- [ ] README opening paragraph only if it changes the core loop description

### Auth or default route change

- [ ] AGENTS.md → locked rules → auth (**approval required**)
- [ ] Verify redirect logic in auth middleware/proxy

### Locked product rule change (any domain)

- [ ] AGENTS.md → relevant locked-rules subsection (**approval required**)
- [ ] Planning brief locked rules if sync-context-md applies

## Evidence commands

Run as needed during Step 1:

```bash
git log --oneline -20
git diff main...HEAD --stat
git diff --stat
ls supabase/migrations/
ls src/app/
```

For unstaged work only: `git diff` and `git status`.

## Examples

### Example A — New authenticated route

**Evidence:** New page under `src/app/`; auth boundary unchanged.

**Updates:**

- AGENTS.md → add route to product routes
- AGENTS.md → feature bullet if new capability
- README → only if opening paragraph lists primary nav sections

**Skip:** Locked rules (no auth boundary change).

### Example B — New table + migration

**Evidence:** New file in `supabase/migrations/`

**Updates:**

- AGENTS.md → bump migration count
- AGENTS.md → data model row with ownership
- AGENTS.md → RLS locked rule if ownership model is novel

**Skip:** README (no human setup change).

### Example C — Internal refactor only

**Evidence:** Extract hook from component; no route/schema/env change.

**Updates:** None. Report "Left unchanged — internal refactor, no repo-truth drift."
