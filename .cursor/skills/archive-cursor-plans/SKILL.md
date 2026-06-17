---
name: archive-cursor-plans
description: >-
  Moves completed Cursor plan files from .cursor/plans/ into
  .cursor/plans/archive/. Use when the user asks to archive plans, clean the
  plans folder, or after a phase ships (often after /sync-context-md). Supports
  bulk move-all or selective archive by phase or explicit list.
disable-model-invocation: true
---

# Archive Cursor plans

Move **live** Cursor plan files from [`.cursor/plans/`](../../plans/) into [`.cursor/plans/archive/`](../../plans/archive/).

**Not the same as:**

- **`sync-context-md`** — updates `CONTEXT.md` / `CONTEXT_ARCHIVE.md` (semantic phase archive)
- **`sync-repo-docs`** — updates `AGENTS.md` / `README.md` from shipped code
- **`plan-next-epic`** — creates new plans (Plan Mode); does not move old ones

Plans are **repo-specific planning history** — not shipped truth. See AGENTS.md and `.cursor/README.md`.

## When to run

- User says: archive plans, clean plans folder, move plans to archive
- End of a phase after `/sync-context-md` when PM wants an empty active plans folder
- Before a major planning push when old epic plans should be retired

Do **not** run as part of routine doc sync — invoke explicitly.

## Modes

Determine mode from the user's request:

| Mode               | When                                                  | What moves                                 |
| ------------------ | ----------------------------------------------------- | ------------------------------------------ |
| **Bulk** (default) | User says "all", "everything", or does not specify    | Every `*.plan.md` in `.cursor/plans/` root |
| **Selective**      | User names a phase, epic list, or specific plan files | Only matching plans                        |

**Selective sources** (use the smallest set that matches intent):

1. Explicit filenames or plan titles from the user
2. Plans whose names match a shipped phase/epic in `CONTEXT.md` ACTIVE/archived sections or `AGENTS.md` "Implemented now"
3. Ask the user to confirm the list before moving if ambiguous

If **bulk** and the user might still have in-progress work, list root plans and confirm before moving unless they already said "move all".

## Workflow

```
Archive plans progress:
- [ ] Step 1: List candidates in .cursor/plans/ (exclude archive/)
- [ ] Step 2: Resolve mode and confirm list if bulk or ambiguous
- [ ] Step 3: Move files to .cursor/plans/archive/
- [ ] Step 4: Report moved, skipped, and stale link warnings
- [ ] Step 5: Suggest next steps (optional /sync-context-md already done)
```

### Step 1 — List candidates

```bash
# Root plans only — never re-move archive/
ls .cursor/plans/*.plan.md 2>/dev/null
```

- **Include:** files matching `.cursor/plans/*.plan.md`
- **Exclude:** `.cursor/plans/archive/**` and any other subdirectories

If zero candidates, stop — nothing to archive.

### Step 2 — Confirm list

**Bulk:** Proceed when user asked for all/everything; otherwise show count + filenames and confirm.

**Selective:** Show the resolved list; stop if empty.

### Step 3 — Move to archive

For each plan file:

1. Target: `.cursor/plans/archive/{basename}`
2. If basename already exists in archive, use `-2`, `-3`, … before `.plan.md` (see [reference.md](reference.md))
3. **Move** with `git mv` when in a git repo; otherwise `mv`
4. Do **not** copy and leave duplicates in root
5. Do **not** edit plan contents, AGENTS.md, README, or CONTEXT unless the user asks

Optional prepend (only if user asks for dated archive headers):

```markdown
**Archived:** YYYY-MM-DD
```

Default: move files as-is — plans already carry Cursor metadata.

### Step 4 — Stale link check (report only)

After moves, search for references to old root paths:

```bash
rg '\.cursor/plans/[a-z0-9_]+\.plan\.md' --glob '!.cursor/plans/archive/**'
```

Report files that still link to moved basenames. **Do not auto-rewrite** links unless the user asks — archived plans and historical docs may keep broken paths intentionally.

Cross-plan links between moved files remain valid relative to each other once all targets moved together; links from **unmoved** plans or docs to moved paths may break.

### Step 5 — Report

```markdown
## Cursor plans archive summary

### Mode

- [bulk / selective — criteria]

### Moved (N)

- `foo.plan.md` → `.cursor/plans/archive/foo.plan.md`
- …

### Skipped (N)

- [duplicate / not in scope / user excluded — with reason]

### Stale link warnings

- [file:line referencing moved plan, or "none"]

### Next steps

- Start next epic: `/plan-next-epic` (Plan Mode)
- Planning brief still stale: `/sync-context-md`
- Repo truth stale: `/sync-repo-docs`
```

Do **not** commit unless the user asks.

## Typical phase-close sequence

1. `/sync-context-md` — append phase to `CONTEXT_ARCHIVE.md`, trim `CONTEXT.md`
2. `/sync-repo-docs` — if AGENTS.md / README drifted
3. **`/archive-cursor-plans`** — clear active plans folder

## Anti-patterns

- Do not move files already under `.cursor/plans/archive/`
- Do not overwrite an existing archive file — use `-2` suffix
- Do not treat plans as shipped truth when updating AGENTS.md or README
- Do not bulk-move without user intent when selective criteria were given
- Do not rewrite `.cursor/plans/archive/` history or delete plans — archive only

## Additional resources

- Duplicate filenames and link patterns: [reference.md](reference.md)
