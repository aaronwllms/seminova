# Docs Restructure & Workflow Adoption — Handoff Plan

**Status:** In progress, one-piece-at-a-time. The full phased migration is **paused** — pieces are pulled forward individually as they make sense, not run in strict phase order. **Scope was deliberately narrowed (2026-06-27): the first chunk is the doc restructure only. The existing skill pipeline (`phase-planning` + `plan-next-epic` + `plan-review`) is kept and repointed — the `to-prd`/`to-issues` swap is deferred indefinitely (see §4, §6, and `docs/WORKFLOW_BACKLOG.md`).** Current done-vs-not-done state lives in **§Progress**, not scattered through the reasoning sections.
**Created:** 2026-06-24
**Last amended:** 2026-06-29
**Origin:** Long planning conversation (Claude Opus) reacting to Matt Pocock's "skills for real engineers" workflow (github.com/mattpocock/skills) and two of his talks/workshops.

> **Read this first — how to use this doc.** This is a full-context handoff, not a checklist. It records *decisions and the reasoning behind them*, including alternatives we rejected, so you can defend the plan rather than re-litigate it. Where you think a decision is wrong, argue from the reasoning here — don't pattern-match to something new.
>
> **Status vs reasoning are separated on purpose.** Sections §1–§8 hold stable *reasoning* (slow-changing). **§Progress** holds fast-churning *execution status*. This mirrors the rate-of-change principle the whole restructure is built on — don't smear status back into the reasoning sections.
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

CONTEXT.md is **retired** (see §3 for why this is correct, not just convenient). Collaboration-system machinery moves under a `docs/` directory; repo-root-conventional files stay at root. The boundary principle:

> **Root = the contract + product references a spinoff inherits and a tool/human expects up top. `docs/` = the working planning machinery.**

```
ROOT (conventional anchors + agent contract + inherited reference)
  README.md          — what Seminova is, who it's for (humans evaluating the template)
  AGENTS.md          — build-time conventions + current schema (EXISTS — keep)
  LOCKED_RULES.md    — inviolable product/architecture constraints (EXISTS — keep)
  ROADMAP.md         — anticipated phases (thin stubs) + living status (the planning horizon)
  DESIGN.md          — token architecture / re-skin workflow (EXISTS — keep)
  LEXICON.md         — shared architectural language (the "ubiquitous language" layer)
  .cursor/rules/     — execution-time coding standards (EXISTS — keep, unchanged; see §5)

docs/ (collaboration machinery)
  DOC_RULES.md       — how these docs are maintained (EXISTS — will move + need rewrite)
  WORKFLOW_BACKLOG.md — deferred collaboration-system decisions (EXISTS — created 2026-06-27)
  adr/               — architecture decision records (decisions + rationale) [STOOD UP]
  prds/              — one PRD per phase (Planning → Ready → Active → Shipped) [STOOD UP]
    archive/         — shipped PRDs move here on phase-ship
  archive/
    CONTEXT_ARCHIVE.md — frozen pre-restructure shipped-phase history (EXISTS — moved)
```

Every file has exactly one job and one lifecycle. Nothing is a junk drawer.

### Root vs. `docs/` — the calls, and why (decided 2026-06-27)

- **`AGENTS.md` + `LOCKED_RULES.md` stay together in root.** They're the agent contract (locked rules were extracted *from* AGENTS.md). Splitting them adds coupling cost and blast radius for no gain.
- **`ROADMAP.md`, `DESIGN.md`, `LEXICON.md` stay at root.** Each has genuine root-convention / inherited-reference pull. `LEXICON.md` cuts both ways (planning input *and* inherited architectural reference, peer to `DESIGN.md`, and Pocock keeps his glossary top-level) — **resolved to root.**
- **`DOC_RULES.md`, `adr/`, `prds/`, `archive/` go under `docs/`.** These are the working machinery of the collaboration system, not things a spinoff evaluator needs at the top level.

### Naming decisions (and why — these were deliberate, don't revert)

