# WORKFLOW_SETUP.md — One-time workflow setup

**Purpose:** One-time setup for a freshly cloned Seminova template — connecting Claude Desktop to the repo via MCP, installing the Claude-side skills this workflow depends on, and verifying it all works. For day-to-day usage once setup is complete, see [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md).

**Status:** DRAFT — blocked on one item before it's runnable end-to-end: `docs/claude-skills/` is not yet populated (Section 4). See inline `[TODO]` markers.

**Audience:** Anyone setting up a project cloned from this template — no prior context assumed.

**Prerequisite:** Complete [README.md](../README.md)'s Quick start and Initial setup first — dev environment, Supabase, and the repo running locally. Also requires Claude Desktop (not claude.ai web) — MCP filesystem server configuration is a Desktop-only feature.

---

## 1. Overview

This doc walks through one-time setup after cloning the template, before any planning or development work begins:

1. Create a Claude Project for this repo (the container for all your setup and planning chats)
2. Connect Claude Desktop to the repo via the filesystem MCP server
3. Install the Claude-side skills this workflow depends on
4. Verify everything is working

> [!NOTE]
> **This doc covers only the Claude side.** `.cursor/skills/` and `.cursor/rules/` ship with the template and are inherited on clone, needing no separate setup. The Cursor IDE and GitHub CLI installs, along with the dev environment, are covered in README — do that first if you haven't.

Once setup is complete, day-to-day usage (the phase-by-phase planning loop) is documented in [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md). That doc also explains *why* this setup looks the way it does — the Claude/Cursor split and why MCP instead of Cowork — if you want the reasoning before you proceed.

---

## 2. Create the Claude Project

Create a Claude Project for this repo before anything else. It's the container that holds all your setup and planning chats in one place, so they share history and you're not scattering setup work across loose conversations.

Creating the Project has no prerequisites — make it empty for now. From here on, run every setup chat (MCP, skills) inside this Project.

**In Claude Desktop:**

1. Click **Projects** in the sidebar.
2. Click **New project**.

Name the Project after your product or repo (e.g. `Seminova`) so it's easy to find later. Leave custom instructions blank for now — `kickoff-grilling` will generate and paste them as its final step.

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
| `phase-planning` | Required | Aligns on terminology/decisions, then decomposes a phase into epics/stories and writes the PRD | Steady-state loop |
| `plan-review` | Required | Reviews Cursor's implementation plan before build | Steady-state loop |
| `lexicon-update` | Required | Writes or sharpens a LEXICON.md entry when a new term surfaces (often during `phase-planning`) | Steady-state loop, ad hoc trigger |
| `grill-me` | Optional | Stress-tests a plan/design via relentless interview, standalone | Ad hoc |
| `writing-great-skills` / `write-a-skill` / `skill-creator` | Optional | Author or audit new Claude-side skills | Template extension work |

**Note:** `skill-creator` ships built-in with Claude Desktop — you don't install it. Only `writing-great-skills` and `write-a-skill` need installing.

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
  - phase-planning
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

## 5. Verify it worked

Once the Project exists, MCP is connected, and skills are installed, confirm setup succeeded before starting real work:

1. Ask Claude to list the contents of `AGENTS.md` (or read its first few lines). This confirms MCP filesystem access is working. (Not `ROADMAP.md` — at this point in setup, before `kickoff-grilling` has run, `ROADMAP.md` won't have real project content yet.)
2. Ask Claude to invoke `kickoff-grilling` (or another installed required skill) and confirm it triggers correctly.

If both succeed, setup is complete. Move to [WORKFLOW_GUIDE.md → Starting a new project](WORKFLOW_GUIDE.md#starting-a-new-project) to begin the kickoff grill.

---

## Open items tracked in this draft

- [ ] Populate `docs/claude-skills/` with real skill folder contents
