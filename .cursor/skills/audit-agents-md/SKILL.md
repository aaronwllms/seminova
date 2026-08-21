---
name: audit-agents-md
description: >-
  Read-only instruction-budget audit of AGENTS.md (full pass or sync); writes
  AGENTS_AUDIT.md at the repo root.
disable-model-invocation: true
---

# AGENTS.md Audit

Audits `AGENTS.md` against the instruction-budget standard below and produces
`AGENTS_AUDIT.md` at the repo root with cited findings.

**Agent mode required** — this skill writes a file. Do not run in Ask mode.

**Read-only toward AGENTS.md** — this skill reviews and reports. It never edits
`AGENTS.md`, and never creates the destination files its findings name.

**Not the same as:**

- **`sync-repo-docs`** — syncs README, DESIGN.md, and the rules index; this skill
  asks whether AGENTS.md content belongs there at all
- **`audit-rules`** — audits `.cursor/rules/*.mdc`; it reads `AGENTS.md`
  § Hard constraints as a source of truth rather than auditing it
- **`audit-tech-debt`** — its documentation-drift dimension catches AGENTS.md
  claims that contradict the code; this skill owns budget and placement

---

## Read first

1. [`AGENTS.md`](../../../AGENTS.md) — the subject, in full
2. [`docs/DOC_RULES.md`](../../../docs/DOC_RULES.md) — document-roles table;
   decides which existing doc owns which content
3. [`rule-authoring`](../rule-authoring/SKILL.md) — constrains what a
   `.cursor/rules/*.mdc` destination can accept

`DOC_RULES.md` and `rule-authoring` are governing conventions. If either
disagrees with this skill, the convention wins and the disagreement is itself
a finding to raise with the user.

---

## The standard

`AGENTS.md` loads on **every request**, whether or not it is relevant. Every
line spends instruction budget the agent could have spent on the task.

**Delete is the default verdict.** Content does not stay because it is true,
useful, or expensive to have written. It stays only if it clears both tests
below. This inverts the usual burden: the audit does not argue for removal, it
demands justification for retention.

### Test 1 — relevance

Does *any* change to this repo risk tripping this content? Not "is it useful
sometimes" — is it live on essentially every task. Hard constraints pass: a
route touches the auth boundary, a component touches semantic tokens, a log
line touches the console rule. A feature inventory fails: most tasks touch none
of it and pay for all of it.

Content that passes stays at root. This set is small by design:

- One-sentence project description
- Package manager, if not the ecosystem default
- Build / typecheck / test commands, if non-standard
- Hard constraints — the boundaries any change can cross
- Governance the agent must follow every run (workflow gates, change protocol)

### Test 2 — irreducibility

Content failing Test 1 is deleted unless it carries a claim that is **both**:

- **not derivable by grep** — the agent could not find it by reading the code.
  A route list, a migration inventory, a directory tree, a command table, and a
  file-path catalog are all derivable. Delete them.
- **not already owned** by an ADR, a `.cursor/rules/*.mdc`, or `LEXICON.md`.

A passing claim is almost always a **why**, not a **what** — intent, tradeoff,
or constraint the code cannot state about itself. Its verdict is still not
*keep*: it is **relocate** to the owner that holds whys. Keeping at root
requires passing Test 1.

**Structure rots.** Documented paths break silently when files move, and the
agent follows them confidently into the wrong place. Describe the project's
shape; let the agent discover current structure itself.

**Accretion is the failure mode.** The file grows one rule at a time, each
added because the agent once did something unwanted. Nobody removes. The result
contradicts itself and nobody notices.

## Protected section

`§ Hard constraints` is never flagged for relocation or deletion. It passes
Test 1 outright, and other skills (`audit-rules`, `plan-review`) read it as a
source of truth. It may still be flagged for staleness, contradiction, or
duplication.

Nothing else is protected. Section age, authorship, and effort are not
arguments.

## Operating principles

Read the actual referenced files before flagging anything. A plausible-sounding
finding that does not hold up on inspection is worse than no finding.

Every finding names a **destination**: a specific file, or `delete`. "Belongs
elsewhere" is not a finding.

**Do not invent findings.** Delete-by-default creates pressure to manufacture
deletions. A section that clears both tests is recorded under § Content that
earns every-request load — that is a result, not a failure to find something.

**Do not hedge a verdict.** If the tests say delete, the finding says delete.
Git holds the content either way.

**Anti-example** — hedged: "Consider whether the migration list still earns its
place here; it may be worth relocating." Corrected: "Delete. The list is
reproducible with `ls supabase/migrations/` and goes stale on every migration."

Cite `startLine:endLine:filepath` for every finding (Cursor code-citation
format).

## Run modes