- **LEXICON.md, not `context.md`.** Pocock names his glossary `context.md`. We reject that name for two concrete reasons: (1) **case-collision** — on default macOS (case-insensitive filesystem), `context.md` and our existing `CONTEXT.md` are the *same file*; (2) **overloading** — "context" is so generic it invites the junk-drawer problem to recur. `LEXICON.md` says exactly what it is to both PM and dev.
- **Seminova's glossary is an *architectural* lexicon, not a *domain* glossary.** Pocock's glossary is rich because his app has real domain language ("standalone video = video with null lesson_id"). Seminova is a *template* — its domain is deliberately near-empty, to be filled by spinoffs. But Seminova's *architectural* language IS rich and worth documenting: primitive-first, semantic token, structure-vs-theme, the `/` + `/auth/**` boundary, admin gate, the three Supabase clients (browser/server/service), operational-vs-fault error, and deep module / interface / god file. Spinoffs inherit the architectural lexicon and grow the domain layer on top. (`seam` / `adapter` were listed aspirationally during planning but have **no codified Seminova meaning yet** — they were omitted from the seeded LEXICON rather than fabricated; add them only when the project actually adopts that vocabulary, so spinoffs don't inherit an invented definition as authoritative.)
- **README reclaims the pitch.** The "what is Seminova / who it's for" content (CONTEXT.md pitch sections) was always README material. It got trapped in CONTEXT.md by accident of starting with one file.
- **ROADMAP holds living state.** Phase status (shipped / active / draft) *is* roadmap state. Living state is small and belongs with the roadmap, not in a separate file.

---

## 3. Why CONTEXT.md is retired (not repurposed)

Once LEXICON extracts the domain/architecture language, LOCKED_RULES holds the rules, and AGENTS.md holds schema + build workflow, CONTEXT.md is left holding only the **pitch** (→ README) and **living state** (→ ROADMAP). Both find better homes. What remains is *nothing* — its existence was an accident of starting with a single file. The name "context" is generic enough that keeping the file would just let it become a junk drawer again. Killing it is the clean call.

**Rejected alternative:** repurpose CONTEXT.md as the archive. Rejected because CONTEXT_ARCHIVE.md already exists, and shipped PRDs archive themselves. Repurposing a confusingly-named file just relocates the confusion.

### The archive: freeze and move, do not convert (decided 2026-06-27)

`CONTEXT_ARCHIVE.md` is an **as-built record** — checkboxes, file names, rule paths, migration notes. A PRD is the opposite: forward intent that deliberately avoids file paths and code snippets ("they go stale fast"). They are different artifact types with different lifecycles.

- **Do NOT chop the archive into per-phase PRDs.** Dropping as-built records into `prds/` (a "disposable forward spec" directory) re-introduces the exact lifecycle-mixing this restructure exists to kill.
- **Freeze the existing archive as the legacy, pre-restructure record.** Don't backfill PRDs for already-shipped phases 1–7. Clean line: **everything before the restructure lives in the frozen archive; everything from here forward is a PRD.**
- **Going forward, the shipped PRD *is* the per-phase document.** A PRD's status flips Planning → Ready → Active → Shipped and it moves to `docs/prds/archive/` on ship. That gives the per-phase-file shape without recasting as-built records as specs.
- **Moved to `docs/archive/CONTEXT_ARCHIVE.md`** — frozen. Once the PRD workflow is live, the archive is referenced by nothing: its *write* references are dead (no more `sync-context-md`), and any "see history" cross-links either repoint to the frozen location or are dropped.
- **The "Resolved decisions" block** at the bottom of the archive is a separate small migration: those are decisions-with-rationale → ADR candidates. Ones clearing the three-part bar become ADRs; the rest stay as a plain decisions log. Not part of the freeze. *(Forward-going policy for newly-resolved questions is separate — see §6, 2026-06-29: resolved questions leave ROADMAP with no standing log.)*

---

## 4. The pipeline split (Claude vs Cursor)

The boundary is **principled**: **Claude/Opus owns tool-agnostic reasoning and alignment; Cursor owns everything that depends on the `.cursor/rules/`.**

### First-chunk reality (decided 2026-06-27): keep the existing pipeline

The doc restructure and the skill-pipeline swap are **two independent changes.** Every win actually being chased — killing the junk drawer, rate-of-change separation, ADRs, LEXICON, no more stale overwrites — lives entirely in the *doc* restructure. **None of it requires swapping `phase-planning` / `plan-next-epic` / `plan-review`.** So the first chunk keeps the existing pipeline and just repoints it at the new files.

**Key realization that de-risks this:** `to-prd` is not a new layer above what `phase-planning` already does — it *is* roughly what `phase-planning` produces. `phase-planning`'s "coherent phase with epics and stories" is PRD-level intent; the grilling/alignment motion is `grill-with-docs`; the writing-down motion is `to-prd`. Aaron already does both, just unnamed and unsplit. Likewise `to-issues` (technical slicing through schema/API/UI/tests) is what Cursor's plan step already does implicitly when it turns stories into an implementation plan.

