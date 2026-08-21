---
name: Phase 17 Epic 4 Downstream Surfaces
overview: Align the public workflow page, remaining docs, and leftover skill pointers with the ADR-0010 charter, then replace AGENTS_AUDIT.md with a full character-based pass against the slimmed file.
todos:
  - id: workflow-surfaces
    content: Rewrite /workflow AGENTS.md row, Cursor owns list, and companion copy; pin charter in the co-located unit test; fix the features-content Locked rules blurb
    status: completed
  - id: role-claim-sweep
    content: Sweep ROADMAP, README, rules index, WORKFLOW_GUIDE (including Step 5 quality bar and initialize-project summary), plus leftover live docs and skill read-first lines that still treat AGENTS.md as a catalog
    status: completed
  - id: audit-rebaseline
    content: Runs last, after 4.1 and 4.2 land. Run audit-agents-md as a full pass; replace AGENTS_AUDIT.md with a character-based 2026-08-21 baseline; do not edit AGENTS.md
    status: completed
  - id: quality-gate
    content: Run pnpm pre-push
    status: completed
  - id: commit-epic
    content: "Conventional commit with Epic: 17.4 trailer"
    status: completed
isProject: false
---

# Phase 17 Epic 4 — Downstream surfaces and re-baseline

> **Track progress:** as you complete each step, update the corresponding `todos` entry's `status` to `completed` in this plan's frontmatter.

> **Precondition:** before the first implementation edit, `git status --porcelain` must be empty apart from untracked files under `.cursor/plans/`. Plan files are planning history and never ride in an epic commit, so they cannot dirty the epic's diff range. Anything else — halt and ask the user to commit or stash. The epic must land as a single commit containing only this epic's work — `code-review` derives its range from that commit.

Stories 4.1 and 4.2 have disjoint files (workflow/features copy vs. docs/skills) and are a good candidate for Build in Parallel. Build the end state once. Do not construct an interim “docs still say catalog, audit already re-baselined” state.

**Story 4.3 runs last**, after 4.1 and 4.2 have landed. `audit-agents-md` audits downstream role claims as well as `AGENTS.md` itself — AG022 was a `docs/DOC_RULES.md` finding — so a re-baseline taken before the sweep completes records findings this same epic resolves.

**Do not edit [AGENTS.md](AGENTS.md)** — including § Hard constraints. The audit skill is read-only toward that file. **Do not reopen [ADR-0010](docs/adr/ADR-0010-agents-md-governance-not-repo-truth.md).** Do not create a `docs/ARCHITECTURE.md`. Do not repair the two enforcement gaps (`check:auth-boundary` as a named pre-push step, `check:admin-gate` as a named CI step). Do not rewrite [docs/WORKFLOW_BACKLOG.md](docs/WORKFLOW_BACKLOG.md) parked-option prose or frozen archive files.

Replacement wording everywhere is the charter already in [docs/DOC_RULES.md](docs/DOC_RULES.md) and [AGENTS.md](AGENTS.md): hard constraints, workflow gates, merge checklist, and change protocol. What exists lives in the code and `supabase/migrations/`. “Repo truth” as a synonym for an AGENTS.md catalog is the stale claim; ADR-0010 may keep the phrase as the thing it rejected.

---

## End state

After this epic:

- `/workflow` no longer describes Cursor as syncing a feature/schema catalog into `AGENTS.md`. The documents table row matches DOC_RULES. The Cursor card lists doc sync of README / DESIGN.md / the rules index after env, scripts, token, or rule-file changes — matching [AGENTS.md](AGENTS.md) § Agent workflow step 4.
- No live doc or shipped surface describes `AGENTS.md` as owning implemented features, routes, or the data model. Skills that still told agents to read those catalogs from `AGENTS.md` point at the code, [LEXICON.md](LEXICON.md), or live layouts instead.
- [AGENTS_AUDIT.md](AGENTS_AUDIT.md) is a new full pass (date 2026-08-21), budget in characters, no finding blocked on AG022.

---

## 1. Public workflow page and features blurb (4.1)

In [src/app/(marketing)/workflow/_lib/workflow-page-content.ts](src/app/(marketing)/workflow/_lib/workflow-page-content.ts):

