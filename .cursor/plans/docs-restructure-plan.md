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
  prds/              — one PRD per phase (draft → active → shipped) [STOOD UP]
  archive/
    CONTEXT_ARCHIVE.md — frozen pre-restructure shipped-phase history (EXISTS — to move)
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
- **Going forward, the shipped PRD *is* the per-phase document.** A PRD's status flips draft → active → shipped and it stays in `docs/prds/`. That gives the per-phase-file shape without recasting as-built records as specs.
- **Move it to `docs/archive/CONTEXT_ARCHIVE.md`** so it's out of root and clearly frozen. The move rides the rewire phase (it's referenced by skills/DOC_RULES/AGENTS — repoint first). **Once the PRD workflow is live, the archive is referenced by nothing:** its *write* references die outright (no more `sync-context-md` appending shipped detail), and any "see history" cross-links either repoint to the frozen location or get dropped.
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
- **Vertical slices** — taken, folded into `phase-planning` (see §6).
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

This is recorded as the destination if the Phase-7 fork ever goes that way. **It is not what the first chunk builds.** The first chunk's pipeline is: `phase-planning` (grill + epics/stories with vertical-slice + success-condition discipline) → `plan-next-epic` (plan one epic, build to the success condition) → `plan-review` → ship. **The ship step is now owned by a dedicated `ship-phase` release skill (decided 2026-06-29 — see §6).**

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