**Why `to-issues`' batch-slice model is NOT adopted now:** it slices a whole PRD into independent, grabbable units up front to enable **parallelism** (a swarm of agents pulling off a kanban DAG without colliding). Seminova is single-agent, human-in-loop — that's a problem we don't have. `plan-next-epic`'s plan-one-at-a-time, just-in-time model is a deliberate workflow preference and is kept.

### What we DO take from Pocock (vs. the whole system)

- **Doc rate-of-change separation** — the core win. Taken.
- **ADRs** — done.
- **LEXICON** (architectural ubiquitous language) — taken; real inherited-reference value for spinoffs.
- **Success conditions per story** — taken, folded into `phase-planning` (see §6).
- **`grill-with-docs`** — deferred; its value is better *alignment input* feeding the existing flesh-out, not replacing it (`docs/WORKFLOW_BACKLOG.md`).
- **`to-prd` / `to-issues` pipeline** — **not adopted.** The existing skills occupy these slots. The full swap is the parked Phase-7 fork (`docs/WORKFLOW_BACKLOG.md`).
- **NOT adopting** (built for parallel agent swarms on a real product): kanban DAG, AFK Ralph loops, parallel grabbable issues as a primary mode, Sand Castle.

### Reference: the *fully-adopted* pipeline shape (the parked end-state, NOT the first chunk)

```
ROADMAP.md (thin phase stubs)
   → pick a phase
   → [CLAUDE/OPUS] grill-with-docs  (grow LEXICON, write ADRs, reach alignment)
   → [CLAUDE/OPUS] to-prd           (synthesize the PRD)
   → ——— handoff artifact: the PRD ———
   → [CURSOR] to-issues             (slice PRD into rule-aware vertical-slice issues)
   → [CURSOR] implement → review → ship → mark shipped on ROADMAP, archive PRD
```

This is recorded as the destination if the Phase-7 fork ever goes that way. **It is not what the first chunk builds.** The first chunk's pipeline is: `phase-planning` (grill + epics/stories with success-condition discipline) → `plan-next-epic` (plan one epic, build to the success condition) → `plan-review` → `ship-phase`. **The ship step is owned by a dedicated `ship-phase` release skill (decided 2026-06-29 — see §6).**

---

## 5. Rules: stay where they are (decided, with reasoning)

**Cursor rules (`.cursor/rules/*.mdc`) are execution-time coding standards. They stay in Cursor, unchanged.** Their auto-attach (frontmatter globs) only works inside Cursor anyway.

**Why we did NOT create a planning-time "digest" of the rules for Claude:** duplicating rule content into the planning side creates two sources for the same constraint, and two sources drift. **One constraint, one home.**

**The one genuinely narrow case:** a rule that encodes a *design decision* (not a coding standard) that planning needs to know. The fix is NOT to copy the rule — the *decision* was always LEXICON/ADR content, and the rule is just its execution-time enforcement. The decision lives once (LEXICON/ADR); the rule enforces it in Cursor.

**Backstop:** if a Claude-written issue accidentally conflicts with a rule, the rule still fires when Cursor implements (auto-attach at the point of writing code).

**Observation worth keeping:** Pocock under-discusses rules because his stack leans on TDD + deep modules + lexicon to carry quality. Seminova *has* a real rules layer he doesn't. That's a strength, not a gap.

**Corollary (see §6 doc-governance):** the one allowed edit to a `.mdc` in this restructure — shrinking `documentation.mdc` to a thin structural guardrail — is *reducing* a rule to its real Cursor-only job, not duplicating planning content into it. That is consistent with this section, not an exception to it.

---

## 6. Decisions reached (with rationale + rejected alternatives)

- **150-line rule vs deep modules — RESOLVED (ADR-0001).** The line rule is a *complexity limiter*; deep modules is an *interface-design philosophy*; applied naively the line rule pushes toward *more, smaller files* = shallow modules. File size is a symptom; interface shape is the real signal. **Outcome:** the 150-line component cap was **removed** from `LOCKED_RULES.md`. The deep-vs-god distinction was codified in `.cursor/rules/project-standards.mdc` in Ousterhout's terms — *deep module = one responsibility, narrow interface, large hidden implementation; god file = many responsibilities, wide interface* — with size language neutralized to read as an **inspect-trigger, not a split-order**. Reconciliation principle: **decompose the implementation freely (private helpers fine); resist proliferating the interface.** `tech-debt-audit/SKILL.md` realigned to match (god-file judged on interface-width + tangled responsibilities, >500 LOC as inspect-trigger; new shallow-module finding gated on coupling + interface-near-implementation, lower severity). `project-standards.mdc` owns the static definition; the audit owns only its dynamic co-change gate.
  - **REJECTED: a write-time "prefer deep modules" mandate.** Redundant with `code-minimalism.mdc` and prone to agent over-rotation. The depth bias lives implicitly in the definition + neutralized size language + minimalism rule.

