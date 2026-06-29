# Product Requirement Docs

A **PRD** captures the forward intent for a single phase: the problem, the goal,
and what's in and out of scope. One PRD per phase. PRDs are **disposable** —
they describe where a phase is *going*, not what was *built*; once shipped, a PRD
is a record of intent, not a maintained spec.

This directory is the per-phase document going forward. Each phase gets its own
file with its own lifecycle.

## Lifecycle

A PRD's **status** flips before archive; the ROADMAP row for the phase mirrors
the PRD status at all times. While a phase is in flight, the file lives in
`docs/prds/`. When shipped, it **moves** to `docs/prds/archive/` — it does not
stay in `docs/prds/`.

`Draft` is a ROADMAP-only status — it means no PRD exists yet. Once a PRD is
created, the phase leaves `Draft` and the PRD carries the status from there.

1. **Planning** — PRD created; intent and scope are being shaped. The ROADMAP row
   flips from `Draft` to `Planning` when the PRD file is created. Epics and
   stories are not yet written in.
2. **Ready** — PRD is locked and approved to build. PM sign-off required to flip
   from `Planning` to `Ready`. The decomposition into epics and vertical-slice
   stories happens here, written in by `phase-planning`.
3. **Active** — the phase is being built. Only one phase should be `Active` at a
   time in practice. ROADMAP row reflects `Active`. File remains in `docs/prds/`.
4. **Shipped** — the phase is done. Flip status to `Shipped` in the PRD and on
   ROADMAP in the same pass, then **move the file to `docs/prds/archive/`** and
   update the ROADMAP PRD column to `docs/prds/archive/phase-N-slug.prd.md`. Do
   **not** move it to `docs/archive/` — that location holds only the frozen
   pre-restructure history.

## What a PRD is — and isn't

- **Forward intent**, in product terms. The problem, the goal, the observable
  outcome that proves the phase worked.
- **No file paths, no code snippets.** They go stale fast and turn a forward spec
  into a brittle as-built record — the exact lifecycle-mixing this restructure
  exists to kill. As-built truth lives in `AGENTS.md`; history lives in the
  frozen archive.
- Epics and stories are added by `phase-planning` when the PRD goes `Ready` —
  that skill owns their shape (vertical slice + success condition + epic sizing).

## Planning models

Two valid approaches — the skill supports both:

- **One-at-a-time** (default): plan a phase only when it's next to build. The
  PRD moves `Planning → Ready → Active` in quick succession.
- **Batch planning**: plan several phases ahead, leaving each PRD at `Ready`
  until its turn. The ROADMAP may have multiple `Ready` rows before one goes
  `Active`.

## Where PRDs sit in the flow

`ROADMAP.md` holds **thin** phase stubs — the planning horizon. A phase is
grilled into a PRD only **when it's its turn** (or when deliberately planning
ahead). Grilling is most accurate close to the work, so PRDs should not be
front-loaded speculatively.

## Naming & filenames

- One file per phase, keyed by phase number: `phase-N-short-slug.prd.md`
  (e.g. `phase-8-tech-debt-remediation.prd.md`).
- The `.prd.md` double extension marks the type at a glance and still renders as
  markdown everywhere.
- The phase number keeps the PRD ↔ `ROADMAP.md` phase mapping obvious.
