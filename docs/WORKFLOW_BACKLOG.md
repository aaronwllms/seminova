# Workflow Backlog

**What this is.** Deferred improvements to the _collaboration system itself_ — the planning/build workflow, skills, and docs that the PM and the agents use to develop Seminova. This is **not** product roadmap (that's [ROADMAP.md](../ROADMAP.md)); nothing here ships in the product. These are decisions consciously parked to revisit later, kept here so they outlive any temporary handoff doc. Placement in the doc stack is defined in [DOC_RULES.md › Document roles](DOC_RULES.md#document-roles).

**Why it exists.** Parked workflow decisions used to live inside the docs-restructure handoff plan — a doc slated for deletion once the restructure ships. Without a permanent home, those decisions would vanish with it. This file is that home.

**How to use it.** Each entry is a deferred decision with its reason for deferral and the signal that should bring it back. Pull an item out when its trigger fires; delete it when it's resolved (record the resolution as an [ADR](adr/README.md) if it qualifies).

**Last updated:** 2026-07-08 (epic close-out commit workflow; auto-commit backlog item resolved)

---

## Contents

- [Deferred items](#deferred-items)
  - [Epic size threshold calibration](#epic-size-threshold-calibration)
  - [TDD-first as the plan's verification loop](#tdd-first-as-the-plans-verification-loop)
  - [Phase 7 decomposition fork](#phase-7-decomposition-fork)
  - [plan-review thinning + automated review](#plan-review-thinning-automated-review)
  - [Promote "batch edits, write once" from tip to standing rule](#promote-batch-edits-write-once-from-tip-to-standing-rule)
  - [Workflow Guide visual overview: Mermaid vs. image tradeoff](#workflow-guide-visual-overview-mermaid-vs-image-tradeoff)
  - [Ad hoc planning workflow (between phases)](#ad-hoc-planning-workflow-between-phases)
  - [Integrate quality skills into the documented workflow](#integrate-quality-skills-into-the-documented-workflow)
  - [Cursor capability utilization audit](#cursor-capability-utilization-audit)
  - [Documentation surface area & context-bloat audit](#documentation-surface-area--context-bloat-audit)
  - [Workflow skill next-step breadcrumb audit](#workflow-skill-next-step-breadcrumb-audit)

---

## Deferred items

### Epic size threshold calibration

**What:** The right epic size — where one agent build-window ends and context starts degrading — can't be set in advance. `phase-planning` encodes the principle (size epics to fit one build-window) but leaves the threshold to be felt out from real runs.

**Why deferred:** No real build data yet. The threshold is PM-owned and experience-driven.

**Revisit when:** A build starts degrading mid-epic — agent loses coherence, makes contradictory changes, or needs repeated correction. That's the signal to tighten the size guidance in `phase-planning`.

### TDD-first as the plan's verification loop

**What:** Adopt test-driven development as the build loop — write tests first (as the spec), confirm they fail, then build to green — instead of the current build-then-test-at-the-end approach. This is Cursor's officially recommended pattern for giving the agent a verifiable target ([best-practices guide](https://cursor.com/blog/agent-best-practices)).

**Why deferred:** It's a change to the planning/build structure, not a quick skill tweak, and Aaron deliberately chose end-stage testing for now (avoids mid-build debug loops bloating the context window). Worth a considered adoption, not a reflex.

**Revisit when:** Doing a focused pass on planning-structure improvements, or when end-stage testing starts producing failures that are expensive to localize.

### Phase 7 decomposition fork

**What:** Decide the long-term shape of decomposition — (A) enrich the existing `phase-planning` + `plan-next-epic` pipeline, keeping single-source, human-in-loop workflow; or (B) adopt Pocock's `to-prd` + `to-issues` and move toward independently-grabbable, parallel-agent issues.

**Why deferred:** The two paths lead to different workflows, and the choice shouldn't be pre-made. The biggest architectural-alignment win may already arrive through better grilling input, making this fork less urgent than it looks. **Current posture: the existing pipeline stays; the swap is deferred indefinitely, not scheduled.**

**Revisit when:** After running a full real planning cycle on the restructured system, with grilling in place — let lived experience decide.

### plan-review thinning + automated review

**What:** Two linked moves. (1) As front-loaded grilling proves it produces complete-enough plans, shrink `plan-review` from "catch architectural mistakes" to "verify execution." (2) Only once that thinning has happened, consider an automated Opus-reviews-the-build loop (distinct from today's Claude-as-thinking-partner role).

**Why deferred:** plan-review currently earns its keep as a second-model check on a single agent's blind spots and covers Aaron's self-identified architecture-experience gap. It's transitional, but dropping it now is premature — keep it until judgment grows.

**Revisit when:** Confidence is high that grilling → constrained plans rarely surface architectural errors at review time.

### Promote "batch edits, write once" from tip to standing rule

**What:** [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md) currently lists "batch file edits, then write once" as a Tips-section suggestion. Given `filesystem:write_file` always does whole-file rewrites (no patch/diff), this may actually be a standing rule rather than a situational tip — worth moving into project instructions alongside the existing "read-before-write discipline" and "whole-file rewrites only" patterns.

**Why deferred:** Don't want to update it in multiple places right now.

**Revisit when:** Doing a broader pass on project instructions, or next time multiple sequential small edits in one session cause noticeable token bloat.

### Workflow Guide visual overview: Mermaid vs. image tradeoff

**What:** [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md)'s Visual overview now uses the same `images/workflow-dark.svg` / `workflow-light.svg` picture-tag pattern as [README.md](../README.md), replacing a jumbled Mermaid flowchart. Mermaid renders in both Cursor and GitHub's markdown previews; the image only renders in GitHub's. Revisit once Mermaid's swimlane feature is stable enough to redo the diagram cleanly in Mermaid — evaluate whether it should replace the image or sit alongside it so Cursor viewers get a rendered diagram too.

**Why deferred:** Swimlane support isn't broadly available yet; not worth hand-rolling a workaround now.

**Revisit when:** Mermaid's swimlane feature is confirmed stable and widely available.

### Ad hoc planning workflow (between phases)

**What:** Design a lightweight, in-the-moment planning path that sits alongside the phased loop in [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md) — for work that doesn't warrant (or doesn't fit) a full ROADMAP phase: spikes, opportunistic improvements, research-driven explorations, or "we learned something mid-phase and want to act on it now." The workflow would be agile by default (shape → plan → build in one sitting or a short sequence) rather than Draft → Planning → Ready → Active. It would run between phases or alongside an active phase when the scope is small and self-contained. A PRD would be optional — created only when the work is large or ambiguous enough to benefit from the same epic/story decomposition the phased path uses. Primary home is likely a Cursor-side skill (plan mode → build), but cloud agents are a viable alternative for longer research or parallel exploration. May compose with a `research` skill currently in flight — research surfaces options and constraints; ad hoc planning turns a chosen direction into an implementation plan without forcing it through `phase-planning`.

**Why deferred:** The phased loop (`phase-planning` → `plan-next-epic` → build → `ship-phase`) is the only defined planning path today. Ad hoc work still happens informally, but there's no skill, no doc contract, and no clear rule for when to skip a PRD vs. write a lightweight one vs. promote the work into the next ROADMAP phase. Defining that boundary needs a few real ad hoc runs — and the research skill needs to exist first if the two are meant to chain.

**Revisit when:** A concrete between-phases task surfaces that doesn't fit the phase loop (e.g. a spike, a workflow improvement, or a research finding that needs a quick build), or when the `research` skill lands and its output needs a defined "what happens next" handoff.

### Integrate quality skills into the documented workflow

**What:** Consider adding the quality/review skills (`pre-release-review`, `code-review`, `audit-tech-debt`, `audit-tests`, `audit-security`, `audit-rules`, etc.) into the workflow as described in [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md) — currently they're only cataloged in [AGENTS.md › Agent skills](../AGENTS.md#agent-skills-cursorskills) and deliberately left out of the numbered phase loop. Extend to [WORKFLOW_SETUP.md](WORKFLOW_SETUP.md) as needed if any setup step is implied.

**Partially addressed (2026-07-08):** `code-review` is now a named manual follow-up after epic commit in [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md) Step 6. Other audit skills (`pre-release-review`, `audit-tech-debt`, `audit-tests`, `audit-security`, `audit-rules`, etc.) remain situational — cataloged in AGENTS.md, invoked by name when needed.

**Why still deferred:** Deciding whether the remaining quality skills should become first-class loop steps (e.g. before Step 7 Ship) or stay situational needs more practice runs — `code-review` integration is the first data point, not the full answer.

**Revisit when:** Doing a broader pass on WORKFLOW_GUIDE.md's phase loop, or once `pre-release-review` and the audit skills have been run enough times in practice to know whether they belong as named steps rather than ad hoc invocation.

### Cursor capability utilization audit

**What:** A full scan of **official Cursor documentation** (product docs, agent best-practices, hooks, skills, rules, subagents, MCP, cloud agents, modes, indexing) against **this repo's actual setup** — rules, skills, plans, agents, ignore files, workflow docs, and how the PM + agents use Cursor day to day. Goal: find places where we're **underutilizing** Cursor — features we could adopt, wire up, or document without fighting the existing workflow. Complements the resolved `.cursor/` scope hygiene pass (thin `.cursor/README.md` router + DOC_RULES audit-artifact row, 2026-07-08); this item is about *what* Cursor can do that we're not using yet.

**Deliverable:** A research brief in `docs/research/` (`RESEARCH-NNNN-cursor-utilization-audit.md`) with: (1) inventory of Cursor capabilities relevant to this template, (2) inventory of what Seminova already uses, (3) gap list ranked by effort vs. payoff, (4) concrete recommendations (adopt now / backlog / skip with reason). Follow-on work may spawn new skills, hooks, rules, workflow-guide updates, or backlog items — but the audit itself is read-only.

**Why deferred:** The current workflow is productive; a utilization pass is optimization, not a blocker. It needs dedicated time to read Cursor docs thoroughly (they evolve quickly) and map them against a repo that has grown substantial `.cursor/` surface area — not a side task during a build.

**Revisit when:** Between phases with a half-day budget for workflow improvement, before forking the template to a new product (so spinoffs inherit current Cursor best practices), or when a specific "could Cursor do this?" question keeps coming up in build sessions.

### Documentation surface area & context-bloat audit

**What:** A structured audit of the repo's **documentation and agent-guidance surface** — README files (root, `.cursor/`, `docs/*/README.md`), [DOC_RULES.md](DOC_RULES.md), [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md), [AGENTS.md](../AGENTS.md), [`.cursor/rules/`](../.cursor/rules/) (especially [rules/README.md](../.cursor/rules/README.md)), skills, audit artifacts, and cross-doc duplication — with the goal of reducing **context bloat** when Cursor indexes the repo and auto-loads rules. The concern is not raw byte count alone (~3 MB tracked today) but **redundant prose** that gets pulled into agent context repeatedly: the same fact stated in multiple places, docs that have grown beyond their stated role, router READMEs that became mini-monoliths, and regenerated snapshots that surface stale guidance in @Codebase. Audit questions include: what belongs in always-on rules vs. glob-attached vs. on-demand only; where thin routers should replace duplicated tables; whether root audit artifacts should move to a dedicated directory; and whether additional paths belong in [`.cursorindexingignore`](../.cursorindexingignore). Complements [RESEARCH-0001](research/archive/RESEARCH-0001-cursor-ignore-files.md) (archives + secrets already soft/hard-blocked) and the separate [Cursor capability utilization audit](#cursor-capability-utilization-audit) item (product features we're not using yet — not doc hygiene).

**Deliverable:** A research brief in `docs/research/` (`RESEARCH-NNNN-doc-context-bloat-audit.md`) with: (1) inventory by file/role with approximate size and auto-load behavior (always-on rules, glob-attached rules, on-demand docs), (2) duplication map — same guidance stated in N places, (3) bloat candidates ranked by trim effort vs. context savings, (4) concrete recommendations (trim now / router pattern / indexingignore / backlog / skip with reason). Follow-on work may update DOC_RULES roles, add ignore patterns, split or thin AGENTS sections, or spawn sub-items — but the audit itself is read-only.

**Why deferred:** RESEARCH-0001 addressed the highest-volume indexing noise (archived plans, frozen docs). The remaining concern is qualitative — overlapping README routers, AGENTS.md growth, and rules that may have expanded beyond their attach globs — and needs a deliberate comparison pass across the doc stack, not ad hoc trims during a build.

**Revisit when:** Between phases with a half-day budget, before forking the template (spinoffs inherit the full doc stack), when @Codebase or always-on rules start surfacing stale or contradictory guidance in build sessions, or after AGENTS.md or `.cursor/rules/README.md` grow meaningfully again.

### Workflow skill next-step breadcrumb audit

**What:** Audit every skill in the documented planning workflow ([WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md) numbered loop + [Other planning-system skills](WORKFLOW_GUIDE.md#other-planning-system-skills)) — Cursor-side (`.cursor/skills/`) and Claude-side (installed per [WORKFLOW_SETUP.md](WORKFLOW_SETUP.md)) — for a consistent **next-step breadcrumb** at skill close-out: a short, explicit handoff telling the PM what to invoke or do next (e.g. `ship-phase`'s "What happens next (human only)", `archive-cursor-plans`'s "Next steps" block, `research` Step 6 downstream suggestions). Inventory which skills already have one, which end abruptly after a report with no handoff, and whether the existing patterns should converge on one section name and shape.

**Deliverable:** Gap list per skill (has breadcrumb / partial / missing / N/A because terminal), a recommended standard close-out template (when to name the next `/skill`, when to say "human only", when to omit), and follow-on edits to skill `SKILL.md` files — the audit itself is read-only; implementation is a separate pass.

**Why deferred:** Breadcrumbs exist ad hoc on a few skills (`ship-phase`, `archive-cursor-plans`, parts of `research`) but are absent on others that sit on critical handoff points (`mark-epic-complete`, `initialize-project`, `lexicon-audit`, `archive-research`, and likely several Claude-side skills). Standardizing without an inventory risks wrong or redundant "next step" copy — especially where the correct handoff depends on context (more epics vs. phase ship vs. back to Claude for `plan-review`).

**Revisit when:** Between phases with a short workflow-improvement window, after a build session where the PM had to ask "what do I do now?" at a skill boundary, or when adding a new planning-system skill (define the breadcrumb contract up front).