- **Success conditions per story — fold into `phase-planning` (decided 2026-06-27, refined 2026-06-29).** Each story carries a verifiable success condition: the observable behavior that proves the story is done, stated in **product terms** ("admin can promote a user and sees it reflected in the table"). This is *intent* — the thing Cursor can't infer and shouldn't invent — so it belongs in `phase-planning`, not `plan-next-epic`. Cursor translates the product-terms condition into the mechanical check (which test, what assertion) at plan time.
  - **Vertical-slice discipline is at the epic level, not the story level (refined 2026-06-29).** The epic is the unit Cursor plans and builds in one shot — so the epic needs to be a coherent end-to-end slice. Stories are the decomposition of that work within the epic; they do not each need to be independently shippable. Encoding slice constraints at the story level risks triggering sequential mini-builds (multiple migrations, etc.) inside a single plan.
  - **Epic size cap:** size epics so the whole build fits one agent build-window. The actual threshold is PM-owned and felt out from real runs — tracked in `docs/WORKFLOW_BACKLOG.md`.

- **Per-slice green-test gating — REJECTED (decided 2026-06-27).** Gating tests *between* slices within one build does NOT solve context exhaustion (all slices still share the one window) — that was a conflation. It only improves failure *debuggability*, and it does so at the cost of triggering mid-build debug loops, the single most context-expensive thing, *before* remaining slices are built. Worse trade than letting the build run lean and testing deliberately at the end. The vertical-slice *cut* is independent of *when you test* — clean slices, one end-of-plan test pass. Matches Cursor's official "revert + refine the plan, re-run" failure pattern over fixing an in-progress agent.

- **`plan-next-epic` — stays thin (decided 2026-06-29).** Its job is to find the next epic, load the right context, and hand off cleanly to Cursor's plan mode. It does NOT direct Cursor's internal planning logic. The "self-contained plan" tightening (plan file is source of truth, not chat) was evaluated and found already implicit in how the skill works — no change needed.
  - **Build-in-Parallel candidacy note (decided 2026-06-29).** The "Choose plan structure" section was removed. Cursor's "Build in Parallel" is a UI button clicked at build time — not something plan mode decides during plan generation. The skill now assesses whether the epic has clearly independent tracks with disjoint file ownership, and if so, notes it at the top of the generated plan as a candidacy signal for Aaron to act on. The plan itself is always written sequentially.
  - **REJECTED: encoding parallel/sequential structure into the plan file.** Plan mode produces sequential plans by default; "Build in Parallel" is a post-plan UI action. Encoding structure into the plan overreaches into Cursor's own planning logic.

- **TDD-first — parked, not adopted (decided 2026-06-27).** Cursor's recommended verifiable-target loop (tests as spec, build to green). A genuine alternative to end-stage testing, but a planning-*structure* change, and end-stage testing was deliberately chosen for now. → `docs/WORKFLOW_BACKLOG.md`.

- **Adopt ADRs — DONE.** Lightweight: `# Title` + 1–3 sentences (context, decision, why). Bar — ALL THREE must hold: (1) hard to reverse, (2) surprising without context, (3) result of a real trade-off. Live in `docs/adr/` as `0001-slug.md`, sequential. Spinoffs inherit them. The directory README pins down format + the **immutability/supersede rule: ADRs are never edited after acceptance; a changed decision is a *new* ADR superseding the old (`Superseded by ADR-NNNN`)**. `DOC_RULES.md` points to the README with one line. **ADR-writing skill DEFERRED** — the README is the procedure for now.

- **ADR creation trigger is conversational, not automatic.** Natural carriers are the grilling step and possibly plan-review.

- **PRDs are many + disposable, one per phase.** Matches the PM mental model. The single "active phase" concept *dissolves* — it was an artifact of CONTEXT.md being one living document.

