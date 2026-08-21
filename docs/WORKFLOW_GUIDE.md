# WORKFLOW_GUIDE.md — Seminova's planning & build workflow

**Purpose:** How phases move from idea to shipped code — the tools, the documents, and the workflow. For write discipline and doc-maintenance rules, see [DOC_RULES.md](DOC_RULES.md).

**Last updated:** 2026-07-24

---

## Contents

- [The two-environment split](#the-two-environment-split)
- [The documents](#the-documents)
- [The full workflow](#the-full-workflow)
  - [Starting a new project](#starting-a-new-project)
  - [Building phase by phase](#building-phase-by-phase)
  - [Visual overview](#visual-overview)
- [Other planning-system skills](#other-planning-system-skills)
- [Tips](#tips)
- [Model guidance](#model-guidance)
- [Where the skills live](#where-the-skills-live)
- [FAQ — Why this workflow looks this way](#faq--why-this-workflow-looks-this-way)

---

## The two-environment split

Seminova's planning system runs across two tools with a hard boundary between them:

- **Claude Desktop** owns planning, alignment, and review — kicking off new projects, decomposing phases into epics and stories, and reviewing Cursor's implementation plans before they build.
- **Cursor** owns implementation — initializing the project from the template, turning epics into implementation plans, and writing code.

> [!IMPORTANT]
> **Claude-side planning requires Claude Desktop with MCP — not claude.ai web.** Skills write planning docs (`ROADMAP.md`, PRDs, `LEXICON.md`) directly into the repo via a one-time filesystem MCP connection. The web app cannot do this. One-time setup is in [WORKFLOW_SETUP.md](WORKFLOW_SETUP.md).

The primary handoff artifacts between them:

- **PRD** (`docs/prds/`) — Claude writes it; Cursor builds from it.
- **Implementation plan** — Cursor generates it (in `.cursor/plans/`); you select **Markdown view** from the plan's ellipsis (`⋯`) menu, copy the contents, and paste it into Claude while invoking `plan-review`.

**Why this way?** [Why split across two tools?](#why-split-tools-instead-of-doing-everything-in-one) · [Why MCP instead of Cowork?](#why-mcp-instead-of-cowork)

---

## The documents

Full roles table and write discipline are authoritative in [DOC_RULES.md](DOC_RULES.md). Quick reference:

| Document | What it is |
| -------- | ---------- |
| `ROADMAP.md` | Thin phase stubs — the planning horizon of confirmed phases. One row per phase with status and a PRD link. |
| `BACKLOG.md` | Uncommitted product ideas — unordered, unnumbered, no PRD. Promoted to a ROADMAP stub only on explicit sign-off. |
| `docs/prds/` | One PRD per phase — forward intent, epics, and stories. Moves to `docs/prds/archive/` on ship. |
| `AGENTS.md` | Repo truth — implemented features, routes, schema, agent workflow, hard constraints. Cursor's primary reference. |
| `LEXICON.md` | Shared architectural vocabulary. Inherited by every spinoff; spinoffs add domain terms on top. |
| `docs/DOC_RULES.md` | How the planning docs are maintained — authoritative roles, write discipline, lifecycle rules. |

> [!NOTE]
> **PRDs describe what you're planning to build; AGENTS describes what's actually in the repo today.** Cursor builds from the PRD and checks plans against AGENTS — don't treat them as interchangeable.

---

## The full workflow

### Starting a new project

**Step 1 — Clone the template**
Fork or clone Seminova. You have the full template but no project identity yet.

**Step 2 — Project kickoff** *(Claude-side skill: `project-kickoff`)*
A structured discovery session with Claude that captures everything needed to understand the new project and produce a populated `ROADMAP.md`. The session is **wide but shallow** — it gets deep enough to understand the whole product and define all the phases, but stops there. Each phase gets its own deep discovery pass when it's its turn.

The session must collect before writing anything:
- Project name, short description, longer pitch, and who it's for
- GitHub URL
- Logo choice (or "use placeholder")
- Any domain vocabulary terms worth seeding into `LEXICON.md`
- Phase stubs — the shape of the product's roadmap

Outputs written by project kickoff:
- `ROADMAP.md` — populated with real phase stubs
- `BACKLOG.md` — uncommitted ideas surfaced in the session that aren't confirmed phases; Seminova's entries cleared, stub structure kept
- `src/config/site.ts` — name, description, GitHub URL
- `README.md` — pitch, audience, what-it-is/is-not (Seminova framing replaced)
- `LEXICON.md` — new domain terms appended (architectural terms stay unchanged)

These lists are a summary — the skill itself is the source of truth on conflict.

**Step 3 — Initialize project** *(Cursor-side skill: `initialize-project`)*
Cursor reads `site.ts` and `README.md` for project identity and does the mechanical scrub pass — replacing Seminova-specific content with the new project's details across the repo. Runs once, immediately after project kickoff.

What `initialize-project` touches:
- `AGENTS.md` — replaces Seminova name references; resets "Implemented now" to baseline template state
- `src/config/landing-content.ts` — stubs hero copy and features with placeholders
- `.cursor/plans/archive/` — purges Seminova's planning history
- `LICENSE` — appends a new copyright line for the project owner; preserves the existing Troya and Williams attributions (MIT requirement)
- `docs/WORKFLOW_BACKLOG.md` — clears Seminova's deferred workflow items, keeps the stub structure
- `docs/mockups/` — purges Seminova's design mockups
- `docs/archive/` — purges the frozen pre-restructure archive
- `docs/research/` — deletes Seminova's active `RESEARCH-*.md` briefs; purges `docs/research/archive/`; keeps `README.md`
- `CONTRIBUTING.md` — deletes the file; the template's contribution guide doesn't apply to a spinoff product

What it does not touch:
- `ROADMAP.md`, `LEXICON.md`, `site.ts`, `README.md` — project kickoff already wrote these correctly
- `.cursor/rules/`, `.cursor/skills/` — inherited unchanged; hard constraints inherit via AGENTS.md and `check:*` enforcement
- `DESIGN.md` — inherited unchanged

These lists are a summary — the skill itself is the source of truth on conflict.

After `initialize-project` completes, the repo is a real project, not a template copy.

---

### Building phase by phase

Once the project is initialized, the phase-by-phase loop begins — one phase planned, built, and shipped before the next gets a deep pass.

**Step 4 — Plan the phase** *(Claude-side skill: `phase-planning`)*
Claude reads ROADMAP, AGENTS.md (hard constraints), and the phase's ROADMAP stub — including any open questions attached to it — then works with you to decompose the target phase into numbered epics and vertical-slice stories. Each story carries a success condition — the observable behavior that proves it's done, in product terms. The decomposition is shaped in chat during `Planning` and written into the PRD at the `Ready` flip; Claude writes the PRD only when you ask. The `Ready` flip also removes the phase's stub from ROADMAP — the locked PRD owns the scope from that point on.

Phase status moves: `Draft → Planning` (PRD created, scope being shaped) → `Ready` (locked, approved to build). The `Active` flip happens later — `kickoff-phase` performs it in Cursor before any epic is planned.

**Step 5 — Plan and review the epic** *(Cursor: `plan-next-epic` ↔ Claude: `plan-review`)*
This step is a subloop — plan and review go back and forth until Claude signs off, which can take one pass or several:

- **5a.** You invoke `plan-next-epic` in Cursor with **plan mode** active. This generates an implementation plan for the next unbuilt epic in the active PRD. Plans are always written sequentially; if an epic has clearly independent tracks, the plan notes it as a Build-in-Parallel candidate for you to act on.
- **5b.** Select **Markdown view** from the plan's ellipsis (`⋯`) menu, copy the markdown, and paste it into Claude, invoking `plan-review`.
- **5c.** If Claude flags issues: discuss and settle the feedback in chat (this can take a few exchanges), then ask Claude for a standalone copy-block prompt summarizing the agreed change.
- **5d.** Paste that prompt into the same Cursor plan-mode session; Cursor updates the plan.
- **5e.** Copy the updated plan's markdown and paste it back to Claude for re-review. Repeat 5c–5e until clean — occasionally a revision introduces a new issue, which just runs another lap of the loop.
- **Exit condition:** Claude confirms the plan is good to build. A solid plan includes: (1) a quality gate (`pnpm type-check && pnpm lint && pnpm format-check && pnpm test:ci`), (2) a **Commit epic** step authorized by the approved plan, and (3) a closing handoff instructing the user to run `/code-review` in a new agent window, including the epic baseline SHA and epic identifier.

**Step 6 — Build and follow-up**
Press the build button on the approved plan in Cursor. The build window implements the epic end to end, runs the quality gate, and commits the epic. It ends with a handoff to run `/code-review` in a **new agent window**, passing the baseline SHA and epic id from the plan.

After build, each follow-up runs in its own fresh agent window:

1. **`/code-review`** — pass the baseline SHA and epic id from the build handoff. Apply and commit any fixes if needed.
2. **`/mark-epic-complete for Epic <id>`** — epic id from the code-review breadcrumb; commits the PRD `` `Complete` `` tag.

If the phase has more unbuilt epics, return to **Step 5** to plan and review the next one. Once every epic in the phase is built, move to Step 7.

**Step 7 — Ship the phase** *(Cursor-side skill: `ship-phase`)*
Flips the PRD to `Shipped`, moves it to `docs/prds/archive/`, updates ROADMAP, commits, pushes, and opens a PR. Merge to main is a separate human step.

Repeat Steps 4–7 for each phase.

**Why this way?** See [Why phase by phase?](#why-phase-by-phase).

### Visual overview

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="../public/images/workflow-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="../public/images/workflow-light.svg">
  <img alt="Seminova workflow: project kickoff and initialize project feed into a phase loop (plan phase, then a nested epic loop of plan epic, review plan, build, then ship phase)" src="../public/images/workflow-light.svg">
</picture>

> [!NOTE]
> **This diagram renders on GitHub; Cursor's built-in preview shows a broken image icon.** That's expected — Cursor doesn't currently render images in markdown preview. See [WORKFLOW_BACKLOG.md](WORKFLOW_BACKLOG.md) for the plan to revisit this once Mermaid's swimlane support matures.

---

## Other planning-system skills

Not part of the numbered loop above, but operate on the planning docs rather than repo code:

**`lexicon-audit`** *(Cursor-side)* — scans the codebase for LEXICON.md candidate terms and drift between the lexicon and actual usage. Read-only, chat output only — does not write to LEXICON.md. Run when you want a health check on the lexicon or suspect terminology drift. To act on findings, use the Claude-side `lexicon-update` skill.

**`create-mockup`** *(Claude-side)* — builds a static UI mockup as an inline widget, iterates on your feedback, and saves the approved version to `docs/mockups/`. Invoked ad hoc ("mock up this screen") or by `phase-planning` when a story's UI is worth seeing before build, with the file path written into the story. The static-only rule (mockups, not clickable prototypes) is defined in the skill itself.

**`research`** *(Cursor-side)* — investigates a product, technical, competitive, or codebase question; persists findings to `docs/research/` (Document mode, default) or delivers in chat only (Chat mode). Docs-only — never edits product code. Invoke with `/research`.

**`archive-research`** *(Cursor-side)* — retires served briefs to `docs/research/archive/` when the PM @-attaches one or more active `RESEARCH-*.md` files in the same invocation. @-mention is required. Archived briefs are frozen. Invoke with `/archive-research`.

For repo-maintenance and quality skills (security audits, tech-debt audits, design/copy review, etc.) not specific to the planning system, see [`.cursor/skills/`](../.cursor/skills/).

---

## Tips

A few practical habits that make this workflow smoother.

1. **Token budget status in Claude.** Click your profile (bottom-left) → Settings → Usage. You'll see two windows: your current five-hour session (usage so far, time remaining) and your weekly limit (which resets separately for Opus vs. all other models). See [How do usage and length limits work?](https://support.claude.com/en/articles/11647753-how-do-usage-and-length-limits-work)

2. **Batch file edits, then write once.** MCP's `filesystem:write_file` does whole-file rewrites — there's no patch/diff capability. Every write re-reads and re-emits the entire file's contents, so several small sequential edits cost more than deciding all the changes first and writing once at the end.

3. **When running low on Claude token budget.** Consider drafting instead of writing directly. Rather than having Claude write through MCP, ask it to produce the content as a copy block in chat, then paste it into the file yourself. This skips the token cost of the write call itself. The tradeoff: Claude normally re-reads a file immediately before writing to guard against drift since its last read — if you draft-and-paste instead, you're the one vouching the file hasn't changed.

4. **Refresh `seo.mdc` before running `audit-seo`.** SEO practice is shifting fast as AI-driven discovery evolves, and the audit checks code against the rule as written — a stale rule means a stale audit. Do a quick review of the rule against current practice first.

---

## Model guidance

Pick model and effort level by task characteristics *and* how much budget headroom you have. Model names are current-generation examples — the categories are what should stay stable as models change.

| Task type | Budget-conscious | Standard |
|---|---|---|
| **Judgment-heavy** (`phase-planning`, `plan-review`, `project-kickoff`) | Sonnet 5, high effort | Opus 4.8, high effort |
| **Hardest calls** (ADR-worthy decisions, low-confidence plan-review verdicts) | Opus 4.8, high effort | Fable 5, high effort |
| **Mechanical / lighter tasks** | Sonnet 5, low effort | Sonnet 5, medium effort |
| **Cursor execution** | Composer 2.5 Standard | Composer 2.5 Fast |

Cursor's Fast vs. Standard tiers are a speed/cost choice, not a capability one — same intelligence either way; Fast just runs on faster hardware at a higher per-token cost.

---

## Where the skills live

Claude-side skill installation (account-wide, one-time) is covered in [WORKFLOW_SETUP.md](WORKFLOW_SETUP.md).

**Cursor-side skills** live in [`.cursor/skills/`](../.cursor/skills/) and are invoked with `/skill-name` in Cursor chat.

---

## FAQ — Why this workflow looks this way

Optional depth — the procedural sections above stand on their own. Read these when you want the reasoning behind a design choice.

<details>
<summary>Read the FAQ</summary>

### Why split tools instead of doing everything in one?

- **Adversarial verification.** A frontier model reviewing a separate, cheaper execution model's work catches more than a model grading its own output. Claude reviews and plans; Cursor's Composer model executes.
- **Cost and quota separation.** Running high-reasoning models inside Cursor burns Cursor's own usage limits faster, and at worse economics, than doing the same reasoning in Claude. Composer is capable enough at execution that it doesn't need the frontier-model tax.
- **This is a current-state workaround, not a permanent architecture.** If Cursor's execution model eventually gets good enough that adversarial review stops adding value, the intent is to collapse this back into a single tool.

### Why MCP instead of Cowork?

Claude-side skills write planning docs directly into the repo. That requires Claude Desktop with a one-time MCP filesystem connection to your local clone (see [WORKFLOW_SETUP.md](WORKFLOW_SETUP.md)). Most of a planning session is conversational; file writes are occasional punctuations, not the whole session.

Cowork is built around heavier file-aware operations, which makes it slow for requests that are mostly conversational — talking through epics, reasoning about tradeoffs, planning. Anthropic's general guidance is to chat in claude.ai and use Cowork for file work, but this workflow moves fluidly between the two within a single session — splitting that across two separate tools/chats breaks the flow. The MCP filesystem connection lets Claude Desktop do both in one place: reason in chat, write files when needed, without Cowork's standing overhead.

### Why phase by phase?

Kickoff defines the horizon; the steady-state loop goes deep on one phase at a time. That's intentional — planning, building, and shipping a phase before starting the next lets you fold in what you learned (scope changes, better ideas, constraints you didn't see upfront) instead of locking every phase's PRD before any code ships.

- **You can plan every phase upfront** if you prefer — run `phase-planning` for each ROADMAP stub before building anything. Nothing in the skills prevents it. The tradeoff is less agility: later phases won't benefit from what earlier shipping taught you.
- **Unattended multi-phase automation is a different model.** If the goal is agents looping through all phases with minimal human involvement, you'd typically plan everything first — but that bypasses the plan-review gate, your Ready/Active approvals, and the adversarial Claude/Cursor split this workflow is built around. Faster throughput, less verification.

</details>
