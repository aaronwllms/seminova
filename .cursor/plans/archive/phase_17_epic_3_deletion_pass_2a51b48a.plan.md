---
name: Phase 17 Epic 3 Deletion Pass
overview: Cut AGENTS.md to the ADR-0010 charter (governance only), harvest deleted sections for unique whys and agent-directed rules before they go, plant directory breadcrumbs and an ADR-0010 guard at the top, and close every pointer that would send an agent to a deleted heading.
todos:
  - id: cut-agents
    content: "Harvest unique whys and agent-directed rules, then rewrite AGENTS.md to the charter: delete AG002–AG020 inventory; new purpose + ADR-0010 pointer + directory breadcrumbs; Hard constraints unchanged"
    status: completed
  - id: matcher-pointers
    content: Drop archive-cursor-plans Implemented-now matcher; drop audit-rules Implemented-now skim; retarget supabase.mdc schema pointer to migrations; retarget or drop the
    status: completed
  - id: quality-gate
    content: Run pnpm pre-push
    status: completed
  - id: commit-epic
    content: "Conventional commit with Epic: 17.3 trailer"
    status: completed
isProject: false
---

# Phase 17 Epic 3 — Deletion pass and why-harvest

> **Track progress:** as you complete each step, update the corresponding `todos` entry's `status` to `completed` in this plan's frontmatter.

> **Precondition:** before the first implementation edit, `git status --porcelain` must be empty apart from untracked files under `.cursor/plans/`. Plan files are planning history and never ride in an epic commit, so they cannot dirty the epic's diff range. Anything else — halt and ask the user to commit or stash. The epic must land as a single commit containing only this epic's work — `code-review` derives its range from that commit.

Stories 3.1–3.3 all write [AGENTS.md](AGENTS.md). Build that end state once; harvest unique whys in the same pass, before the text is gone. Story 3.4 is a small companion in [`.cursor/skills/archive-cursor-plans/`](.cursor/skills/archive-cursor-plans/). Do not construct an interim “half-deleted catalog.”

**Do not reopen [ADR-0010](docs/adr/ADR-0010-agents-md-governance-not-repo-truth.md).** Do not create a `docs/ARCHITECTURE.md`. Do not edit § Hard constraints — verify it unchanged, character for character. Do not regenerate [AGENTS_AUDIT.md](AGENTS_AUDIT.md) (Epic 4.3). Do not sweep leftover “repo truth” claims in [ROADMAP.md](ROADMAP.md), [README.md](README.md), [`.cursor/rules/README.md`](.cursor/rules/README.md), [docs/WORKFLOW_GUIDE.md](docs/WORKFLOW_GUIDE.md), the workflow page, or [src/config/features-content.ts](src/config/features-content.ts) (Epic 4).

---

## End state

After this epic, [AGENTS.md](AGENTS.md) holds only what the charter names:

- One-line project description (Seminova is an opinionated AI-native Next.js + Supabase starter) plus this file’s job: hard constraints, workflow gates, merge checklist, change protocol.
- An ADR-0010 note at the top, where the temptation to add a catalog occurs.
- A handful of directory-level breadcrumbs (not a path table).
- § Agent workflow, § Hard constraints, § Checklist before merging, and § Change protocol — the last three of those already match the charter from Epic 1; § Hard constraints is byte-identical to today.

Gone: the skills tables, the command table and prerequisites paragraph, every § Implemented now subsection, § Data model, § Where things live, and § Logging convention. The H1/purpose line no longer advertises a feature catalog.

`archive-cursor-plans` selective mode matches plans from ROADMAP + PRDs + filenames, not from a deleted AGENTS.md heading.

---

## 1. Harvest, then cut [AGENTS.md](AGENTS.md)

**Harvest first (story 3.2).** Before deleting, walk each departing block against Test 2: a claim — a **why** *or* an **agent-directed rule** — that is both not grep-derivable from the code and not already in an ADR, a scoped rule, [LEXICON.md](LEXICON.md), or [docs/DOC_RULES.md](docs/DOC_RULES.md). The 2026-08-21 audit’s why-hunt found no unique whys; rules were not in its scope, so the rule half of this test is unrun and must be walked here. Anything that surfaces is routed, not dropped:

