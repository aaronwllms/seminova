---
name: initialize-project
description: Scrub template artifacts and write the new project's identity into the repo.
disable-model-invocation: true
---

# Initialize Project

Turn a freshly-grilled template clone into a real project repo. This is a deterministic scrub, not a planning or synthesis task — every judgment call (name, pitch, phases) was already made in `project-kickoff`; this skill propagates those facts and clears the template's own build history.

Anything this skill can't resolve mechanically, it **surfaces** rather than guesses at.

## Preconditions

Before touching anything, verify all three of `src/config/site.ts`, `README.md`, and `ROADMAP.md` have already been updated away from template defaults (e.g. `site.ts`'s `name` field no longer reads `'Seminova'`).

- **All three updated** → proceed.
- **None updated** → halt. Report that `project-kickoff` hasn't been run yet; do not scrub anything.
- **Some updated, some not** → halt. Report exactly which files are initialized and which still carry template defaults — this is a partial or interrupted grill, not something to guess past.

## Has this already run?

Check `CONTRIBUTING.md`. It ships with every template clone and nothing else deletes it, so its absence means this skill has run before.

- **Present** → proceed normally.
- **Absent** → report that initialization appears to have already run, and get explicit confirmation before proceeding. A re-run on a live repo can overwrite real content in `src/config/landing-content.ts` and `docs/WORKFLOW_BACKLOG.md`.

Every write below is safe to redo on a partially-completed run — each one no-ops if it's already done. There is no partial-state halt; an interrupted run should simply be finished.

## What it reads

- **`src/config/site.ts`** — project name, description, GitHub URL
- **`README.md`** — pitch, audience framing
- **`ROADMAP.md`** — phase list, to know which surfaces a later phase deletes

`site.ts` and `README.md` are the only sources of truth for identity. Do not ask the user for any of this — if something needed is missing from both files, halt and report the gap rather than inventing it.

## What it purges — the template's build history

The spinoff inherits each **mechanism** below, not its **content**. Where a directory has a README or an `archive/` subfolder, that structure is part of the mechanism: keep it, empty.

- **`.cursor/plans/archive/`** — purge contents.
- **`docs/prds/archive/`** — purge contents, keep the directory. The spinoff fills it with its own shipped PRDs.
- **`docs/mockups/`** — purge contents.
- **`docs/archive/`** — purge contents (removes `CONTEXT_ARCHIVE.md`).
- **`docs/research/`** — delete all `RESEARCH-*.md` in the active directory; purge `docs/research/archive/` (keep it, `.gitkeep` is fine); preserve `README.md` unchanged.
- **`docs/skill-feedback/`** — purge per-skill feedback logs, keep the directory and any README.
- **`TEST_AUDIT.md`, `RULE_AUDIT.md`, `SECURITY_AUDIT.md`, `TECH_DEBT_AUDIT.md`** (repo root) — delete. Each describes the template's code at a moment in time and is wrong on arrival; the `audit-*` skills regenerate them on demand.
- **`docs/WORKFLOW_BACKLOG.md`** — clear the "Deferred items" section, replacing it with a placeholder line (e.g. `_None yet — entries get added here as workflow decisions are deliberately parked._`). Preserve the header ("What this is" / "Why it exists" / "How to use it") and structure unchanged.
- **`CONTRIBUTING.md`** — delete. Scope guidance, issue links, and framing specific to the public template; a product that later opens to contributions writes its own. (`project-kickoff`'s README rewrite removes references to it, so no dead links remain.)

> **Delete `CONTRIBUTING.md` last.** The "has this already run?" check above depends on its absence being the final act of a completed run. Do not reorder it.

After purging, grep the repo for links to any purged path and **report** what you find. Do not edit the referencing files — several are never-touch. A broken inbound link is an upstream template bug to fix in the template, not here.

## What it writes

- **`package.json`** — set `name` from `site.ts` (kebab-case), and replace the template keyword.
- **`src/config/landing-content.ts`** — stub hero and feature copy with placeholders. Do not invent marketing copy; that's a product decision for a later session.
- **`LICENSE`** — preserve every existing copyright line exactly as-is, in order; each reflects a contributor whose code is still in the repo. Never remove, reorder, or modify an existing line. Append one line: `Copyright (c) <current year> <new owner name>`.

## What it surfaces

Report these; change nothing.

- **`supabase/config.toml`** — `project_id` still points at the template's Supabase project. Two paths, and this skill can't tell which applies: if the product keeps a database, the value must be repointed at a project that doesn't exist yet; if the product strips Supabase, the file goes with it. Name both paths in the report.
- **Residual template-name hits** — sweep the repo for the template name and report anything outside the allowlist below. The template is meant to be name-neutral in everything a spinoff inherits, so hits here are template bugs, not scrub targets.

Allowlist — correct as-is, never flag:

- `README.md` Acknowledgments — attribution required by LICENSE lineage.
- `ROADMAP.md`'s spinoff note.
- This skill.

## What it never touches

**Written by `project-kickoff`** — re-touching risks clobbering grill output: `ROADMAP.md`, `BACKLOG.md`, `src/config/site.ts`, `README.md`.

**Inherited unchanged** — this is the template's value; every spinoff keeps it as-is: `.cursor/rules/`, `.cursor/skills/`, `DESIGN.md`, `LEXICON.md`, `docs/adr/`, `docs/WORKFLOW_GUIDE.md`, `docs/WORKFLOW_SETUP.md`.

On `docs/adr/`: keep every ADR, including ones describing systems an early phase will delete. An ADR's job is to record why a decision was made; when a phase removes the system, that phase marks the ADR superseded. Deleting one destroys the reason the surrounding code looks the way it does.

**Owned by a later phase** — leave alone; check `ROADMAP.md` for which: page copy on surfaces a phase deletes or rewrites (e.g. `/admin`, `/workflow`, `/reference`). Stubbing these now does the work twice and opens a window where the page is wrong.

## Completion

Report in three parts: what was purged, what was written, and what was surfaced. If a precondition halted the run, that report replaces the scrub — do not partially scrub and then report the halt.