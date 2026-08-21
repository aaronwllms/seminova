---
name: Phase 17 Epic 1 Charter Rewiring
overview: Rewire AGENTS.md’s charter and stop every skill from writing the file, so later deletion is not undone by the next epic close-out. The documented finish-work command becomes the same command the pre-push hook already runs.
todos:
  - id: quality-bar
    content: AGENTS.md § Agent workflow step 3 → pnpm pre-push; drop AGENTS.md from step 4 sync list; checklist no longer routes routes/schema into AGENTS.md; plan-next-epic + project-standards.mdc cite the same command
    status: completed
  - id: charter-docs
    content: DOC_RULES roles row, sync-order paragraph, and rule 3 match ADR-0010; AGENTS.md Change protocol stops routing features/routes/data-model into itself
    status: completed
  - id: stop-generators
    content: sync-repo-docs, mark-epic-complete, and ship-phase no longer write AGENTS.md; clear write-routing in archive-cursor-plans, research, pre-release-review, rule-authoring, audit-agents-md, github-docs-authoring; grep .cursor/skills/ for remaining write targets
    status: completed
  - id: quality-gate
    content: Run pnpm pre-push
    status: completed
  - id: commit-epic
    content: "Conventional commit with Epic: 17.1 trailer"
    status: completed
isProject: false
---

# Phase 17 Epic 1 — Charter rewiring

> **Track progress:** as you complete each step, update the corresponding `todos` entry's `status` to `completed` in this plan's frontmatter.

> **Precondition:** confirm `git branch --show-current` outputs `phase-17/instruction-budget-doc-ownership`. If it doesn't match, halt and ask the user — do not switch branches.

> **Precondition:** `git status --porcelain` must be empty before the first implementation edit. If dirty, halt and ask the user to commit or stash. The epic must land as a single commit containing only this epic's work — `code-review` derives its range from that commit.

At plan time the tree was dirty (`ROADMAP.md` and the Phase 17 PRD). Those are kickoff/planning leftovers, not this epic — they must land in a separate commit (or be stashed) before build starts.

Stories 1.1–1.3 share [AGENTS.md](AGENTS.md) and the skill graph. Build the end state once; do not land an interim “still syncs AGENTS.md” skill state.

The AGENTS.md title/purpose line still advertises the file as repo truth after this epic. That is deliberate — Epic 3.3 rewrites it. Leave it alone; it is not an oversight to correct here or to raise in code review.

**Out of this epic (later Phase 17 work):** deleting § Implemented now / data model / skills tables / command table (Epic 3); character-count audit metric and `// debt:` harvest (Epic 2); sweeping leftover “repo truth” read-first lines in skills and docs that this epic does not already touch — [ROADMAP.md](ROADMAP.md) intro, [README.md](README.md), [`.cursor/rules/README.md`](.cursor/rules/README.md), [docs/WORKFLOW_GUIDE.md](docs/WORKFLOW_GUIDE.md), [docs/prds/README.md](docs/prds/README.md) (Epic 4). Do not edit § Hard constraints — Epic 3 verifies it unchanged, character for character.

---

## End state

After this epic:

- An agent following [AGENTS.md](AGENTS.md) § Agent workflow step 3 runs `pnpm pre-push` — the same command [`.husky/pre-push`](.husky/pre-push) and the `pre-push` script in [package.json](package.json) already run. The human-only migration gate stays a separate step.
- [docs/DOC_RULES.md](docs/DOC_RULES.md) and [AGENTS.md](AGENTS.md) § Change protocol agree: the file owns hard constraints, workflow gates, the merge checklist, and change protocol. Implemented features, routes, and the data model are not routed back into it. A *what* lives in the code (`src/`, `supabase/migrations/`); a *why* already has an owner (ADR, scoped rule, or [LEXICON.md](LEXICON.md)). That is [ADR-0010](docs/adr/ADR-0010-agents-md-governance-not-repo-truth.md), already accepted — do not reopen it.
- No skill in `.cursor/skills/` instructs an agent to edit, stage, or sync into `AGENTS.md`. `ship-phase` still chains `sync-repo-docs` for README / DESIGN.md / the rules index. `mark-epic-complete` becomes tag-the-epic plus commit.

Hard-constraint list updates still happen, in the same change that updates enforcement, by the feature agent following the change protocol — not by a sync skill.

---

## 1. AGENTS.md — workflow, checklist, change protocol

Edit only these sections in [AGENTS.md](AGENTS.md). Leave the title/purpose line, skills tables, command table, § Implemented now, § Data model, § Where things live, § Logging convention, and § Hard constraints untouched.

**§ Agent workflow**

- Step 3 quality bar: replace the four-command chain with `pnpm pre-push`.
- Step 4 doc-sync list: drop `AGENTS.md`. Remaining targets are README.md, DESIGN.md, and `.cursor/rules/README.md`. Trigger it after env, scripts, token, or rule-file changes — not after routes or schema (those no longer have an AGENTS.md catalog to update).

**§ Checklist before merging**