- An ADR only if it is hard to reverse, surprising, and a real trade-off ([docs/adr/README.md](docs/adr/README.md)).
- A `.cursor/rules/*.mdc` file only if the claim changes what an agent *does* in that domain — not as a parking lot for explanation.
- [LEXICON.md](LEXICON.md) only if it is a named architectural term.
- [docs/DOC_RULES.md](docs/DOC_RULES.md) only if the claim is a rule about how the planning docs themselves are written.

Four departing claims are known rule candidates and must each be checked explicitly and reported by name:

- § Implemented now → Auth & session: “Do not call bare `getClaims()` or `getSession()` on RSC read paths — always pass an explicit token.”
- § Implemented now → Auth & session: the never-log-tokens instruction attached to the `exp`-decode line.
- § Implemented now → Data model / app settings: “add a registry entry only, no hand-synced key union.”
- § Data model closer: “Do not duplicate per-table detail in PRDs or ROADMAP.”

Report the harvest to the user at the end of the build (empty is success). Do not write a harvest document.

**Then write the slim file (stories 3.1 and 3.3 together).** Snapshot § Hard constraints first (from the `## Hard constraints` heading through the sentence that points at the Change protocol table). After the rewrite, that exact text must still be in the file — including the IMPORTANT callout, the nine enforced bullets, the ecosystem-alignment principle, and the “Consumption detail / Change protocol” closer. Use a diff of that span as the check; do not rewrite, wrap, or “clarify” any of it.

Keep § Agent workflow, § Checklist before merging, and § Change protocol as Epic 1 left them.

**Preamble.** Replace the H1 subtitle “Repo truth for coding agents” and the purpose sentence that lists implemented features, routes, data model, and where to look. Keep **Last updated:** 2026-08-21. Keep the one-line pointer at [docs/DOC_RULES.md](docs/DOC_RULES.md). Directly under the purpose, add a short note pointing at [ADR-0010](docs/adr/ADR-0010-agents-md-governance-not-repo-truth.md): do not add feature inventories, route lists, or schema catalogs to this file.

**Breadcrumbs** replace the deleted directory map — a few sentences of prose, not a table, at directory granularity:

- Coding standards: [`.cursor/rules/`](.cursor/rules/)
- Skills: [`.cursor/skills/`](.cursor/skills/); planning-loop skills: [docs/WORKFLOW_GUIDE.md](docs/WORKFLOW_GUIDE.md)
- Decisions: [docs/adr/](docs/adr/)
- Vocabulary: [LEXICON.md](LEXICON.md)
- Human setup and scripts: [README.md](README.md)
- Schema: `supabase/migrations/` (and generated types)

Every breadcrumb must resolve to a directory or file that exists. Do not re-list `src/app/` route groups, migration filenames, or skill names.

**Delete these blocks outright** (audit AG002–AG020). Do not relocate them:

- § Agent skills (all three tables and the surrounding catalog prose). The skills breadcrumb above is the replacement — not a new heading with a table.
- § Setup and quality commands (the whole table plus the prerequisites paragraph). Package manager and quality bar already live as the pnpm-only hard constraint and workflow step 3.
- § Implemented now (all subsections).
- § Data model (summary) (filename list, entity table, and the “schema authority lives in this section” closer — [docs/DOC_RULES.md](docs/DOC_RULES.md) rule 3 already reassigned schema to migrations).
- § Where things live.
- § Logging convention (hard constraints already cite `logging.mdc`).

---

## 2. Close pointers that would send an agent to a deleted heading

These are caused by the deletion, not the Epic 4 role-claim sweep. Do not copy catalogs into the new targets.

**Story 3.4 — `archive-cursor-plans`.** In [`.cursor/skills/archive-cursor-plans/SKILL.md`](.cursor/skills/archive-cursor-plans/SKILL.md), selective source 2 currently matches shipped phases/epics via ROADMAP + PRDs + `AGENTS.md` “Implemented now”. Drop the AGENTS.md clause. Filename prefixes plus ROADMAP shipped rows plus Active/Shipped PRDs are enough. In [reference.md](.cursor/skills/archive-cursor-plans/reference.md), drop the “AGENTS.md section” heuristic row. Do not invent a new catalog to grep.

