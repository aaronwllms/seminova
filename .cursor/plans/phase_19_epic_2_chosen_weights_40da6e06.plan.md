---
name: Phase 19 Epic 2 Chosen Weights
overview: Write the PM-gated border alphas into globals.css and record the compositing decision as ADR-0011 plus a LEXICON entry, with no visual judgment in this epic.
todos:
  - id: 2.1-write-alphas
    content: Write gate alphas into globals.css (light 0.14/0.105, dark 0.17/0.13); reword DESIGN.md / 0.0N rider
    status: completed
  - id: 2.2-adr-lexicon
    content: Add ADR-0011 (compositing, not derivation) and a LEXICON composited-border entry pointing at it
    status: completed
  - id: quality-gate
    content: Run pnpm pre-push
    status: completed
  - id: commit-epic
    content: "Conventional commit with Epic: 19.2 trailer"
    status: completed
isProject: false
---

# Phase 19 Epic 2 — Chosen Weights and Record

> **Track progress:** as you complete each step, update the corresponding `todos` entry's `status` to `completed` in this plan's frontmatter.

> **Precondition:** `git status --porcelain` must be empty before the first implementation edit. If dirty, halt and ask the user to commit or stash. The epic must land as a single commit containing only this epic's work — `code-review` derives its range from that commit.

**Working tree at plan time:** [`.cursor/plans/phase_19_epic_1_composited_border_tokens_381f0fc5.plan.md`](.cursor/plans/phase_19_epic_1_composited_border_tokens_381f0fc5.plan.md) is untracked and is not this epic. Halt and ask the user to commit or stash it before implementation starts — never discard it, and do not fold it into this epic's commit. This epic's own plan file in `.cursor/plans/` is expected to be untracked and does not count toward the precondition; the halt applies to Epic 1's plan file and anything else dirty.

This epic starts with values already in hand. Do not trial alphas, do not re-open a second muted token, do not edit the PRD gate. Hue and lightness on the four tokens stay as shipped; only the alpha channel changes.

Stories share the same decision. Write the numbers and the record in one pass so the ADR describes what the file actually contains.

## What ships

The app ships the alphas the PM gate settled on 2026-08-24. The architectural decision — borders derive from their surface by compositing, one shared value per theme, no per-surface utilities — is recorded as the next ADR and a short LEXICON pointer, so "why is there no `surface-card`?" is answerable in one lookup.

## 1. Write the settled alphas

In [`src/app/globals.css`](src/app/globals.css), replace Epic 1's provisional alphas. Keep `oklch(0 0 0 / …)` in `:root` and `oklch(1 0 0 / …)` in `.dark`. Do not rename tokens, do not touch `@theme inline`, do not add tokens.

- Light — `--border`, `--input`, `--sidebar-border`: **0.14**. `--border-muted`: **0.105**.
- Dark — `--border`, `--input`, `--sidebar-border`: **0.17**. `--border-muted`: **0.13**.

The three enclosure tokens stay identical within each theme. Muted stays the only separately-tuned value.

**Rider, same file this pass already documents:** in [`DESIGN.md`](DESIGN.md) the re-skin diff-apply step currently says to keep a `/ 0.0N` channel. That shape is wrong once light border is 0.14. Reword it to "keep the existing alpha channel" without pinning a `0.0N` pattern. Bump Last updated to 2026-08-24. Do not rewrite the smoke test, the semantic table, or the structure-vs-theme split.

## 2. Record the decision

Next free number is **0011**. Follow [`docs/adr/README.md`](docs/adr/README.md): decision-first, short, Status Accepted. No rejected-alternatives section — those live in the PRD. Do not put the numeric alphas in the ADR; they live in `globals.css` and can move without a new record.

Create [`docs/adr/ADR-0011-composited-borders-not-per-surface-derivation.md`](docs/adr/ADR-0011-composited-borders-not-per-surface-derivation.md). Title matches the PRD's scope: borders derive from their surface by compositing, not by per-surface derivation. Body, in this order:

- The decision: `--border`, `--input`, and `--sidebar-border` are one shared compositing alpha per theme; `--border-muted` is the only separately-tuned lighter value; no `surface-*` utilities.
- One sentence on why not derivation: a mix against a named surface is still pairing-by-hand, so a re-skin that invents a surface has no correct pairing until someone remembers to add it. Compositing stays correct on surfaces that do not exist yet.
- One sentence on ecosystem alignment: shadcn's default dark `--border` is already this shape (white-alpha), so this is alignment, not a local invention.
- The trade-off: independently-tuned border vs input vs sidebar-border is given up, and dark field fill now derives from the same token as the border — `bg-input/30` composites that alpha rather than carrying a value of its own. Both are the point.

Do not mention the calibration route, the retired lint rule, or the gate procedure.

In [`LEXICON.md`](LEXICON.md), add **Composited border** in the architectural-terms cluster next to Semantic token / Structure vs theme. One or two sentences of meaning, then a pointer at ADR-0011 — enough that "why is there no `surface-card`?" resolves in one lookup. Do not duplicate the alpha numbers. Add it to the Contents list. Bump Last updated to 2026-08-24.

Do not edit [`docs/adr/README.md`](docs/adr/README.md) — it has no ADR catalog.

## Verify (mechanical)

This epic carries no visual judgment. Stop on the first miss:

- `pnpm pre-push` green.
- All four tokens still carry an alpha channel in both `:root` and `.dark`.
- `--border`, `--input`, and `--sidebar-border` still share one value per theme, matching the gate table (light 0.14, dark 0.17; muted 0.105 / 0.13).
- ADR-0011 exists and LEXICON.md has a **composited border** entry pointing at it.
- DESIGN.md no longer describes the compositing channel as `/ 0.0N`.

---

### Verification

Quality bar — [AGENTS.md § Agent workflow](AGENTS.md#agent-workflow) step 3. Stop on failure:

```bash
pnpm pre-push
```

### Commit epic

Authorized by this approved plan:

1. Review diff; stage only files in scope for this epic.
2. Write a conventional commit message. It **must** end with an `Epic:` git trailer — this is the only thing `code-review` uses to find the commit:

   ```
   feat(phase-19): ship settled border alphas and compositing ADR

   Epic: 19.2
   ```

   Format is `Epic: {phase}.{id}` — phase number as written in ROADMAP, epic id as written. Blank line before the trailer, nothing after it. Exactly one commit in the repo may carry a given `Epic:` value.
3. Commit (request `git_write`). Pre-commit hook runs automatically — if it fails, **fix and retry the commit** (a failed pre-commit hook aborts the commit, so there is nothing to amend).
4. Verify `git status --porcelain` is empty after commit.

**Do not push** — push remains `ship-phase`.

### Handoff

Report the epic is committed, then list what's left for the user.

1. Work through the plan's manual verification steps.
2. Fix and commit anything broken.

Then ask: *"Mark this epic complete?"*

On confirmation, read `.cursor/skills/mark-epic-complete/SKILL.md` and follow it in full, preconditions included — it is user-invoked, so reading the file is this run's only route to it. Without confirmation, end the run; the user can type `/mark-epic-complete` later.
