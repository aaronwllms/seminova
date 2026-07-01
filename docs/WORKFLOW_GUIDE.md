# WORKFLOW_GUIDE.md — Seminova's planning & build workflow

**Purpose:** How phases move from idea to shipped code — the tools, the documents, the workflow, and the key vocabulary. For write discipline and doc-maintenance rules, see [docs/DOC_RULES.md](docs/DOC_RULES.md).

**Last updated:** 2026-06-30

---

## The two-environment split

Seminova's planning system runs across two tools with a hard boundary between them:

- **Claude** owns planning, alignment, and review — kicking off new projects, decomposing phases into epics and stories, and reviewing Cursor's implementation plans before they build.
- **Cursor** owns implementation — initializing the project from the template, turning epics into implementation plans, and writing code.

The primary handoff artifacts between them:

- **PRD** (`docs/prds/`) — Claude writes it; Cursor builds from it.
- **Implementation plan** — Cursor generates it (in `.cursor/plans/`); you select **Markdown view** from the plan's ellipsis (`⋯`) menu, copy the contents, and paste it into Claude while invoking `plan-review`.

**Why split tools instead of doing everything in one?**

- **Adversarial verification.** A frontier model reviewing a separate, cheaper execution model's work catches more than a model grading its own output. Claude reviews and plans; Cursor's Composer model executes.
- **Cost and quota separation.** Running high-reasoning models inside Cursor burns Cursor's own usage limits faster, and at worse economics, than doing the same reasoning in Claude. Composer is capable enough at execution that it doesn't need the frontier-model tax.
- **This is a current-state workaround, not a permanent architecture.** If Cursor's execution model eventually gets good enough that adversarial review stops adding value, the intent is to collapse this back into a single tool.

**Why not Claude Cowork instead of MCP?**

Cowork is built around heavier file-aware operations, which makes it slow for requests that are mostly conversational — talking through epics, reasoning about tradeoffs, planning. Anthropic's general guidance is to chat in claude.ai and use Cowork for file work, but this workflow moves fluidly between the two within a single session — splitting that across two separate tools/chats breaks the flow. The MCP filesystem connection lets Claude Desktop do both in one place: reason in chat, write files when needed, without Cowork's standing overhead.

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

**Step 2 — Kickoff grill** *(Claude-side skill: `kickoff-grilling`)*
A structured grill session with Claude that captures everything needed to understand the new project and produce a populated `ROADMAP.md`. The grill is **wide but shallow** — it gets deep enough to understand the whole product and define all the phases, but stops there. Each phase gets its own deep grill when it's its turn (see `phase-planning-with-grill-me` below).

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

**Step 3 — Initialize project** *(Cursor-side skill: `initialize-project`)*
Cursor reads `site.ts` and `README.md` for project identity and does the mechanical scrub pass — replacing Seminova-specific content with the new project's details across the repo. Runs once, immediately after the kickoff grill.

What `initialize-project` touches:
- `AGENTS.md` — replaces Seminova name references; resets "Implemented now" to baseline template state
- `src/config/landing-content.ts` — stubs hero copy and features with placeholders
- `.cursor/plans/archive/` — purges Seminova's planning history
- `LICENSE` — appends a new copyright line for the project owner; preserves the existing Troya and Williams attributions (MIT requirement)
- `docs/WORKFLOW_BACKLOG.md` — clears Seminova's deferred workflow items, keeps the stub structure

What it does not touch:
- `ROADMAP.md`, `LEXICON.md`, `site.ts`, `README.md` — the kickoff grill already wrote these correctly
- `.cursor/rules/`, `.cursor/skills/` — inherited unchanged; these are the template's value
- `LOCKED_RULES.md`, `DESIGN.md` — inherited unchanged

After `initialize-project` completes, the repo is a real project, not a template copy.

---

### Building phase by phase

Once the project is initialized, the phase-by-phase loop begins.

**Step 4 — Plan the phase** *(Claude-side skill: `phase-planning-with-grill-me`)*
Claude reads ROADMAP, LOCKED_RULES, and any existing PRD stub, then works with you to decompose the target phase into numbered epics and vertical-slice stories. Each story carries a success condition — the observable behavior that proves it's done, in product terms. Work happens in chat; Claude writes the PRD only when you ask.

