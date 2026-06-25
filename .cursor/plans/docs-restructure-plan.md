# Docs Restructure & Workflow Adoption — Handoff Plan

**Status:** Planning complete, not yet started. Execution begins at Phase 0.
**Created:** 2026-06-24
**Origin:** Long planning conversation (Claude Opus) reacting to Matt Pocock's "skills for real engineers" workflow (github.com/mattpocock/skills) and two of his talks/workshops.

> **Read this first — how to use this doc.** This is a full-context handoff, not a checklist. It records *decisions and the reasoning behind them*, including alternatives we rejected, so you can defend the plan rather than re-litigate it. Where you think a decision is wrong, argue from the reasoning here — don't pattern-match to something new.
>
> **One warning, because it bit us twice.** Do not map Pocock's constructs onto Seminova's by surface resemblance. Verify the underlying *semantics* match before treating two things as equivalent. This produced two false equivalences earlier in planning: (1) "our 150-line rule = his deep modules" — wrong, they're in *tension*; the line rule pushes toward shallow modules. (2) "our Deferred Decisions = ADRs" — wrong, deferred decisions are explicitly *undecided*, ADRs are decisions *already made*. When in doubt, re-derive from principle.

---

## 1. Why we're doing this

**Trigger:** Pocock's workflow separates planning into discrete, single-job documents and skills — a domain glossary (`context.md`), architecture decision records (ADRs), a disposable PRD per feature, and a grilling skill (`grill-with-docs`) that builds shared language before any code is planned. The structure is legible to product managers because it mirrors how product orgs already work: roadmap → spec → tickets.

**Problem it solves for Seminova:**

- **CONTEXT.md is a junk drawer.** It currently does ~5 distinct jobs at once (product definition, architecture reference, domain model, living state, active-work spec, deferred decisions). These have *different rates of change*. Mixing near-immutable content (product pitch) with fast-churning content (active phase) means every small update rewrites a file that also holds stable content — this is the source of the stale-overwrite risk we already work around.
- **Token inefficiency.** Every planning session loads the whole file, including the "what is Seminova / who it's for" preamble that most sessions don't need.
- **Audience legibility.** Seminova is a *template for PMs who build with AI but don't have deep dev backgrounds* (that's the whole product thesis). PRD / roadmap / glossary vocabulary is *more* legible to that audience than a bespoke CONTEXT.md structure. Adopting Pocock's vocabulary here is meeting users where their mental models already are — NOT cargo-culting.

**Core organizing principle we extracted (this is the real lesson, not any single file):**
> Separate documents by **rate of change / lifecycle**, not by topic. A glossary is permanent and grows slowly. An ADR is immutable once written. A PRD is disposable once shipped. Living state churns constantly. Each lifecycle wants its own file.

---

## 2. Target architecture

CONTEXT.md is **retired** (see §3 for why this is correct, not just convenient). The from-scratch structure:

```
README.md        — what Seminova is, who it's for (humans evaluating the template)
ROADMAP.md       — anticipated phases (thin stubs) + living status (the planning horizon)
prds/            — one PRD per phase (draft → active → shipped)
LEXICON.md       — shared architectural language (the "ubiquitous language" layer)
docs/adr/        — architecture decision records (decisions + rationale)
LOCKED_RULES.md  — inviolable product/architecture constraints (EXISTS — keep)
AGENTS.md        — build-time conventions + current schema (EXISTS — keep)
DOC_RULES.md     — how these docs are maintained (EXISTS — will need rewrite)
DESIGN.md        — token architecture / re-skin workflow (EXISTS — keep; surfaced via DOC_RULES)
CONTEXT_ARCHIVE.md — shipped-phase detail + resolved decisions (EXISTS — keep)
.cursor/rules/   — execution-time coding standards (EXISTS — keep, unchanged; see §5)
```

Every file has exactly one job and one lifecycle. Nothing is a junk drawer.

### Naming decisions (and why — these were deliberate, don't revert)

