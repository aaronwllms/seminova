---
name: Phase 17 Epic 2 Audit Tooling
overview: Point the budget audit at character count instead of lines, widen declared-debt harvest past src/, and plant the two enforcement-gap markers so they show up in that harvest — without repairing the gaps themselves.
todos:
  - id: budget-unit
    content: "audit-agents-md: Orient, mechanical trigger, output template, and quality bar record budget in characters; trigger is 10,000 characters"
    status: completed
  - id: harvest-widen
    content: "audit-tech-debt dimension 10 harvests // debt: from ts/tsx/js/mjs/cjs repo-wide including hidden paths, excluding .git / node_modules / .next / coverage"
    status: completed
  - id: declare-gaps
    content: "Add // debt: markers on proxy.unit.test.ts and no-profiles-role.mjs; delete the WORKFLOW_BACKLOG auth-boundary entry"
    status: completed
  - id: quality-gate
    content: Run pnpm pre-push
    status: completed
  - id: commit-epic
    content: "Conventional commit with Epic: 17.2 trailer"
    status: completed
isProject: false
---

# Phase 17 Epic 2 — Audit tooling and enforcement markers

> **Track progress:** as you complete each step, update the corresponding `todos` entry's `status` to `completed` in this plan's frontmatter.

> **Precondition:** before the first implementation edit, `git status --porcelain` must be empty apart from untracked files under `.cursor/plans/`. Plan files are planning history and never ride in an epic commit, so they cannot dirty the epic's diff range. Anything else — halt and ask the user to commit or stash. The epic must land as a single commit containing only this epic's work — `code-review` derives its range from that commit.

At plan time the tree has two untracked plan files: [`.cursor/plans/phase_17_epic_1_charter_rewiring_7b469b0f.plan.md`](.cursor/plans/phase_17_epic_1_charter_rewiring_7b469b0f.plan.md) and this plan. Both fall under the exemption above — commit or stash them separately whenever convenient; neither blocks build.

This epic is a good candidate for Build in Parallel.

Stories 2.1–2.3 are independent tracks with disjoint files. Build the end state once; do not regenerate [`AGENTS_AUDIT.md`](AGENTS_AUDIT.md) or [`TECH_DEBT_AUDIT.md`](TECH_DEBT_AUDIT.md) — Epic 4.3 is the agents-md re-baseline, and a tech-debt full pass is a separate skill invocation. Do not edit [`AGENTS.md`](AGENTS.md) § Hard constraints. Do not add `check:auth-boundary` to pre-push or `check:admin-gate` to CI — Phase 17 out-of-scope, recorded as debt only.

---

## End state

After this epic:

- [`audit-agents-md`](.cursor/skills/audit-agents-md/SKILL.md) records budget as a character count. The mechanical trigger is **10,000 characters** — set just above the charter's expected steady state (~8k after Epic 3's deletion pass) so accretion is visible while it is still small, rather than only after the file has doubled. Approximate tokens stay as a companion number in the executive summary, not the trigger. Today's file is ~52k characters / ~13k tokens.
- [`audit-tech-debt`](.cursor/skills/audit-tech-debt/SKILL.md) harvests `// debt:` from the whole repo's code and config, not only `src/`. Dependencies and build output stay out. Documentation that *mentions* the convention is not harvested.
- Two new markers exist at the gap sites. A harvest with the new command includes both. The auth-boundary gap no longer also lives in [`docs/WORKFLOW_BACKLOG.md`](docs/WORKFLOW_BACKLOG.md).

---

## 1. Budget unit — `audit-agents-md`

In [`.cursor/skills/audit-agents-md/SKILL.md`](.cursor/skills/audit-agents-md/SKILL.md), move every line-count budget instruction to characters. Touch:

- **Phase 1 Orient** step 2: total **characters** (`wc -m AGENTS.md`), approximate tokens, and section share by character count — not lines.
- **Mechanical triggers:** replace `Total file over **200 lines**` with `Total file over **10,000 characters**`. Waiver column stays empty (always a finding; severity still scales with excess).
- **Output template** executive summary: `Budget: <N> characters / ~<N>k tokens`.
- **Quality bar:** "Budget recorded as a number" still holds; the number is characters.

Leave the rest of the standard (Test 1 / Test 2, protected section, finding IDs, run modes) alone. Do not rewrite [`AGENTS_AUDIT.md`](AGENTS_AUDIT.md) to the new unit — it stays line-based until Epic 4.3's full pass.

---

## 2. Declared-debt harvest — `audit-tech-debt`

In [`.cursor/skills/audit-tech-debt/SKILL.md`](.cursor/skills/audit-tech-debt/SKILL.md) dimension 10, replace `rg -n "// debt:" src/` with a repo-root harvest that covers check scripts and root config without ingesting markdown that discusses the convention:

```bash
rg -n "// debt:" --hidden --glob "*.{ts,tsx,js,mjs,cjs}" --glob "!.git/**" --glob "!node_modules/**" --glob "!.next/**" --glob "!coverage/**"
```

`--hidden` is load-bearing: without it `rg` skips dot-directories and root dotfiles, which would leave config outside `src/` unharvestable — the exact gap this story closes.

