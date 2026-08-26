---
name: archive-research
description: >-
  Retires served research briefs to docs/research/archive/ and repaths links.
  @-attach the briefs in the same message.
disable-model-invocation: true
---

# Archive research

Move **active** research briefs from [`docs/research/`](../../../docs/research/)
into [`docs/research/archive/`](../../../docs/research/archive/).

Archived briefs are **frozen**: [`/research`](../research/SKILL.md) never
refreshes them, and nothing here deletes them. The one sanctioned edit to a
frozen brief is a link repath (Step 4).

**Agent mode required** — this skill moves and edits files.

## Input — @-mention required

Targets are exactly the files the user **@-attached** in the same message as
`/archive-research`, and nothing else.

Optional in the same message: a short **archived because** reason (recorded on
each moved file).

## Workflow

```
Archive research progress:
- [ ] Step 1: Collect @-attached targets; halt if none
- [ ] Step 2: Validate each file (active RESEARCH-*.md only)
- [ ] Step 3: Stamp archive metadata and git mv to docs/research/archive/
- [ ] Step 4: Repath inbound and outbound links
- [ ] Step 5: Verify every reference resolves to a post-archive path
- [ ] Step 6: Report moved, skipped, and repathed
```

### Step 1 — Collect targets

Collect every @-attached file path from the invocation message. If zero
attachments → halt:

> Attach one or more active briefs with `@` and re-run `/archive-research`.

### Step 2 — Validate

For each attached path:

| Check | Pass | Fail — skip with reason |
| ----- | ---- | ----------------------- |
| Basename matches `RESEARCH-[0-9]{4}-.+\.md` | ✓ | Not a research brief |
| Sits directly under `docs/research/` (not `archive/`, not `README.md`) | ✓ | Already archived or wrong file |
| File exists on disk | ✓ | Missing path |

Deduplicate by basename. If a validated basename already exists in
`docs/research/archive/`, halt and report it — `RESEARCH-NNNN` numbers are
never reused, so a collision means the numbering is already broken and needs
resolving before anything moves.

If every attachment fails validation → halt with a summary; nothing to move.

### Step 3 — Stamp and move

For each validated file:

1. Prepend archive metadata immediately after the `# RESEARCH-NNNN: …` title
   line (before `**Researched:**`):

   ```markdown
   **Archived:** YYYY-MM-DD

   **Archived because:** <reason from user message, or omit line if none given>
   ```

2. Ensure `docs/research/archive/` exists (create if missing).

3. Move:

   ```bash
   git mv docs/research/<basename> docs/research/archive/<basename>
   ```

Beyond this stamp and the Step 4 repaths, leave the brief as written.

### Step 4 — Repath

**Resolve, then rewrite.** For each reference, work out which file it pointed at
before the move, then write the path that reaches that file from wherever the
reference now lives.

Substituting `docs/research/` → `docs/research/archive/` as a string gets
relative links wrong in both directions. A sibling brief already in `archive/`
referencing this one drops from `../RESEARCH-NNNN-….md` to
`RESEARCH-NNNN-….md`; a link inside the moved brief reading `../adr/X.md`
becomes `../../adr/X.md`.

Both directions are in scope, and both are rewritten automatically — a
reference left on the pre-archive path is broken, so there is no case to
confirm first.

**Inbound** — references elsewhere in the repo pointing at the moved brief:

```bash
rg -l 'RESEARCH-NNNN-short-slug\.md' --glob '!docs/research/archive/RESEARCH-NNNN-short-slug.md'
```

(Replace with each file's actual basename.) `docs/research/archive/` is
**in scope** apart from the moved brief itself: an already-archived brief
linking to this one breaks the same way any other file does, and repathing it
is a sanctioned edit to a frozen file.

**Outbound** — relative links inside the moved brief. It now sits one directory
deeper, so every link that resolved from `docs/research/` resolves from
`docs/research/archive/`.

Leave alone: absolute URLs, bare `#anchors`, and repo-root-relative paths
naming a file other than the moved brief — their depth never changed.

### Step 5 — Verify

Done when both hold, per moved brief:

1. A repo-wide basename search returns hits only on post-archive paths:

   ```bash
   rg 'RESEARCH-NNNN-short-slug\.md'
   ```

   Every hit must resolve to
   `docs/research/archive/RESEARCH-NNNN-short-slug.md` from the directory of
   the file containing it. This is the same search Step 4 used to find inbound
   references, so a reference Step 4 missed surfaces here — including relative
   links that never spell out `docs/research/`.

2. Every relative link inside the moved brief resolves to a file that exists,
   checked from `docs/research/archive/`.

A path that resolves to nothing is a Step 4 error — fix it here rather than
reporting it.

### Step 6 — Report

```markdown
## Research archive summary

### Moved (N)

- `RESEARCH-0001-….md` → `docs/research/archive/RESEARCH-0001-….md`

### Skipped (N)

- [path — reason]

### Repathed (N)

- `path/to/file` — inbound link → archive path
- `docs/research/archive/RESEARCH-0001-….md` — N relative links repathed
```

Do **not** commit unless the user asks.

## Related

- Active brief rules: [`docs/research/README.md`](../../../docs/research/README.md)
- Write discipline: [DOC_RULES.md rule 11](../../../docs/DOC_RULES.md)