- **LEXICON.md, not `context.md`.** Pocock names his glossary `context.md`. We reject that name for two concrete reasons: (1) **case-collision** — on default macOS (case-insensitive filesystem), `context.md` and our existing `CONTEXT.md` are the *same file*; (2) **overloading** — "context" is so generic it invites the junk-drawer problem to recur. Pocock himself admits on-camera that "context" is badly overloaded. This is the one place his naming is the weakest link, so we beat it rather than match it. `LEXICON.md` (or `GLOSSARY.md`) says exactly what it is to both PM and dev.
- **Seminova's glossary is an *architectural* lexicon, not a *domain* glossary.** Pocock's glossary is rich because his app has real domain language ("standalone video = video with null lesson_id"). Seminova is a *template* — its domain is deliberately near-empty, to be filled by spinoffs. But Seminova's *architectural* language IS rich and worth documenting: primitive-first, semantic token, admin gate, service client, operational-vs-fault error, the `/` + `/auth/**` boundary, and now deep module / seam / interface / adapter. Spinoffs inherit the architectural lexicon and grow the domain layer on top.
- **README reclaims the pitch.** The "what is Seminova / who it's for" content (CONTEXT.md §3–4) was always README material — it's for humans evaluating the template. It got trapped in CONTEXT.md by accident of starting with one file.
- **ROADMAP holds living state.** Phase status (shipped / active / draft) *is* roadmap state. Living state is small and belongs with the roadmap, not in a separate file.

---

## 3. Why CONTEXT.md is retired (not repurposed)

Once LEXICON extracts the domain/architecture language, LOCKED_RULES holds the rules, and AGENTS.md holds schema + build workflow, CONTEXT.md is left holding only the **pitch** (→ README) and **living state** (→ ROADMAP). Both find better homes. What remains is *nothing* — its existence was an accident of starting with a single file. The name "context" is generic enough that keeping the file would just let it become a junk drawer again. Killing it is the clean call.

**Rejected alternative:** repurpose CONTEXT.md as the archive. Rejected because CONTEXT_ARCHIVE.md already exists for shipped-phase detail, and shipped PRDs archive themselves. Repurposing a confusingly-named file just relocates the confusion.

---

## 4. The pipeline split (Claude vs Cursor)

The boundary becomes **principled** instead of mechanical: **Claude/Opus owns tool-agnostic reasoning and alignment; Cursor owns everything that depends on the `.cursor/rules/`.**

```
ROADMAP.md (thin phase stubs)
   → pick a phase
   → [CLAUDE/OPUS] grill-with-docs  (grow LEXICON, write ADRs, reach alignment)
   → [CLAUDE/OPUS] to-prd           (synthesize the PRD — the destination doc)
   → ——— handoff artifact: the PRD ———
   → [CURSOR] to-issues             (slice PRD into rule-aware vertical-slice issues)
   → [CURSOR] implement
   → review (transitional — see §6)
   → ship → mark phase shipped on ROADMAP, archive PRD
```

### Why `to-issues` goes to Cursor and `to-prd` stays with Claude (VERIFIED from skill bodies, not inferred)

- **`to-issues` is the rule-hungry step.** Its SKILL.md: it *explores the codebase*, cuts each slice through *all layers (schema, API, UI, tests)*, and looks for *prefactoring* opportunities (restructuring existing code). All three touch exactly the surfaces `.cursor/rules/` constrain (next/image, shadcn CLI, primitive-first, component size). Putting it in Cursor means issues come out rule-consistent *by construction* — the rules auto-attach at execution time.
- **`to-prd` does NOT touch the code surface.** Its SKILL.md: *no interview, avoids file paths and code snippets* ("they go stale fast"). It synthesizes problem statement, user stories, decisions. There's almost nothing for the rules to constrain. So it stays on the Claude side as pure reasoning.
- **Note:** `to-issues` also wants the **domain glossary and ADRs** ("issue titles and descriptions should use the project's domain glossary vocabulary, and respect ADRs"). Those are repo files, readable by Cursor — fine. Just means the Cursor side reads LEXICON + ADRs, not only rules.
- **Cost we accept:** slicing happens in Cursor/Composer (weaker reasoning than Opus). Acceptable because slicing a well-formed PRD is more *mechanical* (decomposition against rules) than the open architectural judgment in grilling/PRD. Right place to spend the cheaper model.

---

## 5. Rules: stay where they are (decided, with reasoning)

