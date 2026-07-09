# RESEARCH-0002: Epic close-out commit workflow

**Archived:** 2026-07-08

**Researched:** 2026-07-08

**Type:** technical

## Question

How should epic build sessions end with a committed working tree — without a global auto-commit hook — so `code-review`'s clean-tree precondition is satisfied and the planning loop has explicit handoff points?

## Scope and constraints

- In scope: epic build close-out, plan-authorized commits, skill-level commit carve-outs, fresh-window breadcrumb model, epic baseline convention.
- Out of scope: Cursor `stop` hook implementation, `pre-release-review` in the epic loop, ad hoc / non-plan sessions, AGENTS.md changes, Claude-side `plan-review` updates.

## Findings

### Cursor docs posture: explicit workflow commits, not blind auto-commit

Cursor's agent best-practices and hooks documentation favor **intentional, workflow-scoped commits** over a global `stop` hook that commits whatever is in the working tree at session end. A blind auto-commit risks committing partial work, unrelated edits, or failing pre-commit hooks without the agent context to fix them.

### Plan-authorized commit rationale

The approved implementation plan in `.cursor/plans/` is the authorization boundary. When the PM approves a plan in Plan Mode, the **Commit epic** step inside that plan is an explicit contract: the build agent may commit only files in scope for that epic, with a conventional message referencing phase + epic id. This is narrower and safer than a global hook.

### Rejected `stop` hook approach

A `stop` hook that auto-commits on every agent session was considered and rejected:

- No scope control — commits everything dirty, not just epic work.
- No message quality — generic or missing conventional commit format.
- Pre-commit failure handling is worse — hook aborts but the agent may not be in a position to fix and retry.
- Conflicts with the user's standing rule ("only commit when asked") unless the carve-out is very narrow.

The backlog item [Auto-commit after agent coding runs](../WORKFLOW_BACKLOG.md) is resolved by this plan-authorized model instead.

### Epic baseline convention

Before the first implementation edit, the build agent records `git rev-parse HEAD` as **Epic baseline** in the plan body. This SHA is the fixed point for `code-review` (`git diff <baseline>...HEAD`). It pins the review to exactly what this epic built, not an arbitrary ref.

### Fresh-window breadcrumb model

Generated plans **end at the epic commit**. `code-review` and `mark-epic-complete` are **manually invoked follow-up skills**, each in a **fresh agent window**, chained by end-of-run breadcrumbs:

1. Build window → quality gate → commit epic → handoff: `/code-review — epic baseline <sha>, Epic <id>`
2. Review window → two-axis report → handoff: `/mark-epic-complete for Epic <id>`
3. Complete window → PRD `` `Complete` `` tag → `docs:` commit (skill edits only)

Each skill commits only the doc edits it authored (`plan-next-epic` status-flip, `mark-epic-complete` PRD tag). The epic code commit happens in the build window per the approved plan.

### Git-workflow carve-out

`.cursor/rules/git-workflow.mdc` now lists three narrow commit exceptions: (a) user explicitly asks, (b) approved plan includes **Commit epic**, (c) explicitly invoked skill authorizes a commit scoped to its own edits (`ship-phase`, `plan-next-epic` status-flip, `mark-epic-complete` tag).

## Options compared

| Approach | Pros | Cons | Verdict |
| -------- | ---- | ---- | ------- |
| Global `stop` hook auto-commit | Always clean tree | No scope, bad messages, hook failure handling | Rejected |
| Manual commit only (status quo) | Full user control | Friction for `code-review` clean-tree check | Superseded |
| Plan-authorized epic commit + skill-scoped doc commits | Scoped, conventional, pre-commit retry in context | Requires plan approval step | **Adopted** |

## Recommendation

Adopted in 2026-07-08 implementation: plans end at epic commit; follow-ups are manual skills in fresh windows with breadcrumbs carrying baseline SHA and epic id.

## Open questions

- Whether `pre-release-review` should become a named step before `ship-phase` (still deferred — phase/PR boundary only).
- Whether the PM's personal Cursor user rule ("only commit when asked") should be updated to mirror the repo carve-out (repo cannot change that file).

## Sources

- [epic_close-out_commit plan](.cursor/plans/epic_close-out_commit_5ed93700.plan.md)
- [WORKFLOW_GUIDE.md](../WORKFLOW_GUIDE.md) Step 5–6
- [git-workflow.mdc](../../.cursor/rules/git-workflow.mdc) § Commits
- Cursor agent best-practices and hooks documentation (2026)

## Related

- [WORKFLOW_BACKLOG.md](../WORKFLOW_BACKLOG.md) — auto-commit item removed; quality skills integration partially addressed
- [WORKFLOW_GUIDE.md](../WORKFLOW_GUIDE.md) — Step 6 build and follow-up sequence
- Skills: `plan-next-epic`, `code-review`, `mark-epic-complete`