- Quality-bar checkbox still points at step 3 (now `pnpm pre-push`).
- Replace “AGENTS.md / README updated if routes, schema, env, or scripts changed” so it no longer routes routes/schema into AGENTS.md. Env/scripts still update README. Hard-constraint list edits stay on the change-protocol path.
- The replacement must keep one route-related prompt: a new or changed **public** route updates the § Hard constraints auth-boundary route list in the same change. Today that prompt only exists via the AGENTS.md checkbox being removed; the existing “New routes align with the auth boundary” line checks conformance but never says to update the list.

**§ Change protocol**

- Keep the Hard constraints row as-is (enforcement + list together; sync skills never initiate).
- Replace the “Implemented features, routes, data model” row. It must not say “Update AGENTS.md via `/sync-repo-docs`”. Point at the real owners: the code and migrations for what-exists; ADRs / scoped rules / LEXICON.md for whys.
- Planning/roadmap and coding-standards rows stay.

Do not rewrite § Hard constraints.

---

## 2. DOC_RULES.md — same charter

In [docs/DOC_RULES.md](docs/DOC_RULES.md):

- **Document-roles row** for AGENTS.md: drop “repo truth / implemented features / routes / data model”. Owns hard constraints, agent workflow gates, merge checklist, and change protocol — matching ADR-0010 and the Change protocol table.
- **Sync-order paragraph** under the roles table: it currently says update AGENTS.md via `/sync-repo-docs` then update ROADMAP from AGENTS.md. Rewrite so shipped truth is the code; `/sync-repo-docs` updates README / DESIGN.md / the rules index when those drifted; ROADMAP and the active PRD update from the planning conversation, not from AGENTS.md.
- **Write-discipline rule 3:** it currently says authoritative schema lives in AGENTS.md. Reassign: schema lives in `supabase/migrations/` (and generated types); do not duplicate per-table schema or rules/skills detail in PRDs or ROADMAP; AGENTS.md is not a schema or feature catalog. Rules 4–5 (hard constraints canonical in AGENTS.md; changes route through the change protocol) stay.

Same-day **Last updated** (2026-08-21) can stay.

---

## 3. Close the generators

### `sync-repo-docs`

[`.cursor/skills/sync-repo-docs/SKILL.md`](.cursor/skills/sync-repo-docs/SKILL.md) and [reference.md](.cursor/skills/sync-repo-docs/reference.md):

- Drop AGENTS.md from the description, target list, classify-gaps routing table, section map, per-change-type audit checklist, examples, and output template.
- Remaining write targets: README.md, DESIGN.md, `.cursor/rules/README.md`.
- Hard-constraint drift may still be **reported** under “Needs your decision” (read the list, compare to enforcement). Do not edit AGENTS.md to “mirror” it — the change protocol says the list moves with the enforcement change, not after the fact.
- “When to run” / user-says lines that mention “update AGENTS” go away. Auth-boundary drift currently “not in AGENTS.md hard constraints” becomes a report-only gap, not a write.

### `mark-epic-complete`

[`.cursor/skills/mark-epic-complete/SKILL.md`](.cursor/skills/mark-epic-complete/SKILL.md):

- Stop chaining `sync-repo-docs`. The skill is tag-the-epic plus commit.
- Drop the intro that a stale AGENTS.md misleads every later build, and drop Step 1 (sync). Renumber. Commit stages only the PRD. Commit message loses “(docs synced)”.
- Frontmatter description matches: no “syncs repo docs to the code”.
- README / DESIGN / rules-index drift waits for `ship-phase` — say that once so it does not look forgotten.

Do not “fix” the stale parenthetical that says `plan-next-epic` owns Ready→Active (kickoff-phase does). Out of scope.

### `ship-phase`

[`.cursor/skills/ship-phase/SKILL.md`](.cursor/skills/ship-phase/SKILL.md) and [reference.md](.cursor/skills/ship-phase/reference.md):

- Still chain `sync-repo-docs` (remaining targets). Framing, Step 2, `git add`, commit body, PR **What** bullet, and the suggested pre-ship checklist must not claim an AGENTS.md sync that will not happen.
- Stage whatever sync actually edited (README, and DESIGN.md / rules index if touched). Drop `AGENTS.md` from the explicit `git add` list.

### Companion write-routing (same grep, files this epic must clear)

Each of these currently names AGENTS.md as a place to write, sync, or dump catalogs. Change the write instruction; leave pure read-of-hard-constraints alone if that is all the sentence does.

