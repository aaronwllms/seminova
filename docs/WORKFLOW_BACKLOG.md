# Workflow Backlog

**What this is.** Deferred improvements to the _collaboration system itself_ — the planning/build workflow, skills, and docs that Aaron and the agents use to develop Seminova. This is **not** product roadmap (that's `ROADMAP.md`); nothing here ships in the product. These are decisions consciously parked to revisit later, kept here so they outlive any temporary handoff doc.

**Why it exists.** Parked workflow decisions used to live inside the docs-restructure handoff plan — a doc slated for deletion once the restructure ships. Without a permanent home, those decisions would vanish with it. This file is that home.

**How to use it.** Each entry is a deferred decision with its reason for deferral and the signal that should bring it back. Pull an item out when its trigger fires; delete it when it's resolved (record the resolution as an ADR if it qualifies).

---

## Deferred items

### Epic size threshold calibration

**What:** The right epic size — where one agent build-window ends and context starts degrading — can't be set in advance. `phase-planning` encodes the principle (size epics to fit one build-window) but leaves the threshold to be felt out from real runs.
**Why deferred:** No real build data yet. The threshold is PM-owned and experience-driven.
**Revisit when:** A build starts degrading mid-epic — agent loses coherence, makes contradictory changes, or needs repeated correction. That's the signal to tighten the size guidance in `phase-planning`.

### TDD-first as the plan's verification loop

**What:** Adopt test-driven development as the build loop — write tests first (as the spec), confirm they fail, then build to green — instead of the current build-then-test-at-the-end approach. This is Cursor's officially recommended pattern for giving the agent a verifiable target ([best-practices guide](https://cursor.com/blog/agent-best-practices)).
**Why deferred:** It's a change to the planning/build _structure_, not a quick skill tweak, and Aaron deliberately chose end-stage testing for now (avoids mid-build debug loops bloating the context window). Worth a considered adoption, not a reflex.
**Revisit when:** Doing a focused pass on planning-structure improvements, or when end-stage testing starts producing failures that are expensive to localize.

### `grill-me` vanilla trial

**What:** Trial the vanilla `grill-me` skill in a separate, throwaway chat before adopting any grilling capability into the restructured system.
**Why deferred:** Want to feel the unmodified skill's behavior before deciding how (or whether) it folds into phase-planning.
**Revisit when:** Before the `grill-with-docs` adoption below.

### `grill-with-docs` as the front-half of phase-planning

**What:** Adopt structured grilling (reads LEXICON + ADRs first, treats settled ground as closed, spends questions only on what's genuinely open) as the _first motion_ of phase-planning — sharpening the existing "pull the shape out of the PM" step, not adding a separate skill.
**Why deferred:** Depends on LEXICON and the ADR corpus existing and being lived-in, so grilling has settled ground to read. Trial vanilla `grill-me` first.
**Revisit when:** After the doc restructure lands and LEXICON has real content.

### Phase 7 decomposition fork (enrich phase-planning vs. adopt to-prd/to-issues)

**What:** Decide the long-term shape of decomposition — (A) enrich the existing `phase-planning` + `plan-next-epic` pipeline, keeping single-source, human-in-loop workflow; or (B) adopt Pocock's `to-prd` + `to-issues` and move toward independently-grabbable, parallel-agent issues.
**Why deferred:** The two paths lead to different workflows (single-agent vs. parallel-agent), and the choice shouldn't be pre-made. The biggest architectural-alignment win may already arrive through better grilling input, making this fork less urgent than it looks. **Current posture: the existing pipeline stays; the swap is deferred indefinitely, not scheduled.**
**Revisit when:** After running a full real planning cycle on the restructured system, with grilling in place — let lived experience decide.

### plan-review thinning + automated review

**What:** Two linked moves. (1) As front-loaded grilling proves it produces complete-enough plans, shrink `plan-review` from "catch architectural mistakes" to "verify execution." (2) Only once that thinning has happened, consider an automated Opus-reviews-the-build loop (distinct from today's Claude-as-thinking-partner role).
**Why deferred:** plan-review currently earns its keep as a second-model check on a single agent's blind spots and covers Aaron's self-identified architecture-experience gap. It's transitional, but dropping it now is premature — keep it until judgment grows.
**Revisit when:** Confidence is high that grilling → constrained plans rarely surface architectural errors at review time.
