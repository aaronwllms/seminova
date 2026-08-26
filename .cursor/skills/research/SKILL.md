---
name: research
description: >-
  Investigates a product, technical, competitive, or codebase question;
  persists findings to docs/research/ (Document mode) or delivers in chat
  (Chat mode).
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
- **`archive-research`** — retires served briefs to `docs/research/archive/`
  (user @-attached files only; frozen)
- **`sync-repo-docs`** — syncs README, DESIGN.md, and the rules index

---

## Workflow

```
Research progress:
- [ ] Step 1: Mode gate + collect question and type(s)
- [ ] Step 2: Read context (AGENTS.md, active PRD if phase-related)
- [ ] Step 3: Scan active docs/research/ for matches; apply reroute if Chat mode
- [ ] Step 4: Research (codebase, web, optional Task subagents)
- [ ] Step 5: Write or refresh brief (Document) or deliver chat summary
- [ ] Step 6: Close-out — path, refresh vs new, optional downstream links
```

### Step 1 — Mode gate (halt if unclear)

Determine mode from the user's request. If mode is ambiguous, ask once:

> Document (default) — save findings to `docs/research/`  
> Chat — findings in chat only, no new file

| Mode | Triggers | Output |
| ---- | -------- | ------ |
| **Document** (default) | unspecified, "save", "document" | File in `docs/research/` + short chat summary |
| **Chat** | "chat only", "don't save", "ephemeral" | Chat only unless rerouted in Step 3 |

Also collect if missing: the **research question** and optional **type(s)**
(product / technical / competitive / codebase). Done when mode and question
are both resolved — no research before that.

### Step 2 — Read context

When the question touches the current build phase:

1. Read [`AGENTS.md`](../../../AGENTS.md) for hard constraints
2. Read the active PRD in [`docs/prds/`](../../../docs/prds/) (discover via
   [DOC_RULES.md document roles](../../../docs/DOC_RULES.md#document-roles))

### Step 3 — Scan existing briefs

List and read **active** briefs in [`docs/research/`](../../../docs/research/)
only — **exclude** [`docs/research/archive/`](../../../docs/research/archive/).
Match on title, slug, and opening paragraphs (Question section). Determine
fresh vs stale per the staleness rule in
[`docs/research/README.md`](../../../docs/research/README.md).

Archived briefs are frozen; never refresh or match against
`docs/research/archive/`.

**Reroute (Chat mode only):**

| Match state | Action |
| ----------- | ------ |
| **Stale** matching doc exists | Switch to **Document** mode; refresh that file in place; announce reroute in one line |
| **Fresh** matching doc exists | Summarize from the file in chat — no duplicate research |
| **No match** | Chat only; offer once to persist if findings seem durable |

When creating a **new** file, assign the next `RESEARCH-NNNN` per
[README › Numbering & filenames](../../../docs/research/README.md#numbering--filenames)
— scan **both** active `docs/research/` and `docs/research/archive/` for the
highest existing number.

### Step 4 — Research

- **Codebase:** search and read relevant source, tests, migrations, rules
- **External:** web search / fetch for product, competitive, or vendor topics
- **Large scope:** optional `explore` or `generalPurpose` Task subagents — no
  custom `.cursor/agents/` file in v1

**Hard boundary:** never edit product code, migrations, or config. This skill is
docs-only.

Done when every aspect of the research question has either an evidence-backed
finding or an explicit entry under Open questions — nothing silently dropped.

### Step 5 — Write or deliver

**Document mode** — write or refresh per the
[`docs/research/README.md`](../../../docs/research/README.md) template. Refresh
stale briefs in place (same filename, bump `**Researched:**` date).

**Chat mode** — deliver findings in chat. No file unless rerouted.

### Step 6 — Close-out

Report:

- Path written (Document) or chat-only confirmation (Chat)
- Whether an existing brief was refreshed vs newly created
- Optional downstream suggestions (ROADMAP open question, PRD section, ADR) —
  suggest only; never create them unless the user explicitly asks

Do **not** commit unless the user asks.
