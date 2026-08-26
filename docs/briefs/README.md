# Product Briefs

A **brief** captures an idea's justification while the idea is still
uncommitted: the problem, who it's for, why now, and what success looks like.
It is written by `write-product-brief` during exploration and consumed by
`phase-planning` when the idea becomes a phase.

Briefs are **consumed, not archived.** When `phase-planning` locks a phase at
`Ready`, it folds the brief into the PRD and deletes it — in the same pass that
removes the ROADMAP stub and the `BACKLOG.md` entry. Nothing accumulates here,
and there is never a second copy of the same context to fall out of date.

## Sections

Every brief carries this header and these seven sections:

```markdown
# Brief — <Idea name>

**Status:** Exploring | Settled
**Anchor:** [BACKLOG.md § Idea name](../../BACKLOG.md#idea-name)
**Last updated:** YYYY-MM-DD

## Problem
## Who it's for
## Why now
## Decided
## Sketch
## What success looks like
## Open questions
```

- **Status** — `Exploring` while the idea is still being worked over;
  `Settled` when it's ready to become a phase. `phase-planning` ingests only
  `Settled` briefs, so a half-formed one can't be mistaken for a finished one.
- **Anchor** — a link to the idea's `BACKLOG.md` entry. Every brief anchors to
  an entry, never to a ROADMAP stub: `Draft` phases renumber, and a stub link
  would go stale on the next promotion. The entry carries the reciprocal link,
  `**Brief:** [docs/briefs/<slug>.brief.md](...)`, directly under its `##`
  heading. Both directions, so neither side orphans silently.

  Promotion doesn't change the anchor: a promoted entry survives in
  `BACKLOG.md` until its PRD locks at `Ready`, and keeps pointing here.
  `Status` above tracks the idea's maturity — this field doesn't.
- **Decided** — product-shape decisions and rejected options that exploration
  settled: what the feature does and doesn't do from the user's side, and why.
  `phase-planning` surfaces each one for confirmation rather than re-opening it;
  a confirmed decision lands in the story it constrains, and a rejected option
  lands in the PRD's `Out of scope`. Technical shape — which platform layer,
  which mechanism, where the config lives — is not a Decided item. It belongs in
  Sketch, because the phase grill settles it close to the work.
- **Sketch** — the solution as currently imagined, and the one section that
  doesn't survive. `phase-planning` refines the shape; the sketch is an input to
  that, not intent to be honoured.
- **Open questions** — what hasn't settled. As a question resolves, its answer
  moves into the body and the question leaves this section, so what remains is
  live rather than a list mostly already answered.

## What a brief is — and isn't

- **Justification, not specification.** Why this is worth building, for whom,
  and how we'd know it worked. Epics, stories, and acceptance criteria belong to
  the PRD.
- **No out-of-scope list.** What's excluded is a product of grilling, decided
  during decomposition. Writing one before exploring narrows the idea early and
  is stale by the time `phase-planning` reads it. Rejected options recorded
  under Decided are different: they were considered and dropped during
  exploration, and recording them keeps them from being re-proposed.
- **No file paths, no code snippets in the body** — same rule as PRDs, and it
  bites harder here: a brief can sit for months before it's ingested, and any
  path in it will be wrong by then. The header's `Anchor` link is exempt: it
  points at a planning doc, not at code, and it's what keeps the brief
  findable.

## Brief and entry: one home for the substance

A `BACKLOG.md` entry carries **Notes** or a **Brief** pointer, never both. An
idea starts as an entry — What, Why backlog, and Notes as it accumulates
constraints, findings, and rejected options. When the idea earns a brief,
`write-product-brief` absorbs the entry's Notes into the brief's sections and
trims the entry to What, Why backlog, and the `**Brief:**` line, in the same
write. From then on the brief is the idea's substance and the entry is its
index card.

A brief is optional. An idea can live in `BACKLOG.md` as an entry alone, be
promoted without one, and be planned without one.

## Lifecycle

1. **Written** — `write-product-brief` creates the brief at `Exploring` and adds
   the reciprocal `**Brief:**` link to its anchor, in the format above. If the
   idea has no `BACKLOG.md` entry yet, the skill writes one first.
2. **Explored** — the brief is revisited and rewritten as thinking develops.
   Sections fill in; open questions resolve and drop out.
3. **Settled** — the user flips `Status` when the idea is ready to become a
   phase.
4. **Consumed** — at the `Ready` flip, `phase-planning` reads the brief into
   the new PRD, deletes the brief file, and deletes the anchor entry in the same
   pass. While the PRD sits at `Planning`, the brief survives: it is still the
   home for the idea's open questions until every one is answered.

An idea abandoned before step 4 takes its brief with it: deleting an entry that
carries a `**Brief:**` line deletes the brief file in the same edit. Nothing
automates this — it's a hand edit, so read the entry's heading block before
removing it.

## Naming & filenames

- One file per idea, keyed by slug: `<slug>.brief.md`
  (e.g. `multi-tenancy.brief.md`).
- **Keyed by idea, never by phase number.** Draft phases get renumbered
  routinely as priorities shift; a brief named for a phase would need renaming
  every time. The slug is stable because the idea is.
- The `.brief.md` double extension marks the type at a glance and still renders
  as markdown everywhere.
