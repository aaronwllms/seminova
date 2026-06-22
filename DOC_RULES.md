# DOC_RULES — File Management Rules

**Purpose:** Invariant doc-maintenance procedure governing writes to [CONTEXT.md](CONTEXT.md) and [CONTEXT_ARCHIVE.md](CONTEXT_ARCHIVE.md). Not project state — this file applies to every product built from this template. Governs planning skills (`phase-planning`, `sync-context-md`, `sync-repo-docs`, `mark-epic-complete`, `plan-next-epic`).

**Last updated:** 2026-06-22

---

## Document roles

| Document                                     | Audience                     | Owns                                                                                                                                                                 |
| -------------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[CONTEXT.md](CONTEXT.md)**                 | PM / external planning chats | Living brief: vision, locked-rules pointer (§3), AI architecture (§6), migration/RPC notes (§7), roadmap, ACTIVE, DRAFT, open questions — schema detail in AGENTS.md |
| **[CONTEXT_ARCHIVE.md](CONTEXT_ARCHIVE.md)** | PM / agents (reference)      | Shipped phase epic detail + resolved decisions — **append-only**                                                                                                     |
| **[AGENTS.md](AGENTS.md)**                   | Cursor / coding agents       | Repo truth, locked rules (authoritative), implemented features, data model, change protocol                                                                          |
| **[README.md](README.md)**                   | Humans cloning repo          | Setup, scripts, env — not planning                                                                                                                                   |
| **[DESIGN.md](DESIGN.md)**                   | PM + agents                  | Token architecture, structure-vs-theme split, re-skin workflow                                                                                                       |
| **[.cursor/rules/](.cursor/rules/)**         | Agents (style & process)     | How to write code, test, migrate — not product truth                                                                                                                 |
| **[.cursor/skills/](.cursor/skills/)**       | Agents                       | User-triggered workflows (`/sync-context-md`, `/sync-repo-docs`, etc.)                                                                                               |
| **[.cursor/plans/](.cursor/plans/)**         | In-repo planning             | Ephemeral; evidence of intent, not shipped truth                                                                                                                     |
| **`.mockups/`**                              | PM / design                  | HTML mockup explorations                                                                                                                                             |
| **`.mockups/archive/`**                      | PM / design                  | Superseded or shipped-phase mockups                                                                                                                                  |

**Sync order when both planning brief and repo truth may be stale:** gather evidence once → update AGENTS.md (`/sync-repo-docs`) for shipped truth → update planning brief shipped summary / locked-rules pointer / status from AGENTS.md → update roadmap / open questions from PM conversation.

---

## Write discipline

These rules apply to anyone updating CONTEXT.md or CONTEXT_ARCHIVE.md — PM or coding agent.

1. **The ACTIVE section is the source of truth for what is planned but not yet shipped.** Cursor has access to the codebase and can verify live state independently. CONTEXT.md should never contradict the repo.

2. **DRAFT→ACTIVE promotion is owned solely by `phase-planning`** (Claude-side planning skill). When a phase is fully fleshed out in a planning session (PM + Claude collaboratively defining its epics), `phase-planning` relocates the phase block from `DRAFT — Upcoming Phases` into `ACTIVE`, tags the phase header and Roadmap row `` `Active` ``, and deletes its old one-line Draft stub. `ACTIVE` holds at most one phase at a time in practice, but isn't structurally limited to one. When `ACTIVE` has no phase in it, leave a stub note saying so — do not delete the heading. **`mark-epic-complete` must not perform this promotion** — if an epic is marked `Complete` while the phase header or Roadmap row still reads `Draft`, halt and report the inconsistency; do not auto-correct.

3. **Authoritative schema and the build-time agent workflow live in [AGENTS.md](AGENTS.md).** Do not duplicate per-table schema or Cursor/rules/skills detail in CONTEXT.md.

4. **Locked rules are canonical in [AGENTS.md](AGENTS.md).** CONTEXT.md §3 is a pointer + at-a-glance only — do not expand it back into a full duplicate.

5. **Locked-rule changes must be routed through [AGENTS.md › Change protocol](AGENTS.md#change-protocol).** Sync skills (`sync-context-md`, `sync-repo-docs`) are **mirror-only** for locked rules: they never initiate a locked-rule change; they only reflect one already made through the change protocol.

6. **When a phase ships in full**, append its epic/story detail to [CONTEXT_ARCHIVE.md](CONTEXT_ARCHIVE.md) (append-only — never edit existing archive entries), then update the Roadmap status and the Status line in CONTEXT.md and remove the shipped ACTIVE content.

7. **Resolved open-question one-liners** append to `## Resolved decisions` in [CONTEXT_ARCHIVE.md](CONTEXT_ARCHIVE.md); remove from CONTEXT.md.

8. **HTML mockups:** save new explorations as `.mockups/*.html`. When a mockup is superseded or tied to a shipped phase, move it to `.mockups/archive/`.

9. **Epics must be numbered.** Format as `### Epic N: Name` (sequential within the phase, starting at 1). Never `### Epic: Name` with no number. Once implemented, a `` `Complete` `` tag is appended to the heading (`### Epic N: Name \`Complete\``) by the **mark-epic-complete** skill — never added manually or inferred from code.

10. **Stub sections are intentional.** Sections that are empty now (e.g. AI Architecture) are kept as stubs so the structure is inherited by every product built from this template. Do not delete them.
