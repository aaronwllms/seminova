---
name: code-review
description: >-
  Two-axis review of changes since a fixed git ref — Standards (repo rules +
  smell baseline) and Spec (does the diff match the PRD story/epic?) — run as
  two parallel readonly subagents, reported side by side. Use when the user
  asks to review an epic, a branch, or "review since <ref>".
disable-model-invocation: true
---

# Code Review

Two-axis review of the diff between a fixed point and `HEAD`, run as **two parallel readonly subagents** so the axes don't pollute each other's context:

- **Standards** — does the code conform to this repo's rules and the smell baseline?
- **Spec** — does the code faithfully implement what the PRD story/epic asked for?

Runs at **epic completion**, before `pre-release-review`.

**Not the same as:**

- **`pre-release-review`** — pre-PR gate: automated quality gates, security pass, manual test checklist
- **`plan-review`** — reviews the *plan* before build; this skill reviews the *code* after build
- **`audit-tech-debt`** — whole-repo audit; this skill is scoped to one change set

---

## Process

### 1. Pin the fixed point

The fixed point and epic identifier come from the **user's invocation message** (carried by the build handoff), e.g. `epic baseline abc1234, Epic 3`. If either is missing, fall back to asking the user.

The user may also supply a branch name, tag, or `main` instead of a SHA — `git rev-parse` must still succeed.

Preconditions — all three must pass before spawning anything:

1. **Clean tree** — `git status --porcelain` must be empty. If dirty, stop and ask the user to commit first; the review verdict must pin to a state that can be named.
2. **Ref resolves** — `git rev-parse <fixed-point>` succeeds.
3. **Non-empty diff** — `git diff <fixed-point>...HEAD --stat` shows changes.

Capture once and reuse verbatim in both subagent prompts:

- Diff command: `git diff <fixed-point>...HEAD` (three-dot — comparison is against the merge-base)
- Commit list: `git log <fixed-point>..HEAD --oneline`

### 2. Resolve the spec source

In order:

1. The story/epic the user named — find it in the active PRD.
2. The active PRD (`ROADMAP.md` identifies the Active phase; its PRD lives in `docs/prds/`) — match the diff to a story/epic by content; confirm the match with the user if ambiguous.
3. If neither resolves, ask the user. If they say there is no spec, skip the Spec subagent and note "no spec available" in the report.

Record the exact PRD file path and the story/epic identifier(s) to pass to the Spec subagent.

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

Read [`grading.md`](grading.md) — it owns the severity ladder, the verdict function, and the close-out gate. Carry the **epic identifier** forward. Then:

- **Gate not met** — list exactly what remains: blockers to fix, debt findings still needing a `// debt:` marker at their cited site, spec defects awaiting a PRD edit or a decision. Apply the fixes, commit, then re-check the gate.
- **Gate met** — open a new agent window and run `/mark-epic-complete for Epic <id>`. That skill syncs repo docs before stamping the PRD; no separate doc-sync step is needed here.

## Why two axes

A change can pass one axis and fail the other:

- Follows every standard but implements the wrong thing → **Standards pass, Spec fail.**
- Does exactly what the story asked but breaks project conventions → **Spec pass, Standards fail.**

Reporting them separately stops one axis from masking the other.

---

Adapted from Matt Pocock's `code-review` skill (two-axis design, smell baseline, parallel-subagent architecture).
