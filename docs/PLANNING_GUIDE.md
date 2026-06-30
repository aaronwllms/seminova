# PLANNING_GUIDE.md — Seminova's planning system

**Purpose:** How phases move from idea to shipped code — the tools, the documents, the workflow, and the key vocabulary. For write discipline and doc-maintenance rules, see [docs/DOC_RULES.md](docs/DOC_RULES.md).

**Last updated:** 2026-06-29

---

## The two-environment split

Seminova's planning system runs across two tools with a hard boundary between them:

- **Claude** owns planning, alignment, and review — kicking off new projects, decomposing phases into epics and stories, and reviewing Cursor's implementation plans before they build.
- **Cursor** owns implementation — initializing the project from the template, turning epics into implementation plans, and writing code.

The primary handoff artifact between them is the **PRD** — the per-phase doc in `docs/prds/`. Claude writes it; Cursor builds from it.

---

## The documents

Full roles table and write discipline are authoritative in [docs/DOC_RULES.md](docs/DOC_RULES.md). Quick reference:

| Document | What it is |
| -------- | ---------- |
| `ROADMAP.md` | Thin phase stubs — the planning horizon. One row per phase with status and a PRD link. |
| `docs/prds/` | One PRD per phase — forward intent, epics, and stories. Moves to `docs/prds/archive/` on ship. |
| `AGENTS.md` | Repo truth — implemented features, routes, schema, agent workflow. Cursor's primary reference. |
| `LOCKED_RULES.md` | Non-negotiable constraints. Changing one is a deliberate, routed decision. |
| `LEXICON.md` | Shared architectural vocabulary. Inherited by every spinoff; spinoffs add domain terms on top. |
| `docs/DOC_RULES.md` | How the planning docs are maintained — authoritative roles, write discipline, lifecycle rules. |

---

## The full workflow

### Starting a new project

**Step 1 — Clone the template**
Fork or clone Seminova. You have the full template but no project identity yet.

**Step 2 — Kickoff grill** *(Claude-side skill: `kickoff-grill` — not yet built)*
A structured grill session with Claude that captures everything needed to understand the new project and produce a populated `ROADMAP.md`. The grill is **wide but shallow** — it gets deep enough to understand the whole product and define all the phases, but stops there. Each phase gets its own deep grill when it's its turn (see `phase-planning` below).

The grill must collect before writing anything:
- Project name, short description, longer pitch, and who it's for
- GitHub URL
- Logo choice (or "use placeholder")
- Any domain vocabulary terms worth seeding into `LEXICON.md`
- Phase stubs — the shape of the product's roadmap

Outputs written by the kickoff grill:
- `ROADMAP.md` — populated with real phase stubs
- `src/config/site.ts` — name, description, GitHub URL
- `README.md` — pitch, audience, what-it-is/is-not (Seminova framing replaced)
- `LEXICON.md` — new domain terms appended (architectural terms stay unchanged)

**Step 3 — Initialize project** *(Cursor-side skill: `initialize-project` — not yet built)*
Cursor reads `site.ts` and `README.md` for project identity and does the mechanical scrub pass — replacing Seminova-specific content with the new project's details across the repo. Runs once, immediately after the kickoff grill.

What `initialize-project` touches:
- `AGENTS.md` — replaces Seminova name references; resets "Implemented now" to baseline template state
- `src/config/landing-content.ts` — stubs hero copy and features with placeholders
- `.cursor/plans/archive/` — purges Seminova's planning history
- `LICENSE` — updates copyright year and owner name; preserves the Troya attribution (MIT requirement)

What it does not touch:
- `ROADMAP.md`, `LEXICON.md`, `site.ts`, `README.md` — the kickoff grill already wrote these correctly
- `.cursor/rules/`, `.cursor/skills/` — inherited unchanged; these are the template's value
- `LOCKED_RULES.md`, `DESIGN.md` — inherited unchanged

After `initialize-project` completes, the repo is a real project, not a template copy.

---

### Building phase by phase

Once the project is initialized, the phase-by-phase loop begins.

**Step 4 — Plan the phase** *(Claude-side skill: `phase-planning`)*
Claude reads ROADMAP, LOCKED_RULES, and any existing PRD stub, then works with you to decompose the target phase into numbered epics and vertical-slice stories. Each story carries a success condition — the observable behavior that proves it's done, in product terms. Work happens in chat; Claude writes the PRD only when you ask.

Phase status moves: `Draft → Planning` (PRD created, scope being shaped) → `Ready` (locked, approved to build)

**Step 5 — Build one epic at a time** *(Cursor-side skill: `plan-next-epic`)*
Cursor picks up the next unbuilt epic from the active PRD, loads the right context, and generates an implementation plan. Plans are always written sequentially; if an epic has clearly independent tracks, the plan notes it as a Build-in-Parallel candidate for you to act on.

**Step 6 — Review the plan** *(Claude-side skill: `plan-review`)*
Claude reviews the plan as an independent senior engineer — checking for security issues, data integrity risk, locked-rule violations, and correctness — before you approve it to build.

**Step 7 — Build**
Cursor implements. At the end of each epic, run the quality bar:

```bash
pnpm type-check && pnpm lint && pnpm format-check && pnpm test:ci
```

**Step 8 — Ship the phase** *(Cursor-side skill: `ship-phase`)*
Flips the PRD to `Shipped`, moves it to `docs/prds/archive/`, updates ROADMAP, commits, pushes, and opens a PR. Merge to main is a separate human step.

Repeat Steps 4–8 for each phase.

---

## Key vocabulary

### Locked rule
A non-negotiable constraint on how the project is built — an architectural or product decision not up for re-evaluation at implementation time. Lives in `LOCKED_RULES.md`. Changing one requires PM approval and routes through the change protocol in `AGENTS.md`. Coding agents treat them as hard constraints; `plan-review` flags any plan that violates one as a blocking finding.

### Repo truth
The authoritative record of what is actually implemented right now — routes, schema, implemented features, agent workflow. Lives in `AGENTS.md`. Kept current by the `/sync-repo-docs` skill after behavior, routes, schema, or env changes. The PRD is forward intent; `AGENTS.md` is what shipped.

---

## Where the skills live

**Claude-side skills** (`kickoff-grill`, `phase-planning`, `plan-review`, `grill-me`, `lexicon-update`, etc.) are global to the Claude account — not per-repo. They're installed as `.skill` bundles.

**Cursor-side skills** (`initialize-project`, `plan-next-epic`, `mark-epic-complete`, `ship-phase`, `sync-repo-docs`, `lexicon-audit`, etc.) live in `.cursor/skills/` and are invoked with `/skill-name` in Cursor chat.

---

## Skills not yet built

| Skill | Side | Purpose |
| ----- | ---- | ------- |
| `kickoff-grill` | Claude | Structured project kickoff grill → ROADMAP, site.ts, README, LEXICON |
| `initialize-project` | Cursor | Scrubs template artifacts; replaces with project identity from site.ts + README |

These are the two gaps in the workflow as of the last update. Build `kickoff-grill` first (Claude-side), then `initialize-project` (Cursor-side) — `initialize-project` depends on the kickoff grill having run.
