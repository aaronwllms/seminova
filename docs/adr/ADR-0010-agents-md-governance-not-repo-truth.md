# ADR-0010: AGENTS.md holds governance, not repo truth

**Status:** Accepted

`AGENTS.md` loads on every agent request, so every line it carries is spent whether or not the task needs it. It now holds only what any change can trip: the one-line project description, the package manager and quality-bar commands, the hard constraints, the agent workflow gates, the merge checklist, and the change protocol — plus a few directory-level breadcrumbs. Feature inventories, route lists, the data-model summary, and the directory map were deleted rather than relocated: a *what* is derivable from the code, and the *why* behind it already lived in an ADR, a `.cursor/rules/*.mdc`, or `LEXICON.md`.

The trade-off is that repo truth is no longer written down anywhere central. An agent orienting in an unfamiliar area reads the code instead of a catalog, which costs a few tool calls per task. We accepted that against the alternative we had been living with — a catalog that went stale on every migration and route change, grew by automated accretion across sixteen phases with nothing ever removing from it, and confidently pointed agents at files that had moved.

Two alternatives were rejected. A `docs/ARCHITECTURE.md` holding the relocated content would have been a fourth intake valve with no glob, no immutability, and no skill owning its accuracy — the same ball of mud one directory over. Mechanical enforcement (a byte ceiling failing `pre-push`) was declined as too blunt to distinguish accretion from a legitimate hard-constraint addition. The guards are therefore this record, the document-roles table in `docs/DOC_RULES.md`, and a pointer at the top of `AGENTS.md` itself.
