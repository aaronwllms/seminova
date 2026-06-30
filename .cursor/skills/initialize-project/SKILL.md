---
name: initialize-project
description: Scrub template artifacts and replace them with the new project's identity, immediately after kickoff-grilling has written that identity into site.ts, README.md, and ROADMAP.md. Use when the user says "initialize the project", "scrub the template", "run initialize-project", or has just finished a kickoff grill and is ready to turn the cloned template into a real repo.
---

# Initialize Project

Run the mechanical scrub pass that turns a freshly-grilled template clone into a real project repo. This is a deterministic find-and-replace job, not a planning or synthesis task — all judgment calls (name, pitch, phases) were already made in `kickoff-grilling`; this skill only propagates those facts into the files that still carry template framing.

## Preconditions

Before touching anything, verify all three of `src/config/site.ts`, `README.md`, and `ROADMAP.md` have already been updated away from template defaults (e.g. `site.ts`'s `name` field no longer reads `'Seminova'`).

- **All three updated** → also check whether initialization has already run (see Idempotency below), then proceed.
- **None updated** → halt. Report that `kickoff-grilling` hasn't been run yet; do not scrub anything.
- **Some updated, some not** → halt. Report exactly which files are initialized and which still carry template defaults — this is a partial or interrupted grill, not something to guess past.

## Idempotency

Before scrubbing, check all four of this skill's outputs for whether they're already done:

- **`LICENSE`** — has a line matching `Copyright (c) <any year> <owner name from site.ts>`
- **`AGENTS.md`** — no remaining Seminova name references
- **`src/config/landing-content.ts`** — hero/feature copy is stubbed placeholders, not Seminova's content
- **`.cursor/plans/archive/`** — empty
- **`docs/WORKFLOW_BACKLOG.md`** — "Deferred items" section matches the stub placeholder (no real entries)

Bucket on agreement across all five:

- **All five done** → skip the run, report it's already initialized.
- **All five not done** → proceed with the run.
- **Mixed** → halt. Report exactly which outputs are done and which aren't — this is a partial or interrupted prior run, not something to guess past. Do not pick one signal as authoritative over the others; any single check can be coincidentally true (an empty archive) or simply unwritten (LICENSE never touched) without reflecting the real state of the others.

## What it reads

- **`src/config/site.ts`** — project name, description, GitHub URL
- **`README.md`** — pitch, audience framing

These are the only sources of truth for identity. Do not ask the user for any of this — if something needed is missing from both files, halt and report the gap rather than inventing it.

## What it writes

1. **`AGENTS.md`**
   - Replace every Seminova name reference with the new project name.
   - Reset the "Implemented now" section to baseline template state: keep the scaffolding that's true of every spinoff (auth flows, UI primitives, design-token layer, testing setup, doc system) — strip anything that reads as product-specific feature history belonging to Seminova itself, not the template.

2. **`src/config/landing-content.ts`**
   - Stub hero copy and feature copy with placeholders. Do not invent new marketing copy — that's a product decision for a later session, not this skill's job.

3. **`.cursor/plans/archive/`**
   - Purge all contents. This is Seminova's planning history; it has no relevance to the new project.

4. **`LICENSE`**
   - Preserve every existing copyright line exactly as-is, in order — each one reflects a contributor whose code is still in the repo. Never remove, reorder, or modify an existing line.
   - Append one new line for the new project owner: `Copyright (c) <current year> <new owner name>`.

5. **`docs/WORKFLOW_BACKLOG.md`**
   - Clear the "Deferred items" section and replace it with a placeholder line (e.g. `_None yet — entries get added here as workflow decisions are deliberately parked._`). This is Seminova's own deferred workflow decisions; they have no relevance to the new project.
   - Preserve the header ("What this is" / "Why it exists" / "How to use it") and overall structure unchanged — the backlog mechanism itself is part of what every spinoff inherits, just empty until the new project parks its first decision.

## What it never touches

`ROADMAP.md`, `LEXICON.md`, `src/config/site.ts`, `README.md` — `kickoff-grilling` already wrote these correctly; touching them again risks clobbering grill output.

`.cursor/rules/`, `.cursor/skills/`, `LOCKED_RULES.md`, `DESIGN.md` — inherited unchanged. These are the template's value; every spinoff keeps them as-is.

## Completion

Report what was changed, file by file. If any precondition or idempotency check halted the run, that report replaces the scrub — do not partially scrub and then report the halt.
