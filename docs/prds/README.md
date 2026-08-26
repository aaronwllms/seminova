# Product Requirement Docs

A **PRD** captures the forward intent for a single phase: the problem, the goal,
and what's in and out of scope. One PRD per phase. PRDs are **disposable** —
they describe where a phase is *going*, not what was *built*; once shipped, a PRD
is a record of intent, not a maintained spec.

This directory is the per-phase document going forward. Each phase gets its own
file with its own lifecycle.

## Lifecycle

Status vocabulary — what `Draft`, `Planning`, `Ready`, `Active`, and `Shipped`
mean — is authoritative in
[DOC_RULES.md › Phase status vocabulary](../DOC_RULES.md#phase-status-vocabulary).
This section covers only the mechanics: who flips each status and where the
file moves. The ROADMAP row mirrors the PRD status at all times; while a phase
is in flight, the file lives in `docs/prds/`.

1. **Planning** — `phase-planning` creates the PRD; the ROADMAP row flips from
   `Draft` to `Planning`. The file holds whatever has settled so far — epics
   and stories included, as far as they've been shaped — so a session can end
   without losing work. Nothing in it is locked.
2. **Ready** — PM sign-off flips `Planning` to `Ready`; `phase-planning`
   removes the phase's stub from ROADMAP's **Upcoming phases** section in the
   same pass (the locked PRD now owns the phase's scope). Every epic carries
   success criteria and every story a deliverable; no open questions remain.
3. **Active** — `kickoff-phase` flips `Ready` to `Active` and creates the phase
   branch in the same pass, before any epic is planned. Only
   one phase should be `Active` at a time in practice.
4. **Shipped** — `ship-phase` flips the PRD and ROADMAP row to `Shipped` in the
   same pass, **moves the file to [archive/](archive/)**, and updates the
   ROADMAP PRD column to the archived path.

## Sections

Every PRD carries this header and these sections:

```markdown
# PRD — Phase N: <Name>

**Status:** Planning | Ready | Active | Shipped
**Last updated:** YYYY-MM-DD

---

## Problem
## Goal
## Success
## Out of scope

---

## Epics & stories

---

## Notes
```

- **Problem** — what's wrong today, in product terms, and who it's wrong for. A
  phase promoted from an idea that carried a brief folds that brief's *Problem*,
  *Who it's for*, and *Why now* into this section, as one statement rather than
  three.
- **Goal** — what this phase does about it, and the organizing principle behind
  the approach.
- **Success** — the observable outcome that proves the phase worked, at phase
  level. Distinct from the epic-level success criteria under **Epics &
  stories**, which are each epic's done bar: every epic's criteria can pass while
  the phase still misses its outcome.
- **Out of scope** — what was considered and deliberately excluded, with the
  reason. A rejected option recorded here is one nobody re-proposes. Options
  a brief rejected under its *Decided* section land here, one line each; the
  product-shape decisions it confirmed land in the story each one constrains.
- **Epics & stories** — written in by `phase-planning`; partial while the PRD
  is at `Planning`, complete at `Ready`.
- **Notes** — sequencing constraints between epics, ADR candidates, and anything
  that fits no other section.

> [!NOTE]
> PRDs archived before Phase 20 predate the **Success** section and don't carry
> one. They're frozen records of intent — left as shipped, never retrofitted to a
> template written after them.

## What a PRD is — and isn't

- **Forward intent**, in product terms — where the phase is going, not what was
  built.
- **No file paths, no code snippets.** They go stale fast and turn a forward spec
  into a brittle as-built record — the exact lifecycle-mixing this restructure
  exists to kill. As-built truth lives in the code and `supabase/migrations/`; history lives in the
  frozen archive.
- **`phase-planning` owns the shape of epics and stories** — vertical-slice
  stories carrying a deliverable, epic-level success criteria, and epic sizing.

## Planning models

Two valid approaches — the skill supports both:

- **One-at-a-time** (default): plan a phase only when it's next to build. The
  PRD moves `Planning → Ready → Active` in quick succession.
- **Batch planning**: plan several phases ahead, leaving each PRD at `Ready`
  until its turn. The ROADMAP may have multiple `Ready` rows before one goes
  `Active`.

## Where PRDs sit in the flow

[ROADMAP.md](../../ROADMAP.md) holds **thin** phase stubs — the planning horizon. A phase is
grilled into a PRD only **when it's its turn** (or when deliberately planning
ahead). Grilling is most accurate close to the work, so PRDs should not be
front-loaded speculatively. A stub may carry open questions specific to that
phase; `phase-planning` resolves them during decomposition and the resolutions
land in the PRD. Ideas that aren't committed to a phase at all live in
[BACKLOG.md](../../BACKLOG.md), not ROADMAP.

## Naming & filenames

- One file per phase, keyed by phase number: `phase-N-short-slug.prd.md`
  (e.g. `phase-8-tech-debt-remediation.prd.md`).
- The `.prd.md` double extension marks the type at a glance and still renders as
  markdown everywhere.
- The phase number keeps the PRD ↔ `ROADMAP.md` phase mapping obvious.