- **PRD filename convention — `phase-N-slug.prd.md` (decided 2026-06-27).** Phase-keyed, **not** sequential like ADRs, so the PRD ↔ `ROADMAP.md` phase mapping is obvious at a glance. The `.prd.md` double extension marks the artifact type explicitly while still rendering as markdown everywhere. Pinned in `docs/prds/README.md`.

- **Shipped PRDs move to `docs/prds/archive/` on phase-ship (decided 2026-06-29).** Reverses the earlier "shipped PRDs stay in `docs/prds/`" rule. A flat list of 10+ files with no signal about what's live was the failure mode. `ship-phase` performs the move as part of its close-out; ROADMAP PRD column path updates to the archive location. `docs/archive/` remains frozen pre-restructure history only — `docs/prds/archive/` is the ongoing shipped-PRD store.
  - **REJECTED: keeping shipped PRDs flat in `docs/prds/`.** Accumulation makes the active PRD hard to spot at a glance.

- **Roadmap drives PRDs; grill stays close to the work.** ROADMAP.md holds *thin* phase stubs; each phase is grilled into a PRD only *when it's its turn*. **Rejected:** front-loading a batch of PRDs — grilling is most accurate close to the work; front-loaded PRDs go stale.

- **`docs/` directory + root split — decided 2026-06-27.** See §2.

- **Doc-governance homes are split by trigger mechanism, NOT collapsed into one file (decided 2026-06-27).** This was re-opened once; the full reasoning is recorded here so it does not have to be re-litigated.

  **The question raised:** doc rules live in a plain `DOC_RULES.md`. Cursor rules (`.cursor/rules/*.mdc`) carry frontmatter that auto-attaches them "as needed"; `DOC_RULES.md` does not. So shouldn't the doc rules move into `documentation.mdc` to gain that auto-attach? And more loosely — the current arrangement just *feels* disjointed.

  **Answer: the disjointed feeling is valid, but moving doc rules into `documentation.mdc` is wrong — on mechanism grounds.** `documentation.mdc` is **disqualified as the home for doc *rules*** for two independent reasons:
  1. **`.mdc` auto-attach is Cursor-only.** Claude Desktop and the Claude-side skills receive *nothing* from `.cursor/rules/` — that mechanism does not exist on the planning side. And `DOC_RULES.md` explicitly governs `phase-planning` and `plan-next-epic`, **both Claude-side**. Folding the rules into the `.mdc` would orphan them from two of their primary consumers. The "pulled in as needed" benefit never reaches the planning side at all.
  2. **Auto-attach triggers on a *file glob*; doc-maintenance rules trigger on a *workflow*.** `documentation.mdc` globs `docs/**`. But these rules fire on "I'm running the phase-ship procedure" or "I'm promoting a draft" — not "I'm editing a file of type X." That is exactly why the skills pull `DOC_RULES.md` in *explicitly*, and even cite it by number ("rule 6"). A workflow-triggered rule **correctly** lives in a plain `.md` that skills reference; lacking frontmatter is the right shape for it, not a deficiency to fix.

  **The clean resolution — assign each piece to a home by its trigger/audience:**
  - **Per-dir conventions** (ADR three-part bar + immutability; PRD lifecycle / naming / no-paths) → the **per-dir READMEs**.
  - **Doc-maintenance *procedure*** (write discipline, archive policy, draft→active promotion ownership, epic numbering, mockups) → **`DOC_RULES.md`**, referenced by skills, stays a plain `.md`.
  - **"Where a file goes in `docs/`" + "don't invent new top-level `docs/` dirs"** → a **thin `documentation.mdc`**, the one genuinely Cursor-execution-time guardrail, pointing at the READMEs.
  - **The duplicated roles table** (`DOC_RULES.md` ↔ `AGENTS.md`) → single home: `DOC_RULES.md` (resolved 2026-06-29).

  **REJECTED: fold the doc rules into `documentation.mdc` to gain auto-attach.**

- **`WORKFLOW_BACKLOG.md` created — decided 2026-06-27.** Permanent home for deferred collaboration-system decisions. → `docs/WORKFLOW_BACKLOG.md`.

- **Plan-review is TRANSITIONAL, not permanent.** Keep as a safety net while building confidence; thinning + automated-review question parked in `docs/WORKFLOW_BACKLOG.md`.

