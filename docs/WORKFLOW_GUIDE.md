# WORKFLOW_GUIDE.md — Seminova's planning & build workflow

**Purpose:** How phases move from idea to shipped code — the tools, the documents, and the workflow. For write discipline and doc-maintenance rules, see [DOC_RULES.md](DOC_RULES.md).

**Last updated:** 2026-08-23

---

## Contents

- [The two-environment split](#the-two-environment-split)
- [The documents](#the-documents)
- [The full workflow](#the-full-workflow)
  - [Starting a new project](#starting-a-new-project)
  - [Building phase by phase](#building-phase-by-phase)
  - [Visual overview](#visual-overview)
- [Other planning-system skills](#other-planning-system-skills)
- [Experimental — not part of the workflow](#experimental--not-part-of-the-workflow)
- [Tips](#tips)
- [Model guidance](#model-guidance)
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
- **Implementation plan** — Cursor generates it as a file in `.cursor/plans/`; you give Claude the file path while invoking `plan-review`, and Claude revises that file in place.

**Where the skills live:** Claude-side skills are installed account-wide once — see [WORKFLOW_SETUP.md](WORKFLOW_SETUP.md). Cursor-side skills live in [`.cursor/skills/`](../.cursor/skills/) and are invoked with `/skill-name` in Cursor chat.

**Why this way?** [Why split across two tools?](#why-split-tools-instead-of-doing-everything-in-one) · [Why MCP instead of Cowork?](#why-mcp-instead-of-cowork)

---

## The documents

Full roles table and write discipline are authoritative in [DOC_RULES.md](DOC_RULES.md). Quick reference:

| Document | What it is |
| -------- | ---------- |
| `ROADMAP.md` | Thin phase stubs — the planning horizon of confirmed phases. One row per phase with status and a PRD link. |
| `BACKLOG.md` | Uncommitted product ideas — unordered, unnumbered, no PRD. Promoted to a numbered ROADMAP stub only on explicit sign-off, via `promote-backlog-item`. |
| `docs/prds/` | One PRD per phase — forward intent, epics, and stories. Moves to `docs/prds/archive/` on ship. |
| `AGENTS.md` | Hard constraints, agent workflow gates, merge checklist, and change protocol. Cursor's primary governance reference. |
| `LEXICON.md` | Shared architectural vocabulary. Inherited by every spinoff; spinoffs add domain terms on top. |
| `docs/DOC_RULES.md` | How the planning docs are maintained — authoritative roles, write discipline, lifecycle rules. |

> [!NOTE]
> **PRDs describe what you're planning to build; the code and migrations describe what's actually in the repo today.** Cursor builds from the PRD and checks plans against the code plus AGENTS.md hard constraints — don't treat them as interchangeable.

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
- **Project instructions block** (chat output, not a file) — a block you paste into the Claude Project's custom instructions; the skill closes with the paste steps and the handoff to `initialize-project`

These lists are a summary — the skill itself is the source of truth on conflict.

**Step 3 — Initialize project** *(Cursor-side skill: `initialize-project`)*
Cursor reads `site.ts` and `README.md` for project identity and does the mechanical scrub pass — replacing Seminova-specific content with the new project's details across the repo. Runs once, immediately after project kickoff.

What `initialize-project` touches:
- `package.json` — sets `name` from `site.ts` (kebab-case) and replaces the template keyword
- `src/config/landing-content.ts` — stubs hero copy and features with placeholders
- `.cursor/plans/archive/` — purges Seminova's planning history
- `docs/prds/archive/` — purges shipped-PRD archive contents; keeps the directory
- `LICENSE` — appends a new copyright line for the project owner; preserves the existing Troya and Williams attributions (MIT requirement)
- `docs/WORKFLOW_BACKLOG.md` — clears Seminova's deferred workflow items, keeps the stub structure
- `docs/mockups/` — purges Seminova's design mockups
- `docs/archive/` — purges the frozen pre-restructure archive
- `docs/research/` — deletes Seminova's active `RESEARCH-*.md` briefs; purges `docs/research/archive/`; keeps `README.md`
- `docs/skill-feedback/` — purges per-skill logs; keeps the directory
- Root audit artifacts (`TEST_AUDIT.md`, `RULE_AUDIT.md`, `SECURITY_AUDIT.md`, `TECH_DEBT_AUDIT.md`) — deletes; audit skills regenerate them on demand
- `CONTRIBUTING.md` — deletes the file; the template's contribution guide doesn't apply to a spinoff product

What it does not touch:
- `ROADMAP.md`, `LEXICON.md`, `site.ts`, `README.md` — project kickoff already wrote these correctly
- `.cursor/rules/`, `.cursor/skills/`, `AGENTS.md` — inherited unchanged; hard constraints inherit via AGENTS.md and `check:*` enforcement
- `DESIGN.md` — inherited unchanged

What it surfaces (reports, changes nothing): `supabase/config.toml`'s `project_id` still points at the template's Supabase project, and any residual template-name hits outside the attribution allowlist.

These lists are a summary — the skill itself is the source of truth on conflict.

After `initialize-project` completes, the repo is a real project, not a template copy.

---

### Building phase by phase

Once the project is initialized, the phase-by-phase loop begins — one phase planned, built, and shipped before the next gets a deep pass.

**Step 4 — Plan the phase** *(Claude-side skill: `phase-planning`)*
Claude reads ROADMAP, AGENTS.md (hard constraints), and the phase's ROADMAP stub — including any open questions attached to it — then works with you to decompose the target phase into numbered epics and vertical-slice stories. Each story carries a success condition — the observable behavior that proves it's done, in product terms. The decomposition is shaped in chat during `Planning` and written into the PRD at the `Ready` flip; Claude writes the PRD only when you ask. The `Ready` flip also removes the phase's stub from ROADMAP — the locked PRD owns the scope from that point on.

Phase status moves: `Draft → Planning` (PRD created, scope being shaped) → `Ready` (locked, approved to build). The `Active` flip is Step 5.

**Step 5 — Kick off the phase** *(Cursor-side skill: `kickoff-phase`)*
Run in a normal agent window — **not** Plan Mode. Creates the `phase-{N}/{slug}` branch, flips the PRD and its ROADMAP row from `Ready` to `Active`, and commits the planning-doc edits. Runs once per phase, before the first epic is planned; `plan-next-epic` halts if it hasn't.

**Step 6 — Plan and review the epic** *(Cursor: `plan-next-epic` ↔ Claude: `plan-review`)*
This step is a subloop — plan and review go back and forth until Claude signs off, which can take one pass or several:

- **6a.** You invoke `plan-next-epic` in Cursor with **plan mode** active. This generates an implementation plan file in `.cursor/plans/` for the next unbuilt epic in the active PRD. Plans are always written sequentially; if an epic has clearly independent tracks, the plan notes it as a Build-in-Parallel candidate for you to act on.
- **6b.** Give Claude the plan's file path, invoking `plan-review`. Claude reads the file and reviews it against AGENTS.md hard constraints and the PRD's intent, then runs a second pass against `.cursor/rules/` — violations only, not a walk of the corpus.
- **6c.** Before reporting, Claude may need two kinds of input: decisions only you hold (posed as numbered choices — answer with the number), and codebase facts the plan doesn't show (Claude hands you a standalone verification prompt to paste into Cursor; paste Cursor's answer back).
- **6d.** Claude reports findings, then revises the plan file directly — one describe-and-ask, your yes, the edit lands. If Cursor's verification answer or your decisions change the picture, Claude re-reviews and revises again.
- **Exit condition:** Claude confirms the plan is good to build. A solid plan includes: (1) a quality gate (`pnpm pre-push`), (2) a **Commit epic** step authorized by the approved plan, and (3) manual verification steps you can work through after the build.

**Step 7 — Build, verify, and complete**
Build in a **fresh agent window**, not the plan window. At the bottom of the approved plan, the *Referenced by N agents* line has a **+ New** button — click it, then prompt `implement as described`. The new window picks up the plan file as its reference on a clean context window.

By the time `plan-next-epic` and the `plan-review` loop are done, the plan window's context is deep into its budget — and the build is the longest, most detail-sensitive run in the loop.

The build window implements the epic end to end, runs the quality gate, and commits the epic with an `Epic:` git trailer.

Then work the plan's manual verification steps yourself. If something's broken, fix and commit it before moving on — that's why completion is a separate act and not the last line of the build plan. A build that ran clean isn't the same as an epic that works.

The build window closes by listing what's left and asking whether to mark the epic complete. Answer it once you've actually verified — the prompt is a reminder, not a check. **`/mark-epic-complete`** takes no arguments and resolves the epic from the PRD, so it runs equally well from that prompt, a fresh window, or the one you're already in.

If the phase has more unbuilt epics, return to **Step 6** to plan and review the next one. Once every epic in the phase is built, move to Step 8.

**Step 8 — Ship the phase** *(Cursor-side skill: `ship-phase`)*
Chains `archive-cursor-plans` and `sync-repo-docs`, flips the PRD to `Shipped`, moves it to `docs/prds/archive/`, updates ROADMAP, commits, pushes, and opens a PR. Merge to main is a separate human step.

Repeat Steps 4–8 for each phase.

**Why this way?** See [Why phase by phase?](#why-phase-by-phase).

### Visual overview

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="../public/images/workflow-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="../public/images/workflow-light.svg">
  <img alt="Seminova workflow: project kickoff and initialize project feed into a phase loop (plan phase, then a nested epic loop of plan epic, review plan, build, then ship phase)" src="../public/images/workflow-light.svg">
</picture>

> [!NOTE]
> **This picture is a snapshot and can lag the live loop.** After you start the app, the Workflow page (`/workflow`) has the current interactive diagram. The picture renders on GitHub; Cursor's built-in preview shows a broken image icon — that's expected. See [WORKFLOW_BACKLOG.md](WORKFLOW_BACKLOG.md) for the plan to replace both pictures with a Mermaid swimlane once Cursor's preview can render it.

---

## Other planning-system skills

Not part of the numbered loop above, but operate on the planning docs rather than repo code:

**`promote-backlog-item`** *(Claude-side)* — moves one `BACKLOG.md` idea to a numbered `ROADMAP.md` phase stub: renumbers the Draft phases around it, harvests the entry's constraints and prerequisites into open questions on the stub, and deletes the entry. Enacts [DOC_RULES.md](DOC_RULES.md) rule 14 — promotion requires your explicit sign-off, never inferred. Stops at the stub; `phase-planning` decomposes it later.

**`lexicon-audit`** *(Cursor-side)* — scans the codebase for LEXICON.md candidate terms and drift between the lexicon and actual usage. Read-only, chat output only — does not write to LEXICON.md. Run when you want a health check on the lexicon or suspect terminology drift. To act on findings, use `lexicon-update`.

**`lexicon-update`** *(Claude-side)* — writes or sharpens a `LEXICON.md` entry: when a new concept crystallizes during `phase-planning`, a term is being used inconsistently, or a `lexicon-audit` finding needs acting on. The active counterpart to `lexicon-audit`'s read-only scan.

**`create-mockup`** *(Claude-side)* — builds a static UI mockup as an inline widget, iterates on your feedback, and saves the approved version to `docs/mockups/`. Invoked ad hoc ("mock up this screen") or by `phase-planning` when a story's UI is worth seeing before build, with the file path written into the story. The static-only rule (mockups, not clickable prototypes) is defined in the skill itself.

**`research`** *(Cursor-side)* — investigates a product, technical, competitive, or codebase question; persists findings to `docs/research/` (Document mode, default) or delivers in chat only (Chat mode). Docs-only — never edits product code. Invoke with `/research`.

**`archive-research`** *(Cursor-side)* — retires served briefs to `docs/research/archive/` when the PM @-attaches one or more active `RESEARCH-*.md` files in the same invocation. @-mention is required. Archived briefs are frozen. Invoke with `/archive-research`.

**Workflow-system authoring** — skills that operate on the workflow itself (skills, rules, instructions, repo docs), not on product code:

- **`writing-for-agents`** *(both sides)* — the reference standard for any document an agent reads. Never invoked directly; `skill-authoring`, `instructions-authoring`, and `rule-authoring` read it first. Two copies exist (`.cursor/skills/` and the installed Claude skill) — keep their bodies identical.
- **`skill-authoring`** *(Claude-side)* — create, edit, or audit a skill, Claude- or Cursor-side. Packages Claude-side output as a `.skill` bundle for `docs/claude-skills/`.
- **`instructions-authoring`** *(Claude-side)* — write or audit the Claude Project instructions field or the account-wide profile instructions.
- **`rule-authoring`** *(Cursor-side)* — the standard for `.cursor/rules/*.mdc`: size budgets, single ownership, activation modes. `audit-rules` grades against it.
- **`github-docs-authoring`** *(Cursor-side)* — review or write repo markdown for GitHub rendering. `project-kickoff` reads its `reference.md` for conventions.
- **`audit-agents-md`** *(Cursor-side)* — instruction-budget audit of `AGENTS.md`; writes `AGENTS_AUDIT.md` at the repo root.

For repo-maintenance and quality skills (security audits, tech-debt audits, design/copy review, etc.) not specific to the planning system, see [`.cursor/skills/`](../.cursor/skills/).

---

## Experimental — not part of the workflow

These ship in the repo and are usable, but are not documented steps. Step 7 ends at `/mark-epic-complete`; these sit beside it while they're being proven or retired.

- **`code-review`** *(Cursor-side)* — two-axis (Standards + Spec) review of an epic commit. Takes no arguments; resolves the epic from the PRD and the `Epic:` trailer. Genuinely useful, but its severity grading and citation accuracy still need refinement before it earns a numbered step — `code-review-review` exists because of that.
- **`pre-release-review`** *(Cursor-side)* — scoped static review before a PR: automated gates, security pass, hard constraints, manual test checklist. Overlaps `code-review` and the build plan's quality gate; whether it earns a named step is a [WORKFLOW_BACKLOG.md](WORKFLOW_BACKLOG.md) item.
- **`code-review-review`** *(Claude-side)* — adversarial audit of a `/code-review` report: re-derives each severity against `grading.md`, checks citations, routes code-truth questions back to Cursor, ends in a fix prompt.
- **`collect-skill-feedback`** *(Claude-side)* — appends a settled audit's findings to `docs/skill-feedback/<skill>.md`, gap/slip-tagged. The read side (`absorb-skill-feedback`) is a [WORKFLOW_BACKLOG.md](WORKFLOW_BACKLOG.md) item.

---

## Tips

A few practical habits that make this workflow smoother.

1. **Token budget status in Claude.** Click your profile (bottom-left) → Settings → Usage. You'll see two windows: your current five-hour session (usage so far, time remaining) and your weekly limit (which resets separately for Opus vs. all other models). See [How do usage and length limits work?](https://support.claude.com/en/articles/11647753-how-do-usage-and-length-limits-work)

2. **Settle all edits, then write once.** MCP has two write tools: `filesystem:edit_file` for targeted old/new text replacements, `filesystem:write_file` for new files and full rewrites. Either way Claude re-reads the file before writing, so several small sequential writes cost more than deciding every change first and landing them in one call.

3. **When running low on Claude token budget.** Consider drafting instead of writing directly. Rather than having Claude write through MCP, ask it to produce the content as a copy block in chat, then paste it into the file yourself. This skips the token cost of the read-before-write and the write itself. The tradeoff: that re-read is what guards against drift since Claude's last look at the file — if you draft-and-paste instead, you're the one vouching the file hasn't changed.

4. **Refresh `seo.mdc` before running `audit-seo`.** SEO practice is shifting fast as AI-driven discovery evolves, and the audit checks code against the rule as written — a stale rule means a stale audit. Do a quick review of the rule against current practice first.

---

## Model guidance

Pick model and effort by what the skill actually does *and* how much budget headroom you have. Model names are current-generation examples — the skill rows and the effort levels are what should stay stable as models change.

> [!NOTE]
> **Written 2026-08-23.** Model lineups and price/capability tiers move fast. Treat the specific model names as a snapshot and re-check them against current docs before leaning on this table; the task-to-effort mapping is the durable part.

| Claude-side skill | Budget-conscious | Standard |
|---|---|---|
| `plan-review` | Sonnet 5, xhigh | **Opus 5, xhigh** |
| `code-review-review` | Sonnet 5, high | Opus 5, high |
| `phase-planning` | Sonnet 5, high | Opus 5, high |
| `orchestrator` — planning chat | Sonnet 5, high | Opus 5, high |
| `orchestrator` — executor chats | Haiku 4.5, low | Sonnet 5, medium |
| `project-kickoff` | Sonnet 5, medium | Sonnet 5, high |
| `promote-backlog-item` | Sonnet 5, low | Sonnet 5, medium |
| `create-mockup` | Sonnet 5, low | Sonnet 5, medium |
| `grill-me`, `lexicon-update` | — | inherit the session |

| Cursor step | Budget-conscious | Standard |
|---|---|---|
| `plan-next-epic` | Grok 4.6, high | Grok 4.6, high, Fast |
| `/code-review` | Grok 4.6, high | Grok 4.6, high, Fast |
| `pre-release-review` | Grok 4.6, high | Grok 4.6, high, Fast |
| Build | Composer 2.5 Standard | Composer 2.5 Fast |
| Mechanical steps (`kickoff-phase`, `mark-epic-complete`, `ship-phase`) | Composer 2.5 Standard | Composer 2.5 Fast |

**Fast is a speed tier, not a capability tier** — same intelligence either way, roughly double the price for lower latency. That makes it the right budget lever for `plan-next-epic` and `/code-review`: both hand their output to Claude for audit, so you're not watching the stream. Build is where you sit and watch, so Fast earns its keep. Don't mix tiers within a run — pick one and stay there.

**Why Grok 4.6 for planning and review, Composer for build.** Grok 4.6 benchmarks stronger on knowledge work and weaker on software engineering. `plan-next-epic` and `/code-review` are knowledge-work shaped — read, reason, write a document. Build is execution.

**`xhigh` on `plan-next-epic` is a per-epic escalation, not the default.** Reach for it on migrations, anything touching the auth boundary, or cross-cutting refactors. Higher effort tends to produce *more* plan, and over-engineering is one of `plan-review`'s named failure categories — a longer plan also costs more on the expensive side of the loop.

**Why `plan-review` gets the highest effort.** It's the only skill running two full passes in one turn: independent engineering judgment across five failure categories, then a sweep of ~23 rule files (~26k tokens) with severity derived per-rule. Effort is the direct lever on the attention dilution that creates. `xhigh` rather than `max` because it runs every epic.

**Why `project-kickoff` isn't judgment-heavy.** It's capped at wide-but-shallow by design — no epic decomposition — so its value is elicitation quality, not reasoning depth. Sonnet handles it. Bump to Opus only if you'd rather not re-do a roadmap.

**Effort and extended thinking are separate settings.** Effort controls how hard Claude works; the thinking toggle controls whether you see it. Extended thinking can't be disabled on Opus 5.

**Skip Fable 5 for planning work.** It's double Opus 5 on both meters, and none of these skills is a benchmarked case where Opus falls short.

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
