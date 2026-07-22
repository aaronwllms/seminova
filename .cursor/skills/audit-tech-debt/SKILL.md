---
name: audit-tech-debt
description: >-
  Read-only tech debt and architecture audit of the whole repo (full pass or
  sync); writes TECH_DEBT_AUDIT.md at the repo root.
disable-model-invocation: true
---

# Tech Debt Audit

Conducts a deliberate, opinionated audit of an entire codebase and produces `TECH_DEBT_AUDIT.md` at the repo root with cited findings.

**Agent mode required** — this skill writes a file. Do not run in Ask mode.

**Not the same as:**

- **`pre-release-review`** — scoped to changed files before a PR; quality gates + manual checklist
- **`audit-security`** — security-focused; full pass or sync → `SECURITY_AUDIT.md` at repo root
- **`sync-repo-docs`** / **`sync-context-md`** — doc drift only, narrow window

---

## Operating principles

Find what's actually wrong. Not diplomatic. Not surface-only. Don't pattern-match to generic best practices without grounding in this specific repo. No sycophancy. No "overall the codebase is well-structured" filler.

Cite `startLine:endLine:filepath` for every concrete finding (Cursor code-citation format). Vague claims like "the code generally..." don't count. Read code before judging it — a pattern that looks wrong in isolation may be load-bearing.

Respect **intentional design** documented in `AGENTS.md` § Hard constraints and the planning brief. Flag doc-vs-reality mismatches; do not treat hard constraints as debt.

## Run modes

**Mode gate** — first step, before anything else: if the invocation does not state full pass or sync, ask the user which mode as a numbered choice — e.g. `Which mode? 1 (Full pass) 2 (Sync)` — and stop. Do not proceed on an assumed or inferred mode, even when context makes one seem obvious (e.g. `TECH_DEBT_AUDIT.md` already exists, so sync "must" be intended). Only after the mode is explicit, continue below.

**Full pass** — Phase 1 (Orient) → Phase 2 (dimensions) → Phase 3 (write the deliverable). On a full pass, also prune the Resolved appendix: delete any entry older than the previous full audit date.

**Sync pass** — read the existing `TECH_DEBT_AUDIT.md` → gather narrow evidence for **Open** findings only (no full-repo scan) → verify each affected finding in code → make minimal edits → report what changed. Spot-check **Accepted** rows only when their cited marker or code clearly changed. Never flatten Accepted back into Open without an explicit PM decision. Escalate to a full pass (after telling the user) if the file is stale, mostly wrong, or too many new findings surface mid-sync.

**Verify-in-code gate (both modes):** nothing is marked resolved without confirming the fix exists in the code. A ticked checkbox or a commit message claiming a fix does not count. Resolved findings are removed from **Open** / **Accepted** and moved to the Resolved appendix with the date, keeping their ID.

**Finding disposition (required):** every non-resolved finding lands in exactly one section — never leave disposition implied in Recommendation prose alone:

| Section | Meaning | At-a-glance |
| ------- | ------- | ----------- |
| **Open** | Still actionable. `Status` column is `Do next`, `Deferred` (named home: phase / release gate / ROADMAP item), or `Needs decision` (blocked on PM). | Real backlog |
| **Accepted** | Deliberately not doing now. Rows carry **Why accepted** and **Reopen when**. Ceiling-gated `// debt:` markers whose trigger has not fired belong here. | Not a todo list |
| **Resolved** | Fixed in code (appendix). | Done |

**Top 5** and **Quick wins** draw only from **Open**.

## Phase 1: Orient

Do not skip this. Forming opinions before understanding the system produces bad audits.

Use `TodoWrite` to publish a plan so the user can see progress through the phases.