- **`sync-repo-docs` is a periodic cleanup tool, not a phase-close-out gate (decided 2026-06-29).** In a disciplined phase-by-phase build, AGENTS.md shouldn't be significantly stale by phase-end — Cursor reads it as repo truth before planning each epic. `sync-repo-docs` is the tool you reach for when drift is suspected, not a mandatory step in `ship-phase`. `ship-phase/reference.md` notes it as a suggested pre-ship check; that's the right level of prominence.
  - **REJECTED: wiring `sync-repo-docs` into `ship-phase` as a gate.** It's interactive (proposes edits, waits for approval) — can't be orchestrated from inside another skill. And in a clean workflow, it's redundant.

### Session 2026-06-29 — Phase 4 execution decisions

- **Doc-roles table — single home is `DOC_RULES.md` (decided 2026-06-29).** `AGENTS.md` drops its duplicate to a one-line pointer.

- **Resolved open questions leave ROADMAP; no standing decisions log (decided 2026-06-29 — `DOC_RULES.md` rule 7).** When an open question resolves, its resolution is carried by whatever artifact it changed. If hard to reverse and worth a permanent record → ADR. **REJECTED: a standing running decisions log.**

- **`sync-context-md` → RETIRED, not rewritten (decided 2026-06-29).** Its archive-append machinery is dead; its residual phase-ship job moves to `ship-phase`. Folder deleted.

- **New `ship-phase` skill — built (decided + executed 2026-06-29).** Cursor-side release skill at `.cursor/skills/ship-phase/`. Does the reversible close-out: flip active PRD `Active→Shipped`, move PRD to `docs/prds/archive/`, update ROADMAP PRD column path, commit, push, open PR via `gh pr create`, ask if ready to switch to main and pull, then stop. Merge to main is a separate explicit human step.
  - **Two-invocation model:** `ship-phase` = invocation 1 (reversible prep + PR + main pull); merge = invocation 2 (human on their go).
  - **Wired into `DOC_RULES.md`** rule 6 as the owner of the PRD/ROADMAP flip + push + PR open.

- **Skill-repoint order corrected — `DOC_RULES.md` before the skills (decided 2026-06-29).** Write-side skills delegate their write mechanics to `DOC_RULES.md`; repointing them while DOC_RULES still described the old model would produce a broken intermediate state.

- **PRD concrete structure is `phase-planning`'s to define (noted 2026-06-29).** Cursor skills reference "the active phase's PRD" generically until a real PRD exists.

- **Two Claude-side global skills repointed (decided 2026-06-29).** `phase-planning` and `plan-review` repointed to the new model. The one other repo still on the CONTEXT.md model gets a note in its project instructions — not a blocker on this work.

### Session 2026-06-29 (continued) — Status vocabulary + PRD save workflow

- **Unified phase/PRD status vocabulary — `Draft → Planning → Ready → Active → Shipped` (decided 2026-06-29).** Same word means the same thing in ROADMAP rows and PRD files. `Draft` = ROADMAP-only, no PRD. `Planning` = PRD exists, scope being shaped. `Ready` = PRD locked, approved to build. `Active` = being built. `Shipped` = done. ROADMAP gains a PRD column.

- **PRD save workflow — always prompt, never infer from phrasing (decided 2026-06-29).** After presenting a draft or completing a revision, `phase-planning` always closes with: *"Want to keep working, save as in-progress (`Planning`), or lock it in (`Ready`)?"*
  - **REJECTED: inferring status from phrasing.**

- **Claude-side skills are written directly in the orchestrator chat, not via the MCP executor (noted 2026-06-29).** `/mnt/skills/user/` is read-only. Write to temp, package via `python -m scripts.package_skill`, deliver as `.skill` bundle via `present_files`.

---

## 7. Phase plan

**Guiding principle: additive first, destructive last.**

> **Sequencing note:** the phase order is a **dependency guide, not a fixed running order**. Additive-first/destructive-last holds as a hard *safety* constraint. **Live execution status is in §Progress, not here.**

- **Phase 0 — Map the ground.** Branch. Grep every reference to CONTEXT.md. Read skill bodies. Output: reference map. No changes.
- **Phase 1 — Extract stable, low-risk pieces.** Pitch → README. Roadmap + status → ROADMAP.md.
- **Phase 2 — Stand up net-new artifacts.** LEXICON.md + `docs/adr/` + ADR-0001.
- **Phase 3 — Establish PRD structure.** `docs/prds/` + governing README.
- **Phase 4 — Rewire the skills (the hinge).** Repoint all skills + DOC_RULES + AGENTS.md. Rewrite `documentation.mdc` to thin guardrail. Dedup roles table. Move `CONTEXT_ARCHIVE.md` → `docs/archive/` and `DOC_RULES.md` → `docs/`.
- **Phase 5 — Cut CONTEXT.md. COMPLETE (2026-06-29).** 16 files cleaned; `git rm CONTEXT.md`; commit `2eb60b6`.
- **Phase 6 — Adopt grill-with-docs.** Net-new alignment skill. Depends on LEXICON + PRD structure existing. Trial vanilla `grill-me` first — `docs/WORKFLOW_BACKLOG.md`.
- **THEN HANG.** Stop. Run a full real planning cycle on the new structure. Phase-7 decomposition fork parked in `docs/WORKFLOW_BACKLOG.md`.

