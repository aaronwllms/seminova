---
name: sync-context-md
description: >-
  Audits recent code and decisions against the planning brief (CONTEXT.md +
  append-only CONTEXT_ARCHIVE.md), then proposes or applies minimal updates.
  Use when finishing feature work, shipping a phase, after planning decisions,
  when the user asks to sync/update/refresh the planning brief, or before
  external planning sessions.
---

# Sync planning brief (CONTEXT.md + CONTEXT_ARCHIVE.md)

Keep the repo **planning brief** aligned with shipped reality and current planning state. The brief is for PM / external planning chats — **not** agent repo truth (that lives in [AGENTS.md](../../AGENTS.md)).

Pair with [sync-repo-docs](../sync-repo-docs/SKILL.md) when implementation truth (AGENTS.md / README.md) may also be stale.

## Two-file model

| File                     | Role                                                                                                                                                    | Edit policy                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| **`CONTEXT.md`**         | Living brief — vision, locked rules, AI architecture (§6), migration/RPC notes (§7), roadmap, ACTIVE, DRAFT, open questions; schema detail in AGENTS.md | Normal read/write during sync                                      |
| **`CONTEXT_ARCHIVE.md`** | Shipped phase epic narratives + resolved decision log                                                                                                   | **Append-only** — never rewrite or delete existing archive entries |

## Discover the planning brief

1. Check AGENTS.md **documentation map** for `CONTEXT.md` and `CONTEXT_ARCHIVE.md`
2. If not listed, use root `CONTEXT.md` + `CONTEXT_ARCHIVE.md` when present (exclude `node_modules`)
3. If no `CONTEXT.md` exists, report that and stop — do not invent a path

## When to touch which file

**Routine sync** (feature shipped, open question resolved, status bump):

- Edit **`CONTEXT.md` only** — status line, roadmap row, ACTIVE/DRAFT, open questions, section 6 if prompt shipped, section 7 migration count/planning notes if migration shipped (table detail → **sync-repo-docs** → AGENTS.md)
- Do **not** open `CONTEXT_ARCHIVE.md` unless archiving a phase or moving resolved history

**Phase ships in full** (or PM confirms epic list moves to archive):

1. **`CONTEXT_ARCHIVE.md`** — APPEND new `## Phase N` section at end (after existing phases)
2. **`CONTEXT.md`** — REMOVE shipped content from ACTIVE; update Status + Roadmap; clear ACTIVE or point to next Draft phase
3. **Optional:** suggest **`/archive-cursor-plans`** if PM wants `.cursor/plans/` cleared (mechanical plan file move — not part of this skill)

## Archive rules (`CONTEXT_ARCHIVE.md`)

- **Append only** — add new `## Phase N` blocks at the **end**, in chronological order
- **Never edit** existing archived phase sections (no rewrites, corrections in place, or deletions)
- **Never move** content out of the archive back into `CONTEXT.md`
- If archived text is wrong, add a dated correction note as a **new append** under that phase (or ask PM) — do not mutate the original block
- Bump `CONTEXT_ARCHIVE.md` **Last updated** when appending; bump `CONTEXT.md` **Last updated** when editing living sections
- Resolved open-question one-liners (`Resolved (date):` bullets) **append** to `## Resolved decisions` at the end of `CONTEXT_ARCHIVE.md`, not inline in `CONTEXT.md`

## When to run

- End of feature work that changed product behavior, routes, nav, or phase status
- User says: sync CONTEXT, update planning brief, refresh context doc
- Before opening an external planning session and the brief may be outdated
- After a PM decision that resolves an open question or changes roadmap scope
- After marking a phase complete or moving draft → in progress

Skip when changes are internal refactors, tests-only, or plan-only work with nothing shipped.

## Workflow

```
Planning brief sync:
- [ ] Step 1: Gather evidence of recent work
- [ ] Step 2: Read CONTEXT.md (living brief) and diff vs reality
- [ ] Step 3: Classify each gap — which file owns it?
- [ ] Step 4: Propose minimal edits (locked rules & roadmap need approval)
- [ ] Step 5: Apply edits
      - CONTEXT.md only → routine updates
      - Phase complete → append CONTEXT_ARCHIVE.md FIRST, then trim CONTEXT.md
- [ ] Step 6: Summarize both files touched in output
```

### Step 1 — Gather evidence

