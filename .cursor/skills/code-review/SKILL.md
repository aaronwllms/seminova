---
name: code-review
description: >-
  Two-axis review of one epic's commit — Standards (repo rules + smell baseline)
  and Spec (does the diff match the PRD story/epic?) — run as two parallel
  readonly subagents, reported side by side. Takes no arguments; finds the epic
  commit by its `Epic:` git trailer. Use when the user asks to review an epic, a
  branch, or "review since <ref>".
disable-model-invocation: true
---

# Code Review

Two-axis review of the diff across a fixed git range, run as **two parallel readonly subagents** so the axes don't pollute each other's context:

- **Standards** — does the code conform to this repo's rules and the smell baseline?
- **Spec** — does the code faithfully implement what the PRD story/epic asked for?

Runs at **epic completion**, before `pre-release-review`.

**Not the same as:**

- **`pre-release-review`** — pre-PR gate: automated quality gates, security pass, manual test checklist
- **`plan-review`** — reviews the *plan* before build; this skill reviews the *code* after build
- **`audit-tech-debt`** — whole-repo audit; this skill is scoped to one change set

---

## Process

### 1. Resolve the range

Takes **no arguments**. The range is derived from git — nothing records it, so nothing can go stale.

1. **Identify the epic.** The active epic is the first `### Epic` heading in the active PRD (`ROADMAP.md` names the Active phase; its PRD lives in `docs/prds/`) without a `` `Complete` `` tag. Its canonical id is `{phase}.{epic-id}` — e.g. `10.1`, `7.5.1A`.
2. **Find the epic commit.** `plan-next-epic` requires every epic commit to carry an `Epic:` git trailer. Match it exactly:

   ```bash
   git log --grep='^Epic: 10\.1$' --format=%H
   ```

   Anchor both ends and escape the dots — an unanchored grep for `Epic: 1` also matches `Epic: 10.1`. Zero matches or more than one → **halt** and report what you found.
3. **Derive the range.** Tip is that commit. Baseline is its parent, `<tip>^`. Commits made after the epic — workflow, docs, a later epic — fall outside by construction, however many there are.

**Override.** The user may supply an explicit range instead — `/code-review <baseline>..<tip>` or `/code-review <baseline>` (tip defaults to `HEAD`) — for reviewing a branch or an arbitrary ref. When given, skip steps 1–3; `git rev-parse` must succeed on both ends, which may be a SHA, branch, tag, or `main`.

Preconditions — both must pass before spawning anything:

1. **No tracked modifications** — `git status --porcelain --untracked-files=no` must be empty. If non-empty, stop and ask the user to commit first; the verdict must pin to a state that can be named. Untracked files are **not** a halt — the range is commit-to-commit, so they cannot affect the diff. List them in the report's tree note and move on. (The active plan file is normally untracked; `ship-phase` commits it.)
2. **Non-empty diff** — `git diff <baseline>...<tip> --stat` shows changes.

Capture once and reuse verbatim in both subagent prompts:

- Diff command: `git diff <baseline>...<tip>` (three-dot — comparison is against the merge-base)
- Commit list: `git log <baseline>..<tip> --oneline`

Report the resolved range in the review header so the reader can see exactly what was, and was not, in scope.

### 2. Resolve the spec source

The epic identifier is already resolved in step 1 — do not re-derive it, and never match the diff to a story by content. Record the exact PRD file path and the story/epic identifier(s) to pass to the Spec subagent.

On the override path, ask the user for the epic identifier if the invocation didn't carry one. If they say there is no spec, skip the Spec subagent and note "no spec available" in the report.

### 3. Scope the standards sources

Map the diff surface to the relevant `.cursor/rules/*.mdc` files — pass **file paths**, not contents (the subagent reads them itself). Always include:

- `AGENTS.md` (§ Hard constraints)
- `general-conventions.mdc`, `project-standards.mdc`, `code-minimalism.mdc`, `typescript.mdc`

Then add by diff surface, e.g.:

- UI components/styling touched → `ui-shadcn.mdc`, `ui-styling.mdc`, `ui-accessibility.mdc`, `forms.mdc`, `data-tables.mdc` (as applicable)
- Data fetching/state → `react-tanstack-query.mdc`, `nextjs.mdc`
- API routes/server → `api-development.mdc`, `error-handling.mdc`, `logging.mdc`, `security.mdc`
- Database/migrations → `supabase.mdc`, `supabase-sql.mdc`
- Tests touched → `testing.mdc`
- Docs touched → `documentation.mdc`

Skip anything tooling already enforces (lint/type-check/CI gates) — the subagents are told this too, but don't hand them rules that are pure tooling restatements.

### 4. Dispatch both subagents in parallel

Send **one message with two `Task` tool calls** — `standards-reviewer` and `spec-reviewer` (defined in `.cursor/agents/`), foreground, so both run simultaneously and their reports come back for aggregation.

Subagents start with a clean context — each prompt must be self-contained. Pass only the variable inputs; each subagent's own file carries its standing instructions.

**To `standards-reviewer`:**

- The diff command and commit list from step 1
- The list of standards-source file paths from step 3

**To `spec-reviewer`:**

- The diff command and commit list from step 1
- The PRD file path and story/epic identifier(s) from step 2

If the spec is missing, dispatch only the Standards subagent.

### 5. Aggregate

Present the two reports under `## Standards` and `## Spec` headings, verbatim or lightly cleaned. Each carries its own verdict over its own findings. Do **not** merge or rerank findings across axes — the separation is the point (see below).

End with a one-line summary per axis: verdict, finding count, and the worst issue *within that axis*. Never pick a single winner across axes.

### 6. Handoff

Read [`grading.md`](grading.md) — it owns the severity ladder, the verdict function, and the close-out gate. Then:

- **Gate not met** — list exactly what remains: blockers to fix, debt findings still needing a `// debt:` marker at their cited site, spec defects awaiting resolution, standard defects awaiting a rule edit. Apply the fixes, commit, then re-check the gate.
- **Gate met** — open a new agent window and run `/mark-epic-complete`. That skill resolves the epic itself and syncs repo docs before stamping the PRD; no separate doc-sync step is needed here.

## Why two axes

A change can pass one axis and fail the other:

- Follows every standard but implements the wrong thing → **Standards pass, Spec fail.**
- Does exactly what the story asked but breaks project conventions → **Spec pass, Standards fail.**

Reporting them separately stops one axis from masking the other.

---

Adapted from Matt Pocock's `code-review` skill (two-axis design, smell baseline, parallel-subagent architecture).
