---
name: research
description: >-
  Investigates a product, technical, competitive, or codebase question;
  persists findings to docs/research/ (Document mode) or delivers in chat
  (Chat mode). Invoke with /research.
disable-model-invocation: true
---

# Research

Investigate a question and deliver findings — either as a persisted brief in
[`docs/research/`](../../../docs/research/) or in chat only.

**Agent mode required** when writing or refreshing a brief (Document mode). Do
not run file writes in Ask mode.

**Not the same as:**

- **ADR** — immutable decision history; use when a hard-to-reverse choice is
  committed ([`docs/adr/`](../../../docs/adr/))
- **PRD / `phase-planning`** — forward build scope for a phase
- **Audit skills** (`audit-tech-debt`, `audit-security`, etc.) — repo health
  artifacts at repo root, not exploratory briefs
- **`plan-next-epic`** — implementation planning from an active PRD
- **`sync-repo-docs`** — mirrors shipped code into AGENTS.md / README

---

## Mode gate (first step — halt if unclear)

Determine mode from the user's request. If mode is ambiguous, ask once:

> Document (default) — save findings to `docs/research/`  
> Chat — findings in chat only, no new file

| Mode | Triggers | Output |
| ---- | -------- | ------ |
| **Document** (default) | unspecified, "save", "document" | File in `docs/research/` + short chat summary |
| **Chat** | "chat only", "don't save", "ephemeral" | Chat only unless reroute rules apply |

Also collect if missing: the **research question** and optional **type(s)**
(product / technical / competitive / codebase).

---

## Reroute rule (Chat mode)

After scanning `docs/research/` for topic matches (titles + opening
paragraphs):

| Match state | Action |
| ----------- | ------ |
| **Stale** matching doc exists | Switch to **Document** mode; refresh that file in place; announce reroute in one line |
| **Fresh** matching doc exists | Summarize from the file in chat — no duplicate research |
| **No match** | Chat only; offer once to persist if findings seem durable |

**Staleness:** `**Researched:**` date more than six months ago (see
[`docs/research/README.md`](../../../docs/research/README.md)).

---

## Workflow

```
Research progress:
- [ ] Step 1: Mode gate + collect question and type(s)
- [ ] Step 2: Read context (AGENTS.md, active PRD if phase-related)
- [ ] Step 3: Scan docs/research/ for matches; apply reroute if Chat mode
- [ ] Step 4: Research (codebase, web, optional Task subagents)
- [ ] Step 5: Write or refresh brief (Document) or deliver chat summary
- [ ] Step 6: Close-out — path, staleness note, optional downstream links
```

### Step 1 — Mode gate

Resolve mode and question before any research. Stop if mode is unclear.

### Step 2 — Read context

When the question touches the current build phase:

1. Read [`AGENTS.md`](../../../AGENTS.md) for repo truth and hard constraints
2. Read the active PRD in [`docs/prds/`](../../../docs/prds/) (discover via
   [DOC_RULES.md document roles](../../../docs/DOC_RULES.md#document-roles))

### Step 3 — Scan existing briefs

List and read [`docs/research/`](../../../docs/research/) — match on title,
slug, and opening paragraphs (Question section). Determine fresh vs stale per
the six-month rule.

Assign the next `RESEARCH-NNNN` number only when creating a **new** file (highest
existing number + 1, zero-padded).

### Step 4 — Research

- **Codebase:** search and read relevant source, tests, migrations, rules
- **External:** web search / fetch for product, competitive, or vendor topics
- **Large scope:** optional `explore` or `generalPurpose` Task subagents — no
  custom `.cursor/agents/` file in v1

**Hard boundary:** never edit product code, migrations, or config. This skill is
docs-only.

### Step 5 — Write or deliver

**Document mode** — write or refresh per
[`docs/research/README.md`](../../../docs/research/README.md) template. Refresh
stale briefs in place (same filename, bump `**Researched:**` date).

**Chat mode** — deliver findings in chat. No file unless rerouted.

### Step 6 — Close-out

Report:

- Path written (Document) or chat-only confirmation (Chat)
- Whether an existing brief was refreshed vs newly created
- Optional downstream suggestions (ROADMAP open question, PRD section, ADR) —
  never required

Do **not** commit unless the user asks.

---

## Anti-patterns

- Do not edit product code, migrations, or config
- Do not create ADRs or PRD sections unless the user explicitly asks
- Do not duplicate research when a fresh matching brief exists
- Do not leave a stale brief unrefreshed when Document mode or reroute applies
- Do not seed example `RESEARCH-*.md` files in the template — README only
