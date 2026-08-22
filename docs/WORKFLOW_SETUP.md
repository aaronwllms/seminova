# WORKFLOW_SETUP.md — One-time workflow setup

**Purpose:** One-time setup for a freshly cloned Seminova template — connecting Claude Desktop to the repo via MCP, installing the Claude-side skills this workflow depends on, and verifying it all works. For day-to-day usage once setup is complete, see [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md).

**Last updated:** 2026-08-21

**Audience:** Anyone setting up a project cloned from this template — no prior context assumed.

**Prerequisite:** Complete [README.md](../README.md)'s [Quick start](../README.md#quick-start) and [Initial setup](../README.md#initial-setup) first — dev environment, Supabase, and the repo running locally. Also requires Claude Desktop (not claude.ai web) — the filesystem connector is a desktop extension that runs locally.

---

## 1. Overview

This doc walks through one-time setup after cloning the template, before any planning or development work begins:

1. Create a Claude Project for this repo (the container for all your setup and planning chats)
2. Connect Claude Desktop to the repo via the filesystem MCP server
3. Install the Claude-side skills this workflow depends on
4. Verify everything is working

> [!NOTE]
> **This doc covers only the Claude side.** `.cursor/skills/` and `.cursor/rules/` ship with the template and are inherited on clone, needing no separate setup. The Cursor IDE and GitHub CLI installs, along with the dev environment, are covered in README — do that first if you haven't.

Once setup is complete, day-to-day usage (the phase-by-phase planning loop) is documented in [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md). That doc also explains *why* this setup looks the way it does — see [FAQ — Why this workflow looks this way](WORKFLOW_GUIDE.md#faq--why-this-workflow-looks-this-way) — if you want the reasoning before you proceed.

---

## 2. Create the Claude Project

Create a Claude Project for this repo before anything else. It's the container that holds all your setup and planning chats in one place, so they share history and you're not scattering setup work across loose conversations.

Creating the Project has no prerequisites — make it empty for now. From here on, run every setup chat (MCP, skills) inside this Project.

**In Claude Desktop:**

1. Click **Projects** in the sidebar.
2. Click **New project**.

Name the Project after your product or repo (e.g. `Seminova`) so it's easy to find later. Leave custom instructions blank for now — `project-kickoff` will output a block for you to paste there as its final step.

---

## 3. MCP filesystem — connect

**Prerequisite:** Claude Desktop installed.

Connecting Claude to the repo's files is a one-time setup done entirely in Claude Desktop's UI — Claude cannot configure this for you.

1. Click **Customize** in the left-hand menu.
2. Click **Connectors** in the left-hand menu of that screen.
3. Find **Filesystem** in your connectors list and click **Connect**. If it isn't there yet, click the **"+"** next to **Connectors** to open the directory, then find and install it.
4. Add the absolute path to your project's directory — e.g. `/Users/you/projects/my-project` — then save.
5. In a chat, click the **"+"** in the lower-left of the message box, hover **Connectors**, and toggle **Filesystem** on. This is per-conversation — do it in each new chat where Claude needs repo access.

Add one path per project in step 4. This connector is account-wide, not per-project: when you clone another repo later, come back here and add its path to the same list rather than connecting a second time.

> [!CAUTION]
> The filesystem server runs with your user account's permissions — it can do anything to these directories that you can do manually. Only add paths you're comfortable with Claude reading and modifying.

> [!NOTE]
> **Filesystem is a desktop extension, not a web connector.** It runs locally, so it's available in Claude Desktop only — not claude.ai on the web or mobile.

Confirm it worked in [Section 5](#5-verify-it-worked) below.

---

## 4. Claude-side skills — install

This workflow depends on a set of Claude-side skills. They are global to your Claude account, not part of the repo — they need to be installed once, not per-project (re-installing for a second project is only needed if you're setting up Claude fresh on a different account).

### Skill inventory

**Required — the workflow loop**

| Skill | Purpose | Used in |
|---|---|---|
| `project-kickoff` | One-time grill that populates `ROADMAP.md`, `BACKLOG.md`, `site.ts`, `README.md`, `LEXICON.md` for a new project, then outputs the Project instructions block | Setup, before phase work begins |
| `phase-planning` | Aligns on terminology/decisions, then decomposes a phase into epics/stories and writes the PRD | Steady-state loop |
| `plan-review` | Reviews Cursor's implementation plan before build and revises the plan file in place | Steady-state loop |
| `lexicon-update` | Writes or sharpens a LEXICON.md entry when a new term surfaces (often during `phase-planning`) | Steady-state loop, ad hoc trigger |
| `create-mockup` | Static UI mockups as reviewable inline widgets, saved to `docs/mockups/` for PRD stories to reference (invoked by `phase-planning` or ad hoc) | Steady-state loop, ad hoc trigger |

**Optional — authoring**

| Skill | Purpose | Used in |
|---|---|---|
| `skill-authoring` | Create, edit, or audit a skill (Claude- or Cursor-side); packages Claude-side output as a `.skill` bundle | Template extension work |
| `instructions-authoring` | Write or audit the Claude Project instructions field or the account-wide profile instructions | Template extension work |
| `writing-for-agents` | Reference standard the authoring skills read first. Never invoked directly — install it if you install either of the two above. A second copy lives in `.cursor/skills/`; keep their bodies identical | Read by `skill-authoring`, `instructions-authoring` |

**Optional — experimental, not part of the workflow** (see [WORKFLOW_GUIDE.md › Experimental](WORKFLOW_GUIDE.md#experimental--not-part-of-the-workflow))

| Skill | Purpose | Used in |
|---|---|---|
| `code-review-review` | Adversarial audit of a `/code-review` report — re-grades severities against `grading.md`, checks citations, ends in a fix prompt | Beside Step 7, while being proven |
| `collect-skill-feedback` | Appends a settled audit's findings to `docs/skill-feedback/<skill>.md`, gap/slip-tagged | After `code-review-review` |

### Where skill files live

Each skill ships in this repo as a ready-to-upload skill file at `docs/claude-skills/<skill-name>.skill`.

### How to install

1. In Claude, go to **Customize > Skills**.
2. Click **"Add,"** then **"Upload a skill."**
3. Select the corresponding `.skill` file from [docs/claude-skills/](claude-skills/) in your local repo clone.
4. Confirm the skill appears in your skills list, then toggle it on.
5. Repeat for each skill in the Required table above (and any Optional ones you want).

---

## 5. Verify it worked

Once the Project exists, MCP is connected, and skills are installed, confirm setup succeeded before starting real work:

1. Ask Claude to list the contents of [AGENTS.md](../AGENTS.md) (or read its first few lines). This confirms MCP filesystem access is working. (Not [ROADMAP.md](../ROADMAP.md) — at this point in setup, before `project-kickoff` has run, ROADMAP.md won't have real project content yet.) If Claude can't see the file, confirm Filesystem is toggled on for this conversation, then restart Claude Desktop to refresh the extension registry.
2. Confirm each installed skill appears under **Customize > Skills**, then ask Claude "what does the `project-kickoff` skill do?" — a correct summary confirms the skill is loaded without starting the kickoff session.

If both succeed, setup is complete. Move to [Starting a new project](WORKFLOW_GUIDE.md#starting-a-new-project) in [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md) to begin project kickoff.
