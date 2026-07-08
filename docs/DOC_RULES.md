# DOC_RULES — File Management Rules

**Purpose:** Invariant doc-maintenance procedure governing the planning docs ([ROADMAP.md](../ROADMAP.md), the PRDs in [prds/](prds/), and the frozen [archive/](archive/)). This is not project state — it applies to every product built from this template. Governs the planning skills (`phase-planning`, `plan-next-epic`, `mark-epic-complete`, `ship-phase`) and the repo-sync skill (`sync-repo-docs`).

**Last updated:** 2026-07-08

---

## Document roles

This table is authoritative. [AGENTS.md](../AGENTS.md) carries a one-line pointer here rather than duplicating it.

| Document | Audience | Owns |
| -------- | -------- | ---- |
| **[README.md](../README.md)** | Humans cloning + external | Project pitch and positioning; setup, scripts, env |
| **[ROADMAP.md](../ROADMAP.md)** | PM / planning chats | Planning horizon: thin phase stubs, phase status, PRD links, open questions |
| **[prds/](prds/)** | PM / agents | Per-phase forward intent (problem, goal, scope); epics + stories while a phase is Active. Lifecycle in [prds/README.md](prds/README.md) |
| **[AGENTS.md](../AGENTS.md)** | Cursor / coding agents | Repo truth: implemented features, routes, data model, hard-constraint change protocol, agent workflow |
| **[LEXICON.md](../LEXICON.md)** | PM / agents | Architectural vocabulary |
| **[DESIGN.md](../DESIGN.md)** | PM / agents | Token architecture, structure-vs-theme split, re-skin workflow |
| **[adr/](adr/)** | PM / agents | Architecture Decision Records — immutable decision history; rules in [adr/README.md](adr/README.md) |
| **[archive/](archive/)** | PM / agents (reference) | Frozen pre-restructure history — **closed; append nothing** |
| **[WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md)** | PM | Planning & build workflow — the tool split, the phase loop, model guidance |
| **[WORKFLOW_SETUP.md](WORKFLOW_SETUP.md)** | PM | One-time Claude-side workflow setup (MCP connection, skill installs, verification) |
| **[WORKFLOW_BACKLOG.md](WORKFLOW_BACKLOG.md)** | PM | Deferred workflow-system decisions (revisit-triggered) |
| **[.cursor/rules/](../.cursor/rules/)** | Agents (style & process) | How to write code, test, migrate — not product truth |
| **[.cursor/skills/](../.cursor/skills/)** | Agents | User-triggered workflows |
| **[.cursor/plans/](../.cursor/plans/)** | In-repo planning | Ephemeral epic plans; evidence of intent, not shipped truth |
| **`.mockups/`** | PM / design | HTML mockup explorations |
| **`.mockups/archive/`** | PM / design | Superseded or shipped-phase mockups |

Agent guidance lives in `.cursor/` (rules and skills), never duplicated into product code.

**Sync order when both the planning docs and repo truth may be stale:** gather evidence once → update AGENTS.md (`/sync-repo-docs`) for shipped truth → update ROADMAP status and the active PRD from AGENTS.md → update ROADMAP open-questions from the PM conversation.

---

## Phase status vocabulary

Status is shared across ROADMAP rows and PRD files — the same word means the same thing in both places.

| Status | ROADMAP meaning | PRD meaning |
| ------ | --------------- | ----------- |
| `Draft` | Stub only; no PRD exists | — (never appears on a PRD) |
| `Planning` | PRD created; scope being shaped | Being shaped; not yet locked |
| `Ready` | PRD locked; approved to build | Locked and approved |
| `Active` | Currently being built | Currently being built |
| `Shipped` | Done | Done |

A PRD's status starts at `Planning` when the file is created and never goes below it.

---

## Write discipline

These rules apply to anyone updating the planning docs — PM or coding agent.

1. **The active phase's PRD is the source of truth for what is planned but not yet shipped.** The docs must never contradict the repo.

2. **PRD creation and promotion are split by lifecycle stage.** `phase-planning` (Claude-side planning skill) creates the PRD at `Planning` and flips it to `Ready` on PM sign-off, decomposing it into numbered epics and vertical-slice stories at that point. `plan-next-epic` (Cursor-side) flips it to `Active` when it generates the plan for the phase's first epic — the flip precedes the plan so every plan review sees an `Active` phase. Each skill updates the ROADMAP row to match at its transition. On the same first-epic pass, `plan-next-epic` removes the phase's stub from ROADMAP's **Upcoming phases** section — an `Active` phase's PRD owns its scope, so the stub would drift.

> [!IMPORTANT]
> **`mark-epic-complete` must never promote** — if an epic is marked `Complete` while its PRD or ROADMAP row reads `Draft`, `Planning`, or `Ready`, halt and report the inconsistency; do not auto-correct.

   PRD lifecycle detail lives in [prds/README.md](prds/README.md).

3. **Authoritative schema and the build-time agent workflow live in [AGENTS.md](../AGENTS.md).** Do not duplicate per-table schema or Cursor rules/skills detail in PRDs or ROADMAP.

4. **Hard constraints are canonical in [AGENTS.md — Hard constraints](../AGENTS.md#hard-constraints)** and enforced by `check:*` scripts, lint rules, and tests in the repo.

5. **Hard-constraint changes route through [AGENTS.md — Change protocol](../AGENTS.md#change-protocol),** including the mirror-only constraint on sync skills — stated there, not here.

6. **When a phase ships,** flip its PRD status to `Shipped`, move the file to [prds/archive/](prds/archive/), and mark the phase `Shipped` on ROADMAP in the same pass — update the ROADMAP PRD column to the archived path. Never move shipped PRDs into [archive/](archive/) — see rule 8. The **[ship-phase](../.cursor/skills/ship-phase/SKILL.md)** skill owns this flip, archive move, push, and PR open; merge to `main` is a separate human step. Procedure detail lives in [prds/README.md](prds/README.md).

7. **Resolved open questions leave ROADMAP.** The resolution is carried by whatever artifact it changed (a PRD, a rule, the schema, or ROADMAP itself). If a decision is hard to reverse and worth a permanent record, write an ADR (see [adr/README.md](adr/README.md) for the three-part bar). There is no standing decisions log.

8. **[archive/](archive/) holds frozen pre-restructure history only.**

> [!IMPORTANT]
> **This archive is closed** — never append to it, never edit it.

9. **Epics must be numbered.** Format as shown below (sequential within the phase, starting at 1). Once implemented, the **mark-epic-complete** skill appends a `Complete` tag to the heading — never added manually or inferred from code.

   ```markdown
   ### Epic N: Name
   ### Epic N: Name `Complete`
   ```

10. **HTML mockups:** save new explorations as `.mockups/*.html`. When a mockup is superseded or tied to a shipped phase, move it to `.mockups/archive/`.

11. **Stub sections and files are intentional.** Empty-by-design structure (e.g. ROADMAP phase stubs, the LEXICON domain-terms stub) is kept so the shape is inherited by every product built from this template. Do not delete stubs. Exception: an individual phase's stub is removed when the phase goes `Active` (rule 2); the **Upcoming phases** section itself always stays.

12. **Propose WORKFLOW_BACKLOG.md entries when they surface.** When a planning conversation deliberately defers a decision about the workflow/skills/docs system itself — not product scope — propose adding it to [WORKFLOW_BACKLOG.md](WORKFLOW_BACKLOG.md) using its existing entry format (What / Why deferred / Revisit when). Product-roadmap items don't belong here — those go to [ROADMAP.md](../ROADMAP.md) open questions instead.