---

## §Progress (execution status — the fast-churning part)

> This is the single home for done-vs-not-done. Keep status here; keep reasoning in §1–§8.

### Done

- **ADR-0001 decided and recorded.** 150-line cap removed from `LOCKED_RULES.md`; deep-vs-god codified in `project-standards.mdc`; `tech-debt-audit/SKILL.md` realigned.
- **`docs/adr/` stood up** with governing README and ADR-0001.
- **`docs/WORKFLOW_BACKLOG.md` created** (2026-06-27), seeded with deferred workflow items. Epic size threshold calibration entry added (2026-06-29).
- **Claude-side skill scoping resolved:** skills are GLOBAL to the account, not per-project.
- **Scope narrowed (2026-06-27):** first chunk = doc restructure only; existing pipeline kept and repointed; `to-prd`/`to-issues` swap deferred indefinitely.
- **Phase 0 fully closed (2026-06-27):** reference map finalized.
- **Phase 1 complete (2026-06-27):** `ROADMAP.md` created. `README.md` enriched with full pitch. supa-next-starter attribution added; dual MIT copyright; dead `LICENSE.md` link fixed.
- **Phase 2 complete (2026-06-27):** `LEXICON.md` created, seeded with seven architectural entries. `docs/adr/` already done.
- **Phase 3 partial (2026-06-27):** `docs/prds/` created with governing README. `documentation.mdc` conflict resolved in principle, folded into Phase 4.
- **Phase 4 substantially executed — Stages 1–3 (2026-06-29):**
  - **Stage 1 — `docs/DOC_RULES.md` written.** Authoritative roles table, renumbered rules, delegates ADR/PRD lifecycle to per-dir READMEs, resolved-question policy as rule 7, phase-ship as rule 6, epic numbering/Complete tag as rule 9, promotion ownership as rule 2.
  - **Stage 2 — `AGENTS.md` + `documentation.mdc`.** AGENTS.md: roles table → one-line pointer; CONTEXT.md refs repointed. `documentation.mdc`: wholesale-replaced with thin `docs/**` structural guardrail.
  - **Stage 3 — three Cursor-side skills repointed.** `plan-next-epic`, `mark-epic-complete`, `sync-repo-docs`.
- **Destructive tail complete (2026-06-29):** `sync-context-md` deleted; `CONTEXT_ARCHIVE.md` moved to `docs/archive/`; root `DOC_RULES.md` deleted; dangling `/sync-context-md` reference cleaned from `AGENTS.md`.
- **Status vocabulary updated across all artifacts (2026-06-29):** `Draft → Planning → Ready → Active → Shipped` unified. `prds/README.md`, `DOC_RULES.md`, `ROADMAP.md`, `mark-epic-complete` all updated.
- **Claude-side global skills repointed (2026-06-29):** `phase-planning` and `plan-review` rewritten and packaged as `.skill` bundles.
- **Phase 5 complete (2026-06-29):** 16 files cleaned of CONTEXT.md references; `git rm CONTEXT.md`; commit `2eb60b6`.
- **`.prettierignore` updated (2026-06-29):** `docs/` glob + `ROADMAP.md` + `LEXICON.md` added to agent-authored docs block.
- **`ship-phase` skill built (2026-06-29).** `.cursor/skills/ship-phase/SKILL.md` + `reference.md`. Wired into `DOC_RULES.md` rule 6. Steps: flip PRD → move to `docs/prds/archive/` → update ROADMAP path → commit → push → open PR → ask to switch to main and pull → stop.
- **`docs/prds/archive/` created (2026-06-29).** Shipped PRDs move here on phase-ship. `ship-phase`, `DOC_RULES.md`, `prds/README.md`, `documentation.mdc` all updated to match.
- **`phase-planning` skill discipline edit (2026-06-29).** Success condition per story added. Vertical-slice discipline clarified as epic-level (not story-level). Epic size cap noted as PM-owned, tracked in WORKFLOW_BACKLOG.
- **`plan-next-epic` skill updated (2026-06-29).** "Choose plan structure" section replaced with Build-in-Parallel candidacy note. Plan is always written sequentially; candidacy noted at the top when applicable.