**Cursor rules (`.cursor/rules/*.mdc`) are execution-time coding standards. They stay in Cursor, unchanged.** Their auto-attach (frontmatter globs) only works inside Cursor anyway.

**Why we did NOT create a planning-time "digest" of the rules for Claude:** duplicating rule content into the planning side creates two sources for the same constraint, and two sources drift. That drift is noise, and noise leads to worse outcomes. **One constraint, one home.**

**The one genuinely narrow case:** a rule that encodes a *design decision* (not a coding standard) that planning needs to know. The fix is NOT to copy the rule — it's that the *decision* was always LEXICON/ADR content, and the rule is just its execution-time enforcement. The decision lives once (LEXICON/ADR); the rule enforces it in Cursor. Different layers of the same thing, not two copies.

**What happens if a Claude-written issue accidentally conflicts with a rule:** the rule still fires when Cursor implements (auto-attach at the point of writing code). It's a backstop. The `to-issues`-in-Cursor decision (§4) makes even this rare, because issues are generated where the rules are visible.

**Observation worth keeping:** Pocock under-discusses rules because his stack leans on TDD + deep modules + lexicon to carry quality, with few codified coding standards. Seminova *has* a real rules layer he doesn't. That's a Seminova strength, not a gap to close.

---

## 6. Decisions reached (with rationale + rejected alternatives)

- **150-line rule vs deep modules — TENSION, not equivalence.** The line rule is a *complexity limiter*; deep modules is an *interface-design philosophy*. Applied naively, the line rule pushes toward *more, smaller files* = shallow modules, which is what Pocock argues against. File size is a symptom; interface shape is the real signal. **Action:** the 150-line rule's fate is the first ADR (ADR-0001). We don't remember the original rationale, so the ADR can't be archaeology — it's a *re-decision now*: keep / revise to "deep-module-first, 150 as a warning signal not a hard split trigger" / drop. Writing the ADR is a forcing function.
- **Adopt ADRs.** Pocock's format is deliberately lightweight: `# Title` + 1–3 sentences (context, decision, why). Optional Status/Considered-Options/Consequences only when they add value. Bar for writing one — ALL THREE must hold: (1) hard to reverse, (2) surprising without context, (3) result of a real trade-off. ADRs live in `docs/adr/` as `0001-slug.md`, sequential. **Spinoffs inherit `docs/adr/`** with Seminova's foundational decisions already recorded.
- **ADR creation trigger is conversational, not automatic.** In Pocock's system it's a side-effect of other skills (grill-with-docs offers one when a qualifying decision crystallizes; improve-codebase-architecture offers one when you reject a candidate with a load-bearing reason). For us, the natural carriers are the grilling skill and possibly plan-review.
- **PRDs are many + disposable, one per phase.** Matches the PM mental model ("we shipped that; now a new PRD for the next feature set"). The current single "active phase" concept *dissolves* — it was an artifact of CONTEXT.md being one living document that could only hold one thing in flight.
- **Roadmap drives PRDs; grill stays close to the work.** ROADMAP.md holds *thin* phase stubs. Each phase gets grilled into a PRD only *when it's its turn*. **Rejected alternative:** front-load grilling for a batch of PRDs up front. Rejected because grilling is most accurate close to the work — front-loaded PRDs go stale as you learn from shipping earlier ones. Thin-stub-until-its-turn keeps the roadmap legible AND grilling fresh.
- **Plan-review is TRANSITIONAL, not permanent.** Today plan-review exists because Cursor makes architectural decisions at plan time that nobody constrained. In the new flow, architecture is decided up front (grilling → PRD → constrained issues), so Cursor stops exercising architectural judgment — it executes a spec. The review's job *shrinks* from "catch design mistakes" to "verify execution." Keep the existing plan-review as a safety net through Phase 6 *while building confidence that front-loaded grilling produces complete-enough issues*. Once proven, it thins to execution-verification — and *that's* when the automated review question (below) goes live. Do NOT carry the full architectural plan-review forward as permanent.
- **The plan-review piece has genuine value for THIS user.** It's a real second-model check on a single agent's blind spots, and it covers the user's self-identified architecture-experience gap. Pocock gets the same value via his automated Opus-reviews-Sonnet step. Keep it until judgment grows; drop later, not now.

