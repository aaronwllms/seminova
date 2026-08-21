# Cursor rule activation and glob findings (temp)

Working notes from a rules audit. This is a findings/backlog doc, not an execution
plan — each unchecked item below should become its own `.cursor/plans/*.plan.md`
before work starts. Delete this file once everything is triaged into plans.

Source of truth for the behavior described here: [Cursor rules docs](https://cursor.com/docs/rules).
Authoring standard this audit judges against: `[.cursor/skills/rule-authoring/SKILL.md](.cursor/skills/rule-authoring/SKILL.md)`.

## Findings

### 1. Folded-scalar descriptions are dropped (confirmed, blocking)

`project-standards.mdc` and `git-workflow.mdc` write their `description` as a YAML
folded scalar (`>-` followed by indented continuation lines). Cursor's frontmatter
reader is not a full YAML parser and does not resolve them.

**Evidence:** in the originating chat session, `project-standards.mdc` was injected
into agent context as an agent-requestable rule with its description rendered as the
literal two characters `>-`. The actual sentence never reached the model.

**Impact:** `project-standards.mdc` is Agent Requested with no globs, so the
description is its only activation path — it is effectively unreachable.
`git-workflow.mdc` loses its description too (see finding 2).

### 2. Globs suppress description-based selection

When `globs` is set, the description is no longer used for agent-side relevance
selection. Confirmed in the same session: of 26 rules, exactly one appeared in the
agent-requestable list — the only rule without globs.

**Impact:** every description on a globbed rule is decoration. The README's
"Auto + Agent requested" mode for `git-workflow.mdc` describes a mode Cursor does
not support. Each rule resolves to exactly one activation path.

### 3. Auto-attach is reactive, not intentional

A globbed rule fires only once a matching file is in context. Rules governing
_creating_ a file, restructuring a module, or writing a commit have no matching file
in context at decision time. Globs are the wrong mechanism for intent-driven rules
regardless of pattern quality.

### 4. Glob breadth has recreated always-on (deferred)

Four rules match all `src` TypeScript (`security`, `supabase`, `logging`,
`typescript`); five more cover `src/app` plus `src/components` (`nextjs`,
`ui-shadcn`, `ui-styling`, `ui-accessibility`, `seo`). When a matching file
**enters agent context** (read, edit, @-mention — see finding 6), a typical App
Router TSX file attaches roughly nine rules. The authoring skill budgets the always-apply _set_ at
~800 words because that cost is per-request, but auto-attached files are only
inspected at 300 lines each — so real per-request load on UI work far exceeds the
budget without tripping it.

**Deferred to a follow-up pass.** Needs measurement of actual loaded context, not
pattern tidying.

### 5. Not broken

- **Comma-separated globs work (Phases 2–3).** Docs prescribe a comma-separated
  single-line string; the repo now uses that form on all globbed rules. Verified:
  reading `rule-authoring-pointer.mdc` attaches via `.cursor/rules/**/*.mdc`;
  reading `src/app/layout.tsx` post–Phase 3 attaches nine rules (logging, security,
  supabase, typescript, nextjs, seo, ui-accessibility, ui-shadcn, ui-styling).
  YAML list form also worked pre-migration; no longer in the repo.
- **Brace expansion** (`{ts,tsx}`) is the real documented hazard; every rule already
  avoids it, per the authoring skill's warning. Keep avoiding it.
- **Frontmatter comments** — moved below the closing delimiter in Phases 1 and 3
  (`git-workflow`, `forms`, `notifications`, `supabase-sql`, `typescript`).

### 6. Editor focus alone does not trigger glob attach (confirmed post–Phase 3)

Glob rules attach when a matching file **enters agent context** (agent read, edit,
@-mention), not merely because it is the focused editor tab.

**Evidence:**

- Fresh chat, `src/app/globals.css` focused, turn 1 — zero glob rules (expected:
  no CSS globs).
- Fresh chat, `src/app/layout.tsx` focused, turn 1 — zero glob rules despite nine
  matching patterns.
- Same chat after **Read** on `layout.tsx` — nine glob rules attach; comma-separated
  syntax confirmed working.
- Mid-session focus switch — does not re-run glob attachment.
- Reading `.cursor/plans/*.plan.md` — `do-migrations-agent.mdc` attaches via
  `**/*.plan.md`.

**Impact:** replace vague "open/edited file" wording in the authoring skill with
this trigger. "What's attached on turn 1?" is a weak verification method — agents
may only report always-on + Agent Requested until a matching file is read (glob
rules appear in the "relevant to files you just read" injection).

## Decisions (locked with PM)

| Decision                | Choice                                                                          |
| ----------------------- | ------------------------------------------------------------------------------- |
| Scope                   | Phased — fix confirmed breakage now; glob breadth as a separate pass            |
| `git-workflow.mdc` mode | Agent Requested — drop globs, rely on a strong single-line description          |
| Glob syntax             | Switch to the documented comma-separated single-line form                       |
| Frontmatter comments    | Move below the closing delimiter — keep frontmatter to the three real keys only |

Rejected: keeping the YAML list form (works, but undocumented ground); pointer-stub
for git workflow (viable, but a plain description is sufficient here); doing the
breadth audit in the same pass; leaving frontmatter comments in place (tolerated
today, but unparsed territory in a non-YAML reader).

## Phases

Each phase becomes one `.cursor/plans/*.plan.md`. Commit at the end of every phase;
run the full `pnpm pre-push` gate once before the Phase 4 commit.

### Phase 1 — Unblock the broken rules

**Files:** `project-standards.mdc`, `git-workflow.mdc`

- [x] Convert folded (`>-`) descriptions to single-line strings in both files
- [x] Drop `.husky/**` / `.github/workflows/**` globs from `git-workflow.mdc` so it
  ```
  resolves to Agent Requested
  ```
- [x] Sharpen the `git-workflow.mdc` description — it becomes the rule's sole
  ```
  activation trigger, so transcription may not be enough
  ```
- [x] Move the `git-workflow.mdc` frontmatter comment below the closing delimiter

**Why first:** this is the only confirmed breakage, it is self-contained, and it
depends on nothing else. It also removes `git-workflow.mdc` from the glob set before
Phase 3 runs, so we never convert globs we are about to delete.

### Phase 2 — Prove the glob syntax (verification gate)

**Files:** one rule only

- [x] Convert `rule-authoring-pointer.mdc` to comma-separated single-line globs
- [x] Verify in a **fresh chat session** that reading a `.cursor/rules/*.mdc` file
  ```
  still auto-attaches it
  ```

**Why this rule:** it is the one rule with an observed, reproducible before-state —
it auto-attached during the audit — so a pass/fail signal is unambiguous.

**Why a fresh session:** rules resolve when a session builds context, so a
conversion made mid-session may not be re-read. Verifying in the same chat can
produce a false pass.

> [!IMPORTANT]
> **Gate.** If the pilot fails to attach, stop. Revert to the YAML list form,
> cancel Phase 3, and drop the glob-syntax change from Phase 4's skill update.
> The list form demonstrably works; the documented form is the unproven one here.

### Phase 3 — Roll out the frontmatter hygiene

**Files:** the remaining ~19 globbed rules

- [x] Convert remaining rules to comma-separated single-line globs
- [x] In the same pass, move frontmatter comments below the closing delimiter in
  ```
  `forms.mdc`, `notifications.mdc`, `supabase-sql.mdc`, `typescript.mdc`
  ```
- [x] Do not change which paths any rule targets, and do not introduce brace
  ```
  expansion
  ```

**Why combined:** four of the five comment files are also in the glob-conversion
set. Same frontmatter surface, one edit per file instead of two.

### Phase 4 — Canonize in docs

**Files:** `.cursor/rules/README.md`, `.cursor/skills/rule-authoring/SKILL.md`
(consider `.cursor/skills/rule-authoring/TEMPLATE.md` — still shows YAML-list globs)

- [x] Correct the README mode table — no dual "Auto + Agent requested" mode exists;
  ```
  reclassify `git-workflow.mdc` as Agent Requested
  ```
- [x] SKILL.md: state that globs suppress description-based selection
- [x] SKILL.md: replace "use a YAML list" with the comma-separated single-line form,
  ```
  keeping the brace-expansion warning
  ```
- [x] SKILL.md: frontmatter carries the three real keys only — rationale comments go
  ```
  below the closing delimiter
  ```
- [x] SKILL.md: document glob attach mechanics (finding 6) — attach fires when a
  ```
  matching file enters agent context (read, edit, @-mention), not from editor
  focus alone; note that turn-1 self-report may show only always-on + Agent
  Requested until a matching file is read
  ```
- [x] Run `pnpm pre-push` and commit

**Why last:** the guidance should describe what Phases 2–3 proved and what finding 6
observed, not what we hoped.

### Follow-up — separate effort, not part of this sequence

- [ ] Audit glob breadth: the `src/**` and app+components overlap (finding 4).
  ```
  Needs measurement of actual loaded context first.
  ```

## Out of scope (for now)

- Glob-breadth reduction and the `src/**` / app+components overlap (follow-up pass).
- Rule _content_ edits — size budgets, no-op pruning, ownership overlap.
- Adding or removing rules.
- Converting additional rules to the pointer-stub pattern.
