---
name: tech-debt-audit
description: >-
  Thorough, user-invoked tech debt and architecture audit of the current
  codebase. Produces TECH_DEBT_AUDIT.md with file-cited findings, severity,
  effort estimates, and a required "looks bad but is actually fine" section. Use
  when the user asks for a debt audit, codebase health check, architecture
  review, or code quality assessment of an entire repo. Does not auto-invoke.
disable-model-invocation: true
---

# Tech Debt Audit

Conducts a deliberate, opinionated audit of an entire codebase and produces `TECH_DEBT_AUDIT.md` at the repo root with cited findings.

**Agent mode required** — this skill writes a file. Do not run in Ask mode.

**Not the same as:**

- **`pre-release-review`** — scoped to changed files before a PR; quality gates + manual checklist
- **`security-audit`** — security-focused; Plan Mode → Build → `SECURITY_AUDIT.md` at repo root
- **`sync-repo-docs`** / **`sync-context-md`** — doc drift only, narrow window
- **`sync-tech-debt-audit`** — incremental TECH_DEBT_AUDIT.md refresh after recent changes; not a full re-audit
- **`archive-tech-debt-audit`** — move completed audit to `archive/tech-debt-audits/` when all findings resolved
- **`archive-security-audit`** — move completed security audit to `archive/security-audits/` when actionable findings resolved
- **`refactor-cleaner`** skill + subagent — post-audit **hands-off cleanup** via `/refactor-cleaner`; subagent removes code and commits in batches; run only after this skill produces `TECH_DEBT_AUDIT.md`

For human install notes, philosophy, and limitations, see [reference.md](reference.md).

---

## Operating principles

Find what's actually wrong. Not diplomatic. Not surface-only. Don't pattern-match to generic best practices without grounding in this specific repo. No sycophancy. No "overall the codebase is well-structured" filler.

Cite `startLine:endLine:filepath` for every concrete finding (Cursor code-citation format). Vague claims like "the code generally..." don't count. Read code before judging it — a pattern that looks wrong in isolation may be load-bearing.

Respect **intentional design** documented in `AGENTS.md` locked rules and the planning brief. Flag doc-vs-reality mismatches; do not treat locked rules as debt.

## Phase 1: Orient

Do not skip this. Forming opinions before understanding the system produces bad audits.

Use `TodoWrite` to publish a plan so the user can see progress through the phases.

1. Read `README.md`, `package.json` (or stack manifest), **`AGENTS.md`**, and the **planning brief** (path from AGENTS.md documentation map — e.g. `CONTEXT.md`). Skim `.cursor/rules/` for project conventions.
2. Map the directory structure and identify the major modules / layers.
3. Run `git log --oneline -200` and `git log --stat --since="6 months ago"` to see what's actually changing and where churn concentrates.
4. Identify entry points, hot paths, and cold corners.
5. List the top 20 largest files by line count, and the 20 files most frequently modified in the last 6 months. The intersection is where debt usually hides.
6. Write a 1–2 paragraph mental model of the architecture before proceeding. If your model contradicts the README or AGENTS.md, flag it — that itself is a finding.

## Phase 2: Audit across these dimensions

Use `rg` (Grep tool), shell commands, and language-native tooling to find concrete examples. Cite `startLine:endLine:filepath` for every finding.