Inspect **recent work**, not the whole repo. Prefer the smallest window that covers the change:

| Source                                             | What to look for                                          |
| -------------------------------------------------- | --------------------------------------------------------- |
| Current conversation                               | Features shipped, decisions made, open questions resolved |
| `git log --oneline -20` and `git diff main...HEAD` | Commits and behavioral changes                            |
| [AGENTS.md](../../AGENTS.md)                       | Current repo truth for routes, features, locked rules     |
| `src/app/`, auth middleware/proxy                  | Routes, auth boundary, post-login default                 |
| `supabase/migrations/`                             | Schema changes                                            |
| `.cursor/plans/`                                   | **Planning intent only** — do not treat as shipped        |

**AGENTS.md is the source of truth for what shipped.** If AGENTS.md and code disagree, flag drift; do not invent features from plans alone.

### Step 2 — Diff planning brief vs reality

Read the current planning brief. For each evidence item, ask: **Is this already documented accurately in the right section?**

Common drift patterns (adapt section names to the file's structure):

- **Last updated** / **Status** stale after shipping work
- **Shipped / implemented summary** missing new routes, nav, or feature bullets
- **Locked rules** out of sync with AGENTS.md locked rules
- **Open questions** still lists a decision that was made
- **Roadmap / phase status** wrong (e.g. still `Draft` when work started)
- Future-phase detail updated from code when only current phase shipped

### Step 3 — Classify gaps

Use [reference.md](reference.md) for generic section ownership. Map to whatever headings exist in the project's planning brief.

### Step 4 — Propose minimal edits

**Requires product-owner approval before editing:**

- **Locked rules** — any product rule that also lives in AGENTS.md
- **Roadmap / phase status** — promoting a phase from `Draft` to `In progress` or `Complete`
- **Vision / target user** — core product positioning
- **Removing or rewriting future-phase epics** — scope cuts or reprioritization

**Safe to apply without approval** (factual, shipped-only):

- **Last updated** date (ISO `YYYY-MM-DD`, use conversation system date)
- Shipped-summary bullets that mirror AGENTS.md "Implemented now" (or equivalent)
- **Open questions** — note resolution with date when PM confirmed in conversation
- Typos and broken links

Editing principles:

- **Minimal diff** — touch only stale lines; preserve tone
- **Planning voice** for future work; factual shipped list for current phase
- **No duplication of AGENTS.md** — brief summary only; link to AGENTS.md for detail
- **Do not** expand future-phase detail from unshipped `.cursor/plans/` alone

### Step 5 — Apply and report

After editing (or after proposing approval-gated changes):

1. Set **Last updated** on each file touched when that field exists and content changed
2. Summarize drift found and updates applied (list `CONTEXT.md` and `CONTEXT_ARCHIVE.md` separately)
3. If AGENTS.md or README.md also look stale, suggest running **sync-repo-docs**
4. Do **not** commit unless the user asks

## Output format

```markdown
## Planning brief sync summary

### Drift found

- [bullet per gap, with evidence source]

### Updates applied

- CONTEXT.md: [sections touched, or "none"]
- CONTEXT_ARCHIVE.md: [appended Phase N / Resolved decisions, or "none — routine sync only"]

### Needs your decision

- [locked rules, roadmap, or vision changes awaiting approval, or "none"]

### Related docs

- [AGENTS.md / README.md drift noted, or "none"]

### Left unchanged (and why)

- [optional — e.g., plan-only, future phase draft untouched]
```

## Anti-patterns

- Do not mark future-phase stories as shipped from plans or partial spikes
- Do not paste AGENTS.md verbatim — planning brief is for humans/planning, not agent rules
- Do not change locked rules silently — mirror AGENTS.md only after explicit approval
- Do not rewrite vision/target-user sections without PM direction
- Do not run `pnpm db:push` or edit generated types as part of doc sync
- Do not treat `.cursor/plans/` as shipped truth
- Do not add new `# ARCHIVE` sections inside `CONTEXT.md`
- Do not edit or delete existing content in `CONTEXT_ARCHIVE.md`
- Do not duplicate full phase epic lists in both files — living brief gets status/roadmap summary only; epic detail lives in archive
- Do not skip `CONTEXT_ARCHIVE.md` when a phase is marked complete

## Additional resources

- Section ownership and audit checklist: [reference.md](reference.md)
