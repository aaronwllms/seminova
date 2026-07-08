# Workflow Backlog

**What this is.** Deferred improvements to the _collaboration system itself_ — the planning/build workflow, skills, and docs that the PM and the agents use to develop Seminova. This is **not** product roadmap (that's [ROADMAP.md](../ROADMAP.md)); nothing here ships in the product. These are decisions consciously parked to revisit later, kept here so they outlive any temporary handoff doc. Placement in the doc stack is defined in [DOC_RULES.md › Document roles](DOC_RULES.md#document-roles).

**Why it exists.** Parked workflow decisions used to live inside the docs-restructure handoff plan — a doc slated for deletion once the restructure ships. Without a permanent home, those decisions would vanish with it. This file is that home.

**How to use it.** Each entry is a deferred decision with its reason for deferral and the signal that should bring it back. Pull an item out when its trigger fires; delete it when it's resolved (record the resolution as an [ADR](adr/README.md) if it qualifies).

**Last updated:** 2026-07-08

---

## Contents

- [Deferred items](#deferred-items)
  - [Epic size threshold calibration](#epic-size-threshold-calibration)
  - [TDD-first as the plan's verification loop](#tdd-first-as-the-plans-verification-loop)
  - [Phase 7 decomposition fork](#phase-7-decomposition-fork)
  - [plan-review thinning + automated review](#plan-review-thinning-automated-review)
  - [Promote "batch edits, write once" from tip to standing rule](#promote-batch-edits-write-once-from-tip-to-standing-rule)
  - [Workflow Guide visual overview: Mermaid vs. image tradeoff](#workflow-guide-visual-overview-mermaid-vs-image-tradeoff)
  - [Auto-commit after agent coding runs](#auto-commit-after-agent-coding-runs)
  - [Cursor ignore files (.cursorignore / .cursorindexingignore)](#cursor-ignore-files-cursorignore--cursorindexingignore)
  - [Ad hoc planning workflow (between phases)](#ad-hoc-planning-workflow-between-phases)
  - [Cursor directory scope audit (.cursor/README + guidance drift)](#cursor-directory-scope-audit-cursorreadme--guidance-drift)
  - [Integrate quality skills into the documented workflow](#integrate-quality-skills-into-the-documented-workflow)

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

### Auto-commit after agent coding runs

**What:** Investigate having Cursor automatically commit at the end of an agent coding run (e.g. via hooks, or a skill-level instruction), so every session ends with a clean, committed working tree.

**Why deferred:** Surfaced as a prerequisite-adjacent need for the planned `code-review` skill, whose clean-tree precondition (dirty tree → stop, ask to commit first) only avoids friction if commits already happen reliably after each run. Not yet investigated.

**Revisit when:** Building or refining the `code-review` skill's clean-tree check, or whenever the manual "did you commit?" step becomes a recurring annoyance.

### Cursor ignore files (.cursorignore / .cursorindexingignore)

**What:** Research Cursor's two ignore mechanisms — [`.cursorignore`](https://cursor.com/docs/reference/ignore-file) (hard block: excluded from indexing, Agent, Tab, and @-mentions) and [`.cursorindexingignore`](https://cursor.com/docs/reference/ignore-file) (soft block: excluded from automatic codebase indexing only; still readable when @-mentioned or dragged in) — then decide whether either belongs in this repo and, if yes, commit a minimal, documented baseline.

**Why deferred:** Spotted in another repo; unclear whether Seminova needs them. Cursor already respects `.gitignore` and ships a large default indexing-exclusion list (lockfiles, `node_modules`, `.next`, binaries, media, etc.), so extra ignore files may be redundant for a repo this size. The wrong `.cursorignore` could also hide things agents need — especially under `.cursor/` (rules, skills, plans) or generated types agents rely on. Worth a deliberate pass, not a copy-paste from elsewhere.

**Revisit when:** Indexing feels slow or noisy (@Codebase returns stale or irrelevant hits), agents repeatedly pull in archived plans or audit artifacts, or before spinning off a new product from the template — that's when ignore policy becomes part of what every fork inherits.

### Ad hoc planning workflow (between phases)

**What:** Design a lightweight, in-the-moment planning path that sits alongside the phased loop in [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md) — for work that doesn't warrant (or doesn't fit) a full ROADMAP phase: spikes, opportunistic improvements, research-driven explorations, or "we learned something mid-phase and want to act on it now." The workflow would be agile by default (shape → plan → build in one sitting or a short sequence) rather than Draft → Planning → Ready → Active. It would run between phases or alongside an active phase when the scope is small and self-contained. A PRD would be optional — created only when the work is large or ambiguous enough to benefit from the same epic/story decomposition the phased path uses. Primary home is likely a Cursor-side skill (plan mode → build), but cloud agents are a viable alternative for longer research or parallel exploration. May compose with a `research` skill currently in flight — research surfaces options and constraints; ad hoc planning turns a chosen direction into an implementation plan without forcing it through `phase-planning`.

**Why deferred:** The phased loop (`phase-planning` → `plan-next-epic` → build → `ship-phase`) is the only defined planning path today. Ad hoc work still happens informally, but there's no skill, no doc contract, and no clear rule for when to skip a PRD vs. write a lightweight one vs. promote the work into the next ROADMAP phase. Defining that boundary needs a few real ad hoc runs — and the research skill needs to exist first if the two are meant to chain.

**Revisit when:** A concrete between-phases task surfaces that doesn't fit the phase loop (e.g. a spike, a workflow improvement, or a research finding that needs a quick build), or when the `research` skill lands and its output needs a defined "what happens next" handoff.

### Cursor directory scope audit (.cursor/README + guidance drift)

**What:** Audit how Cursor is wired in this repo — starting with [`.cursor/README.md`](../.cursor/README.md) as the stated entry point — and decide what belongs inside `.cursor/` vs. elsewhere. [DOC_RULES.md](DOC_RULES.md) says agent guidance lives in `.cursor/` (rules and skills) and should not be duplicated into product code, but repo truth and workflow docs now carry substantial agent-facing content too ([AGENTS.md](../AGENTS.md), [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md), audit artifacts, planning docs). Clarify the intended split: what is portable Cursor config (rules, skills, plans, README), what is product/repo truth that agents read but humans own, and what has drifted or duplicated across boundaries. Update `.cursor/README.md` and cross-links so the layout matches the decision — trim outbound pointers that belong in repo docs, or pull guidance back into `.cursor/` where it should live.

**Why deferred:** The current setup works well enough day to day; this is a hygiene and template-portability pass, not a blocker. The right boundary needs a deliberate read of what's actually loaded by Cursor (rules globs, skills, AGENTS.md as repo truth) vs. what's merely linked from `.cursor/README.md` for convenience.

**Revisit when:** Preparing to fork or export the template to another product, after a noticeable "where does this instruction live?" confusion in a build session, or during a broader docs/workflow cleanup pass where DOC_RULES roles and `.cursor/` layout can be reconciled in one sitting.

### Integrate quality skills into the documented workflow

**What:** Consider adding the quality/review skills (`pre-release-review`, `code-review`, `audit-tech-debt`, `audit-tests`, `audit-security`, `audit-rules`, etc.) into the workflow as described in [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md) — currently they're only cataloged in [AGENTS.md › Agent skills](../AGENTS.md#agent-skills-cursorskills) and deliberately left out of the numbered phase loop. Extend to [WORKFLOW_SETUP.md](WORKFLOW_SETUP.md) as needed if any setup step is implied.

**Why deferred:** The current split (numbered planning loop in WORKFLOW_GUIDE, situational quality skills cataloged in AGENTS.md) was a deliberate choice, not an oversight — revisiting it means deciding whether quality skills should become a first-class step in the loop (e.g. after Step 6 Build, before Step 7 Ship) or stay situational/invoke-by-name. Not a quick doc tweak.

**Revisit when:** Doing a broader pass on WORKFLOW_GUIDE.md's phase loop, or once `code-review` has been run enough times in practice to know whether it belongs as a named step rather than an ad hoc invocation.