---

## 7. Phase plan

**Guiding principle: additive first, destructive last.** Every phase must leave the repo in a working state. Extract by *copy, not move* until the very end — CONTEXT.md keeps working as-is while new files come alive beside it; skills switch over; CONTEXT.md retires in one clean cut only when nothing reads it.

- **Phase 0 — Map the ground.** Branch. Grep every reference to CONTEXT.md across skills, rules, DOC_RULES, AGENTS.md. Read the skill *bodies* (not just descriptions). Output: a reference map = the real blast radius. No changes. *(Known already from this planning pass: DOC_RULES.md references CONTEXT.md heavily and names skills not yet seen — `sync-context-md`, `sync-repo-docs`, `mark-epic-complete`, `plan-next-epic`, `phase-planning` — plus a `DESIGN.md`. Audit must cover these.)*
- **Phase 1 — Extract stable, low-risk pieces (copy, not move).** Pitch (§3–4) → README. Roadmap (§8 + status) → ROADMAP.md. Least-referenced-by-automation, most-obviously-single-job. Nothing breaks (nothing removed).
- **Phase 2 — Stand up net-new artifacts.** Create LEXICON.md (seed with architectural terms). Create `docs/adr/` with ADR-0001 = the 150-line rule re-decision. Pure addition.
- **Phase 3 — Establish PRD structure.** Create `prds/`. Convert the *current active phase* into the first real PRD as the worked example. Draft phases become thin ROADMAP stubs.
- **Phase 4 — Rewire the skills (the hinge, riskiest).** Repoint phase-planning, plan-review, DOC_RULES, AGENTS.md, and the sync/mark skills from CONTEXT.md sections to the new files. Comes late on purpose — by now the new homes exist and have been lived with. *(Claude-side work rides here — see §8.)*
- **Phase 5 — Cut CONTEXT.md.** Only when grep shows zero live references. Delete. Trivial once Phase 4 is done.
- **Phase 6 — Adopt grill-with-docs.** Net-new alignment skill (no current equivalent). Depends on LEXICON + PRD structure existing. Biggest single win: front-loaded architectural alignment via grilling.
- **THEN HANG.** Stop here. Run a full real planning cycle on the new structure. Decide the Phase 7 fork only after living with it.

### Phase 7 — parked, do NOT pre-decide

- **The decomposition fork.** What happens to the existing `phase-planning` skill: (option A) *enrich* it with module-map discipline, keeping CONTEXT-style single-source workflow; or (option B) *replace* it with Pocock's `to-prd` + `to-issues` and move toward independently-grabbable issues. This is where the "single-agent vs parallel-agent / how much human-in-loop" question finally has to be answered, because the two paths lead to different workflows. **Let the experience of running Phase 6 inform it.** The biggest architectural-constraint win may already arrive through better grilling input, making this fork less urgent than it looks.
- **Automated review.** Pocock's Sonnet-builds / Opus-reviews step is *within an automated loop* (two autonomous agents, no human between). This is a DIFFERENT axis from our Claude-plans / Cursor-builds split (which has a human at the planning tier). Don't conflate: in his world Opus is the autonomous *code reviewer*; in ours Opus is the *human's thinking partner during alignment*. Same model, different role/stage. The automated review becomes live only once plan-review has thinned to execution-verification.

---

## 8. Experiment mechanics (how to try this without abandoning what works)

The new system is a *documentation-and-workflow layer over the same Seminova code* — not a different product. So:

- **Repo side: use a git branch**, not a new repo. A new repo would either fork the code (maintain two) or start empty (can't test migration against real content). A branch is a parallel reality you build out, live with, and merge or delete at zero cost to `main`. **Bonus:** the migration itself is a product artifact — spinoff PMs will have their own CONTEXT.md-style junk drawers to migrate, so a visible before/after branch on the real repo demonstrates the migration path. Suggested branch name: `docs-restructure`.
- **Claude side: the repo branch doesn't cover Claude-side state** (project instructions; skills at `/mnt/skills/user/`). Asymmetry: only the repo has branches. If you change Claude-side skills in place while testing the branch, `main` breaks (its expected skills changed underneath it). Solutions:
  - **Project instructions:** archive current text (dated copy) before changing, so you can restore.
  - **Claude-side skills:** archive by *coexistence*, not deletion — keep old `phase-planning` as `phase-planning-legacy` (or move to an archive folder) while building the new one alongside. Don't invoke the legacy ones during the experiment.
  - **Cleanest option — a new Claude Project as the experiment boundary.** Projects have separate memory spaces. A new project (pointed at the branch, with new instructions/skills) is the "Claude-side branch"; the current project keeps old instructions/skills intact. Abandon → delete the project. Keep → it becomes primary.
  - **Unresolved caveat:** unknown whether Claude-side skills scope per-project or are global to the account. If global, the new-project trick isolates *instructions* but not *skills* — fall back to rename-to-legacy for skills. **Check this before committing to the project-based split.**
- **Symmetry achieved:** stable world = current project + `main`; experiment world = new project + `docs-restructure` branch. Experiment lives entirely in the experiment pair; stable world keeps working throughout.

---

## 9. Working-style constraints for the executing chat

- **Filesystem access is via MCP (`filesystem:*` tools), not sandbox `view`/`bash`.** Call `tool_search "filesystem"` at the start of a fresh chat before any file op. Never `view`/`bash_tool` against the project paths — they fail or search the wrong location.
- **Write pattern:** whole-file rewrite via `filesystem:write_file`. Read the current file immediately before writing (Cursor may have changed it between sessions). No partial-edit tools on these paths.
- **Write gate:** name the file + summarize the change + ask once. The user's "yes" is full authorization — write immediately, no second confirmation. That describe-and-ask message is the only gate.
- **Respond concisely.** Lead with the direct answer; expand only when asked. (Standing user preference.)
- **Canonical doc writes** (CONTEXT.md, CONTEXT_ARCHIVE.md, and the new canonical files) follow DOC_RULES.md write discipline and archive policy — which itself will be rewritten in Phase 4.

---

## 10. Key file paths

- Planning context (to be retired): `/Users/aaronwilliams/projects/seminova/CONTEXT.md`
- Shipped archive: `/Users/aaronwilliams/projects/seminova/CONTEXT_ARCHIVE.md`
- Doc maintenance rules (to be rewritten): `/Users/aaronwilliams/projects/seminova/DOC_RULES.md`
- Agent instructions: `/Users/aaronwilliams/projects/seminova/AGENTS.md`
- Locked rules: `/Users/aaronwilliams/projects/seminova/LOCKED_RULES.md`
- Design/token doc: `/Users/aaronwilliams/projects/seminova/DESIGN.md`
- Cursor rules: `/Users/aaronwilliams/projects/seminova/.cursor/rules/`
- Cursor skills: `/Users/aaronwilliams/projects/seminova/.cursor/skills/`
- Plans (this file): `/Users/aaronwilliams/projects/seminova/.cursor/plans/`
- Pocock's skills repo (reference): https://github.com/mattpocock/skills

---

## 11. Source material (Pocock)

- Conference talk "It Ain't Broke: Why Software Fundamentals Matter More Than Ever" — thesis: deep modules, ubiquitous language, TDD, vertical slices matter *more* with AI; specs-to-code fails because it divests from system design.
- Workshop "Full Walkthrough: Workflow for AI Coding" — grill → PRD → kanban issues (vertical slices) → AFK implement → review. Smart-zone/dumb-zone (~100k token) constraint; clear-over-compact.
- Video on `grill-with-docs` — `grill-me` + a `context.md` glossary + ADRs. Glossary = ubiquitous language (DDD). ADRs for non-obvious decisions the glossary can't capture.
- **Skills relevant to us:** `grill-with-docs` (adopt), `to-prd` (Claude side), `to-issues` (Cursor side), `improve-codebase-architecture` + `codebase-design` (the deep-module vocabulary/skill — feeds LEXICON), ADR format.
- **Skills/machinery we are NOT adopting** (built for parallel agent swarms on a real product; we're single-agent, human-in-loop, on a template): kanban DAG, AFK Ralph loops, parallel independently-grabbable issues as a *primary* mode, Sand Castle. Revisit only if Phase 7 goes that direction.