- **Vertical slices + success conditions — fold into `phase-planning` (decided 2026-06-27).** The story is the slice, not the epic; an epic is a bundle of slices.
  - **Story = a complete vertical slice:** one coherent behavior delivered end-to-end (schema → API → UI → test), shippable on its own. Sharpens `phase-planning`'s existing "coherent behavior, not implementation steps" line — no conflict with it. Guards against drift into horizontal stories ("all schema this story, all UI next").
  - **Each story carries a verifiable success condition:** the observable behavior that proves the slice works, stated in **product terms** ("admin can promote a user and sees it reflected in the table"). This is *intent* — the thing Cursor can't infer and shouldn't invent — so it belongs in `phase-planning`, not `plan-next-epic`. Cursor translates the product-terms condition into the mechanical check (which test, what assertion) at plan time. Cursor's own guidance makes verifiable goals the #1 driver of agent build quality; this is how that goal gets a home upstream.
  - **Epic size cap:** size epics so the whole epic's build fits one agent build-window (the "smart zone"). This is the **only real lever on the dumb-zone problem** — `plan-next-epic` can't rescue an oversized epic once it's set. The cap lives in `phase-planning` because that's where epic boundaries are drawn. **Open, PM-owned:** the actual threshold (where Aaron's agent build starts degrading) is to be felt out from real runs, not set a priori. Independently confirmed by Cursor's "start a fresh conversation after one logical unit of work."

- **Per-slice green-test gating — REJECTED (decided 2026-06-27).** Gating tests *between* slices within one build does NOT solve context exhaustion (all slices still share the one window) — that was a conflation. It only improves failure *debuggability*, and it does so at the cost of triggering mid-build debug loops, the single most context-expensive thing, *before* remaining slices are built. Worse trade than letting the build run lean and testing deliberately at the end. The vertical-slice *cut* is independent of *when you test* — clean slices, one end-of-plan test pass. Matches Cursor's official "revert + refine the plan, re-run" failure pattern over fixing an in-progress agent.

- **`plan-next-epic` — one tightening, no verification logic (decided 2026-06-27).** It does NOT define success conditions (those arrive in the story from `phase-planning`); it *consumes* them and builds to the target it's handed. The only addition: make explicit that the plan must be **self-contained** — the source of truth is the plan file, not chat back-and-forth — so revert-and-re-run works cleanly. (Reconciled against Cursor's [Plan Mode docs](https://cursor.com/docs/agent/plan-mode) and [best-practices guide](https://cursor.com/blog/agent-best-practices); the rest of the skill already aligns — sequential-default/parallel-only-for-disjoint-tracks, one-epic-one-chat, light on file tags.)

- **TDD-first — parked, not adopted (decided 2026-06-27).** Cursor's recommended verifiable-target loop (tests as spec, build to green). A genuine alternative to end-stage testing, but a planning-*structure* change, and end-stage testing was deliberately chosen for now. → `docs/WORKFLOW_BACKLOG.md`.

- **Adopt ADRs — DONE.** Lightweight: `# Title` + 1–3 sentences (context, decision, why). Bar — ALL THREE must hold: (1) hard to reverse, (2) surprising without context, (3) result of a real trade-off. Live in `docs/adr/` as `0001-slug.md`, sequential. Spinoffs inherit them. The directory README pins down format + the **immutability/supersede rule: ADRs are never edited after acceptance; a changed decision is a *new* ADR superseding the old (`Superseded by ADR-NNNN`)**. `DOC_RULES.md` points to the README with one line. **ADR-writing skill DEFERRED** — the README is the procedure for now.

- **ADR creation trigger is conversational, not automatic.** Natural carriers are the grilling step and possibly plan-review.

- **PRDs are many + disposable, one per phase.** Matches the PM mental model. The single "active phase" concept *dissolves* — it was an artifact of CONTEXT.md being one living document.

- **PRD filename convention — `phase-N-slug.prd.md` (decided 2026-06-27).** Phase-keyed, **not** sequential like ADRs, so the PRD ↔ `ROADMAP.md` phase mapping is obvious at a glance. The `.prd.md` double extension marks the artifact type explicitly while still rendering as markdown everywhere. Pinned in `docs/prds/README.md`.

- **Roadmap drives PRDs; grill stays close to the work.** ROADMAP.md holds *thin* phase stubs; each phase is grilled into a PRD only *when it's its turn*. **Rejected:** front-loading a batch of PRDs — grilling is most accurate close to the work; front-loaded PRDs go stale.

- **`docs/` directory + root split — decided 2026-06-27.** See §2.

- **Doc-governance homes are split by trigger mechanism, NOT collapsed into one file (decided 2026-06-27).** This was re-opened once; the full reasoning is recorded here so it does not have to be re-litigated.

  **The question raised:** doc rules live in a plain `DOC_RULES.md`. Cursor rules (`.cursor/rules/*.mdc`) carry frontmatter that auto-attaches them "as needed"; `DOC_RULES.md` does not. So shouldn't the doc rules move into `documentation.mdc` to gain that auto-attach? And more loosely — the current arrangement just *feels* disjointed.

  **Answer: the disjointed feeling is valid, but moving doc rules into `documentation.mdc` is wrong — on mechanism grounds.** `documentation.mdc` is **disqualified as the home for doc *rules*** for two independent reasons:
  1. **`.mdc` auto-attach is Cursor-only.** Claude Desktop and the Claude-side skills receive *nothing* from `.cursor/rules/` — that mechanism does not exist on the planning side. And `DOC_RULES.md` explicitly governs `phase-planning` and `plan-next-epic`, **both Claude-side**. Folding the rules into the `.mdc` would orphan them from two of their primary consumers. The "pulled in as needed" benefit never reaches the planning side at all.
  2. **Auto-attach triggers on a *file glob*; doc-maintenance rules trigger on a *workflow*.** `documentation.mdc` globs `docs/**`. But these rules fire on "I'm running the phase-ship procedure" or "I'm promoting a draft" — not "I'm editing a file of type X." That is exactly why the skills pull `DOC_RULES.md` in *explicitly*, and even cite it by number ("rule 6"). A workflow-triggered rule **correctly** lives in a plain `.md` that skills reference; lacking frontmatter is the right shape for it, not a deficiency to fix.

  **What's actually disjointed is a multi-way overlap, not a two-file problem.** Four things touch doc governance today: the **roles table in `DOC_RULES.md`**, a **second roles table in `AGENTS.md`**, the **structure description in `documentation.mdc`**, and the **per-dir READMEs**. That spread is the real drift that "one constraint, one home" exists to kill.

  **The clean resolution — assign each piece to a home by its trigger/audience:**
  - **Per-dir conventions** (ADR three-part bar + immutability; PRD lifecycle / naming / no-paths) → the **per-dir READMEs**. Single-responsibility per directory, human-browsable, already there. This is the *source of truth* for dir conventions.
  - **Doc-maintenance *procedure*** (write discipline, archive policy, draft→active promotion ownership, epic numbering, mockups) → **`DOC_RULES.md`**, referenced by skills, stays a plain `.md`.
  - **"Where a file goes in `docs/`" + "don't invent new top-level `docs/` dirs"** → a **thin `documentation.mdc`**, the one genuinely Cursor-execution-time guardrail, pointing at the READMEs. `archive/` has no README, so its archive policy is pointed at `DOC_RULES.md` (which owns archive policy) rather than spawning an `archive/README.md` for one frozen line.
  - **The duplicated roles table** (`DOC_RULES.md` ↔ `AGENTS.md`) → collapse to a single home. *(Resolved 2026-06-29: the single home is `DOC_RULES.md` — see below.)*

  **REJECTED: fold the doc rules into `documentation.mdc` to gain auto-attach.** The mechanism mismatch above — orphaning the rules from the Claude-side skills, and misusing glob-attach for a workflow trigger — makes this strictly worse, not cleaner.

  **Execution timing:** the thin-pointer `documentation.mdc` rewrite, the `DOC_RULES.md` rationalization, and the roles-table dedup are the *same body of work* as the already-planned **Phase-4 `DOC_RULES.md` rewrite** — so they were folded into Phase 4, not done ad hoc. The only doc-structure change that landed this session is `docs/prds/` + its README. (This also confirms §5: reducing `documentation.mdc` to a thin guardrail is *shrinking* a rule to its real job, not duplicating planning content into it.)

- **`WORKFLOW_BACKLOG.md` created — decided 2026-06-27.** Permanent home for deferred collaboration-system decisions that previously lived only in this (deletable) handoff. Named "backlog," not "roadmap," to avoid collision with product `ROADMAP.md`. → `docs/WORKFLOW_BACKLOG.md`.

- **Plan-review is TRANSITIONAL, not permanent.** It exists because Cursor makes architectural decisions at plan time that nobody constrained. As architecture moves up front (grilling → intent → constrained plans), its job shrinks from "catch design mistakes" to "verify execution." Keep it as a safety net *while building confidence*; thinning + the automated-review question are parked in `docs/WORKFLOW_BACKLOG.md`. It has genuine value for this user now (second-model check on a single agent's blind spots; covers the self-identified architecture-experience gap) — keep until judgment grows, drop later.

### Session 2026-06-29 — Phase 4 execution decisions

- **Doc-roles table — single home is `DOC_RULES.md` (decided 2026-06-29).** Resolves the "collapse to a single home" item left open in the doc-governance entry above. `DOC_RULES.md` owns the authoritative document-roles table; `AGENTS.md` drops its duplicate to a one-line pointer. **Rationale:** the roles table is doc-governance, which is `DOC_RULES.md`'s entire job; `AGENTS.md` is repo *truth* (routes, schema, build workflow) and a roles table isn't that. New top-level docs get registered in `DOC_RULES.md`, not `AGENTS.md`.

- **Resolved open questions leave ROADMAP; no standing decisions log (decided 2026-06-29 — `DOC_RULES.md` rule 7).** When an open question resolves, it leaves `ROADMAP.md`; its resolution is carried by whatever artifact it changed (a PRD, a rule, the schema, or ROADMAP itself). If the decision is hard to reverse and worth a permanent record, it becomes an **ADR** — the pressure valve. **REJECTED: a standing running decisions log.** It's a new perpetual-growth file whose entries are mostly either redundant (already baked into the artifact that changed) or low-signal; an unread log of stale one-liners is exactly the junk-drawer failure this whole restructure exists to kill. The rare genuinely-notable-but-not-ADR-worthy call already has homes — a PRD's inline "rejected alternatives" note for phase-scoped decisions, and `docs/WORKFLOW_BACKLOG.md` for deferred workflow decisions — so a global log would overlap those, not fill a hole. (Distinct from §3's one-time migration of the *existing* archive "Resolved decisions" block; this is the forward-going policy.)

- **`sync-context-md` → RETIRED, not rewritten (decided 2026-06-29).** Resolves Phase 0's "full rewrite or retirement." Decompose what the skill did and nothing survives the new model: its distinctive two-file archive-append machinery is **dead** (the archive is frozen; shipped PRDs stay in place); shipped-summary mirroring is already `sync-repo-docs`' job; open-question resolution is now rule 7 (no skill needed); status/vision edits are approval-gated PM edits, not a mechanical sync. The one residual job — the phase-ship flip (active PRD `Active→Shipped` + mark ROADMAP, rule 6) — is absorbed by the new `ship-phase` skill (below). **Retiring loses no discipline:** rule 6 already holds the procedure. The skill-folder deletion joins the destructive tail.

- **New `ship-phase` skill — a release skill, built as its own task (decided 2026-06-29).** Not a docs skill — the phase's whole *final piece*. **Branching model (confirmed this session):** one branch per phase, all epics accumulate on it, merged once at phase-end — so the branch *is* the phase, and there is a real PR to open and merge. `ship-phase` does the **reversible** close-out — flip the active PRD `Active→Shipped` + mark ROADMAP shipped (rule 6), push the branch, open the PR — then **stops**. The **irreversible** main-merge is a **separate, explicitly-gated step** on Aaron's go; the skill never auto-merges `main`.
  - **Cursor-side** (`.cursor/skills/ship-phase/`): it needs `git` + `gh`; the planning environment can't run a release.
  - **Structural reality:** a Cursor skill runs in a single agent turn — it cannot "open the PR and then *wait* to be told to merge" (nothing is left running to wait). Natural shape = **two invocations**: `ship-phase` (prep, then stop) and a separate merge action on go. Same human gate, structurally two steps.
  - **Sequencing:** built as its own focused task **after** the restructure closes — it depends on the new model being fully in place (it flips a PRD + ROADMAP that only exist post-restructure), and a net-new release skill deserves a clean start, not the tail of this one.

- **Skill-repoint order corrected — `DOC_RULES.md` before the skills (decided 2026-06-29).** The originally-planned "repoint skills first" was **reversed.** Discovery: the write-side skills (`phase-planning`, `mark-epic-complete`, and the now-retired `sync-context-md`) delegate their write *mechanics* to `DOC_RULES.md` (e.g. "File Management Rules," "rule 9," "rule 6"). Repointing them while `DOC_RULES.md` still described the CONTEXT.md model would make a skill and its delegated procedure **contradict each other** — a broken intermediate state that violates additive-first / always-working. So `DOC_RULES.md` is rewritten first (or in the same pass), then the skills repoint against the settled procedure. Read-only skills (`plan-review`) are independent and can move anytime. **Pairing constraint:** `plan-next-epic` *reads* the `Complete` tag that `mark-epic-complete` *writes* — they must move together.

- **PRD concrete structure is `phase-planning`'s to define; the Cursor skills reference it generically until then (noted 2026-06-29).** `plan-next-epic` and `mark-epic-complete` reference "the active phase's PRD" / "the PRD's status" / "the ROADMAP row" *generically* rather than baking in exact line formats (where the status field sits, whether a *Last updated* line exists). No real PRD exists yet and neither skill runs until one does, so generic-now is safe and avoids unilaterally inventing PRD shape — that belongs to `phase-planning` (the Claude-side follow-on). Locking the PRD shape later may require a small tightening of these two Cursor skills.

- **Two Claude-side global skills repoint to the new model; bring the other repo along (decided 2026-06-29).** `phase-planning` and `plan-review` are **global to the account**, so repointing them affects *every* project that uses them — and one other repo still runs the CONTEXT.md model. Decision: repoint the two globals to the new model and **drop a note in the other repo (its project instructions) that it needs converting** to the new doc model; do not let that repo gate this work (Aaron is largely done with it). This repoint is **Claude-side** (not the MCP executor) and is handled as a follow-on, after the destructive tail. *(Accepted: until that repo is converted, its planning skills point at ROADMAP/PRDs it doesn't have yet — fine, since its planning is dormant.)*

### Session 2026-06-29 (continued) — Status vocabulary + PRD save workflow

- **Unified phase/PRD status vocabulary — `Draft → Planning → Ready → Active → Shipped` (decided 2026-06-29).** Previously `DOC_RULES.md` and `prds/README.md` used `Draft` as both a ROADMAP-only state (no PRD exists) and the first PRD status (PRD exists but not locked). This double-duty created ambiguity. Resolved with a clean five-status set shared across ROADMAP rows and PRD files — the same word means the same thing in both places:
  - `Draft` — ROADMAP-only; no PRD file exists. Never appears on a PRD.
  - `Planning` — PRD created, scope being shaped. First PRD status.
  - `Ready` — PRD locked and approved to build (PM sign-off required).
  - `Active` — currently being built.
  - `Shipped` — done.
  - **ROADMAP** gains a `PRD` column linking the filename once one exists.
  - **Updated artifacts:** `docs/prds/README.md` (new lifecycle), `docs/DOC_RULES.md` (new vocabulary table + rule 2 updated), `ROADMAP.md` (PRD column added). `mark-epic-complete` updated to halt on `Draft`, `Planning`, or `Ready` (not just `Draft`); promotion references updated from `Draft→Active` to `Ready→Active`.

- **PRD save workflow — always prompt, never infer from phrasing (decided 2026-06-29).** `phase-planning` works in chat until Aaron asks to save. After presenting a draft or completing a revision round, it always closes with: *"Want to keep working, save as in-progress (`Planning`), or lock it in (`Ready`)?"* Aaron responds however he wants; the skill acts on intent, not magic words. On save: creates or updates the PRD file at `docs/prds/phase-N-slug.prd.md`; sets status to `Planning` or `Ready` per Aaron's choice; flips the ROADMAP row to match.
  - **REJECTED: inferring status from phrasing** (e.g. "that's ready" = `Ready`, "save it" = `Planning`). Phrasing is too variable; ambiguity produces wrong status silently. Explicit prompt is the clean model.

- **Claude-side skills are written directly in the orchestrator chat, not via the MCP executor (noted 2026-06-29).** `/mnt/skills/user/` is a read-only mounted volume not accessible via the local MCP filesystem server. Skills are written to a temp directory, packaged via `python -m scripts.package_skill`, and delivered as a `.skill` bundle via `present_files`. The executor cannot reach this path.

---

## 7. Phase plan

**Guiding principle: additive first, destructive last.** Every phase must leave the repo in a working state. Extract by *copy, not move* until the very end — CONTEXT.md keeps working as-is while new files come alive beside it; skills switch over; CONTEXT.md retires in one clean cut only when nothing reads it.

> **Sequencing note:** the phase order is a **dependency guide, not a fixed running order**. Pieces are pulled forward one at a time (e.g. `docs/adr/` landed ahead of Phase 1). Additive-first/destructive-last holds as a hard *safety* constraint — nothing destructive until nothing reads the target. **Live execution status is in §Progress, not here.**

- **Phase 0 — Map the ground.** Branch. Grep every reference to CONTEXT.md across skills, rules, DOC_RULES, AGENTS.md. Read the skill *bodies*. Output: a reference map = the real blast radius. No changes. *(Detailed findings + remaining gap → §Progress.)*
- **Phase 1 — Extract stable, low-risk pieces (copy, not move).** Pitch → README. Roadmap + status → ROADMAP.md. Least-referenced-by-automation, most-obviously-single-job. Nothing removed.
- **Phase 2 — Stand up net-new artifacts.** Create LEXICON.md (seed with architectural terms). `docs/adr/` + ADR-0001 already done. Pure addition. *(Complete — see §Progress.)*
- **Phase 3 — Establish PRD structure.** Create `docs/prds/` + governing README. **Active-phase→first-PRD conversion dropped** — no active phase exists, and manufacturing one just to produce a worked example was rejected; the first real PRD waits for a genuine phase promotion. Draft phases become thin ROADMAP stubs. *(The `documentation.mdc` conflict turned out **broader** than `prd/` vs `prds/`: the whole rule describes a 4-dir structure Seminova doesn't use, plus an archive-by-prefix-rename policy that contradicts our frozen-archive + shipped-PRDs-stay-in-place model. Resolution decided — §6 doc-governance — but **execution moved to Phase 4** with the DOC_RULES rewrite.)*
- **Phase 4 — Rewire the skills (the hinge, riskiest).** Repoint phase-planning, plan-review, DOC_RULES, AGENTS.md, and the sync/mark skills from CONTEXT.md sections to the new files. **Apply the recorded skill edits** (see §6): `phase-planning` gains vertical-slice + success-condition + epic-size-cap discipline; `plan-next-epic` gains the self-contained-plan tightening. **Apply the doc-governance rework (folded in from Phase 3, see §6):** rewrite `documentation.mdc` down to a thin Cursor-only structural guardrail pointing at the per-dir READMEs; rationalize `DOC_RULES.md` to procedure-only; dedup the doc-roles table between `DOC_RULES.md` and `AGENTS.md` to a single home. **Move `CONTEXT_ARCHIVE.md` → `docs/archive/`** and `DOC_RULES.md` → `docs/` here, once references are repointed. **Repoint the two sidecar relative-path links** (`../../../DOC_RULES.md` → `../../../docs/DOC_RULES.md`) and **preserve or repoint the `sync-context-md` "rule 6" reference** when DOC_RULES.md is rewritten (see §Progress Phase 0 findings). Comes late on purpose. *(Execution detail + resolutions of the rule-6 / relative-path / sync-context-md items → §Progress.)*
- **Phase 5 — Cut CONTEXT.md. COMPLETE (2026-06-29).** 16 files cleaned of CONTEXT.md references; `git rm CONTEXT.md`; commit `2eb60b6`.
- **Phase 6 — Adopt grill-with-docs.** Net-new alignment skill. Depends on LEXICON + PRD structure existing. *(Trial vanilla `grill-me` in a separate chat first — `docs/WORKFLOW_BACKLOG.md`.)*
- **THEN HANG.** Stop. Run a full real planning cycle on the new structure. The Phase-7 decomposition fork is parked in `docs/WORKFLOW_BACKLOG.md` — decide only after living with it.

---

## §Progress (execution status — the fast-churning part)

> This is the single home for done-vs-not-done. Keep status here; keep reasoning in §1–§8. This handoff is temporary — it dies when the restructure ships — so status lives inline rather than in a separate progress doc.

### Done

- **ADR-0001 decided and recorded.** 150-line cap removed from `LOCKED_RULES.md`; deep-vs-god codified in `project-standards.mdc`; `tech-debt-audit/SKILL.md` realigned. (Reasoning: §6.)
- **`docs/adr/` stood up** with a governing README (format, three-part bar, sequential numbering, immutability/supersede rule) and ADR-0001 written. `DOC_RULES.md` carries a one-line pointer.
- **`docs/WORKFLOW_BACKLOG.md` created** (2026-06-27), seeded with the deferred workflow items.
- **Claude-side skill scoping resolved:** skills are GLOBAL to the account, not per-project. A new Claude Project isolates *instructions*, not *skills*. → additive-only approach (see §8).
- **Scope narrowed (2026-06-27):** first chunk = doc restructure only; existing pipeline kept and repointed; `to-prd`/`to-issues` swap deferred indefinitely.
- **Cursor Plan Mode reconciliation done:** `plan-next-epic` aligns with current docs except the one self-contained-plan tightening (recorded as intent, §6). Channel/skill-invocation and home-dir-save questions resolved (Aaron invokes skills via slash command; saves plans to `.cursor/plans/` manually).
- **Phase 0 fully closed (2026-06-27):** sidecar `reference.md` files read; reference map finalized (see below).
- **Phase 1 complete (2026-06-27):** `ROADMAP.md` created (status table + "no active phase" note + the four draft phase stubs + all open-questions/deferred-decisions blocks, copied from CONTEXT.md). `README.md` enriched with the full pitch (curated-not-blank differentiator, fixed-structure/swappable-theme distinction, "what it is not," three-part audience). Tangential cleanup done in the same pass: supa-next-starter attribution added (`LICENSE` now carries dual MIT copyright — Michael Troya + Aaron Williams; `README` Acknowledgments section explains the lineage and dual copyright; dead `LICENSE.md` link fixed to `LICENSE`).
- **Phase 2 complete (2026-06-27):** `LEXICON.md` created at root, seeded with seven grounded architectural entries — primitive-first, semantic token, structure-vs-theme, the `/` + `/auth/**` auth boundary, admin gate, the three Supabase clients (browser/server/service), operational-vs-fault error, and deep-module-vs-god-file (interface/implementation) — each pointing to its canonical home (`DESIGN.md`, `LOCKED_RULES.md`, the relevant rule/ADR) rather than restating values, plus an empty *Domain terms* stub for spinoffs. **`seam` / `adapter` deliberately omitted** (listed in §2 but no codified Seminova meaning yet — not stubbed, to avoid spinoffs inheriting a fabricated definition). `docs/adr/` was already done, so this **closes Phase 2**.
- **Phase 3 partial (2026-06-27):** `docs/prds/` created with a governing README (ADR-README style): one PRD per phase; draft→active→shipped lifecycle with status flipping **in place** (file never moves); the `phase-N-slug.prd.md` filename convention; no-file-paths/no-code discipline; and the explicit rule that **shipped PRDs stay in `docs/prds/`** and are not moved to `docs/archive/` (which holds only frozen pre-restructure history). The active-phase→first-PRD conversion was **dropped** (no active phase — see §7). The `documentation.mdc` conflict was **resolved in principle but not written** — folded into Phase 4 (see §6 doc-governance).
- **Phase 4 substantially executed — Stages 1–3 (2026-06-29):**
  - **Stage 1 — `docs/DOC_RULES.md` written** (new file). New-model authoritative document-roles table (now the single home; CONTEXT.md dropped from it entirely), renumbered procedure rules, delegates ADR/PRD lifecycle to the per-dir READMEs, archive = frozen-only, the resolved-question policy as **rule 7**, phase-ship as **rule 6**, epic numbering / Complete tag as **rule 9**, promotion ownership as **rule 2**. Written with `docs/`-relative links for its new home. **Root `DOC_RULES.md` still present** (deleted in the destructive tail).
  - **Stage 2 — `AGENTS.md` + `documentation.mdc`.** `AGENTS.md`: dropped its duplicate roles table → one-line pointer to `docs/DOC_RULES.md`; CONTEXT.md refs repointed to `ROADMAP.md` + `docs/prds/`; the CONTEXT §3 at-a-glance language removed; change-protocol "Planning/roadmap" row repointed; `DOC_RULES`/archive links → `docs/` paths. `documentation.mdc`: **wholesale-replaced** with a thin `docs/**` structural guardrail pointing at the per-dir READMEs (the old 5-dir + prefix-rename-archive boilerplate was generic and contradicted the model).
  - **Stage 3 — three Cursor-side skills repointed.** `plan-next-epic` (reads → `ROADMAP.md` + active PRD; Complete-tag read → PRD). `mark-epic-complete` (write target → active PRD; **decoupled from `sync-context-md`** → phase-ship now generically cited as rule 6; archive ref → `docs/archive/`; `DOC_RULES` path + rule numbers updated; consistency check spans PRD status + ROADMAP row). `sync-repo-docs` (+ `reference.md`): stale CONTEXT/doc-map cross-links cleaned, `DOC_RULES` path fixed to `docs/`, obsolete locked-rules-pointer checklist line dropped.
- **Destructive tail complete (2026-06-29):**
  - `sync-context-md` skill folder deleted (retired).
  - `docs/archive/` created; `CONTEXT_ARCHIVE.md` moved to `docs/archive/CONTEXT_ARCHIVE.md`; root `CONTEXT_ARCHIVE.md` deleted.
  - Root `DOC_RULES.md` deleted.
  - Dangling `/sync-context-md` reference cleaned from `AGENTS.md` agent-workflow step 4.
- **Status vocabulary updated across all artifacts (2026-06-29):** `Draft → Planning → Ready → Active → Shipped` unified across ROADMAP and PRDs. `docs/prds/README.md` rewritten with new lifecycle. `docs/DOC_RULES.md` updated with vocabulary table + rule 2 updated. `ROADMAP.md` gains PRD column. `mark-epic-complete` halt condition updated to cover `Draft`, `Planning`, `Ready`; promotion references updated to `Ready→Active`. (Reasoning: §6.)
- **Claude-side global skills repointed (2026-06-29):** `phase-planning` rewritten — CONTEXT.md → ROADMAP + PRD; new "Find the target phase" section; new PRD save workflow (always prompt, never infer). `plan-review` rewritten — CONTEXT.md → ROADMAP + active PRD. Both packaged as `.skill` bundles and delivered.
- **Phase 5 complete (2026-06-29):** 16 files cleaned of live CONTEXT.md references (root docs, `.cursor/` READMEs, 9 skill files including `sync-tech-debt-audit/reference.md`); dead `/sync-context-md` mentions removed from `.cursor/README.md`; `git grep` clean; `git rm CONTEXT.md`; commit `2eb60b6`. CONTEXT.md is gone.
- **`.prettierignore` updated (2026-06-29):** `docs/` glob added to agent-authored docs block, covering `DOC_RULES.md`, `prds/`, `adr/`, `archive/`, and all future `docs/` content. `ROADMAP.md` and `LEXICON.md` added to the same block. Replaces the removed `CONTEXT.md` line and the now-redundant `docs/archive/CONTEXT_ARCHIVE.md` line.

### Phase 0 — blast-radius findings (CLOSED)

- **4 Cursor-side skills tie to CONTEXT.md as primary read/write target:**
  - `sync-context-md` — heaviest; essentially built around CONTEXT.md + CONTEXT_ARCHIVE.md. **RESOLVED (2026-06-29): RETIRED** — its archive-append machinery is dead under the new model and its residual phase-ship job moves to the new `ship-phase` skill (see §6). Folder deleted.
  - `mark-epic-complete` — writes the `Complete` tag into CONTEXT.md ACTIVE. **DONE (2026-06-29):** repointed to the active PRD (Stage 3).
  - `plan-next-epic` — reads CONTEXT.md to pick the next epic. **DONE (2026-06-29):** repointed to ROADMAP + active PRD (Stage 3).
  - `sync-repo-docs` — CONTEXT.md only as a cross-link; core target is AGENTS.md/README — mostly survives. **DONE (2026-06-29):** cross-links cleaned, DOC_RULES path fixed (Stage 3).
- **Rule conflict — `documentation.mdc`:** defines a `docs/` structure with a `prd/` subdir + `archive/` convention that does NOT match the plan's target (`docs/prds/`). **DONE (2026-06-29):** wholesale-replaced with the thin guardrail (Stage 2).
- **`project-standards.mdc` 300–400 vs old 150 conflict:** resolved by ADR-0001. No longer open.
- **Claude-side skills:** `phase-planning` (writes CONTEXT.md; already reads LOCKED_RULES.md), `plan-review` (reads CONTEXT.md for intent; light rewire to ROADMAP/PRD). **DONE (2026-06-29):** both repointed and packaged.

**Sidecar read (`reference.md`) — completed; three additions to the Phase 4 rewire:**
- **`sync-context-md` pins specific CONTEXT.md section names** — **RESOLVED (2026-06-29):** moot; skill retired.
- **Hard dependency on `DOC_RULES.md` "rule 6" by number** — **RESOLVED (2026-06-29):** new DOC_RULES.md keeps rule 6 (phase-ship); `mark-epic-complete` updated; `sync-context-md` retired.
- **Relative-path cross-links break on the DOC_RULES.md move** — **RESOLVED (2026-06-29):** `sync-repo-docs` links fixed; `sync-context-md` links retired with the skill.

### Not yet resolved / open

- **Note in other repo's project instructions** that it needs converting to the new doc model (§6). Still open.
- **`ship-phase` skill** — net-new release skill, built as its own focused task after the restructure closes (§6).
- **Skill discipline edits not yet applied** (recorded as intent, a separate pass — §6): `phase-planning` vertical-slice + success-condition + size-cap; `plan-next-epic` self-contained-plan tightening (Cursor-side).
- **Epic-size threshold (PM-owned):** where Aaron's agent build starts degrading. To be felt out from real runs.
- **First real PRD:** awaits a genuine phase promotion.
- **Deferred workflow items:** see `docs/WORKFLOW_BACKLOG.md`.
- **Optional hygiene:** remaining `sync-context-md` mentions in other audit `reference.md` files (no `context.md` substring; low priority).

---

## 8. Experiment mechanics (how to try this without abandoning what works)

The new system is a *documentation-and-workflow layer over the same Seminova code* — not a different product. So:

- **Repo side: use a git branch**, not a new repo. A branch is a parallel reality built out, lived with, and merged or deleted at zero cost to `main`. **Bonus:** the migration itself is a product artifact — spinoff PMs will have their own CONTEXT.md-style junk drawers to migrate, so a visible before/after branch demonstrates the path. Branch in use: `docs-restructure`.
- **Claude side: the repo branch doesn't cover Claude-side state** (project instructions; skills at `/mnt/skills/user/`). Only the repo has branches.
  - **Skills are GLOBAL to the account, not per-project.** A new Claude Project isolates *instructions*, not *skills*.
  - **Additive-only for skills.** Leave existing skills untouched; add new ones alongside. No rename-to-legacy, no archival — nothing is rewired out from under `main` yet. (Rename-to-legacy stays available as a fallback if a future change must repoint an existing skill destructively.) *(Note: the 2026-06-29 decision to repoint the two global skills — `phase-planning`, `plan-review` — to the new model is a deliberate, eyes-open exception, taken because the only other consumer repo is being brought along; see §6.)*
  - **Project instructions:** archive current text (dated copy) before changing, so you can restore.
- **Symmetry:** stable world = current project + `main`; experiment world = `docs-restructure` branch (+ optionally a separate project for instruction isolation).

---

## 9. Working-style constraints for the executing chat

- **Filesystem access is via MCP (`filesystem:*` tools), not sandbox `view`/`bash`.** Call `tool_search "filesystem"` at the start of a fresh chat before any file op. Never `view`/`bash_tool` against project paths.
- **Write pattern:** whole-file rewrite via `filesystem:write_file`. Read the current file immediately before writing (Cursor may have changed it between sessions). No partial-edit tools on these paths.
- **Write gate:** name the file + summarize the change + ask once. The user's "yes" is full authorization — write immediately, no second confirmation. That describe-and-ask message is the only gate.
- **Respond concisely.** Lead with the direct answer; expand only when asked.
- **Canonical doc writes** follow `docs/DOC_RULES.md` write discipline and archive policy.
- **Claude-side skills cannot be written via MCP.** `/mnt/skills/user/` is read-only. Write skill content to a temp directory, package with `python -m scripts.package_skill`, and deliver as a `.skill` bundle via `present_files`. The executor cannot reach this path.

---

## 10. Key file paths

- Shipped archive: `/Users/aaronwilliams/projects/seminova/docs/archive/CONTEXT_ARCHIVE.md`
- Doc maintenance rules: `/Users/aaronwilliams/projects/seminova/docs/DOC_RULES.md`
- Workflow backlog: `/Users/aaronwilliams/projects/seminova/docs/WORKFLOW_BACKLOG.md`
- Agent instructions: `/Users/aaronwilliams/projects/seminova/AGENTS.md`
- Locked rules: `/Users/aaronwilliams/projects/seminova/LOCKED_RULES.md`
- Architectural lexicon: `/Users/aaronwilliams/projects/seminova/LEXICON.md`
- Roadmap: `/Users/aaronwilliams/projects/seminova/ROADMAP.md`
- ADRs: `/Users/aaronwilliams/projects/seminova/docs/adr/` (README + `ADR-0001-*.md`)
- PRDs: `/Users/aaronwilliams/projects/seminova/docs/prds/` (README + `phase-N-slug.prd.md`)
- Design/token doc: `/Users/aaronwilliams/projects/seminova/DESIGN.md`
- Cursor rules: `/Users/aaronwilliams/projects/seminova/.cursor/rules/`
- Cursor skills: `/Users/aaronwilliams/projects/seminova/.cursor/skills/`
- Claude-side skills: `/mnt/skills/user/` (e.g. `phase-planning`) — read-only mount; write via temp + package
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
