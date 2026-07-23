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
   `Draft` to `Planning`. Epics and stories are not yet written in.
2. **Ready** — PM sign-off flips `Planning` to `Ready`; `phase-planning` writes
   the numbered epics and vertical-slice stories in at this flip.
3. **Active** — `kickoff-phase` flips `Ready` to `Active` and creates the phase
   branch in the same pass, before any epic is planned. Only
   one phase should be `Active` at a time in practice.
4. **Shipped** — `ship-phase` flips the PRD and ROADMAP row to `Shipped` in the
   same pass, **moves the file to [archive/](archive/)**, and updates the
   ROADMAP PRD column to the archived path.

## What a PRD is — and isn't

- **Forward intent**, in product terms. The problem, the goal, the observable
  outcome that proves the phase worked.
- **No file paths, no code snippets.** They go stale fast and turn a forward spec
  into a brittle as-built record — the exact lifecycle-mixing this restructure
  exists to kill. As-built truth lives in [AGENTS.md](../../AGENTS.md); history lives in the
  frozen archive.
- Epics and stories are added by `phase-planning` when the PRD goes `Ready` —
  that skill owns their shape (vertical-slice stories carrying a deliverable,
  epic-level success criteria, and epic sizing).

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
front-loaded speculatively.

## Naming & filenames

- One file per phase, keyed by phase number: `phase-N-short-slug.prd.md`
  (e.g. `phase-8-tech-debt-remediation.prd.md`).
- The `.prd.md` double extension marks the type at a glance and still renders as
  markdown everywhere.
- The phase number keeps the PRD ↔ `ROADMAP.md` phase mapping obvious.
