# WORKFLOW_SETUP.md — One-time workflow setup

**Purpose:** One-time setup for a freshly cloned Seminova template — connecting Claude Desktop to the repo via MCP, installing the Claude-side skills this workflow depends on, and verifying it all works. For day-to-day usage once setup is complete, see [PLANNING_GUIDE.md](PLANNING_GUIDE.md).

**Status:** DRAFT — blocked on two items before it's runnable end-to-end: `docs/claude-skills/` is not yet populated (Section 4), and the Project-creation UI path is unconfirmed (Section 2). See inline `[TODO]` markers.

**Audience:** Anyone setting up a project cloned from this template — no prior context assumed.

**Prerequisite:** Claude Desktop (not claude.ai web) — MCP filesystem server configuration is a Desktop-only feature.

---

## 1. Overview

This doc walks through one-time setup after cloning the template, before any planning or development work begins:

1. Create a Claude Project for this repo (the container for all your setup and planning chats)
2. Connect Claude Desktop to the repo via the filesystem MCP server
3. Install the Claude-side skills this workflow depends on
4. Paste in the Claude Project instructions
5. Verify everything is working

> [!NOTE]
> **Cursor-side tooling needs no setup.** `.cursor/skills/` and `.cursor/rules/` ship with the template and are inherited on clone. This doc is entirely about the Claude side.

Once setup is complete, day-to-day usage (the phase-by-phase planning loop) is documented in [PLANNING_GUIDE.md](PLANNING_GUIDE.md).

---

## 2. Create the Claude Project

Create a Claude Project for this repo before anything else. It's the container that holds all your setup and planning chats in one place, so they share history and you're not scattering setup work across loose conversations.

Creating the Project has no prerequisites — make it empty for now. You'll paste its instructions in later (Section 5), once the paths and skills they reference exist. From here on, run every setup chat (MCP, skills) inside this Project.

[TODO: confirm exact UI path for creating a Project in Claude Desktop, and note any naming convention worth suggesting.]

---

## 3. MCP filesystem — configure

**Prerequisites:**
- Claude Desktop installed.
- Your local repo's absolute path (e.g. `/Users/you/projects/myproject`) — the install agent will ask for it to point the config at the repo root.

Connecting Claude to the repo's files is a manual, one-time config step — Claude cannot edit its own MCP configuration. The fastest way through it is to start a conversation and let Claude walk you through it interactively.

Config file location and exact steps differ between Mac and Windows; Claude will walk you through the specifics for your platform as part of the conversation below.

**Predefined setup prompt** — paste this into a fresh chat (inside your Project from Section 2), with your repo path filled in at the bottom:

```
I need to set up the filesystem MCP server in Claude Desktop so you can
read and write files in my local repo. Walk me through how to do this
step by step, including where the config file lives, what to add to it,
and how to restart Desktop to pick up the change. I'll tell you when I've
done each step — help me verify it worked at the end, and help me
troubleshoot if it doesn't connect.

My repo is at: [REPO_PATH]
```

