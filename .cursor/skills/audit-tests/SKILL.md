---
name: audit-tests
description: >-
  Thorough, user-invoked audit of the test suite — coverage gaps, over-testing,
  assertion quality, mocking hygiene, reliability, orphaned tests, and
  adherence to testing.mdc. Two explicitly invoked run modes: full pass and
  sync pass (open findings only). Produces or updates TEST_AUDIT.md at the
  repo root with file-cited findings. Use when the user asks for a test audit,
  test suite health check, or coverage review. Does not auto-invoke.
disable-model-invocation: true
---

# Test Audit

Audits the test suite and produces `TEST_AUDIT.md` at the repo root with cited findings.

**Agent mode required** — this skill writes a file. Do not run in Ask mode.

**Not the same as:**

- **`audit-tech-debt`** — whole-codebase debt; its test-debt dimension catches obvious hygiene only and defers depth here
- **`audit-rules`** — audits the rule files themselves; this skill audits the suite's *compliance* with `testing.mdc`, not the rule's quality
- **`pre-release-review`** — scoped to changed files before a PR

---

## Operating principles

`.cursor/rules/testing.mdc` is the governing convention — dimensions below audit the suite against it rather than restating it. Read it in full during Orient; if the rule and this skill ever disagree, the rule wins and the disagreement is itself a finding to raise with the user.

Find what's actually wrong, in both directions: missing tests that would catch real bugs, and existing tests that catch nothing. The suite's core principle is "minimum tests that catch real bugs" — a bloated suite is as much a finding as a gappy one.

Cite `startLine:endLine:filepath` for every concrete finding. Read the test *and* its subject before judging — a test that looks trivial may pin a regression.

Where a violation is mechanically checkable, the Recommendation must propose a lint rule, config change, or CI gate — not just a one-time fix (see `no-unquarantined-skips` and the snapshot ban for shipped examples of this pattern). State the enforcement as the recommendation itself, never as an optional aside.

**Anti-example** — a shipped finding once recommended a filename-convention fix like this: "Rename to `.integration.test.tsx`. Optionally add an ESLint or filename lint mirroring the convention." The "optionally" hedges away the enforcement. Corrected: "Rename to `.integration.test.tsx`. Add a filename lint rule enforcing the `.unit`/`.integration` suffix matches actual mocking scope."

## Run modes

**Mode gate** — first step, before anything else: if the invocation does not state full pass or sync, ask the user which mode as a numbered choice — e.g. `Which mode? 1 (Full pass) 2 (Sync)` — and stop. Do not proceed on an assumed or inferred mode, even when context makes one seem obvious (e.g. `TEST_AUDIT.md` already exists, so sync "must" be intended). Only after the mode is explicit, continue below.

**Full pass** — Phase 1 (Orient) → Phase 2 (dimensions) → Phase 3 (write the deliverable). On a full pass, also prune the Resolved appendix: delete any entry older than the previous full audit date.

**Sync pass** — read the existing `TEST_AUDIT.md` → gather narrow evidence for open findings only → verify each affected finding in code → make minimal edits → report what changed. Escalate to a full pass (after telling the user) if the file is stale, mostly wrong, or too many new findings surface mid-sync.

**Verify-in-code gate (both modes):** nothing is marked resolved without confirming the fix exists in the code. A ticked checkbox or a commit message claiming a fix does not count. Resolved findings move to the Resolved appendix with the date, keeping their ID.

## Phase 1: Orient

Use `TodoWrite` to publish a plan so the user can see progress.

1. Read `.cursor/rules/testing.mdc` in full, plus `vitest.config.ts` (coverage include/exclude/thresholds), the test scripts in `package.json`, and the test-related ESLint rules.
2. Inventory the suite: list every `*.test.*` file with line count, unit/integration suffix, and colocation with its subject. Compute the aggregate unit:integration ratio.
3. Run `pnpm test:ci` for a pass/fail and coverage baseline. Capture Vitest's slow-test output.
4. Map source directories to test files; note in-scope source files (per the coverage include/exclude) with no corresponding tests.
5. Cross-check `git log --stat --since="6 months ago"`: high-churn source files with thin or absent tests are where gaps bite.
6. Write a short mental model of the suite (shape, ratio, coverage posture) before proceeding.

## Phase 2: Audit across these dimensions

1. **Coverage gaps** — in-scope critical paths (auth, mutations, trust boundaries) with no tests or happy-path-only tests; high-churn files with thin coverage; threshold health (how close to the 80% floor, and whether it's propped up by over-tested easy files); whether the `vitest.config.ts` exclude list has grown beyond its documented rationale to dodge the denominator.
2. **Over-testing** — the inverse gap, per `testing.mdc`'s investigate signals (~400-line files, per-type test counts): near-duplicate edge-case permutations, tests of framework/library behavior, tests on trivial code, exhaustive validation-rule coverage where 1-2 representative cases suffice, render-only tests on surfaces reachable in normal dev flow (per the render-only rule in `testing.mdc`). Investigate signals are triggers to read the file, not verdicts.
3. **Assertion quality** — tests that pass while verifying nothing (no meaningful assertion, asserting the mock); implementation-detail assertions (internal state, CSS classes); H/I/B categories missing with no sign of a conscious skip.
4. **Mocking hygiene** — own business logic mocked; mocking inside the boundary instead of at it; MSW handlers bypassed with ad-hoc fetch mocks; Supabase mocked where the policy prefers a test database.
5. **Reliability & speed** — flaky tests; tests over the slow-test threshold; quarantined tests whose QUARANTINE issue links are stale or whose quarantine has outlived its reason.
6. **Orphaned & stale tests** — tests for removed or rewritten code; assertions pinning behavior that no longer exists; suites kept green by testing a dead path.
7. **Structural adherence** — everything `testing.mdc` mandates structurally: `.unit`/`.integration` naming matching the test's actual scope, colocation, `@/test/test-utils` usage, and the aggregate integration-vs-unit balance from Orient (only checkable suite-wide, so it lives here rather than in authoring-time rules).

## Phase 3: Deliverable

Write to `TEST_AUDIT.md` in the repo root per the Output template below.

- Category values are the seven dimension names
- Before finalizing: reread every Recommendation cell for a mechanically-checkable finding — if it contains "optionally," "consider," or similar hedges around enforcement, rewrite it as the direct recommendation (see anti-example under Operating principles)
- Severity calibration: **Critical** = untested security/auth path, or flaky test in the CI gate; **High** = coverage gap on a core flow, mock-testing-the-mock; **Medium** = over-testing, convention violations; **Low** = speed, naming nits
- **Verified OK** is required; if empty, the audit was shallow
- Finding IDs (`TS001`…) are stable across passes — never renumber
- Don't pad. If a dimension has nothing material, write "Nothing material" and move on
- Do not fix tests unless the user asks — this skill produces the audit artifact only

## Output template

```markdown
# Test Audit — <repo name>

Last full audit: YYYY-MM-DD
Last synced: YYYY-MM-DD
Scope: test suite health and adherence to .cursor/rules/testing.mdc

## Executive summary

- (ranked bullets, max 10)

## Suite mental model

...

## Findings

| ID    | Category | File:Line | Severity | Description | Recommendation |
| ----- | -------- | --------- | -------- | ----------- | -------------- |
| TS001 | ...      | src/...:42 | High    | ...         | ...            |

## Quick wins

- [ ] TS042: ...

## Verified OK / looks bad but is fine

- ...

## Open questions

- ...

## Resolved

- YYYY-MM-DD — TS007: <one-line description>
```
