# BACKLOG.md — Product Idea Backlog

Product ideas — not ordered, no PRD.
Distinct from [ROADMAP.md](ROADMAP.md) (confirmed, numbered, sequenced phases) and
[docs/WORKFLOW_BACKLOG.md](docs/WORKFLOW_BACKLOG.md) (deferred decisions about the
workflow system itself, not product scope).

**Promotion:** an idea moves to ROADMAP.md as a numbered phase stub only when the PM
explicitly commits it in a planning conversation — no automatic trigger. (Mental filter
for deciding: would I build this in the next 2-3 phases if nothing else changed? Yes →
propose promoting it. No/unsure → leave it here.)

**Promoted entries stay here.** A promoted idea keeps its entry, marked
`**Promoted:** Roadmap phase "Name"`, and is deleted when that phase's PRD locks at
`Ready`. Its ROADMAP stub points here rather than copying the contents, so the
constraints, rejected options, and research an entry carries survive into phase planning.
An entry without that marker is uncommitted.

---

## Blog Page

**What:** Add a `/blog` page. Publish-without-deploy is a requirement, which rules out
MDX and means DB-backed posts with admin authoring UI (editor, draft/published states,
slugs) — larger than a route addition.
**Why backlog, not ROADMAP:** Not confirmed as something we're building.
**Notes:** Deletable as an optional module if unwanted (see ROADMAP.md's optional
module contract).

---

## Pricing Page

**What:** Add a `/pricing` page. Static content vs plan-driven (tied to billing) still
undecided.
**Why backlog, not ROADMAP:** Not confirmed as something we're building.
**Notes:** Inherits the same deletable-optional-module shape as Blog.

---

## Optional module contract

**What:** A contract for making features deletable if unwanted (Blog, Pricing). Removal
spans more than a directory — it touches a migration, one or more directories, and
line-edits to shared files the feature registers with (nav links, settings registry,
sitemap, generated Supabase types).
**Why backlog, not ROADMAP:** Not yet scoped, and only worth designing once there's
something to design it against.
**Notes:** Options include a self-registering manifest pattern vs. documented per-feature
removal steps run through `initialize-project`. Candidate for a LEXICON entry and/or ADR
once the shape settles. Revisit when a second optional feature exists.

---

## Name / domain finalization

**What:** Claim `seminova.dev` (or similar) and carry keywords in the repo description and
topics rather than in the name itself.
**Why backlog, not ROADMAP:** Low priority, opportunistic — not confirmed as something
we're doing.
**Notes:** Name is Seminova; the `.com` is contested by out-of-lane semiconductor and
agriculture firms.

---

## Slim AGENTS.md (instruction budget)

**What:** Cut AGENTS.md down to content that earns every-request load — hard constraints,
agent workflow gates, merge checklist, change protocol — and stop the doc system from
refilling it. Findings and per-section verdicts are in [AGENTS_AUDIT.md](AGENTS_AUDIT.md)
(first full pass 2026-08-06: 24 open findings; ~0.9% staleness, so this is a budget
problem, not a drift problem). Decision made: slim-AGENTS (AG022 option A).

**Why backlog, not ROADMAP:** Decided but not scheduled; sizing is an open question — the
generator fix is small and the deletions are large but mechanical, so this may be one
phase or a phase plus a slice.

**Notes:**

- **Ordering constraint:** fix the generator before deleting anything. `sync-repo-docs` is
  the one skill that auto-invokes, and it is currently instructed to write shipped
  features, routes, and schema back into AGENTS.md. Deleting first just loops.
- **Scope, four files:** `docs/DOC_RULES.md` (roles table AGENTS.md row, rule 3 schema
  authority, sync-order line, audit-artifacts row) → `.cursor/skills/sync-repo-docs/SKILL.md`
  (Step 3 ownership row, three Step 2 drift patterns, Step 4 migration count, Step 1
  evidence row, one anti-pattern) → `.cursor/skills/sync-repo-docs/reference.md` (four
  AGENTS.md section-map rows, four audit-checklist entries, examples A and B) → AGENTS.md
  itself (change-protocol row, then the AG deletions).
- **Dependency not in AGENTS_AUDIT.md:** DOC*RULES' sync-order line has ROADMAP and PRD
  status updates reading shipped truth \_out of* AGENTS.md. That chain breaks unless those
  updates are repointed at code and git in the same pass.