Work through the conversation with Claude until it confirms it can read a file in your repo (e.g. by listing the repo's root directory).

---

## 4. Claude-side skills — install

This workflow depends on a set of Claude-side skills. They are global to your Claude account, not part of the repo — they need to be installed once, not per-project (re-installing for a second project is only needed if you're setting up Claude fresh on a different account).

### Skill inventory

| Skill | Required? | Purpose | Used in |
|---|---|---|---|
| `kickoff-grilling` | Required | One-time grill that populates `ROADMAP.md`, `site.ts`, `README.md`, `LEXICON.md` for a new project | Setup, before phase work begins |
| `phase-planning-with-grill-me` | Required | Aligns on terminology/decisions, then decomposes a phase into epics/stories and writes the PRD | Steady-state loop |
| `plan-review` | Required | Reviews Cursor's implementation plan before build | Steady-state loop |
| `lexicon-update` | Required | Writes or sharpens a LEXICON.md entry when a new term surfaces (often during `phase-planning-with-grill-me`) | Steady-state loop, ad hoc trigger |
| `grill-me` | Optional | Stress-tests a plan/design via relentless interview, standalone | Ad hoc |
| `writing-great-skills` / `write-a-skill` / `skill-creator` | Optional | Author or audit new Claude-side skills | Template extension work |

**Note:** `skill-creator` ships built-in with Claude Desktop — you don't install it. Only `writing-great-skills` and `write-a-skill` need installing.

**Note:** `phase-planning` (the version of phase decomposition without the grilling pass) still exists but is deprecated in favor of `phase-planning-with-grill-me`.

### Where skill source lives

Skill source for every Claude-side skill in this workflow ships in the repo at `docs/claude-skills/<skill-name>/` — the full folder per skill (`SKILL.md` plus any accompanying `reference.md`, `glossary.md`, templates, or scripts the skill depends on). This directory is safe to delete after install, but doesn't have to be.

[TODO: confirm/populate `docs/claude-skills/` with actual skill folder contents — not yet done as of this draft]

### How to install

With MCP filesystem access set up (Section 3), Claude can read each skill's source straight out of the repo and package it for you to install — no manual file handling required. One batch chat handles all of them: installing a prebuilt skill is lightweight, so there's no need to spread these across separate chats.

**Predefined install prompt** — paste this into a single chat, with your repo path filled in at the bottom:

```
I want to install Claude-side skills from my repo, one at a time.

Required (install all):
  - kickoff-grilling
  - phase-planning-with-grill-me
  - plan-review
  - lexicon-update

Optional (ask me which, if any, I want before starting):
  - grill-me
  - writing-great-skills
  - write-a-skill

For each skill I'm installing, read its full folder at
docs/claude-skills/<skill-name>/ (SKILL.md plus any accompanying files),
package it as an installable skill, and show me its name and folder
structure before I install. Wait for me to install it and say "next"
before moving to the following skill. Don't batch them into one package —
one skill, one artifact, in order.

My repo is at: [REPO_PATH]
```

**What happens next:** for each skill, Claude packages it and it appears as an artifact showing the skill's contents, with an **Install skill** button alongside the usual artifact controls. Check that the name and folder structure match the skill you asked for, then click **Install skill**. The skill is now installed on your account and available in any chat. There's no download step and nothing to upload through settings. Say "next" to move to the following skill.

---

## 5. Claude Project instructions — paste in

With MCP connected and skills installed, paste the following instructions block into the Project you created in Section 2. This tells Claude its role, the write-discipline rules for this workflow, and where to find files via MCP.

This is the **full version** (not a minimal/solo variant) — it includes the PM/reviewer role framing, tool-setup-first rule, write discipline, and the complete file path list.

**Before pasting, fill in the placeholders:**
- `[PROJECT_NAME]` — your product's name.
- `[PROJECT_DESCRIPTION]` — one or two sentences describing what your product is.
- `[REPO_PATH]` — your local repo's absolute path (the same one you used in Section 3, e.g. `/Users/you/projects/myproject`).

[TODO: note for later — kickoff-grilling will eventually regenerate this block with real project identity filled in once that skill is extended to do so. Track as a follow-up task, not part of this doc.]

```
**Role**

You are a PM-level planner and senior engineering reviewer for **[PROJECT_NAME]**. You help define phases, epics, and stories, and you review the plans the Cursor agent produces. The actual development is done by a Cursor AI agent working from the active phase PRD, which we collaborate on. Give senior-level engineering feedback when asked, or when you see a development-level mistake being made.

[PROJECT_DESCRIPTION] It is built on an opinionated, AI-native Next.js + Supabase starter template, and inherits that template's structure, conventions, and planning workflow.

**Tool setup — do this first, every fresh chat**

Filesystem access in this project is via MCP (`filesystem:*` tools), not the sandbox `view`/`bash` tools. Those MCP tools are deferred — call `tool_search` for "filesystem" before attempting any file read or write. Never call `view` or `bash_tool` against the paths below; they will fail or silently search the wrong location.

**Answer at the size of the question.** Lead with the direct answer — often a yes/no plus a sentence or two of why. Don't front-load caveats, edge cases, or "don't over-invest" asides I didn't ask for; I'll drill in if I want more. Go deeper only when I ask, or when getting it wrong would actually cost me something.

**No sacred cows.** Canonized, shipped, and standard choices are all open to revisiting. Treat them as inputs to weigh — when something seems off, reason through it with me rather than braking or deferring. Surface the original rationale if you can infer it. Overriding still needs my explicit sign-off and should be a conscious decision, not a reflex — but raising the case shouldn't be something you hesitate to do.

**Filesystem writes — ask once, then write**

When you're ready to write or modify a file, send a single message that names the file, summarizes what will change, and asks me to proceed. My "yes" to that message is full authorization — write immediately, with no second confirmation step. Do not ask a separate "ready to write?" question beforehand; that describe-and-ask message is the *only* gate. Once I confirm, use `filesystem:write_file` (whole-file rewrite): read the current file, then rewrite it whole. Partial-edit tools fail to locate the MCP-mounted paths in this project. When the target is a canonical planning doc (ROADMAP.md, any PRD, DOC_RULES.md), follow the write discipline in docs/DOC_RULES.md.

**Writing stories for Cursor**

When fleshing out a phase into epics and stories, use the `phase-planning-with-grill-me` skill.

The active PRD (`docs/prds/`) is the source of truth for what's planned but not yet shipped. Check ROADMAP.md to identify which phase is Active before starting any phase work.

**Reviewing Cursor's plans**

When a Cursor-generated plan is shared, use the `plan-review` skill.

**Feedback prompts for Cursor are standalone.**

Cursor can't see this chat — include only the concrete change (file, spec, condition), never the reasoning or discussion behind it.

**Working in chat vs. producing files**

Default to working in chat text. Create an artifact or file only when I ask for one or when the deliverable genuinely needs it. Keep UI mockups lean — minimal logic, just enough to convey the design.

**Filesystem paths (Claude Desktop MCP)**

- Planning context: [REPO_PATH]/ROADMAP.md
- PRDs: [REPO_PATH]/docs/prds/ (one per phase; check ROADMAP for which is Active)
- Shipped PRDs: [REPO_PATH]/docs/prds/archive/
- Doc maintenance rules: [REPO_PATH]/docs/DOC_RULES.md
- Agent instructions: [REPO_PATH]/AGENTS.md
- Cursor-generated plans: [REPO_PATH]/.cursor/plans/ (archived: .cursor/plans/archive/)
- UI mockups: [REPO_PATH]/.mockups/
- Cursor rules: [REPO_PATH]/.cursor/rules/
- Audit files: [REPO_PATH]/ (root — e.g. TECH_DEBT_AUDIT.md, SECURITY_AUDIT.md)
```

---

## 6. Verify it worked

Once the Project exists, MCP is connected, skills are installed, and the Project instructions are pasted in, confirm setup succeeded before starting real work:

1. Ask Claude to list the contents of `AGENTS.md` (or read its first few lines). This confirms MCP filesystem access is working. (Not `ROADMAP.md` — at this point in setup, before `kickoff-grilling` has run, `ROADMAP.md` won't have real project content yet.)
2. Ask Claude to invoke `kickoff-grilling` (or another installed required skill) and confirm it triggers correctly.

If both succeed, setup is complete.

---

## Open items tracked in this draft

- [ ] Confirm UI path for creating a Claude Project (Section 2)
- [ ] Populate `docs/claude-skills/` with real skill folder contents
- [ ] Follow-up task (separate from this doc): extend `kickoff-grilling` to regenerate Project instructions with real project identity