Phase status moves: `Draft → Planning` (PRD created, scope being shaped) → `Ready` (locked, approved to build)

**Step 5 — Plan and review the epic** *(Cursor: `plan-next-epic` ↔ Claude: `plan-review`)*
This step is a subloop — plan and review go back and forth until Claude signs off, which can take one pass or several:

- **5a.** You invoke `plan-next-epic` in Cursor with **plan mode** active. This generates an implementation plan for the next unbuilt epic in the active PRD. Plans are always written sequentially; if an epic has clearly independent tracks, the plan notes it as a Build-in-Parallel candidate for you to act on.
- **5b.** Select **Markdown view** from the plan's ellipsis (`⋯`) menu, copy the markdown, and paste it into Claude, invoking `plan-review`.
- **5c.** If Claude flags issues: discuss and settle the feedback in chat (this can take a few exchanges), then ask Claude for a standalone copy-block prompt summarizing the agreed change.
- **5d.** Paste that prompt into the same Cursor plan-mode session; Cursor updates the plan.
- **5e.** Copy the updated plan's markdown and paste it back to Claude for re-review. Repeat 5c–5e until clean — occasionally a revision introduces a new issue, which just runs another lap of the loop.
- **Exit condition:** Claude confirms the plan is good to build. A solid plan typically includes the quality bar (`pnpm type-check && pnpm lint && pnpm format-check && pnpm test:ci`) and a closing `mark-epic-complete` step, tagging the epic `` `Complete` `` in the PRD once implementation is finished — confirm both are present during review rather than expecting to run them by hand later.

**Step 6 — Build**
Press the build button on the approved plan in Cursor. Cursor implements it end to end, including the quality-bar and `mark-epic-complete` steps the plan already specifies. If the phase has more unbuilt epics, return to **Step 5** to plan and review the next one. Once every epic in the phase is built, move to Step 7.

**Step 7 — Ship the phase** *(Cursor-side skill: `ship-phase`)*
Flips the PRD to `Shipped`, moves it to `docs/prds/archive/`, updates ROADMAP, commits, pushes, and opens a PR. Merge to main is a separate human step.

Repeat Steps 4–7 for each phase.

### Visual overview

```mermaid
%%{init: {'flowchart': {'curve': 'stepAfter'}}}%%
flowchart TD
    Start(["Step 1: Clone template"])
    KG["Step 2: Kickoff grill<br/>(kickoff-grilling)"]
    IP["Step 3: Initialize project<br/>(initialize-project)"]
    PP["Step 4: Plan the phase<br/>(phase-planning-with-grill-me)"]
    P5["Step 5a — Cursor (plan mode)<br/>plan-next-epic"]
    R5["Step 5b — Claude<br/>plan-review"]
    BD["Step 6: Build"]
    SP["Step 7: Ship the phase<br/>(ship-phase)"]

    Start --> KG --> IP --> PP --> P5 --> R5 --> BD --> SP
    R5 -.->|"revise via Cursor"| P5
    BD -.->|"more epics to plan"| P5
    SP -.->|"repeat for next phase"| PP

    subgraph Legend["Legend"]
        direction LR
        L1["Claude step"]
        L2["Cursor step"]
    end

    classDef claudeStep fill:#CECBF6,stroke:#534AB7,color:#26215C
    classDef cursorStep fill:#9FE1CB,stroke:#0F6E56,color:#04342C
    class KG,PP,R5 claudeStep
    class IP,BD,SP,P5 cursorStep
    class L1 claudeStep
    class L2 cursorStep
    style Legend fill:#F1EFE8,stroke:#B4B2A9,color:#444441
    linkStyle default stroke:#9c9a92,stroke-width:1.5px
    linkStyle 7 stroke:#534AB7,stroke-width:2px
    linkStyle 8 stroke:#0F6E56,stroke-width:2px
    linkStyle 9 stroke:#B7791F,stroke-width:2px
```

