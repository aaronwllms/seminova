---
name: archive-research
description: >-
  Moves served research briefs from docs/research/ into docs/research/archive/
  (user @-attached files only). Invoke with /archive-research.
disable-model-invocation: true
---

# Archive research

Move **active** research briefs from [`docs/research/`](../../../docs/research/)
into [`docs/research/archive/`](../../../docs/research/archive/). Archived briefs
are **frozen** — `/research` never refreshes them, and they are never deleted.

**Not the same as:**

- **`research`** — investigates a question; writes or refreshes active briefs in
  `docs/research/` ([`research/SKILL.md`](../research/SKILL.md))
- **ADR** — immutable committed decisions ([`docs/adr/`](../../../docs/adr/))
- **`ship-phase`** — PRD lifecycle; does not touch research briefs

## Input — @-mention required

Targets come **only** from files the user **@-attached** in the same message as
`/archive-research`.

Optional in the same message: a short **archived because** reason (recorded on
each moved file).

## Workflow

```
Archive research progress:
- [ ] Step 1: Collect @-attached targets; halt if none
- [ ] Step 2: Validate each file (active RESEARCH-*.md only)
- [ ] Step 3: Inbound-link scan (report only)
- [ ] Step 4: Stamp archive metadata and git mv to docs/research/archive/
- [ ] Step 5: Report moved, skipped, and link warnings
```

### Step 1 — Collect targets

From the user's invocation message, collect every **@-attached** file path.

Do **not** accept typed paths, filenames, or IDs as a substitute, and do not
infer targets from prose, open editors, or prior chat turns. If zero
attachments → halt:

> Attach one or more active briefs with `@` and re-run `/archive-research`.

### Step 2 — Validate

For each attached path:

| Check | Pass | Fail — skip with reason |
| ----- | ---- | ----------------------- |
| Basename matches `RESEARCH-[0-9]{4}-*.md` | ✓ | Not a research brief |
| Under `docs/research/` root (not `archive/`, not `README.md`) | ✓ | Already archived or wrong file |
| File exists on disk | ✓ | Missing path |

If every attachment fails validation → halt with a summary; nothing to move.

Deduplicate by basename before moving.

### Step 3 — Inbound-link scan (report only)

Before moving, search the repo for references to each basename, excluding the
brief itself:

```bash
rg 'RESEARCH-NNNN-short-slug\.md' --glob '!docs/research/archive/**' --glob '!docs/research/RESEARCH-NNNN-short-slug.md'
```

(Replace with each file's actual basename.)

Report matches — **do not auto-rewrite** links unless the user asks. The user
may update dependents in a follow-up.

### Step 4 — Stamp and move

For each validated file:

1. Prepend archive metadata immediately after the `# RESEARCH-NNNN: …` title
   line (before `**Researched:**`):

   ```markdown
   **Archived:** YYYY-MM-DD

   **Archived because:** <reason from user message, or omit line if none given>
   ```

2. Ensure `docs/research/archive/` exists (create if missing).

3. **Move** with `git mv` when in a git repo; otherwise `mv`:

   ```bash
   git mv docs/research/<basename> docs/research/archive/<basename>
   ```

4. Do **not** edit brief body beyond the archive stamp.
5. Do **not** change `RESEARCH-NNNN` numbers or filenames.
6. Do **not** delete anything — archive only.

### Step 5 — Report

```markdown
## Research archive summary

### Moved (N)

- `RESEARCH-0001-….md` → `docs/research/archive/RESEARCH-0001-….md`

### Skipped (N)

- [path — reason]

### Inbound link warnings

- [file referencing moved basename, or "none"]

### Reminders

- Global `RESEARCH-NNNN` numbering still counts archived IDs — never reuse
- Archived briefs are in [`.cursorindexingignore`](../../../.cursorindexingignore) — excluded from @Codebase search, still readable via @-mention ([`.cursor/README.md` › Ignore files](../../../.cursor/README.md#ignore-files-repo-root))
```

Do **not** commit unless the user asks.

## Related

- Active brief rules: [`docs/research/README.md`](../../../docs/research/README.md)
- Write discipline: [DOC_RULES.md rule 11](../../../docs/DOC_RULES.md)