**Dead required-reads (same class as 3.4):**

- [`.cursor/skills/audit-rules/SKILL.md`](.cursor/skills/audit-rules/SKILL.md) Orient step 3 tells the auditor to skim `AGENTS.md` § Implemented now. Drop that heading; keep § Hard constraints and the DOC_RULES roles table as the duplication check.
- [`.cursor/rules/supabase.mdc`](.cursor/rules/supabase.mdc) currently sends schema-work agents to `AGENTS.md` § Data model as “authoritative.” Retarget that sentence to `supabase/migrations/` (and generated types). Do not paste the entity table into the rule.

**Inbound `#agent-skills-cursorskills` links (same class as 3.4).** Deleting § Agent skills breaks every link that targets that anchor. Fix them here — Epic 4 sweeps *role claims*, and a dead anchor to a skills heading is not a role claim, so it would pass that epic’s check while still broken:

- [`.cursor/README.md`](.cursor/README.md)
- [docs/WORKFLOW_GUIDE.md](docs/WORKFLOW_GUIDE.md)
- [docs/WORKFLOW_BACKLOG.md](docs/WORKFLOW_BACKLOG.md)

In each, retarget the link to [`.cursor/skills/`](.cursor/skills/) where the surrounding sentence is pointing at the skills library, or drop the link and leave the prose where the reference is incidental. Do not copy the skills table into any of them. Any remaining “repo truth” role-claim prose in these files stays for Epic 4 — this is an anchor fix only.

---

## 3. Verify the cut, then the hook

Before the quality gate:

- Grep [AGENTS.md](AGENTS.md) for route lists, migration filenames, data-model tables, directory maps, skills tables, command tables, and shipped-feature prose — none remain.
- Diff confirms § Hard constraints is unchanged.
- Each breadcrumb path exists.
- [README.md](README.md) carries the Node version, the pnpm version, the `.env.example` variable list, and the `next-env.d.ts`-after-clone note before the Prerequisites paragraph is cut. If any is missing, add it to README in this pass rather than deleting it.
- No file in the repo links to `AGENTS.md#agent-skills-cursorskills`.
- Harvest is reported (empty, or each claim with a named home).
- `archive-cursor-plans` no longer names “Implemented now.”
- `audit-rules` no longer names that heading; `supabase.mdc` no longer names `#data-model-summary`.

Then run the quality gate below.

---

## Manual check (for the user after build)

- Open AGENTS.md: it should read as a short governance file, not a product inventory.
- Confirm the nine hard-constraint bullets are still there, with the same enforcement names.
- Confirm an ADR-0010 warning sits near the top.
- Confirm the leftover “repo truth” lines on the public `/workflow` page and in README are still stale — that is Epic 4, not a miss.

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
   docs(phase-17): cut AGENTS.md to the governance charter

   Epic: 17.3
   ```

   Format is `Epic: {phase}.{id}` — phase number as written in ROADMAP (decimals OK: `7.5`), epic id as written (`1`, `1A`). Blank line before the trailer, nothing after it. Exactly one commit in the repo may carry a given `Epic:` value.
3. Commit (request `git_write`). Pre-commit hook runs automatically — if it fails, **fix and retry the commit** (a failed pre-commit hook aborts the commit, so there is nothing to amend).
4. Verify `git status --porcelain` is empty after commit, apart from any untracked `.cursor/plans/` files.

**Do not push** — push remains `ship-phase`.

### Handoff

End the run by telling the user:

*"Epic 17.3 committed. Baseline SHA: `{sha}` (the commit immediately preceding this epic's commit — `git rev-parse HEAD~1`). Next: open a new agent window and run `/code-review`."*

Pass nothing else. `code-review` resolves the commit and range from the `Epic:` trailer; the epic id and baseline SHA above are stated so the range is checkable by hand.
