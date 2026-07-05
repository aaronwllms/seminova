# WORKFLOW_SETUP.md — One-time workflow setup

**Purpose:** One-time setup for a freshly cloned Seminova template — connecting Claude Desktop to the repo via MCP, installing the Claude-side skills this workflow depends on, and verifying it all works. For day-to-day usage once setup is complete, see [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md).

**Last updated:** 2026-07-04

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

Name the Project after your product or repo (e.g. `Seminova`) so it's easy to find later. Leave custom instructions blank for now — `project-kickoff` will generate and paste them as its final step.

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
| `project-kickoff` | Required | One-time grill that populates `ROADMAP.md`, `site.ts`, `README.md`, `LEXICON.md` for a new project | Setup, before phase work begins |
| `phase-planning` | Required | Aligns on terminology/decisions, then decomposes a phase into epics/stories and writes the PRD | Steady-state loop |
| `plan-review` | Required | Reviews Cursor's implementation plan before build | Steady-state loop |
| `lexicon-update` | Required | Writes or sharpens a LEXICON.md entry when a new term surfaces (often during `phase-planning`) | Steady-state loop, ad hoc trigger |
| `create-mockup` | Required | Static UI mockups as reviewable inline widgets, saved to `.mockups/` for PRD stories to reference (invoked by `phase-planning` or ad hoc) | Steady-state loop, ad hoc trigger |
| `skill-authoring` | Optional | Create, edit, or audit a skill. Applies the quality standard (invocation choices, information hierarchy, pruning, failure modes) while running an interview, draft, eval, iterate loop | Template extension work |

### Where skill files live

Each skill ships in this repo as a ready-to-upload skill file at `docs/claude-skills/<skill-name>.skill`.

### How to install

1. In Claude, go to **Customize > Skills**.
2. Click **"Add,"** then **"Upload a skill."**
3. Select the corresponding `.skill` file from `docs/claude-skills/` in your local repo clone.
4. Confirm the skill appears in your skills list, then toggle it on.
5. Repeat for each skill in the Required list above (and any Optional ones you want).

---

## 5. Verify it worked

Once the Project exists, MCP is connected, and skills are installed, confirm setup succeeded before starting real work:

1. Ask Claude to list the contents of `AGENTS.md` (or read its first few lines). This confirms MCP filesystem access is working. (Not `ROADMAP.md` — at this point in setup, before `project-kickoff` has run, `ROADMAP.md` won't have real project content yet.)
2. Ask Claude to invoke `project-kickoff` (or another installed required skill) and confirm it triggers correctly.

If both succeed, setup is complete. Move to [WORKFLOW_GUIDE.md → Starting a new project](WORKFLOW_GUIDE.md#starting-a-new-project) to begin project kickoff.