- [`.cursor/skills/archive-cursor-plans/SKILL.md`](.cursor/skills/archive-cursor-plans/SKILL.md) — “updates AGENTS.md / README.md”; related-workflow “if AGENTS.md drifted”; “when updating AGENTS.md”. (The “Implemented now” plan-matching heuristic still works until Epic 3 deletes that section — do not invent a replacement matcher here.) Epic 3 breaks that heuristic when it deletes § Implemented now, and no Phase 17 story currently owns the replacement. Add it to Epic 3's scope in the PRD as part of this epic's handoff so it does not fall through.
- [`.cursor/skills/research/SKILL.md`](.cursor/skills/research/SKILL.md) — “mirrors shipped code into AGENTS.md”.
- [`.cursor/skills/pre-release-review/SKILL.md`](.cursor/skills/pre-release-review/SKILL.md) — docs checkbox “AGENTS.md / README may need sync”; while in the file, the principle “Project truth lives in AGENTS.md” becomes hard-constraints/governance, not a catalog.
- [`.cursor/skills/rule-authoring/SKILL.md`](.cursor/skills/rule-authoring/SKILL.md) — “Repo-truth catalogs belong in AGENTS.md” and the checklist “what did we build? → move to AGENTS.md”. Catalogs belong in neither rules nor AGENTS.md: delete both lines rather than re-pointing them. This is a generator: leaving it would refill the file on the next rule pass.
- [`.cursor/skills/audit-agents-md/SKILL.md`](.cursor/skills/audit-agents-md/SKILL.md) — “sync-repo-docs keeps AGENTS.md current”. It still never edits AGENTS.md; update the contrast line so it does not describe a write that no longer exists. Do not regenerate `AGENTS_AUDIT.md` (Epic 4.3).
- [`.cursor/skills/github-docs-authoring/SKILL.md`](.cursor/skills/github-docs-authoring/SKILL.md) — may **review** AGENTS.md; it is not a default write destination and must not remind the user to sync AGENTS content.

**Also on the quality-bar path (same AG025 bug, agent-executed):**

- [`.cursor/skills/plan-next-epic/SKILL.md`](.cursor/skills/plan-next-epic/SKILL.md) — generated `quality-gate` todo and Verification block currently hardcode the four-command chain and cite WORKFLOW_GUIDE. Point them at AGENTS.md § Agent workflow (`pnpm pre-push`) so every later Phase 17 plan does not reintroduce AG025. While in the file, the “Read first” line can drop “repo truth / what’s implemented”. Leave [docs/WORKFLOW_GUIDE.md](docs/WORKFLOW_GUIDE.md) Step 5 wording for Epic 4.
- [`.cursor/rules/project-standards.mdc`](.cursor/rules/project-standards.mdc) — the “Quality bar before merge” pointer still lists the four-command chain. Point at `pnpm pre-push` / AGENTS.md step 3.

Do not sweep other skills’ “read AGENTS.md for repo truth” lines (kickoff-phase, design-critique, ux-copy, audit-rules, audit-security, and so on). Epic 4 owns leftover role claims in files this epic does not touch.

---

## 4. Verify the grep, then the hook

Success checks before the quality gate:

- No skill under `.cursor/skills/` tells an agent to edit, stage, or sync into `AGENTS.md`. Remaining mentions are read-only (hard constraints, “never edit”, audit subject, review subject).
- [docs/DOC_RULES.md](docs/DOC_RULES.md) roles row and [AGENTS.md](AGENTS.md) § Change protocol state the same charter; neither routes features/routes/data-model updates into AGENTS.md.
- § Agent workflow step 3 is `pnpm pre-push`, matching [package.json](package.json) `pre-push` and [`.husky/pre-push`](.husky/pre-push).
- § Hard constraints is untouched.

Then run the quality gate below. `pnpm pre-push` is the gate — it is a superset of the four-command chain still printed in WORKFLOW_GUIDE until Epic 4, and running both would reproduce the AG025 pattern this epic removes.

---

## Manual check (for the user after build)

- Open AGENTS.md § Agent workflow: finish-work command is `pnpm pre-push`; doc-sync list has no AGENTS.md.
- Open DOC_RULES document-roles: AGENTS.md row is governance, not a feature catalog.
- Skim `mark-epic-complete`: no sync step; commit is the PRD tag only.
- Skim `ship-phase` commit/PR copy: no “AGENTS.md synced”.

---

### Verification

Quality bar — [AGENTS.md § Agent workflow](AGENTS.md#agent-workflow) step 3 as this epic rewrites it. Stop on failure:

```bash
pnpm pre-push
```

### Commit epic

Authorized by this approved plan:

1. Review diff; stage only files in scope for this epic.
2. Write a conventional commit message (`feat`/`fix`/`docs`/etc.). It **must** end with an `Epic:` git trailer — this is the only thing `code-review` uses to find the commit:

   ```
   docs(phase-17): rewire AGENTS.md charter and close its generators

   Epic: 17.1
   ```

   Format is `Epic: {phase}.{id}` — phase number as written in ROADMAP (decimals OK: `7.5`), epic id as written (`1`, `1A`). Blank line before the trailer, nothing after it. Exactly one commit in the repo may carry a given `Epic:` value.
3. Commit (request `git_write`). Pre-commit hook runs automatically — if it fails, **fix and retry the commit** (a failed pre-commit hook aborts the commit, so there is nothing to amend).
4. Verify `git status --porcelain` is empty after commit.

**Do not push** — push remains `ship-phase`.

### Handoff

End the run by telling the user:

*"Epic 17.1 committed. Next: open a new agent window and run `/code-review`."*

Pass nothing else. `code-review` resolves the commit and the baseline from the `Epic:` trailer and git.
