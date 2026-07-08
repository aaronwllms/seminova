# Sync repo docs — reference

## Document roles

See [DOC_RULES.md](../../../docs/DOC_RULES.md) for the canonical document-roles table.

## AGENTS.md section map (typical — adapt to each repo)

| Section                        | Update when…                                              |
| ------------------------------ | --------------------------------------------------------- |
| Doc-roles pointer (was: map)   | AGENTS.md only points to docs/DOC_RULES.md; register new top-level docs there, not here |
| Setup and quality commands     | New/changed quality or install commands in `package.json` |
| Hard constraints (each bullet) | Mirror a hard-constraint change already made via change protocol (enforcement + AGENTS list together) — never initiate |
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

## DESIGN.md section map

| Section                     | Update when…                                              |
| --------------------------- | --------------------------------------------------------- |
| Structure vs theme lists    | Token name/grouping added, or the re-skinnable set changes in `globals.css` |
| Token groups tables         | A token is added, removed, or renamed in `globals.css` (names only — never copy values) |
| Typography table            | Font family or `next/font` wiring changes in `layout.tsx` |
| Default theme               | Theme provenance or `components.json` `baseColor` changes |
| Re-skinning steps           | The re-skin workflow itself changes                       |

## `.cursor/rules/README.md` section map

| Section                          | Update when…                                              |
| -------------------------------- | --------------------------------------------------------- |
| Rule count + rule-files table    | A `.mdc` file is added, removed, or renamed               |
| Mode / Globs columns             | A rule's `alwaysApply` or `globs` changes (reclassification) |
| Per-rule detail (details blocks) | A rule's purpose or scope materially changes              |

## Audit checklist (by change type)

### New product route

- [ ] AGENTS.md → implemented → product routes
- [ ] AGENTS.md → hard constraints → auth (if public/protected boundary changed)
- [ ] README opening paragraph if it names primary sections
- [ ] Verify auth middleware/proxy matches documented boundary

### Database migration

- [ ] AGENTS.md → migration count
- [ ] AGENTS.md → data model table (new table, column, or ownership)
- [ ] AGENTS.md → hard constraints / RLS guidance if policies added/changed
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

- [ ] Mirror hard-constraint change via AGENTS.md change protocol if auth boundary changed (never initiate)
- [ ] Verify redirect logic in auth middleware/proxy

### Hard constraint change (any domain)

- [ ] Mirror a hard-constraint change already made via AGENTS.md change protocol (enforcement + list together) — never initiate

### New or reclassified Cursor rule

- [ ] `.cursor/rules/README.md` → rule-files table row (add/remove/rename)
- [ ] Mode + Globs columns match the `.mdc` frontmatter
- [ ] Per-rule detail block if purpose/scope changed
- [ ] Row count equals the actual `.mdc` file count in `.cursor/rules/`

### Token or theme change

- [ ] DESIGN.md → token group table (name add/remove/rename)
- [ ] DESIGN.md → typography or default-theme if fonts or `baseColor` changed
- [ ] Values stay in `globals.css` — DESIGN.md names tokens, never values

## Evidence commands

Run as needed during Step 1:

```bash
git log --oneline -20
git diff main...HEAD --stat
git diff --stat
ls supabase/migrations/
ls src/app/
ls .cursor/rules/
```

For unstaged work only: `git diff` and `git status`.

## Examples

### Example A — New authenticated route

**Evidence:** New page under `src/app/`; auth boundary unchanged.

**Updates:**

- AGENTS.md → add route to product routes
- AGENTS.md → feature bullet if new capability
- README → only if opening paragraph lists primary nav sections

**Skip:** Hard constraints (no auth boundary change).

### Example B — New table + migration

**Evidence:** New file in `supabase/migrations/`

**Updates:**

- AGENTS.md → bump migration count
- AGENTS.md → data model row with ownership
- AGENTS.md → hard constraints / RLS if ownership model is novel

**Skip:** README (no human setup change).

### Example C — Internal refactor only

**Evidence:** Extract hook from component; no route/schema/env change.

**Updates:** None. Report "Left unchanged — internal refactor, no repo-truth drift."