1. **Architectural decay** — circular deps, layering violations, god files (>500 LOC) and god functions, duplicated logic across 3+ sites where an abstraction should exist, abstractions that exist but nobody uses, dead code (unused exports, unreachable branches, stale commented-out blocks). Two `code-minimalism.mdc` anti-patterns also belong here as named finding types — the construct is *used*, so dead-code and unused-abstraction scans miss them:
   - **Speculative flexibility** — flexibility that exists but is never exercised: an interface with one implementation, a factory for one product, config for a value that never changes, an options object with a single option, a function param never passed a non-default value. (Per the rule's "no unrequested abstractions" discipline — distinct from an unused abstraction, where the construct itself is dead.) Cite the construct's `startLine:endLine:filepath`.
   - **Reinventing the platform/ecosystem** — hand-rolled code where a lower rung of the minimalism ladder already covers it: JS where CSS suffices, app code where a DB constraint suffices, a raw native element where a shadcn/ui component is the standard (rung 4), or a helper/util reimplemented once where one already exists (rung 2, below the 3+-site duplication threshold above). Cite the reimplementation's `startLine:endLine:filepath`.

2. **Consistency rot** — multiple ways of doing the same thing (HTTP clients, error handling, logging, config loading, validation, date handling). Naming drift. Folder structure that no longer reflects what the code actually does.

3. **Type & contract debt** — `any` / `unknown` / `as any` / `# type: ignore` / loose dicts. Untyped API boundaries. Missing schema validation at trust boundaries.

4. **Test debt** — run coverage if configured; otherwise map high-churn files to test files. Tests that assert implementation rather than behavior. Skipped or flaky tests. High-churn files with no tests.

5. **Dependency & config debt** — `pnpm audit` / `npm audit` / stack equivalent for CVEs. Unused deps. Duplicate deps doing the same job. Env var sprawl (referenced but not documented; defaults inconsistent across envs).

6. **Performance & resource hygiene** — N+1 queries, sync work in async paths, blocking I/O on hot paths, uncleaned listeners or handles, unnecessary serialization.

7. **Error handling & observability** — swallowed exceptions, blanket catches, errors logged but not handled, inconsistent error shapes across modules, missing structured logs on critical paths.

8. **Security hygiene** — hardcoded secrets, string-concat SQL, missing input validation at trust boundaries, permissive auth or CORS, weak crypto. For deep security review, note that **`security-audit`** exists; this dimension catches obvious hygiene only.

9. **Documentation drift** — README or AGENTS.md claims that don't match reality, comments that contradict adjacent code, public APIs without docstrings.

10. **Declared debt** — harvest the deliberate shortcuts the author flagged inline per `code-minimalism.mdc`: `rg -n "// debt:" src/`. Each marker names a known ceiling and upgrade path (e.g. `// debt: in-memory cache, swap for Redis if multi-instance`). These are **pre-classified, uncontested** findings — the author already declared them debt, so do not re-litigate whether they belong. Record each in the findings table under category **Declared debt**, citing the marker's `startLine:endLine:filepath`, using the marker's stated upgrade path as the Recommendation, and setting Severity/Effort from the nature of the ceiling. A marker whose shortcut is no longer present (upgraded already) is not a finding.

## Phase 3: Deliverable

Write to `TECH_DEBT_AUDIT.md` in the repo root with this structure:

- **Executive summary** — max 10 bullets, ranked by impact.
- **Architectural mental model** — your understanding of the system as it actually is.
- **Findings table** — columns: `ID | Category | File:Line | Severity (Critical/High/Medium/Low) | Effort (S/M/L) | Description | Recommendation`. Aim for 30–80 findings; padding past that is noise. The **Declared debt** category (Phase 2, dimension 10) carries the author's own `// debt:` markers — keep that category label so self-declared shortcuts stay visibly distinct from auditor-discovered findings.
- **Top 5 "if you fix nothing else, fix these"** — with concrete diff sketches or refactor outlines, not vague advice.
- **Quick wins** — Low effort × Medium+ severity, as a checklist.
- **Things that look bad but are actually fine** — calls you considered flagging and chose not to, with reasoning. **This section is required.** If it's empty, you didn't look hard enough.
- **Open questions for the maintainer** — things you couldn't tell were debt vs. intentional.

## Rules

- Cite `startLine:endLine:filepath` for every concrete finding.
- If unsure whether something is debt or intentional, ask in the open questions section — don't assert.
- Don't recommend rewrites. Recommend specific, scoped changes.
- Don't pad. If a category has nothing material, write "Nothing material" and move on.
- No sycophancy. Tell the user what's broken.
- Do not fix code unless the user asks — this skill produces the audit artifact only.

## After the audit

This skill produces the report only. To **act on findings**, run **`/refactor-cleaner`** — a skill that delegates to the [`refactor-cleaner`](../../agents/refactor-cleaner.md) subagent for hands-off cleanup and batch commits (see [git-workflow.mdc](../../rules/git-workflow.mdc) subagent exception). Do not overlap with active feature development.

## Stack-specific tooling

Detect the stack from the manifest and run the relevant tools. Run them in parallel when possible. Prefer project scripts from `package.json` when they exist.

- **TypeScript / JavaScript (pnpm)** — `pnpm audit`, `pnpm type-check`, `pnpm lint`, `pnpm test:ci`; optional if available: `npx knip`, `npx madge --circular`, `npx depcheck`
- **TypeScript / JavaScript (npm)** — `npm audit`, `npx knip`, `npx madge --circular`, `npx depcheck`, `tsc --noEmit`
- **Python** — `pip-audit`, `ruff check`, `vulture`, `pydeps --show-cycles`, `mypy --strict`
- **Rust** — `cargo audit`, `cargo udeps`, `cargo machete`, `cargo clippy -- -W clippy::pedantic`
- **Go** — `govulncheck`, `go vet`, `staticcheck`, `golangci-lint run`

If a tool isn't installed, note it in the audit and move on rather than blocking. Do not install dev tools globally without permission.

## Large repos: spawn subagents

If the repo is >50k LOC or has >5 top-level modules, dispatch subagents (`Task` tool) in parallel — one per module — and synthesize their reports. Serial reading on a large repo eats the context window before findings can be written.

Each subagent gets: scope (one module), the dimensions list above, the citation requirement, and a 200-finding cap. The main agent merges, dedupes, and ranks.

## Repeat-run mode

If `TECH_DEBT_AUDIT.md` already exists in the repo, read it first. Mark resolved findings as `RESOLVED`, update stale ones, and tag new findings with `NEW`. This turns the audit into a living document tracked over time.

## Output template

```markdown
# Tech Debt Audit — <repo name>

Generated: YYYY-MM-DD

## Executive summary

- ...

## Architectural mental model

...

## Findings

| ID   | Category | File:Line  | Severity | Effort | Description | Recommendation |
| ---- | -------- | ---------- | -------- | ------ | ----------- | -------------- |
| F001 | ...      | src/...:42 | High     | M      | ...         | ...            |

## Top 5

1. **F001 — ...** ...

## Quick wins

- [ ] F042: ...

## Things that look bad but are actually fine

- ...

## Open questions

- ...
```
