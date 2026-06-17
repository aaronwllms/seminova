# Archive Cursor plans — reference

## Live vs archived

| State              | Path                              | Used by                                 |
| ------------------ | --------------------------------- | --------------------------------------- |
| **Active plans**   | `.cursor/plans/*.plan.md`         | Plan Mode, Build, epic work in progress |
| **Archived plans** | `.cursor/plans/archive/*.plan.md` | Historical reference, cross-plan links  |

`.cursor/plans/` is repo-specific — do not copy to new projects (see `.cursor/README.md`).

## Archive filename collision

Cursor plan basenames include a hash suffix (e.g. `phase_11_epic_1_4c6bfc90.plan.md`), so collisions are rare.

If `archive/{basename}` already exists:

```
phase_11_epic_1_4c6bfc90.plan.md   → exists
phase_11_epic_1_4c6bfc90-2.plan.md → use next free suffix
```

Prefer reporting the collision to the user over silently overwriting.

## Link patterns that break after move

Plans and docs often link with repo-root paths:

```markdown
[Epic plan](.cursor/plans/foo_abc123.plan.md)
```

After move, correct path is `.cursor/plans/archive/foo_abc123.plan.md`.

**Already valid** — links that already use `archive/`:

```markdown
[Old epic](.cursor/plans/archive/phase_10_epic_1_ba153f3c.plan.md)
```

## Selective mode — name matching heuristics

When matching plans to a shipped phase without an explicit list:

| Signal            | Example                                                 |
| ----------------- | ------------------------------------------------------- |
| Filename prefix   | `phase_11_epic_*` for Phase 11 epics                    |
| AGENTS.md section | "Phase 11 Epic N" shipped → archive matching plan files |
| User list         | Exact basenames or slug without hash                    |

When unsure, show the candidate list and wait for confirmation.

## git mv

```bash
git mv .cursor/plans/foo.plan.md .cursor/plans/archive/foo.plan.md
```

Preserves history. Use plain `mv` only when not in a git repo or file is untracked.
