# Product Requirement Docs

A **PRD** captures the forward intent for a single phase: the problem, the goal,
and what's in and out of scope. One PRD per phase. PRDs are **disposable** —
they describe where a phase is *going*, not what was *built*; once shipped, a PRD
is a record of intent, not a maintained spec.

This directory is the per-phase document going forward. The single "active phase"
concept from the old `CONTEXT.md` dissolves here — each phase gets its own file
with its own lifecycle.

## Lifecycle

A PRD's **status** flips in place; the file never moves.

1. **Draft** — intent only. The phase exists as a thin stub on `ROADMAP.md`;
   the PRD holds the problem and rough scope, not yet decomposed.
2. **Active** — the phase is being built. Run through `phase-planning` to flesh
   the PRD into epics and stories (each story a vertical slice with a success
   condition). This file is where that decomposition lives while work is in flight.
3. **Shipped** — the phase is done. Flip status to `Shipped`. **The file stays
   in `docs/prds/`.** Do **not** move it to `docs/archive/` — that location holds
   only the frozen pre-restructure history. Going forward, the shipped PRD *is*
   the per-phase record.

Mark the phase shipped on `ROADMAP.md` in the same pass.

## What a PRD is — and isn't

- **Forward intent**, in product terms. The problem, the goal, the observable
  outcome that proves the phase worked.
- **No file paths, no code snippets.** They go stale fast and turn a forward spec
  into a brittle as-built record — the exact lifecycle-mixing this restructure
  exists to kill. As-built truth lives in `AGENTS.md`; history lives in the
  frozen archive.
- Epics and stories are added by `phase-planning` when the PRD goes Active —
  that skill owns their shape (vertical slice + success condition + epic sizing).

## Where PRDs sit in the flow

`ROADMAP.md` holds **thin** phase stubs — the planning horizon. A phase is
grilled into a full PRD only **when it's its turn**; grilling is most accurate
close to the work, so PRDs are not front-loaded in a batch.

## Naming & filenames

- One file per phase, keyed by phase number: `phase-N-short-slug.prd.md`
  (e.g. `phase-8-tech-debt-remediation.prd.md`).
- The `.prd.md` double extension marks the type at a glance and still renders as
  markdown everywhere.
- The phase number keeps the PRD ↔ `ROADMAP.md` phase mapping obvious.