That is the "whole repo, excluding dependencies" the story asks for, scoped to files that can actually carry a `// debt:` comment. Existing markers that the old `src/`-only command missed — [`vitest.config.ts`](vitest.config.ts), [`scripts/checks/a11y-structure.mjs`](scripts/checks/a11y-structure.mjs), [`scripts/checks/a11y-contrast.mjs`](scripts/checks/a11y-contrast.mjs) — become harvestable as a side effect. Do not add them to [`TECH_DEBT_AUDIT.md`](TECH_DEBT_AUDIT.md) in this epic.

[`code-minimalism.mdc`](.cursor/rules/code-minimalism.mdc) already says markers are greppable by this skill and does not restrict them to `src/`. Leave it.

---

## 3. Declare the two gaps, retire the duplicate

Place one `// debt:` marker at each site, naming the ceiling and the upgrade path (same shape as the a11y checkers). Do not wire the missing steps.

**Auth-boundary** — [`src/supabase/proxy.unit.test.ts`](src/supabase/proxy.unit.test.ts), which carries the discovered-route proxy tests `check:auth-boundary` runs (`package.json` cannot hold a comment). File-top marker: the named script is not a `pre-push` or CI step; those tests pass only because `test:ci` runs this file; upgrade is adding `pnpm check:auth-boundary` as a named step in the [`package.json`](package.json) `pre-push` script and [`.github/workflows/pull-request.yaml`](.github/workflows/pull-request.yaml) when the union-vs-subset contract for `check:*` scripts is stated.

**Admin-gate scanner** — [`scripts/checks/no-profiles-role.mjs`](scripts/checks/no-profiles-role.mjs) (the half of `check:admin-gate` that CI never runs; the Vitest half already rides `test:ci`). File-top marker: this scanner runs in `pre-push` only; CI never invokes this file; upgrade is adding `pnpm check:admin-gate` as a named step in [`.github/workflows/pull-request.yaml`](.github/workflows/pull-request.yaml), mirroring pre-push.

**Retire the duplicate.** Delete the [`docs/WORKFLOW_BACKLOG.md`](docs/WORKFLOW_BACKLOG.md) entry `` `check:auth-boundary` runs only incidentally under `test:ci` `` — the Contents bullet and the full section. Do not leave a resolved stub; the marker is now the one record. Set **Last updated** to 2026-08-21. Do not touch [`RULE_AUDIT.md`](RULE_AUDIT.md) or [`.cursor/rules/git-workflow.mdc`](.cursor/rules/git-workflow.mdc) (their stale pointers wait for their own audit / Epic 4).

---

## 4. Verify the harvest, then the hook

Before the quality gate:

- Confirm [`audit-agents-md`](.cursor/skills/audit-agents-md/SKILL.md) Orient, mechanical trigger, output template, and quality bar all speak characters / 10,000 — no remaining "200 lines" budget trigger.
- Run the new harvest command. Both new markers appear. The previously-invisible `scripts/checks/` and `vitest.config.ts` markers appear too.
- Confirm [`docs/WORKFLOW_BACKLOG.md`](docs/WORKFLOW_BACKLOG.md) has no auth-boundary gap entry (Contents or body).
- Confirm [`AGENTS.md`](AGENTS.md) § Hard constraints is untouched.

Then run the quality gate below.

---

## Manual check (for the user after build)

- Skim `audit-agents-md`: budget is characters; trigger is 10,000.
- Skim `audit-tech-debt` dimension 10: harvest is not `src/`-only.
- Confirm the two new `// debt:` comments name an upgrade path and do not add CI/pre-push steps.
- Confirm WORKFLOW_BACKLOG no longer lists the auth-boundary gap.

---

### Verification

Quality bar — [AGENTS.md § Agent workflow](AGENTS.md#agent-workflow) step 3. Stop on failure:

```bash
pnpm pre-push
```

### Commit epic

Authorized by this approved plan:

1. Review diff; stage only files in scope for this epic.
2. Write a conventional commit message (`feat`/`fix`/`docs`/etc.). It **must** end with an `Epic:` git trailer — this is the only thing `code-review` uses to find the commit:

   ```
   docs(phase-17): measure AGENTS.md budget in characters and declare enforcement-gap debt

   Epic: 17.2
   ```

   Format is `Epic: {phase}.{id}` — phase number as written in ROADMAP (decimals OK: `7.5`), epic id as written (`1`, `1A`). Blank line before the trailer, nothing after it. Exactly one commit in the repo may carry a given `Epic:` value.
3. Commit (request `git_write`). Pre-commit hook runs automatically — if it fails, **fix and retry the commit** (a failed pre-commit hook aborts the commit, so there is nothing to amend).
4. Verify `git status --porcelain` is empty after commit, apart from any untracked `.cursor/plans/` files.

**Do not push** — push remains `ship-phase`.

### Handoff

End the run by telling the user:

*"Epic committed. Next: open a new agent window and run `/code-review`."*

Pass nothing else. `code-review` resolves the epic, its commit, and the baseline from the PRD and git.