- **Cursor `owns`:** drop `Repo truth sync after behavior changes`. Replace with the actual remaining Cursor ownership: human-facing doc sync after env, scripts, token, or rule-file changes (`/sync-repo-docs` → README, DESIGN.md, `.cursor/rules/README.md`).
- **`AGENTS.md` row:** set the writer to both environments — Claude and Cursor. Claude owns the content (hard-constraint and workflow-gate changes are decided in PM/Claude chat per [AGENTS.md § Change protocol](AGENTS.md#change-protocol)); Cursor applies the edits during an epic. If `writtenBy` is typed as a constrained union that does not admit a both-environments value, widen the type in the same pass. Change `purpose` from the catalog sentence to the charter (hard constraints, workflow gates, merge checklist, change protocol).
- **Plan-review node `detail`:** “repo truth and hard constraints” currently implies a catalog check. Retarget to the code plus hard constraints.

Companion copy on the same page, same pass (otherwise the page still describes the old workflow):

- [src/app/(marketing)/workflow/_components/workflow-two-environments-section.tsx](src/app/(marketing)/workflow/_components/workflow-two-environments-section.tsx) — “repo truth flows back” → shipped code / what is actually in the repo.
- [src/app/(marketing)/workflow/_components/workflow-plan-review-section.tsx](src/app/(marketing)/workflow/_components/workflow-plan-review-section.tsx) — same retarget as the node detail.

**Co-located test moves with the copy** in [src/app/(marketing)/workflow/_lib/workflow-page-content.unit.test.ts](src/app/(marketing)/workflow/_lib/workflow-page-content.unit.test.ts): keep the GitHub URL pins; add an assertion that the `AGENTS.md` row's `purpose` is the charter (not “implemented features / routes / schema”). Do not add a negative assertion against the Cursor `owns` list. Do not add a render test for the section components.

**Shipped features surface** (success criterion, deferred from Epic 3): in [src/config/features-content.ts](src/config/features-content.ts), the “Locked rules” blurb currently says `AGENTS.md` owns implemented features. Rewrite the blurb to the charter. Keep the capability name — [src/config/features-content.unit.test.ts](src/config/features-content.unit.test.ts) pins `'Locked rules'` as a home-highlight label; renaming is out of scope (Phase 17 already deferred the admin-shell copy revisit).

---

## 2. Role-claim sweep (4.2)

Story 4.2 names four files. Success also requires no remaining live doc or shipped surface to claim catalog ownership, and Epic 1 deferred leftover skill “read AGENTS.md for repo truth” lines here. Sweep all of the following in one pass; do not invent new homes for catalogs.

**Named in the PRD:**

- [ROADMAP.md](ROADMAP.md) intro: “build-time workflow and authoritative schema in AGENTS.md” → workflow gates / hard constraints in AGENTS.md; schema in `supabase/migrations/`.
- [README.md](README.md) documentation table: `Repo truth — routes, hard constraints, data model` → charter wording.
- [`.cursor/rules/README.md`](.cursor/rules/README.md): “Repo truth for agents: AGENTS.md” → hard constraints / governance, not a catalog.
- [docs/WORKFLOW_GUIDE.md](docs/WORKFLOW_GUIDE.md):
  - Documents table row and the note “AGENTS describes what's actually in the repo today.”
  - Step 3 `initialize-project` bullet that claims it resets “Implemented now” — the skill does not write `AGENTS.md` at all. Align the summary with [`.cursor/skills/initialize-project/SKILL.md`](.cursor/skills/initialize-project/SKILL.md); do not add a new AGENTS.md write to that skill.
  - Step 5 quality gate still prints the four-command chain. Change it to `pnpm pre-push` (Epic 1 left this sentence for this epic).

**Also fail the success criterion today (include):**

- [`.cursor/README.md`](.cursor/README.md) — opening paragraphs, “Where to look next” row (“Repo truth, hard constraints, skills catalog”), and “Sync after shipping: `/sync-repo-docs` (AGENTS.md + README)”. Skills catalog lives in `.cursor/skills/`; sync targets are README, DESIGN.md, and the rules index.
- [docs/prds/README.md](docs/prds/README.md) — “As-built truth lives in AGENTS.md” → as-built truth lives in the code and migrations.
- [DESIGN.md](DESIGN.md) purpose line — “For repo truth and hard constraints, see AGENTS.md” → hard constraints only (the DESIGN.md role table already says that).
- [`.cursor/plans/archive/README.md`](.cursor/plans/archive/README.md) — “For current routes, auth, and patterns, see AGENTS.md” → the code (and LEXICON / hard constraints as needed).

**Leftover skill pointers (Epic 1 handoff; agents would look for deleted sections):**

- [`.cursor/skills/kickoff-phase/SKILL.md`](.cursor/skills/kickoff-phase/SKILL.md) — “repo truth, hard constraints” → hard constraints.
- [`.cursor/skills/ux-copy/SKILL.md`](.cursor/skills/ux-copy/SKILL.md) — do not send the agent to AGENTS.md for product terms, routes, or feature behavior. Point at shipped UI, [LEXICON.md](LEXICON.md), and the active PRD. Hard constraints stay a valid read if copy would trip one.
- [`.cursor/skills/design-critique/SKILL.md`](.cursor/skills/design-critique/SKILL.md) — shipped UI patterns / routes / shells come from live layouts and `src/components/`, not AGENTS.md.
- [`.cursor/skills/audit-rules/SKILL.md`](.cursor/skills/audit-rules/SKILL.md) — drop the “restate implemented-features prose from AGENTS.md” overlap check (that prose is gone). Keep the § Hard constraints overlap check.

Leave [docs/adr/ADR-0010-agents-md-governance-not-repo-truth.md](docs/adr/ADR-0010-agents-md-governance-not-repo-truth.md), [LEXICON.md](LEXICON.md) “Instruction budget”, and frozen [docs/archive/](docs/archive/) alone. Skills that already read AGENTS.md **only** for § Hard constraints (code-review, audit-security, audit-seo, research, etc.) stay.

After the edits, grep live (non-archive-plan, non-PRD-problem-statement) files for `repo truth`, `Implemented now`, and “AGENTS.md” paired with routes / data model / implemented features. Anything still claiming catalog ownership is in scope; historical ADR / lexicon explanation is not.

---

## 3. Full audit re-baseline (4.3)

Follow [`.cursor/skills/audit-agents-md/SKILL.md`](.cursor/skills/audit-agents-md/SKILL.md) as an explicit **full pass** — not sync. The current [AGENTS_AUDIT.md](AGENTS_AUDIT.md) still describes the pre-deletion 266-line file, line-based budget, and AG022 as a blocking `Needs decision`. A sync pass would verify findings against content that no longer exists.

Write a replacement [AGENTS_AUDIT.md](AGENTS_AUDIT.md):

- `Last full audit:` **2026-08-21**
- Budget as **characters** (`wc -m AGENTS.md`) and approximate tokens; mechanical trigger is 10,000 characters (Epic 2)
- Every current top-level section gets a ledger row (preamble, Agent workflow, Hard constraints, Checklist, Change protocol — plus whatever headings exist after Epic 3)
- Verify-gate: move AG002–AG025 to Resolved only if the cited change exists in [AGENTS.md](AGENTS.md) / DOC_RULES / the skill files. Do not mark resolved from this plan’s prose
- AG022 is resolved as of Epic 3, so no Open finding is expected to be blocked on it. Record whatever the pass actually finds — do not suppress a live finding to match that expectation
- Pruning is a no-op this pass: the previous full audit is also dated 2026-08-21, so no Resolved entry is older than it. The Epic 1–3 resolutions carry forward as the new appendix
- Do not edit [AGENTS.md](AGENTS.md). New Open findings (if any) are recorded, not fixed in this epic

---

## Verification

Quality bar — [AGENTS.md § Agent workflow](AGENTS.md#agent-workflow) step 3. Stop on failure:

```bash
pnpm pre-push
```

Manual smoke after the hook: `/workflow` documents table and Cursor card; the “Locked rules” blurb on both `/features` and the home page (the same content entry feeds a home highlight).

---

## Commit epic

Authorized by this approved plan:

1. Review diff; stage only files in scope for this epic. Do not stage `.cursor/plans/`.
2. Write a conventional commit message. It **must** end with an `Epic:` git trailer — this is the only thing `code-review` uses to find the commit:

   ```
   docs(phase-17): align downstream surfaces with AGENTS.md charter

   Epic: 17.4
   ```

   Format is `Epic: {phase}.{id}` — phase number as written in ROADMAP, epic id as written. Blank line before the trailer, nothing after it. Exactly one commit in the repo may carry a given `Epic:` value.
3. Commit (request `git_write`). Pre-commit hook runs automatically — if it fails, **fix and retry the commit** (a failed pre-commit hook aborts the commit, so there is nothing to amend).
4. Verify `git status --porcelain` is empty after commit (untracked `.cursor/plans/` files may remain).

**Do not push** — push remains `ship-phase`.

### Handoff

End the run by telling the user:

*"Epic 17.4 committed at `{sha}`. Next: open a new agent window and run `/code-review`."*

Substitute the actual commit SHA.
