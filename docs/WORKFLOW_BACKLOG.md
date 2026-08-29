# Workflow Backlog

**What this is.** Deferred improvements to the _collaboration system itself_ — the planning/build workflow, skills, and docs that the PM and the agents use to develop Seminova. This is **not** product roadmap (that's [ROADMAP.md](../ROADMAP.md)); nothing here ships in the product. These are decisions consciously parked to revisit later, kept here so they outlive any temporary handoff doc. Placement in the doc stack is defined in [DOC_RULES.md › Document roles](DOC_RULES.md#document-roles).

**Why it exists.** Parked workflow decisions used to live inside the docs-restructure handoff plan — a doc slated for deletion once the restructure ships. Without a permanent home, those decisions would vanish with it. This file is that home.

**How to use it.** Each entry is a deferred decision with its reason for deferral and the signal that should bring it back. Pull an item out when its trigger fires; delete it when it's resolved (record the resolution as an [ADR](adr/README.md) if it qualifies).

**Last updated:** 2026-08-29

---

## Contents

- [Deferred items](#deferred-items)
  - [Epic size threshold calibration](#epic-size-threshold-calibration)
  - [TDD-first as the plan's verification loop](#tdd-first-as-the-plans-verification-loop)
  - [Phase 7 decomposition fork](#phase-7-decomposition-fork)
  - [plan-review thinning + automated review](#plan-review-thinning-automated-review)
  - [Workflow Guide visual overview: Mermaid vs. image tradeoff](#workflow-guide-visual-overview-mermaid-vs-image-tradeoff)
  - [Ad hoc planning workflow (between phases)](#ad-hoc-planning-workflow-between-phases)
  - [Integrate quality skills into the documented workflow](#integrate-quality-skills-into-the-documented-workflow)
  - [Cursor capability utilization audit](#cursor-capability-utilization-audit)
  - [Documentation surface area & context-bloat audit](#documentation-surface-area--context-bloat-audit)
  - [Audit glob breadth on typical UI files](#audit-glob-breadth-on-typical-ui-files)
  - [Workflow skill next-step breadcrumb audit](#workflow-skill-next-step-breadcrumb-audit)
  - [Pre-release review value audit](#pre-release-review-value-audit)
  - [Rename LEXICON.md to CONTEXT.md; separate glossary from as-built pointers](#rename-lexiconmd-to-contextmd-separate-glossary-from-as-built-pointers)
  - [Rules & skills: stage-stable guidance vs. direct code references](#rules--skills-stage-stable-guidance-vs-direct-code-references)
  - [Skill naming convention alignment (Cursor + Claude)](#skill-naming-convention-alignment-cursor--claude)
  - [code-review: per-rule fan-out to fix recall variance](#code-review-per-rule-fan-out-to-fix-recall-variance)
  - [Move mechanically-checkable rules to lint (starting with import-direction boundaries)](#move-mechanically-checkable-rules-to-lint-starting-with-import-direction-boundaries)
  - [Build the `absorb-skill-feedback` skill](#build-the-absorb-skill-feedback-skill)
  - [Theme regeneration as skill vs mode](#theme-regeneration-as-skill-vs-mode)
  - [Retire `docs/archive/`](#retire-docsarchive)
  - [Pre-launch checklist for spinoffs](#pre-launch-checklist-for-spinoffs)
  - [ADR immutability: define an in-place amendment carve-out](#adr-immutability-define-an-in-place-amendment-carve-out)
  - [Move root audit artifacts to `docs/audits/`](#move-root-audit-artifacts-to-docsaudits)
  - [~~Deterministic scripts in agent skills~~](#deterministic-scripts-in-agent-skills) *(resolved)*

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

### Workflow Guide visual overview: Mermaid vs. image tradeoff

**What:** [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md)'s Visual overview uses the same `public/images/workflow-dark.svg` / `workflow-light.svg` picture-tag pattern as [README.md](../README.md), because an earlier Mermaid flowchart was jumbled. The image renders on GitHub; Cursor's markdown preview shows a broken image icon. Mermaid swimlanes (`swimlane-beta`, shipped in Mermaid 11.16.0) would answer "who owns each step" cleanly — two lanes (Claude and Cursor), You as labeled handoff arrows, replacing the SVG in both files rather than keeping two diagrams.

**Decision (2026-08-21):** Hold until Cursor's markdown preview renders swimlanes. Do not push to GitHub just to confirm GitHub's Mermaid version. When Cursor preview works, GitHub can be checked as a follow-on, not as the gate.

**Why deferred:** Cursor preview still shows an error block for `swimlane-beta` (checked 2026-08-21). Replacing the SVG now would make the docs diagram unreadable in the editor we actually use.

**Revisit when:** The demo block below renders as a diagram in this file's Cursor markdown preview — not an error. Then replace the SVGs in WORKFLOW_GUIDE and README with a two-lane swimlane of the current nine-step loop, and drop this item.

**Cursor support check** — open this file in markdown preview. Diagram = supported; error block = still wait.

```mermaid
swimlane-beta LR
  subgraph Claude
    A[Plan phase]
  end
  subgraph Cursor
    B[Plan epic]
  end
  A --> B
```

### Ad hoc planning workflow (between phases)

**What:** Design a lightweight, in-the-moment planning path that sits alongside the phased loop in [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md) — for work that doesn't warrant (or doesn't fit) a full ROADMAP phase: spikes, opportunistic improvements, research-driven explorations, or "we learned something mid-phase and want to act on it now." The workflow would be agile by default (shape → plan → build in one sitting or a short sequence) rather than Draft → Planning → Ready → Active. It would run between phases or alongside an active phase when the scope is small and self-contained. A PRD would be optional — created only when the work is large or ambiguous enough to benefit from the same epic/story decomposition the phased path uses. Primary home is likely a Cursor-side skill (plan mode → build), but cloud agents are a viable alternative for longer research or parallel exploration. May compose with a `research` skill currently in flight — research surfaces options and constraints; ad hoc planning turns a chosen direction into an implementation plan without forcing it through `phase-planning`.

**Why deferred:** The phased loop (`phase-planning` → `plan-next-epic` → build → `ship-phase`) is the only defined planning path today. Ad hoc work still happens informally, but there's no skill, no doc contract, and no clear rule for when to skip a PRD vs. write a lightweight one vs. promote the work into the next ROADMAP phase. Defining that boundary needs a few real ad hoc runs — and the research skill needs to exist first if the two are meant to chain.

**Revisit when:** A concrete between-phases task surfaces that doesn't fit the phase loop (e.g. a spike, a workflow improvement, or a research finding that needs a quick build), or when the `research` skill lands and its output needs a defined "what happens next" handoff.

### Integrate quality skills into the documented workflow

**What:** Consider adding the quality/review skills (`pre-release-review`, `code-review`, `audit-tech-debt`, `audit-tests`, `audit-security`, `audit-rules`, etc.) into the workflow as described in [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md) — currently they live in [`.cursor/skills/`](../.cursor/skills/) and are deliberately left out of the numbered phase loop. Extend to [WORKFLOW_SETUP.md](WORKFLOW_SETUP.md) as needed if any setup step is implied.

**Partially addressed (2026-07-08, 2026-08-21):** `code-review` is now a named manual follow-up after epic commit in [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md) Step 7. `pre-release-review` is listed under the guide's [Experimental](WORKFLOW_GUIDE.md#experimental--not-part-of-the-workflow) section pending the [value audit](#pre-release-review-value-audit) below. The audit skills (`audit-tech-debt`, `audit-tests`, `audit-security`, `audit-rules`, etc.) remain situational — discoverable in [`.cursor/skills/`](../.cursor/skills/), invoked by name when needed.

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

**Relationship to other items:** The "whether root audit artifacts should move" question is now a standalone item — [Move root audit artifacts to `docs/audits/`](#move-root-audit-artifacts-to-docsaudits) — not part of this research pass.

### Audit glob breadth on typical UI files

**What:** Measure how much rule text actually loads when a typical App Router TSX file enters agent context, then decide whether to narrow the overlapping globs. Today four rules match all `src` TypeScript (`security`, `supabase`, `logging`, `typescript`) and five more match `src/app` plus `src/components` (`nextjs`, `ui-shadcn`, `ui-styling`, `ui-accessibility`, `seo`) — about nine rules on a typical page. The authoring skill budgets the always-apply set at ~800 words; auto-attached rules sit outside that budget, so UI work can exceed it without tripping the check.

**Why deferred:** The 2026-08 rules-glob pass fixed confirmed breakage (folded descriptions, glob syntax, attach mechanics) and deliberately left breadth as a separate pass. Pattern tidying without numbers would guess at the cost.

**Revisit when:** Between phases with a short workflow-improvement window, or when UI work starts feeling instruction-heavy.

**Relationship to other items:** Complements [Documentation surface area & context-bloat audit](#documentation-surface-area--context-bloat-audit) (redundant prose and indexing) — this item is specifically about **attached-rule load on a typical file**, not doc duplication.

### Workflow skill next-step breadcrumb audit

**What:** Audit every skill in the documented planning workflow ([WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md) numbered loop + [Other planning-system skills](WORKFLOW_GUIDE.md#other-planning-system-skills)) — Cursor-side (`.cursor/skills/`) and Claude-side (installed per [WORKFLOW_SETUP.md](WORKFLOW_SETUP.md)) — for a consistent **next-step breadcrumb** at skill close-out: a short, explicit handoff telling the PM what to invoke or do next (e.g. `ship-phase`'s "What happens next (human only)", `archive-cursor-plans`'s "Next steps" block, `research` Step 6 downstream suggestions). Inventory which skills already have one, which end abruptly after a report with no handoff, and whether the existing patterns should converge on one section name and shape.

**Deliverable:** Gap list per skill (has breadcrumb / partial / missing / N/A because terminal), a recommended standard close-out template (when to name the next `/skill`, when to say "human only", when to omit), and follow-on edits to skill `SKILL.md` files — the audit itself is read-only; implementation is a separate pass.

**Why deferred:** Breadcrumbs exist ad hoc on a few skills (`ship-phase`, `archive-cursor-plans`, parts of `research`) but are absent on others that sit on critical handoff points (`mark-epic-complete`, `initialize-project`, `lexicon-audit`, `archive-research`, and likely several Claude-side skills). Standardizing without an inventory risks wrong or redundant "next step" copy — especially where the correct handoff depends on context (more epics vs. phase ship vs. back to Claude for `plan-review`).

**Revisit when:** Between phases with a short workflow-improvement window, after a build session where the PM had to ask "what do I do now?" at a skill boundary, or when adding a new planning-system skill (define the breadcrumb contract up front).

### Pre-release review value audit

**What:** Decide whether `pre-release-review` earns a place in the documented workflow — or should be deleted, merged, or left situational only. The workflow is accumulating named steps (`code-review` after epic commit, quality gate in every build plan, `mark-epic-complete`, `ship-phase`, etc.), and `pre-release-review` may be redundant junk or may cover a gap nothing else does. This is a **focused verdict on one skill**, not the broader quality-skills integration pass in [Integrate quality skills into the documented workflow](#integrate-quality-skills-into-the-documented-workflow).

**Questions to answer:**

1. **Overlap map** — What does each step of `pre-release-review` duplicate vs. what already runs elsewhere?
   - Step 1 (automated gates) vs. build-plan quality gate and `pnpm pre-push`
   - Step 3 (scoped code review) vs. `code-review` Standards axis
   - Step 4 (security) vs. `audit-security` and `.cursor/rules/security.mdc`
   - Step 5 (hard constraints) vs. `code-review` Standards + CI `check:*` scripts
   - Step 6 (errors / a11y / DB) vs. rules + `code-review`
   - Step 7 (manual test checklist + docs sync prompt) vs. build handoff and `sync-repo-docs`
2. **Unique value** — If anything in `pre-release-review` is not covered elsewhere, is it worth a standalone skill or should it fold into an existing step (e.g. add manual-test checklist to `code-review` close-out)?
3. **Placement** — If kept: named loop step (where — after `code-review`? before PR? phase ship only?), situational invoke-by-name, or delete the skill entirely.
4. **Cost** — Context window, PM friction, and "another step" fatigue vs. catch rate from real runs (has it ever surfaced something `code-review` or the build gate missed?).

**Deliverable:** A short research brief in `docs/research/` (`RESEARCH-NNNN-pre-release-review-audit.md`) with: (1) overlap table (step → already covered by → gap?), (2) unique-value summary, (3) recommendation — **keep as named step** / **keep situational** / **merge into `code-review` or build plan** / **delete skill**, (4) if kept or merged, the exact WORKFLOW_GUIDE.md step wording to add. Record as an [ADR](adr/README.md) only if the decision changes workflow contracts other skills depend on.

**Why deferred:** `code-review` just landed as a named post-epic step (2026-07-08); running this audit before a few real epic cycles would guess at overlap instead of measuring it. The skill may be junk, but the call needs evidence — not a reflex delete while steps are still being wired up.

**Revisit when:** Between phases with a short workflow-improvement window, before updating WORKFLOW_GUIDE.md / WORKFLOW_SETUP.md with the next batch of named steps, or after 1–2 epic cycles where `code-review` ran but `pre-release-review` was skipped — compare whether anything was missed.

### Rename LEXICON.md to CONTEXT.md; separate glossary from as-built pointers

**What:** Two linked changes, surfaced during Phase 10 planning. (1) Rename `LEXICON.md` to `CONTEXT.md` to align terminology with Matt Pocock's domain-modeling skill, which this workflow's grilling/ADR pattern was adapted from — reduces future confusion about where the pattern originated and what maps to what. (2) In Pocock's model, `CONTEXT.md` is a pure glossary — "totally devoid of implementation details." Seminova's `LEXICON.md` mixes that with as-built reference-implementation pointers (e.g. `check:auth-boundary`, specific file paths as "reference implementation") — content that duplicates what `AGENTS.md` already owns and that goes stale the moment the pointed-to code moves, independent of whether the underlying term's meaning changed. Phase 10 hit this directly: two entries (auth boundary, post-auth redirect) have real definitional changes that could be written the moment the decision was made, while two others (response envelope, save model) only need pointer updates that can't be written until Cursor decides where code lands — one file, two different update timings, because it's carrying two different kinds of content.

**Why deferred:** The rename touches every reference to `LEXICON.md` — the `DOC_RULES.md` document-roles table, `AGENTS.md`, the `lexicon-update` skill (name and content), likely `phase-planning` and `project-kickoff`, and possibly `WORKFLOW_GUIDE.md`. Needs a full inventory pass, not a mid-session edit. The content split (glossary vs. pointers) is a design decision on its own — where do the pointers go instead? A section in `AGENTS.md`? Dropped entirely as redundant? — worth settling deliberately rather than deciding in passing.

**Revisit when:** A dedicated workflow-improvement session, ideally before the next phase that touches LEXICON entries, so the split is in place before more entries accumulate the same mixed shape.

### Rules & skills: stage-stable guidance vs. direct code references

**What:** Audit every `.cursor/rules/*.mdc` file and every `.cursor/skills/**/SKILL.md` (plus related templates like `rule-authoring/TEMPLATE.md` and rules with "Reference Implementations" sections) for **direct references to repo-specific code** — file paths, function/component names tied to a single implementation, line-number citations, and "see `src/...`" pointers — and inventory which guidance **allows or actively encourages** that pattern today. The target posture: rules and skills should remain **true at any repo stage** (empty template, mid-build, shipped product) by stating **principles and illustrative examples** rather than anchoring to whatever file happens to exist right now. Code *examples* (short, fictional or generic snippets that demonstrate shape) are fine; **live code pointers** that go stale when files move, rename, or delete are not.

**Questions to answer:**

1. **Inventory** — Which rules and skills cite `src/...` paths, specific components, or "reference implementation" bullets? Rank by frequency and how central the pointer is to the rule's directive (decorative vs. the rule is unusable without the path).
2. **Encouragement sources** — Where does the system tell authors to do this? Primary suspect: [`rule-authoring`](../.cursor/skills/rule-authoring/SKILL.md) explicitly lists "file paths to reference implementations" under **Keep** and says "Point at a real file over writing a code block." Also check `audit-rules` currency checks, `data-tables.mdc` / `forms.mdc` Reference Implementations sections, AGENTS.md prose links, and any rule README guidance.
3. **Replacement pattern** — For each category of pointer (error envelopes, forms, data tables, auth, storage, tests), what should replace it? Options to evaluate: generic example blocks, role-based descriptions ("the canonical server-action envelope"), pointers to **stable abstractions** (a directory convention, a filename pattern) vs. a specific file, or deferring as-built detail entirely to AGENTS.md (repo truth) while rules stay pattern-only.
4. **Boundary** — What still legitimately needs a path? Candidates: glob attach patterns, migration directory, check-script names, `.cursor/` self-references. Separate "where to look in *this* repo today" (AGENTS.md, audit artifacts) from "how to behave in any repo using this template" (rules/skills).
5. **Follow-on** — Update `rule-authoring` standard, `audit-rules` criteria, and affected rules/skills; optionally add a lightweight lint or `audit-rules` finding category for new direct `src/` citations in rules.

**Deliverable:** A research brief in `docs/research/` (`RESEARCH-NNNN-rules-skills-code-reference-audit.md`) with: (1) inventory table (file → reference type → stability risk), (2) list of guidance that encourages direct references, (3) recommended replacement pattern per category, (4) phased migration plan (rule-authoring first, then highest-churn rules). Follow-on work updates standards and rules — the audit itself is read-only.

**Relationship to other items:** Complements [Rename LEXICON.md to CONTEXT.md](#rename-lexiconmd-to-contextmd-separate-glossary-from-as-built-pointers) (glossary vs. as-built pointers) and [Documentation surface area & context-bloat audit](#documentation-surface-area--context-bloat-audit) (overlap and duplication) — but this item is specifically about **reference stability across repo lifecycle**, not doc size alone.

**Why deferred:** The current `rule-authoring` standard deliberately favors project-specific pointers ("stays DRY and current with the codebase"), and many rules were written under that contract — including during template phases where paths were the fastest way to onboard agents. Reversing it touches most of `.cursor/rules/`, the rule-authoring skill, and several audit skills; needs a deliberate inventory and a new authoring contract before mass edits, or we risk swapping stale paths for vague rules.

**Revisit when:** A dedicated workflow-improvement session (half-day), before forking the template to a new product (so spinoffs inherit stage-stable rules), after a build where agents followed a rule to a moved/deleted file, or when doing the LEXICON → CONTEXT split (same "as-built vs. timeless" design thread).

### Skill naming convention alignment (Cursor + Claude)

**What:** Audit skill **names** (invoke strings and directory / `.skill` filenames) across **both environments** — Cursor-side (`.cursor/skills/`) and Claude-side (`docs/claude-skills/`, installed per [WORKFLOW_SETUP.md](WORKFLOW_SETUP.md)) — and decide on a **consistent naming convention** before any mass renames. Today the catalog mixes several patterns without an explicit rule:

| Pattern | Examples | Notes |
| ------- | -------- | ----- |
| `audit-{thing}` | `audit-rules`, `audit-tests`, `audit-tech-debt`, `audit-security`, `audit-seo` | Largest audit family — action (`audit`) first |
| `{thing}-audit` | `lexicon-audit` | Same job shape as above, opposite word order |
| `{verb}-{noun}` (action first) | `ship-phase`, `plan-next-epic`, `mark-epic-complete`, `initialize-project`, `sync-repo-docs`, `archive-cursor-plans`, `archive-research`, `kickoff-phase`, `create-migration`, `create-mockup` | Workflow / lifecycle verbs lead |
| `{noun}-{verb}` or `{thing}-{action}` | `code-review`, `pre-release-review`, `design-critique`, `rule-authoring`, `github-docs-authoring`, `skill-authoring`, `instructions-authoring` | Subject or artifact leads |
| `{thing}-{verb}` (Claude lexicon) | `lexicon-update`, `project-kickoff`, `phase-planning`, `plan-review` | Overlaps conceptually with Cursor names but different order (`kickoff-phase` vs `project-kickoff`) |
| Bare noun | `research` | No verb prefix |
| Specialty short form | `ux-copy` | Domain-specific, not verb-led |

**Questions to answer:**

1. **Primary axis** — Should names be **verb-first** (`audit-rules`, `ship-phase`) or **noun-first** (`rules-audit`, `phase-ship`)? Or different rules per family (audits vs. workflow steps vs. authoring helpers)?
2. **Audit family** — Standardize on `audit-{thing}` (rename `lexicon-audit` → `audit-lexicon`) or `{thing}-audit` (rename five `audit-*` skills)? Consider discoverability when typing `/audit` in Cursor vs. grouping lexicon work with `lexicon-update` on Claude.
3. **Cross-environment pairs** — Where Claude and Cursor skills are handoff partners, should names **echo** each other (`kickoff-phase` ↔ `project-kickoff`, `plan-next-epic` ↔ `plan-review`, `lexicon-audit` ↔ `lexicon-update`)? If yes, which side is canonical for word order?
4. **Authoring / meta skills** — Keep `{thing}-authoring` (`rule-authoring`, `skill-authoring`) or move to `author-{thing}` / `create-{thing}` to match `create-migration` / `create-mockup`?
5. **Rename cost** — Inventory every reference: skill `name:` frontmatter, `SKILL.md` cross-links, [AGENTS.md](../AGENTS.md) catalog, [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md), [WORKFLOW_SETUP.md](WORKFLOW_SETUP.md), plans, backlog items, and PM muscle memory. Separate **must-rename** (true inconsistency) from **grandfather** (rename cost > payoff).
6. **Authoring contract** — If a convention is chosen, where does it live? Candidates: `skill-authoring` skill, a short section in WORKFLOW_GUIDE or DOC_RULES, or a checklist in `docs/claude-skills/README.md` (if added).

**Deliverable:** A short research brief in `docs/research/` (`RESEARCH-NNNN-skill-naming-convention-audit.md`) with: (1) full inventory table (Cursor + Claude, required vs. optional, workflow vs. situational), (2) pattern taxonomy and outliers, (3) recommended convention per family with rationale, (4) rename map (old → new) or explicit grandfather list, (5) follow-on work estimate (docs-only vs. directory renames + Claude re-upload). Record as an [ADR](adr/README.md) only if the convention becomes a hard template contract for spinoffs.

**Relationship to other items:** Complements [Workflow skill next-step breadcrumb audit](#workflow-skill-next-step-breadcrumb-audit) (skill *content* at close-out) and [Integrate quality skills into the documented workflow](#integrate-quality-skills-into-the-documented-workflow) (skill *placement* in the loop) — this item is specifically about **invoke-name consistency and discoverability**, not what skills do or when to run them.

**Why deferred:** Names grew organically as skills landed; nothing is broken today. Renaming is high-touch (Cursor paths, Claude account-wide reinstall, every doc reference) and should follow a deliberate convention choice, not ad hoc fixes when one name feels wrong.

**Revisit when:** A dedicated workflow-improvement session (half-day), before forking the template (so spinoffs inherit clean names), when adding a new skill and the "what should we call it?" question takes more than a minute, or alongside the [LEXICON → CONTEXT rename](#rename-lexiconmd-to-contextmd-separate-glossary-from-as-built-pointers) pass if `lexicon-audit` / `lexicon-update` are in scope anyway.

### code-review: per-rule fan-out to fix recall variance

**What:** `standards-reviewer` currently holds every in-scope `.cursor/rules/*.mdc` file plus a 12-item smell baseline in one context and sweeps the whole diff against all of it. Six back-to-back `code-review` runs on the identical frozen range (`de518bd...68c196b`, one commit, no code changes between runs) produced largely disjoint finding sets — two runs with the fullest reports still shared only 2 of 8 graded findings (Jaccard ≈ 0.25), and a real data-clump finding (`ProfileDialogProfile`) that one run caught was silently absent from every other run. Recall degrades with search-space size; the fix is to shrink the space per subagent rather than keep tuning prose. Proposed shape: one subagent per glob-matched rule file (via each `.mdc`'s frontmatter `globs:`), each reading only the rule and the files its globs match — not the whole diff — plus one unscoped subagent for the smell baseline (smells are whole-diff observations, not tied to a rule) and always-apply rules (`typescript.mdc`, `project-standards.mdc`, `code-minimalism.mdc`, `general-conventions.mdc`, `AGENTS.md` § Hard constraints), which see the full diff by necessity. Two known costs to design around: (1) splitting rules from smells breaks today's "the repo overrides" suppression (a rule-holding agent can suppress a smell the baseline would flag; a smell-only agent can't) — suppression would need to move to the aggregation step in `SKILL.md`; (2) more parallel subagents means more tokens per review, permanently, for checks that don't need judgment — see the lint item below, which shrinks the search space instead of parallelizing it.

**Why deferred:** This is an architecture change to `code-review`'s subagent dispatch (`SKILL.md` step 3–4 and both `.cursor/agents/*.md` files), not a prose edit. Four rounds of prose-only fixes already landed — cap removal, mandatory quoting, the epic-plan input, and a severity classifier replacing the judgment-based ladder (`grading.md`) — and each measurably improved something (recall, fabrication, blocker detection). Fan-out is the next lever once prose is exhausted, and it should be scoped and measured, not built reactively mid-epic.

**Revisit when:** Prose-tuning `code-review`'s agent files stops producing measurable gains between runs (diminishing returns), before relying on `code-review` as a hard gate for a higher-stakes epic, or when token cost is not a binding constraint and the recall gap is.

### Move mechanically-checkable rules to lint (starting with import-direction boundaries)

**What:** Some `code-review` findings are pure pattern-matching with no judgment involved — e.g. `use-blur-save-field.ts` (under `_lib/`) importing a type from `_components/profile/field-save-indicator.tsx`, inverting the repo's `_lib` → `_components` dependency direction. This is exactly what ESLint's built-in `no-restricted-imports` rule is for: a few lines of `eslint.config.*` forbidding `_lib/**` from importing `_components/**` (or the inverse, whichever direction is canonical) turns a probabilistic, sometimes-missed review finding into a deterministic, always-caught lint failure at save/commit time — before code review ever runs. `testing.mdc`'s render-only-test restriction may be a second candidate (detectable via a custom lint rule or a coverage-exclude check) but needs a closer look at feasibility. Every rule moved to lint permanently shrinks `code-review`'s search space on every future run, independent of whichever prose or fan-out state the skill is in.

**Why deferred:** Surfaced as a side finding during the `code-review` reliability deep-dive (2026-07-09), not yet scoped as its own task — needs an inventory pass across `.cursor/rules/*.mdc` for which rules are genuinely mechanical vs. which need judgment, then the actual eslint config change and a check that it doesn't fight existing lint setup.

**Revisit when:** Doing the `code-review` fan-out item above (natural place to also ask "should this rule even be in the reviewer's scope, or should it be lint instead"), or the next time a `code-review` run misses an import-direction or similarly mechanical violation that a prior run caught.

### Build the `absorb-skill-feedback` skill

**What:** The read side of the skill-feedback loop. `collect-skill-feedback` writes per-run findings to `docs/skill-feedback/<skill>.md`; `absorb-skill-feedback` would read an accumulated log, weight the **gap**-tagged entries over **slip**s, surface recurring deficiencies, and propose concrete revisions to the target skill's `SKILL.md` — essentially `skill-authoring` run with a feedback log as its input. Output is a proposed change for the PM to approve, not an automatic edit.

**Why deferred:** Speculative at n=0 — no log exists yet. The right shape of the absorb step depends on what real accumulated feedback looks like: how many entries before a pattern is trustworthy, the gap/slip ratio, whether recurring findings cluster by class (mis-grade vs. false-citation) or by rule. Designing the mining logic before there's anything to mine would guess at all of it — build it against a real `code-review.md` log, not an imagined one.

**Revisit when:** `docs/skill-feedback/code-review.md` has accumulated several audit runs' worth of entries — enough that recurring gaps are visible — or the first time you want to revise `code-review` off its feedback history rather than off a single run.

**Relationship to other items:** Completes the loop started by `collect-skill-feedback` and `code-review-review`; a specialization of `skill-authoring` (log-driven revision rather than interview-driven authoring).

### Theme regeneration as skill vs mode

**What:** The "put a new spin on the design for this project" capability should regenerate theme values only — never structure. Decide whether that ships as a separate, theme-only skill distinct from the structure-establishing design-system skill, or as a mode within it.

**Why deferred:** Unscoped — the skill ships independently of any phase, and the mode-vs-skill call doesn't block anything today. Relocated here from ROADMAP's open questions (2026-07-24): it's a decision about the skill system, not product scope.

**Revisit when:** A dedicated workflow-improvement session, or the next time a spinoff needs re-skinning and the current [DESIGN.md](../DESIGN.md) re-skin workflow proves too manual.

### Retire `docs/archive/`

**What:** Delete `docs/archive/` and its only occupant, `CONTEXT_ARCHIVE.md` (Phases 1–7 epic/story detail carried over from the pre-restructure `CONTEXT.md` planning brief), then remove the guidance governing it. `plan-next-epic` held the last live pointer and it was cut 2026-08-23 — nothing reads the file now. Remaining references: [DOC_RULES.md](DOC_RULES.md) (purpose line, the `archive/` role-table row, rule 6's "never move shipped PRDs into `archive/`" clause, and rule 8 entirely), [`.cursor/rules/documentation.mdc`](../.cursor/rules/documentation.mdc) (layout block, and the first sentence of § Archiving — the rest covers `prds/archive/` and `research/archive/` and stays), [prds/README.md](prds/README.md) ("history lives in the frozen archive"), [`initialize-project`](../.cursor/skills/initialize-project/SKILL.md) (purge bullet), and [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md) (the same bullet in the `initialize-project` touch list).

**Why it matters — inheritance.** `initialize-project` purges the archive's contents in every spinoff. So every product built from this template inherits rule 8, the role-table row, and `documentation.mdc`'s archiving paragraph, all governing an empty directory — guidance that can never fire. A no-op rule propagated to every downstream project, which is the opposite of what the template is for.

**Open question — rule citation brittleness.** Deleting rule 8 renumbers rules 9–14, and those numbers are cited from outside the file (`mark-epic-complete` cites rule 9; WORKFLOW_GUIDE and `promote-backlog-item` cite rule 14; DOC_RULES cites 2, 7, and 14 internally). Three paths: renumber and sweep every citation; delete rule 8's content but keep the slot so 9–14 hold; or stop citing rules by number and cite by name, killing this class of breakage permanently. The third is broader than this item and may deserve its own entry.

**What's lost:** `docs/prds/archive/` starts at phase 8, so `CONTEXT_ARCHIVE.md` is the only product-shaped record of Phases 1–7. Git history keeps the file, and spinoffs never had it, so the loss is Seminova-only.

**Also on record:** the file's header was edited 2026-08-23 to fix a dead link to the deleted `CONTEXT.md` and to correct a stale "append-only" instruction. Rule 8 says never edit the archive; this was a deliberate, approved exception, not tampering.

**Why deferred:** The delete is cheap; the citation sweep across four-plus files is where it goes silently wrong. Surfaced mid-session while trimming `plan-next-epic`, with no deadline forcing it.

**Revisit when:** A dedicated workflow-improvement session, before forking the template (so spinoffs stop inheriting the dead rule), or alongside any other DOC_RULES restructuring where renumbering is already on the table.

### Pre-launch checklist for spinoffs

**What:** A single pre-launch checklist — everything a project spun off from this template must do before its first real launch — so the steps aren't scattered across skills, rules, and doc prose where a spinoff has to already know they exist. Confirmed items so far: run and remediate [`audit-security`](../.cursor/skills/audit-security/SKILL.md); run and remediate [`audit-tech-debt`](../.cursor/skills/audit-tech-debt/SKILL.md); replace the placeholder support email address in the Supabase email templates. Candidates to confirm when the item is picked up: replace the `/privacy` and `/terms` placeholder pages with real content, set the production `site_url` + redirect allowlist and the SEO base URL, and run the remaining audits (`audit-tests`, `audit-rules`, `audit-seo`).

**Open question — where it lives.** [README.md](../README.md) is the stable pitch; a long operational checklist may not belong in it. Alternative: the checklist lives in `docs/` and README carries a one-line pointer. Settle placement before writing, and confirm the choice against [DOC_RULES.md › Document roles](DOC_RULES.md#document-roles).

**Open question — scope boundary.** The checklist and [`initialize-project`](../.cursor/skills/initialize-project/SKILL.md) both cover "things a spinoff must do," at opposite ends of the lifecycle. Decide what belongs to each so the two don't duplicate, and whether any confirmed item is better enforced as a `check:*` script than as a prose checkbox.

**Why deferred:** The item list isn't complete — the three confirmed entries are the ones that surfaced in conversation, not the result of a pass over the repo. Writing it now would ship a partial checklist that reads as authoritative. Nothing is launching yet, so there's no forcing function.

**Revisit when:** The first spinoff approaches production, or during a workflow-improvement session with budget to sweep the repo for the full item set.

### ADR immutability: define an in-place amendment carve-out

**What:** [ADR-0012](adr/ADR-0012-first-password-elevated-write-gated-on-flag.md) was rewritten in place on 2026-08-28, overriding the absolute rule in [adr/README.md](adr/README.md) — "An accepted ADR is **immutable** … The only edit ever made to an existing ADR is that status change." The `has_password` server-stamping work was folded into the existing record rather than written as a superseding ADR-0013, on the grounds that the decision itself was unchanged: the elevated first-password write gated on a profile flag still stands, and only 0012's account of what remained open had moved. **The rule was deliberately left as written** — this is a logged one-off override, not a sanctioned exception. Decide whether the README should carry a carve-out and where its boundary sits.

**Candidate boundary:** amend in place when the decision is unchanged and only its open/closed account moved; supersede when the decision itself changes; PM approval either way.

**Known constraints on any carve-out:**

- **No mechanical test works.** Every proxy considered — ADR age, whether the phase that introduced it has shipped, inbound citation count — either forbids this exact case or permits genuine retconning. ADR-0012 was created 2026-08-27 and Phase 20 shipped the same day, so a ship-gated test would have blocked it. Any carve-out rests on a PM gate, which cuts against the repo's preference for deterministic enforcement over prose guidance.
- **Two files assert it.** [DOC_RULES.md](DOC_RULES.md) § Document roles also calls `adr/` "immutable decision history." A carve-out either edits both or softens DOC_RULES to a pointer so the rule lives in one place.
- **Prior art in the same direction.** The README's own rename note records ADR-0005 being amended to a two-authority refresh model under the same number, described as a filename change. That is already an in-place amendment without a rule to sit under — a carve-out would give it one.
- **In-place amendment keeps the number,** so inbound references (`SECURITY_AUDIT.md`, `TECH_DEBT_AUDIT.md`, `.cursor/rules/security.mdc`) survive untouched. The cost is to a reader who remembers the old text, not to link integrity.

**Why deferred:** Nothing is broken, and a single override with no rule change is recoverable. Settling the boundary well is its own decision, and drafting it mid-epic would ship a rule written to justify one edit. The real risk is repetition — "immutable, except sometimes" weakens each time it is bent without definition.

**Revisit when:** A second ADR needs an in-place edit; during a dedicated workflow-improvement session; or before forking the template, so spinoffs stop inheriting an absolute rule that the practice already contradicts.

**Relationship to other items:** Touches the same file as [Retire `docs/archive/`](#retire-docsarchive) (DOC_RULES restructuring, rule renumbering) — worth pairing if either is picked up.

### Move root audit artifacts to `docs/audits/`

**What:** Move the six regenerated audit snapshots (`TECH_DEBT_AUDIT.md`, `SECURITY_AUDIT.md`, `TEST_AUDIT.md`, `RULE_AUDIT.md`, `SEO_AUDIT.md`, `AGENTS_AUDIT.md`) from the repo root into `docs/audits/`. Update the six audit skills, [DOC_RULES.md](DOC_RULES.md) (role table + path language), [documentation.mdc](../.cursor/rules/documentation.mdc) (layout — this is a new `docs/` folder, which that rule currently forbids without a PM call), [`initialize-project`](../.cursor/skills/initialize-project/SKILL.md), and [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md). Leave README, AGENTS, CLAUDE, ROADMAP, BACKLOG, DESIGN, LEXICON, and all tool configs at root.

**Why deferred:** The move is mechanical and touches a lot of pointers for a tidy, not a product change. Root placement is currently the documented contract. Worth doing only if the GitHub file list reading as a health-report dump starts to matter — especially before a public template browse or a spin-off.

**Revisit when:** Before forking the template, or when the next audit-skill edit is already touching those path strings.

**Relationship to other items:** Narrower than [Documentation surface area & context-bloat audit](#documentation-surface-area--context-bloat-audit). That item stays a read-only inventory. This item is the one concrete relocation already judged worth doing.

**Out of scope:** Nesting Next/ESLint/Vitest configs. Moving the ESLint gate files (placed at root on purpose). Moving ROADMAP / BACKLOG / DESIGN / LEXICON.

### ~~Deterministic scripts in agent skills~~

**Resolved 2026-07-09** — [RESEARCH-0003](research/RESEARCH-0003-skills-deterministic-scripts.md).

**What:** Whether skills with heavy procedural logic should incorporate executable `scripts/` (per Cursor's skill convention) for more deterministic runs — which skills, what scripts, and where they live vs. existing `scripts/checks/` CI gates.

**Verdict (summary):** Hybrid, not blanket scripting. **Do now:** `initialize-project` and `archive-cursor-plans` (mechanical cores). **Do next:** shared audit/sync orient evidence scripts; keep judgment-primary skills (`code-review`, `lexicon-audit`, planning skills) prose-only. Invariants stay in `scripts/checks/` per ADR-0002.

**Follow-on (not this research pass):** implement Tier A scripts, update skill-authoring contract, optional `scripts/workflow/` shared orient layer.