Color carries ownership (purple = Claude, teal = Cursor) — see the legend at the bottom. Step 5's two sub-steps are plain nodes in the main chain rather than a boxed subgraph — Cursor (5a) first, Claude (5b) second, straight down the page in read order — since nesting them in a box confused the layout engine's cycle handling and pushed Steps 6–7 above Step 5. Three loops run at three grains, each its own dotted line: the **review subloop** (5b back to 5a, revise via Cursor), the **epic loop** (Step 6 back to 5a, more epics left in this phase), and the **phase loop** (Step 7 back to Step 4, Steps 1–3 run once per project, Steps 4–7 repeat per phase). Each loop's dotted line is color-coded to its grain (subloop purple, epic loop teal, phase loop amber) so the three backward edges stay distinguishable even where they route near each other.

---

## Key vocabulary

### Locked rule
A non-negotiable constraint on how the project is built — an architectural or product decision not up for re-evaluation at implementation time. Lives in `LOCKED_RULES.md`. Changing one requires PM approval and routes through the change protocol in `AGENTS.md`. Coding agents treat them as hard constraints; `plan-review` flags any plan that violates one as a blocking finding.

### Repo truth
The authoritative record of what is actually implemented right now — routes, schema, implemented features, agent workflow. Lives in `AGENTS.md`. Kept current by the `/sync-repo-docs` skill after behavior, routes, schema, or env changes. The PRD is forward intent; `AGENTS.md` is what shipped.

---

## Other planning-system skills

Not part of the numbered loop above, but operate on the planning docs rather than repo code:

**`lexicon-audit`** *(Cursor-side)* — scans the codebase for LEXICON.md candidate terms and drift between the lexicon and actual usage. Read-only, chat output only — does not write to LEXICON.md. Run when you want a health check on the lexicon or suspect terminology drift. To act on findings, use the Claude-side `lexicon-update` skill.

For repo-maintenance and quality skills (security audits, tech-debt audits, design/copy review, etc.) not specific to the planning system, see [AGENTS.md › Agent skills](../AGENTS.md#agent-skills-cursorskills).

---

## Tips

A few practical habits that make this workflow smoother.

**Check your token budget before a long session.** Click your profile (bottom-left) → Settings → Usage to see remaining budget and when the window resets. Useful to check before starting a long planning or review session so you're not caught mid-task.

**Batch file edits, then write once.** `filesystem:write_file` does whole-file rewrites — there's no patch/diff capability. Every write re-reads and re-emits the entire file's contents, so several small sequential edits cost more than deciding all the changes first and writing once at the end.

**When running low on context, consider drafting instead of writing directly.** Rather than having Claude write through MCP, ask it to produce the content as a copy block in chat, then paste it into the file yourself. This skips the token cost of the write call itself. The tradeoff: Claude normally re-reads a file immediately before writing to guard against drift since its last read — if you draft-and-paste instead, you're the one vouching the file hasn't changed.

---

## Model guidance

Claude Sonnet 5 narrows the performance gap to Opus considerably while costing roughly 2.5x less — for most of this workflow's skills, effort level matters more than which model you pick.

- **`phase-planning-with-grill-me`, `plan-review`, `kickoff-grilling`** — Sonnet 5 at high or xhigh effort. Reach for Opus only when a specific decision is high-stakes enough to want the extra accuracy ceiling (e.g., an ADR-worthy call, or a plan-review verdict you're not confident in).
- **Lighter, more mechanical skills** — Sonnet 5 at low or medium effort.
- `lexicon-update` inherits whatever model/effort its parent session is running.

---

## Where the skills live

Claude-side skill installation (account-wide, one-time) is covered in [WORKFLOW_SETUP.md](WORKFLOW_SETUP.md).

**Cursor-side skills** live in `.cursor/skills/` and are invoked with `/skill-name` in Cursor chat. See [AGENTS.md › Agent skills](../AGENTS.md#agent-skills-cursorskills) for the full repo-maintenance catalog.

---

## Credits

Seminova itself is built on Michael Troya's original Next.js/Supabase starter template — the foundation this project's structure inherits from. Full attribution lives in [LICENSE](../LICENSE).

Several pieces of this workflow are adapted from Matt Pocock's skills system ([aihero.dev](https://www.aihero.dev/)):

- The `grill-me` skill itself
- The grill-me-with-docs pattern, used inside `phase-planning-with-grill-me`
- The ADR framework (`docs/adr/`)

Where possible, original language and structure have been preserved rather than rewritten from scratch.