**Mode gate** — first step, before anything else: if the invocation does not
state full pass or sync, ask the user which mode as a numbered choice — e.g.
`Which mode? 1 (Full pass) 2 (Sync)` — and stop. Do not proceed on an assumed
or inferred mode, even when context makes one seem obvious (e.g.
`AGENTS_AUDIT.md` already exists, so sync "must" be intended). Only after the
mode is explicit, continue below.

**Full pass** — Phase 1 (Orient) → Phase 2 (Audit) → Phase 3 (write the
deliverable). On a full pass, also prune the Resolved appendix: delete any
entry older than the previous full audit date.

**Sync pass** — read the existing `AGENTS_AUDIT.md` → gather narrow evidence
for **Open** findings only (re-read only the `AGENTS.md` sections those
findings cite, plus the files they verify against) → verify each affected
finding → make minimal edits → report what changed. Spot-check **Accepted**
rows only when their cited content clearly changed. Never flatten Accepted back
into Open without an explicit PM decision. Escalate to a full pass (after
telling the user) if the file is stale, mostly wrong, or too many new findings
surface mid-sync.

**Verify gate (both modes):** nothing is marked resolved without confirming the
change exists in `AGENTS.md`. A commit message or checklist claim does not
count. Resolved findings are removed from **Open** / **Accepted** and moved to
the Resolved appendix with the date, keeping their ID.

**Finding disposition (required):** every non-resolved finding lands in exactly
one section — never leave disposition implied in Recommendation prose alone:

| Section | Meaning | At-a-glance |
| ------- | ------- | ----------- |
| **Open** | Still actionable. `Status` column is `Do next`, `Deferred` (named home: phase / ROADMAP item), or `Needs decision` (blocked on PM). | Real backlog |
| **Accepted** | Deliberately keeping content the tests say should go. Rows carry **Why accepted** and **Reopen when**. | Not a todo list |
| **Resolved** | Removed or relocated in `AGENTS.md` (appendix). | Done |

**Quick wins** draw only from **Open**.

## Phase 1: Orient

Use `TodoWrite` to publish a plan so the user can see progress through the
phases.

1. Read the three files under § Read first.
2. Record the budget: total **characters** (`wc -m AGENTS.md`), approximate
   tokens, and share of the file per top-level section by character count — not
   lines.
3. List the owners available today: `docs/adr/`, `.cursor/rules/*.mdc` (with
   activation modes), `LEXICON.md`, `.cursor/skills/*/`.

Do not form findings yet.

## Phase 2: Audit

Every top-level section gets both tests and one verdict: **keep**, **relocate**
(with destination), or **delete**.

Run the tests at paragraph granularity inside long sections. A section is not a
single unit; a whole-section verdict on a 300-line section is a sign the pass
was shallow.

Judgment the standard does not carry:

- **Falsifiable claims** — every file path, route, command, table name, and
  shipped-feature claim is checkable. Check it against the filesystem, not from
  memory. Report the total checked and the number broken as a headline
  staleness rate. An unverifiable prose claim is not a `Stale` finding — it
  goes to Open questions.
- **Why-hunting** — before deleting a long passage, name any claim in it that
  passes Test 2. That claim relocates; the surrounding prose still deletes.
  Finding none is a valid and common result — record it, do not manufacture
  one.
- **Contradiction** — read both instructions' actual content and name the
  specific scenario where they collide. A shared topic is not a contradiction.
- **No-op** — would the agent behave differently without this line?
  Restatements of what lint or CI already enforces cost budget and change
  nothing.
- **Destination already holds it** — when relocating into an existing rule,
  ADR, or `LEXICON.md`, read that file first. If it already carries the claim,
  the verdict is `delete`, not relocate.
- **Destination would reject it** — if the destination is a rule file that
  `rule-authoring` would refuse (repo-truth catalog, or bulk into the
  always-apply budget), the verdict is `delete`, not relocate.

### Mechanical triggers

Apply these **before** any judgment. When a trigger fires, file a finding
unless the waiver criteria are met — then document the waiver in the ledger.

| Trigger | Category | Default severity | Finding unless |
| ------- | -------- | ---------------- | -------------- |
| Total file over **10,000 characters** | `Budget` | High | — (always a finding; severity scales with excess) |
| Any section failing Test 1 | `Budget` | Medium | Section is `§ Hard constraints` |
| **3+ concrete file paths** in one section | `Drift risk` | Medium | Paths are the subject of a hard constraint |
| Inventory of routes, migrations, tables, commands, or directories | `Derivable` | Medium | The inventory *is* a hard constraint |
| Instruction restating a check in `eslint.config.mjs`, `package.json` scripts, or CI | `No-op` | Low | States a principle the check cannot express, plus a pointer to it |
| Two instructions on the same topic with different directives | `Contradiction` | High | — (always a finding) |
| Broken path, route, or command reference | `Stale` | High | — (always a finding) |

**Section ledger mandatory pass:** every top-level section gets one row in the
ledger (Phase 3) — both test results, verdict, and either a finding ID or a
waiver reason. Do not summarize as "the rest are fine."