- **No new home needed for the deleted content.** The code is the agent-facing reference;
  whys already live in ADRs, `.cursor/rules/`, and LEXICON; the human-facing feature list
  already exists as `src/config/features-content.ts` rendered at `/features`.
- Audit skill is `/audit-agents-md` (`.cursor/skills/audit-agents-md/`), added 2026-08-06.

---

## Design-system surface coherence

**What:** Replace `surface-elevated` with per-surface utility bundles that derive their own
border, name the contrast constant behind them, and enforce it so borders can't be
hand-tuned at call sites.

**Why backlog, not ROADMAP:** Decided, not scheduled. Core is small — one CSS file plus
~6 className edits — but the enforcement rule and a both-themes verification pass push it
past a single prompt. Likely one phase, ~3 epics. Do not fold into an unrelated active
phase: the Spec axis of code review would have nothing to check it against.

**Notes:**

- **Problem.** `surface-elevated` rebinds `--border`/`--input` via
  `color-mix(--card 88%, --foreground 12%)`, hardcoding `--card` as its reference surface.
  That holds only because `--card`, `--popover`, and `--sidebar` share a value today —
  globals.css's own comment admits it. On any other surface, the border derives from a
  surface the element isn't painted on.
- **How it surfaced.** `profile-modal-content.tsx` carries `bg-border/40` on two
  `<Separator>`s — a hand-tuned opacity reached for because the real rule wasn't
  discoverable. `sidebar-shell.tsx` correctly pairs `bg-sidebar` + `surface-elevated`;
  dialog and profile-modal didn't. **Pairing-by-hand is the defect**, not any one call site.
- **The invariant, stated:** a border sits ~0.07–0.09 lightness from *its own* surface
  (light 0.087, dark 0.078 — the page-level delta). `surface-elevated` is a misnomer; it's
  contrast preservation, not elevation. This theme doesn't encode elevation as lightness at
  all — light-mode `--sidebar` (0.967) is *darker* than `--background` (0.9842).
- **Shape:** `surface-card` / `surface-popover` / `surface-sidebar`, each setting
  background + foreground + its own derived `--border`/`--input` (sidebar also
  `--sidebar-border`). One class, impossible to apply half of it. Retire `surface-elevated`.
  Migrate 6 call sites: `sidebar-shell.tsx` (3), `dropdown-menu.tsx` (2), `select.tsx` (1).
  Name the constant `--border-contrast-mix: 88%` — currently a magic number recorded only
  in a comment and repeated per surface.
- **No `surface-background`.** Base tokens are already calibrated for the page surface; a
  utility that changes nothing is a no-op rule.
- **Enforcement, not abstraction.** Lint rule banning opacity modifiers on
  `border`/`bg-border` (same shape as existing `local/motion-tier`). *Rejected:* a semantic
  `<SectionDivider>` wrapper — a className passes straight through it, so it prevents
  nothing, and it wraps a primitive that already behaves correctly.
- **Dialogs stay on `--background`.** shadcn assigns `--popover` to floating menu layers
  and `--background` to dialog/alert-dialog/sheet. Moving them to `--popover` was
  considered and *rejected*: once surfaces self-derive, both are correct, so it's taste —
  and it would restyle every modal for no systems gain.
- **Gotcha — one real visual change.** Light-mode `--sidebar` (0.967) currently wears a
  `--card`-derived border only 0.054 from its surface; self-deriving moves it to 0.082, so
  the light-mode sidebar border gets slightly more visible. Correct, but verify rather than
  be surprised. Dark mode unaffected (sidebar and card share a value there).
- **Separate rule, same work — separator inset.** `DropdownMenuSeparator` and
  `SelectSeparator` both carry `-mx-1`, going full-bleed against the popover's `p-1`. The
  content column is 12px across every item variant (items are `px-2` inside `p-1`;
  checkbox/radio indicators sit at `left-2`), so `mx-2` aligns to it. Every other separator
  in the app already respects container padding — these are the outliers, and only because
  shadcn shipped them that way. Keep this distinct from the surface decision.
- **Loose findings from the same sweep:** `AccordionTrigger`'s `px-2` pushes "Change
  Password" 8px out of the profile modal's content column (fix: `-mx-2 px-2`); the Bio
  textarea shows a resize grabber despite the 160-char cap. All of the above were found by
  walking past them, not by auditing — a real design-system coherence audit is a separate,
  unbounded scope.

---
