---
name: audit-rules
description: >-
  Audit of `.cursor/rules/*.mdc` against the rule-authoring standard (full pass
  or sync); writes RULE_AUDIT.md at the repo root.
disable-model-invocation: true
---

# Rule Audit

Audits every file in `.cursor/rules/` against the standard defined in
[`rule-authoring`](../rule-authoring/SKILL.md) and produces `RULE_AUDIT.md`
at the repo root with cited findings.

**Agent mode required** — this skill writes a file. Do not run in Ask mode.

## Operating principles

`rule-authoring` is the standard — read it in full each run. This skill
carries no copy of its criteria; if the rule changes, the audit changes with
it.

Read the actual referenced files and actual other rule files before flagging anything; a plausible-sounding finding that doesn't hold up on inspection is worse than no finding. No sycophancy — if a rule is fine, say so and move on.

## Run modes

**Mode gate** — first step, before anything else: if the invocation does not state full pass or sync, ask the user which mode as a numbered choice — e.g. `Which mode? 1 (Full pass) 2 (Sync)` — and stop. Do not proceed on an assumed or inferred mode, even when context makes one seem obvious (e.g. `RULE_AUDIT.md` already exists, so sync "must" be intended). Only after the mode is explicit, continue below.

**Full pass** — Phase 1 (Orient) → Phase 2 (Audit) → Phase 3 (write the deliverable). On a full pass, also prune the Resolved appendix: delete any entry older than the previous full audit date.

**Sync pass** — read the existing `RULE_AUDIT.md` → gather narrow evidence for open findings only (re-read only the rule files those findings cite, plus `rule-authoring` if a finding depends on it) → verify each affected finding → make minimal edits → report what changed. Escalate to a full pass (after telling the user) if the file is stale, mostly wrong, or too many new findings surface mid-sync.

**Verify gate (both modes):** nothing is marked resolved without confirming the fix exists in the actual rule file. A commit message or checklist claim does not count. Resolved findings are removed from the Findings table and moved to the Resolved appendix with the date, keeping their ID.

## Phase 1: Orient

1. Read `rule-authoring` in full.
2. Read `AGENTS.md` § Hard constraints at the repo root.
3. List every file in `.cursor/rules/*.mdc`.

## Phase 2: Audit

Apply every principle and checklist item in `rule-authoring` to every rule file. Where a principle requires cross-file knowledge (overlap, contradiction, ownership), check each rule against all others plus `AGENTS.md` § Hard constraints, not just its neighbors.

Audit-specific judgment the skill doesn't carry:

- **Size** — a file outside the line target is a finding to weigh, not an automatic verdict. Note what the excess consists of.
- **Contradiction** — read both rules' actual content and name the specific scenario where their directives collide. A shared topic is not a contradiction.
- **Currency** — verify referenced file paths against the actual filesystem, not from memory.
- **Mode fit** — check the activation mode against the rule's actual relevance shape, not just whether frontmatter is internally consistent. `alwaysApply` only for true per-request universals; `globs` when relevance is bound to editing a specific file type; Agent Requested when relevance is task-bound but not file-bound (and the `description` must be specific enough to match on); Manual only when invocation-by-name is intentional. Syntactically valid frontmatter can still be the wrong mode — that's the finding.

**Done when:** every rule file has been checked against every principle, and every rule file appears in either the Findings table or the Rules That Are Fine section. No file unaccounted for.

## Phase 3: Deliverable

Write or update `RULE_AUDIT.md` at repo root per the Output template below.

- **Executive summary** — rank by what would most confuse Cursor if left unfixed
- **Category** = rule-authoring principle violated, with Contradiction as a value — name both rules and the specific conflicting scenario in Description
- **Severity** calibrated by how badly the problem would mislead Cursor
- **Rules that are fine** is required; if empty, you didn't look hard enough
- On a full pass, prune Resolved entries older than the previous full audit date
- Finding IDs are stable across passes — never renumber

## Rules

- If `rule-authoring` itself has a problem, note it as a separate finding rather than silently working around it.
- Don't recommend consolidating rules just because they share a topic — check whether they cover genuinely different concerns first.
- Do not fix rule files — this skill produces the audit artifact only.

## Output template

```markdown
# Rule Audit — <repo name>

Last full audit: YYYY-MM-DD
Last synced: YYYY-MM-DD
Scope: .cursor/rules/*.mdc against the rule-authoring standard

## Executive summary

- (max 10 bullets, ranked by what would most confuse Cursor if left unfixed)

## Orient

(rule inventory: file list with activation modes)

## Findings

| ID   | Category | File:Line | Severity | Description | Recommendation |
| ---- | -------- | --------- | -------- | ----------- | -------------- |
| R001 | ...      | ...       | Medium   | ...         | ...            |

## Rules that are fine

- (required — if empty, you didn't look hard enough)

## Open questions

- ...

## Resolved

- YYYY-MM-DD — R003: <one-line description>
```
