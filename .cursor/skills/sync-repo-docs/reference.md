# Sync repo docs — reference

## Document roles

See [DOC_RULES.md](../../../docs/DOC_RULES.md) for the canonical document-roles table.

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

- [ ] README opening paragraph if it names primary sections
- [ ] Verify auth middleware/proxy matches documented boundary
- [ ] Report if public/protected boundary changed but AGENTS.md hard-constraint list was not updated in the same change

### Database migration

- [ ] Do not claim migration is applied — user runs `pnpm db:push`

### New env variable

- [ ] README → Environment section
- [ ] `.env.example` if the repo maintains one

### New npm/pnpm script

- [ ] README → Scripts table

### Shipped feature (UI/behavior)

- [ ] README opening paragraph only if it changes the core loop description

### Auth or default route change

- [ ] Report auth-boundary drift if AGENTS.md hard-constraint list not updated with enforcement change
- [ ] Verify redirect logic in auth middleware/proxy

### Hard constraint change (any domain)

- [ ] Report-only — list updates ride with enforcement per AGENTS.md change protocol; this skill does not edit AGENTS.md

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

- README → only if opening paragraph lists primary nav sections

**Skip:** Hard constraints (no auth boundary change).

### Example B — New table + migration

**Evidence:** New file in `supabase/migrations/`

**Updates:** None for this skill's targets.

**Skip:** README (no human setup change).

### Example C — Internal refactor only

**Evidence:** Extract hook from component; no route/schema/env change.

**Updates:** None. Report "Left unchanged — internal refactor, no doc drift."