1. Read `README.md`, `package.json` (or stack manifest), **`AGENTS.md`**, and **`ROADMAP.md`** + active PRD in `docs/prds/` (discoverable via `docs/DOC_RULES.md` document-roles table). Skim `.cursor/rules/` for project conventions.
2. Map the directory structure and identify the major modules / layers.
3. Run `git log --oneline -200` and `git log --stat --since="6 months ago"` to see what's actually changing and where churn concentrates.
4. Identify entry points, hot paths, and cold corners.
5. List the top 20 largest files by line count, and the 20 files most frequently modified in the last 6 months. The intersection is where debt usually hides.
6. Write a 1–2 paragraph mental model of the architecture before proceeding. If your model contradicts the README or AGENTS.md, flag it — that itself is a finding.

## Phase 2: Audit across these dimensions

Use `rg` (Grep tool), shell commands, and language-native tooling to find concrete examples. Cite `startLine:endLine:filepath` for every finding.

1. **Architectural decay** — circular deps, layering violations, god files and god functions, duplicated logic across 3+ sites where an abstraction should exist, abstractions that exist but nobody uses, dead code (unused exports, unreachable branches, stale commented-out blocks). Judge god files on **interface width + tangled responsibilities** (per the depth definition in `project-standards.mdc`), not raw length: treat >500 LOC as an inspect-trigger, not a conviction. A **deep module** (one responsibility, narrow interface, large hidden implementation) is the legitimate large-file case and is not a finding — flag only when the length tracks *many responsibilities* exposed through a *wide interface*. Two `code-minimalism.mdc` anti-patterns also belong here as named finding types — the construct is *used*, so dead-code and unused-abstraction scans miss them:
   - **Speculative flexibility** — flexibility that exists but is never exercised: an interface with one implementation, a factory for one product, config for a value that never changes, an options object with a single option, a function param never passed a non-default value. (Per the rule's "no unrequested abstractions" discipline — distinct from an unused abstraction, where the construct itself is dead.) Cite the construct's `startLine:endLine:filepath`.
   - **Reinventing the platform/ecosystem** — hand-rolled code where a lower rung of the minimalism ladder already covers it: JS where CSS suffices, app code where a DB constraint suffices, a raw native element where a shadcn/ui component is the standard (rung 4), or a helper/util reimplemented once where one already exists (rung 2, below the 3+-site duplication threshold above). Cite the reimplementation's `startLine:endLine:filepath`.
   - **Shallow module** — the inverse of a god file: small files whose split buys little encapsulation and that behave as one unit — candidates for consolidation into fewer, deeper modules. Per the depth definition in `project-standards.mdc`, a shallow module's interface is nearly as complex as the thin implementation it hides. Flag **only when both** gates hold:
     1. **Interface ≈ implementation** — the exported surface (exports, props, params) carries nearly as much complexity as what it hides; the split buys little encapsulation.
     2. **Shotgun surgery / shotgun coupling** — the units co-change as a unit: editing one routinely forces edits across the others. Detect from the `git log --stat --since="6 months ago"` already run in Phase 1 — look for files that repeatedly appear together in the same commits. Co-change clustering is the dynamic signal that a single responsibility was split across files.
     Require both before flagging — interface-complexity alone may be inherent; coupling alone may be coincidental. Cite the co-changing file set (lead file's `startLine:endLine:filepath` plus the peer filepaths). **Lower severity than god files** — over-splitting is recoverable by merging, so default Low–Medium; let the Recommendation column carry the specific consolidation.

2. **Consistency rot** — multiple ways of doing the same thing (HTTP clients, error handling, logging, config loading, validation, date handling). Naming drift. Folder structure that no longer reflects what the code actually does.

3. **Type & contract debt** — `any` / `unknown` / `as any` / `# type: ignore` / loose dicts. Untyped API boundaries. Missing schema validation at trust boundaries.

4. **Test debt** — high-churn files with no tests (from the Phase 1 churn data). For suite depth — coverage gaps, over-testing, assertion quality, mocking hygiene — note that **`audit-tests`** exists; this dimension catches the churn-vs-coverage signal only.

5. **Dependency & config debt** — `pnpm audit` / `npm audit` / stack equivalent for CVEs. Unused deps. Duplicate deps doing the same job. Env var sprawl (referenced but not documented; defaults inconsistent across envs).

6. **Performance & resource hygiene** — N+1 queries, sync work in async paths, blocking I/O on hot paths, uncleaned listeners or handles, unnecessary serialization.

7. **Error handling & observability** — swallowed exceptions, blanket catches, errors logged but not handled, inconsistent error shapes across modules, missing structured logs on critical paths.

8. **Security hygiene** — hardcoded secrets, string-concat SQL, missing input validation at trust boundaries, permissive auth or CORS, weak crypto. For deep security review, note that **`audit-security`** exists; this dimension catches obvious hygiene only.

9. **Documentation drift** — README or AGENTS.md claims that don't match reality, comments that contradict adjacent code, public APIs without docstrings.

10. **Declared debt** — harvest the deliberate shortcuts the author flagged inline per `code-minimalism.mdc`: `rg -n "// debt:" src/`. Each marker names a known ceiling and upgrade path (e.g. `// debt: in-memory cache, swap for Redis if multi-instance`). These are **pre-classified, uncontested** findings — the author already declared them debt, so do not re-litigate whether they belong. Record under category **Declared debt**, citing the marker's `startLine:endLine:filepath`, using the marker's stated upgrade path as the Recommendation, and setting Severity/Effort from the nature of the ceiling. Place ceiling-gated markers whose trigger has not fired in **Accepted**; place markers whose upgrade is actively queued or deferred to a named phase in **Open**. A marker whose shortcut is no longer present (upgraded already) is not a finding.

## Phase 3: Deliverable

Write to `TECH_DEBT_AUDIT.md` in the repo root per the Output template below.

- Aim for 30–80 findings on a full pass; padding past that is noise
- **Declared debt** stays a distinct category — self-declared `// debt:` markers remain visibly separate from auditor-discovered findings
- Split findings into **Open** / **Accepted** / **Resolved** per Finding disposition above — do not dump accepted or parked items into Open
- **Top 5** needs concrete diff sketches or refactor outlines, not vague advice; **Open only**
- **Quick wins** = Low effort × Medium+ severity from **Open only**
- **Verified OK** (areas that look scary but are sound) is required prose; if empty, the audit was shallow — it is not a substitute for the **Accepted** findings table
- On a full pass, prune Resolved entries older than the previous full audit date
- Finding IDs are stable across passes — never renumber

## Rules

- Cite `startLine:endLine:filepath` for every concrete finding.
- If unsure whether something is debt or intentional, ask in the open questions section — don't assert.
- Don't recommend rewrites. Recommend specific, scoped changes.
- Don't pad. If a category has nothing material, write "Nothing material" and move on.
- No sycophancy. Tell the user what's broken.
- Do not fix code unless the user asks — this skill produces the audit artifact only.

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

## Output template

```markdown
# Tech Debt Audit — <repo name>

Last full audit: YYYY-MM-DD
Last synced: YYYY-MM-DD
Scope: <what this audit covers>

## Executive summary

- (ranked bullets, max 10)

## Architectural mental model

...

## Open

Actionable backlog only. `Status`: `Do next` | `Deferred` | `Needs decision`.

| ID   | Status   | Category | File:Line  | Severity | Description | Recommendation | Effort |
| ---- | -------- | -------- | ---------- | -------- | ----------- | -------------- | ------ |
| F001 | Do next  | ...      | src/...:42 | High     | ...         | ...            | M      |

## Accepted

Deliberately not doing now. Not a todo list.

| ID   | Category | File:Line | Severity | Description | Why accepted | Reopen when | Effort |
| ---- | -------- | --------- | -------- | ----------- | ------------ | ----------- | ------ |
| F022 | ...      | ...       | Low      | ...         | ...          | ...         | —      |

## Top 5

1. **F001 — ...** ... (Open findings only)

## Quick wins

- [ ] F042: ... (Open findings only)

## Verified OK

- (areas that look scary but are sound — required; not a substitute for Accepted)

## Open questions

- ...

## Resolved

- YYYY-MM-DD — F007: <one-line description>
```

Adapted from [ksimback/tech-debt-skill](https://github.com/ksimback/tech-debt-skill) (MIT).