**Done when:** every top-level section has a ledger row and appears in either
the Findings tables or § Content that earns every-request load. Every
falsifiable claim in the file has been checked against the filesystem, and the
staleness rate is a number.

## Phase 3: Deliverable

Write or update `AGENTS_AUDIT.md` at the repo root per the Output template
below.

- **Executive summary** — lead with two numbers: budget (characters / tokens) and
  staleness rate (broken references / total checked). Then rank findings by
  what would most mislead the agent if left unfixed.
- **Severity** calibrated by misdirection, not size — a broken path outranks a
  verbose section of equal length. `Critical` = an instruction that actively
  sends the agent wrong on a common task; `High` = broken reference, or
  contradiction; `Medium` = budget spend on content failing Test 1; `Low` =
  no-ops and nits.
- Split findings into **Open** / **Accepted** / **Resolved** per Finding
  disposition — do not dump accepted content into Open
- **Content that earns every-request load** is required. Every entry states
  which test it passed and why. Generic praise is insufficient; an entry that
  cannot name a test it passed is a finding, not a keep. It is not a substitute
  for the **Accepted** table.
- On a sync pass, update **Last synced** only; preserve **Last full audit**
  unless the sync escalated
- On a full pass, prune Resolved entries older than the previous full audit date
- Finding IDs (`AG001`…) are stable across passes — never renumber
- Do not pad. If a category has nothing material, write "Nothing material" and
  move on

## Output quality bar

Before finishing:

- [ ] Budget recorded as a character count; staleness recorded as a ratio
- [ ] Every top-level section has a ledger row with both test results
- [ ] Long sections audited at paragraph granularity, not one verdict each
- [ ] Every finding has a stable ID, category, severity,
      `startLine:endLine:filepath`, description, recommendation, and destination
- [ ] Every destination is a specific file or `delete` — no "elsewhere"
- [ ] No Recommendation contains "consider", "optionally", "may be worth", or
      similar hedging around a verdict
- [ ] Every entry under Content that earns every-request load names its passed test
- [ ] Findings split into Open / Accepted / Resolved, with nothing accepted left
      in Open
- [ ] `AGENTS.md` was not modified

## When this skill ends

Stop after `AGENTS_AUDIT.md` is written or updated. Tell the user the file is
ready at the repo root, report the budget and staleness numbers plus finding
counts by disposition, and note that edits to `AGENTS.md` happen in separate
chats.

## Output template

```markdown
# AGENTS.md Audit — <repo name>

Last full audit: YYYY-MM-DD
Last synced: YYYY-MM-DD
Scope: AGENTS.md at repo root, against the instruction-budget standard

## Executive summary

- Budget: <N> characters / ~<N>k tokens, loaded on every request
- Staleness: <N> broken references of <N> checked
- (max 10 bullets, ranked by what would most mislead the agent if left unfixed)

## Orient

| Section | Share | Verdict |
| ------- | ----- | ------- |
| § Hard constraints | 7% | keep (protected) |

Owners available: (list)

## Open

Actionable backlog only. `Status`: `Do next` | `Deferred` | `Needs decision`.

| ID    | Status  | Category    | File:Line          | Severity | Description | Recommendation | Destination |
| ----- | ------- | ----------- | ------------------ | -------- | ----------- | -------------- | ----------- |
| AG001 | Do next | `Derivable` | 340:356:AGENTS.md  | Medium   | ...         | ...            | delete      |

Categories: `Budget`, `Stale`, `Drift risk`, `Derivable`, `Contradiction`, `No-op`.

## Accepted

Content the tests say should go, deliberately kept. Not a todo list.

| ID    | Category | File:Line | Severity | Description | Why accepted | Reopen when |
| ----- | -------- | --------- | -------- | ----------- | ------------ | ----------- |
| AG0xx | `Budget` | ...       | Medium   | ...         | ...          | ...         |

## Quick wins

- [ ] AG042: ... (Open findings only)

## Content that earns every-request load

- **§ Hard constraints** — passes Test 1: any change can cross one of these
  boundaries. Protected; read as a source of truth by `audit-rules` and
  `plan-review`.
- (required — every entry names the test it passed)

## Section ledger

Mandatory on full pass — one row per top-level section.

| Section | Test 1 (relevance) | Test 2 (irreducibility) | Verdict | Result |
| ------- | ------------------ | ----------------------- | ------- | ------ |
| § Implemented now | fails — most tasks touch none of it | 2 whys found, rest derivable | relocate + delete | AG004–AG011 |

## Open questions

- ...

## Resolved

- YYYY-MM-DD — AG003: <one-line description>
```

Standard adapted from Matt Pocock, "A Complete Guide To AGENTS.md"
(https://www.aihero.dev/a-complete-guide-to-agents-md).
