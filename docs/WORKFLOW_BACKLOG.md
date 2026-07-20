# Workflow Backlog

**What this is.** Deferred improvements to the _collaboration system itself_ — the planning/build workflow, skills, and docs that the PM and the agents use to develop Seminova. This is **not** product roadmap (that's [ROADMAP.md](../ROADMAP.md)); nothing here ships in the product. These are decisions consciously parked to revisit later, kept here so they outlive any temporary handoff doc. Placement in the doc stack is defined in [DOC_RULES.md › Document roles](DOC_RULES.md#document-roles).

**Why it exists.** Parked workflow decisions used to live inside the docs-restructure handoff plan — a doc slated for deletion once the restructure ships. Without a permanent home, those decisions would vanish with it. This file is that home.

**How to use it.** Each entry is a deferred decision with its reason for deferral and the signal that should bring it back. Pull an item out when its trigger fires; delete it when it's resolved (record the resolution as an [ADR](adr/README.md) if it qualifies).

**Last updated:** 2026-07-12 (`absorb-skill-feedback` item added)

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
  - [Pre-release review value audit](#pre-release-review-value-audit)
  - [Rename LEXICON.md to CONTEXT.md; separate glossary from as-built pointers](#rename-lexiconmd-to-contextmd-separate-glossary-from-as-built-pointers)
  - [Rules & skills: stage-stable guidance vs. direct code references](#rules--skills-stage-stable-guidance-vs-direct-code-references)
  - [Skill naming convention alignment (Cursor + Claude)](#skill-naming-convention-alignment-cursor--claude)
  - [code-review: per-rule fan-out to fix recall variance](#code-review-per-rule-fan-out-to-fix-recall-variance)
  - [Move mechanically-checkable rules to lint (starting with import-direction boundaries)](#move-mechanically-checkable-rules-to-lint-starting-with-import-direction-boundaries)
  - [`check:auth-boundary` runs only incidentally under `test:ci`](#checkauth-boundary-runs-only-incidentally-under-testci)
  - [Build the `absorb-skill-feedback` skill](#build-the-absorb-skill-feedback-skill)
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

### Promote "batch edits, write once" from tip to standing rule

**What:** [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md) currently lists "batch file edits, then write once" as a Tips-section suggestion. Given `filesystem:write_file` always does whole-file rewrites (no patch/diff), this may actually be a standing rule rather than a situational tip — worth moving into project instructions alongside the existing "read-before-write discipline" and "whole-file rewrites only" patterns.

**Why deferred:** Don't want to update it in multiple places right now.

**Revisit when:** Doing a broader pass on project instructions, or next time multiple sequential small edits in one session cause noticeable token bloat.

### Workflow Guide visual overview: Mermaid vs. image tradeoff

**What:** [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md)'s Visual overview now uses the same `public/images/workflow-dark.svg` / `workflow-light.svg` picture-tag pattern as [README.md](../README.md), replacing a jumbled Mermaid flowchart. Mermaid renders in both Cursor and GitHub's markdown previews; the image only renders in GitHub's. Revisit once Mermaid's swimlane feature is stable enough to redo the diagram cleanly in Mermaid — evaluate whether it should replace the image or sit alongside it so Cursor viewers get a rendered diagram too.

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

### `check:auth-boundary` runs only incidentally under `test:ci`

**What:** `check:auth-boundary` is a named `package.json` script (`vitest run src/supabase/proxy.unit.test.ts`) that enforces one of the template's hard constraints — which routes are reachable without a session. It is **not** a step in `pnpm pre-push`. It passes today only because `test:ci` happens to run the whole Vitest suite, that test file included. Nothing pins that relationship: narrow `test:ci`'s scope, move the test file, or add a coverage-driven exclude, and the auth-boundary gate silently stops running while `pre-push` stays green. Surfaced during Phase 10 planning (Epic 5 widens the allowlist a second time) and recorded in that PRD's out-of-scope list, which is deleted when the phase ships — hence this entry.

**Why deferred:** The fix is likely one line in `pre-push`, but it isn't obviously *only* that. Adding a named step raises the same question the other `check:*` scripts answer implicitly — is `pre-push` the union of every check, or a fast subset with the rest at CI? That contract is worth stating once for all `check:*` scripts rather than patching one in. Phase 10 is mid-build and this is not blocking it.

**Revisit when:** A dedicated workflow-improvement session, before forking the template (a spinoff inherits an unenforced hard-constraint gate), the next time a `check:*` script is added and its `pre-push` placement is unclear, or immediately if `test:ci`'s scope is ever narrowed.

### Build the `absorb-skill-feedback` skill

**What:** The read side of the skill-feedback loop. `collect-skill-feedback` writes per-run findings to `docs/skill-feedback/<skill>.md`; `absorb-skill-feedback` would read an accumulated log, weight the **gap**-tagged entries over **slip**s, surface recurring deficiencies, and propose concrete revisions to the target skill's `SKILL.md` — essentially `skill-authoring` run with a feedback log as its input. Output is a proposed change for the PM to approve, not an automatic edit.

**Why deferred:** Speculative at n=0 — no log exists yet. The right shape of the absorb step depends on what real accumulated feedback looks like: how many entries before a pattern is trustworthy, the gap/slip ratio, whether recurring findings cluster by class (mis-grade vs. false-citation) or by rule. Designing the mining logic before there's anything to mine would guess at all of it — build it against a real `code-review.md` log, not an imagined one.

**Revisit when:** `docs/skill-feedback/code-review.md` has accumulated several audit runs' worth of entries — enough that recurring gaps are visible — or the first time you want to revise `code-review` off its feedback history rather than off a single run.

**Relationship to other items:** Completes the loop started by `collect-skill-feedback` and `code-review-review`; a specialization of `skill-authoring` (log-driven revision rather than interview-driven authoring).

### ~~Deterministic scripts in agent skills~~

**Resolved 2026-07-09** — [RESEARCH-0003](research/RESEARCH-0003-skills-deterministic-scripts.md).

**What:** Whether skills with heavy procedural logic should incorporate executable `scripts/` (per Cursor's skill convention) for more deterministic runs — which skills, what scripts, and where they live vs. existing `scripts/checks/` CI gates.

**Verdict (summary):** Hybrid, not blanket scripting. **Do now:** `initialize-project` and `archive-cursor-plans` (mechanical cores). **Do next:** shared audit/sync orient evidence scripts; keep judgment-primary skills (`code-review`, `lexicon-audit`, planning skills) prose-only. Invariants stay in `scripts/checks/` per ADR-0002.

**Follow-on (not this research pass):** implement Tier A scripts, update skill-authoring contract, optional `scripts/workflow/` shared orient layer.