### Not yet resolved / open

- **Note in other repo's project instructions** that it needs converting to the new doc model (§6). Still open.
- **First real PRD:** awaits a genuine phase promotion.
- **Deferred workflow items:** see `docs/WORKFLOW_BACKLOG.md`.

---

## 8. Experiment mechanics (how to try this without abandoning what works)

- **Repo side: use a git branch.** Branch in use: `docs-restructure`.
- **Claude side:** skills are GLOBAL to the account. Additive-only where possible. The 2026-06-29 repoint of `phase-planning` + `plan-review` is a deliberate eyes-open exception — the only other consumer repo is being brought along.
- **Project instructions:** archive current text (dated copy) before changing.

---

## 9. Working-style constraints for the executing chat

- **Filesystem access is via MCP (`filesystem:*` tools), not sandbox `view`/`bash`.** Call `tool_search "filesystem"` at the start of a fresh chat before any file op.
- **Write pattern:** whole-file rewrite via `filesystem:write_file`. Read the current file immediately before writing.
- **Write gate:** name the file + summarize the change + ask once. The user's "yes" is full authorization — write immediately, no second confirmation.
- **Respond concisely.** Lead with the direct answer; expand only when asked.
- **Canonical doc writes** follow `docs/DOC_RULES.md` write discipline and archive policy.
- **Claude-side skills cannot be written via MCP.** Write to temp, package with `python -m scripts.package_skill`, deliver as `.skill` bundle via `present_files`.

---

## 10. Key file paths

- Shipped archive: `/Users/aaronwilliams/projects/seminova/docs/archive/CONTEXT_ARCHIVE.md`
- Doc maintenance rules: `/Users/aaronwilliams/projects/seminova/docs/DOC_RULES.md`
- Workflow backlog: `/Users/aaronwilliams/projects/seminova/docs/WORKFLOW_BACKLOG.md`
- Agent instructions: `/Users/aaronwilliams/projects/seminova/AGENTS.md`
- Locked rules: `/Users/aaronwilliams/projects/seminova/LOCKED_RULES.md`
- Architectural lexicon: `/Users/aaronwilliams/projects/seminova/LEXICON.md`
- Roadmap: `/Users/aaronwilliams/projects/seminova/ROADMAP.md`
- ADRs: `/Users/aaronwilliams/projects/seminova/docs/adr/`
- PRDs: `/Users/aaronwilliams/projects/seminova/docs/prds/` (active); `docs/prds/archive/` (shipped)
- Design/token doc: `/Users/aaronwilliams/projects/seminova/DESIGN.md`
- Cursor rules: `/Users/aaronwilliams/projects/seminova/.cursor/rules/`
- Cursor skills: `/Users/aaronwilliams/projects/seminova/.cursor/skills/`
- Claude-side skills: `/mnt/skills/user/` — read-only mount; write via temp + package
- Plans (this file): `/Users/aaronwilliams/projects/seminova/.cursor/plans/`
- Cursor Plan Mode docs: https://cursor.com/docs/agent/plan-mode
- Cursor agent best-practices: https://cursor.com/blog/agent-best-practices
- Pocock's skills repo (reference): https://github.com/mattpocock/skills

---

## 11. Source material (Pocock)

- Conference talk "It Ain't Broke: Why Software Fundamentals Matter More Than Ever" — thesis: deep modules, ubiquitous language, TDD, vertical slices matter *more* with AI.
- Workshop "Full Walkthrough: Workflow for AI Coding" — grill → PRD → kanban issues (vertical slices) → AFK implement → review. Smart-zone/dumb-zone (~100k token) constraint.
- Video on `grill-with-docs` — `grill-me` + a `context.md` glossary + ADRs. Glossary = ubiquitous language (DDD).
- **Skills relevant to us:** `grill-with-docs` (deferred — backlog), `to-prd`/`to-issues` (not adopted; parked fork), `improve-codebase-architecture` + `codebase-design` (deep-module vocabulary — feeds LEXICON), ADR format.
- **NOT adopting** (parallel agent swarms on a real product; we're single-agent, human-in-loop, on a template): kanban DAG, AFK Ralph loops, parallel grabbable issues as a primary mode, Sand Castle.
