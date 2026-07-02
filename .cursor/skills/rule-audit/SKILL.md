---
name: rule-audit
description: >-
  Thorough, user-invoked audit of .cursor/rules/*.mdc against the standard in
  rule-authoring.mdc. Produces RULE_AUDIT.md at the repo root with cited
  findings. Does not auto-invoke.
disable-model-invocation: true
---

# Rule Audit

Audits every file in `.cursor/rules/` against the standard defined in [`rule-authoring.mdc`](../../rules/rule-authoring.mdc) and produces `RULE_AUDIT.md` at the repo root with cited findings.

**Agent mode required** — this skill writes a file. Do not run in Ask mode.

## Operating principles

`rule-authoring.mdc` is the standard — read it in full each run. This skill carries no copy of its criteria; if the rule changes, the audit changes with it.

Read the actual referenced files and actual other rule files before flagging anything; a plausible-sounding finding that doesn't hold up on inspection is worse than no finding. No sycophancy — if a rule is fine, say so and move on.

## Phase 1: Orient

1. Read `rule-authoring.mdc` in full.
2. Read `AGENTS.md` and `LOCKED_RULES.md` at the repo root.
3. List every file in `.cursor/rules/*.mdc`.

## Phase 2: Audit

Apply every principle and checklist item in `rule-authoring.mdc` to every rule file. Where a principle requires cross-file knowledge (overlap, contradiction, ownership), check each rule against all others plus `AGENTS.md` and `LOCKED_RULES.md`, not just its neighbors.

Audit-specific judgment the rule doesn't carry:

- **Size** — a file outside the line target is a finding to weigh, not an automatic verdict. Note what the excess consists of.
- **Contradiction** — read both rules' actual content and name the specific scenario where their directives collide. A shared topic is not a contradiction.
- **Currency** — verify referenced file paths against the actual filesystem, not from memory.

**Done when:** every rule file has been checked against every principle, and every rule file appears in either the Findings table or the Rules That Are Fine section. No file unaccounted for.

## Phase 3: Deliverable

Write `RULE_AUDIT.md` at repo root:

- **Executive summary** — max 10 bullets, ranked by what would most confuse Cursor if left unfixed.
- **Findings table** — `ID | File | Principle violated | Description | Recommendation`. Cite the specific line or section for every finding.
- **Contradictions found** — separate section; each entry names both rules and the specific conflicting scenario.
- **Rules that are fine** — required. If empty, you didn't look hard enough.
- **Open questions** — anything you couldn't tell was a real problem vs. intentional.

## Rules

- If `rule-authoring.mdc` itself has a problem, note it as a separate finding rather than silently working around it.
- Don't recommend consolidating rules just because they share a topic — check whether they cover genuinely different concerns first.
- Do not fix rule files — this skill produces the audit artifact only.

## Repeat-run mode

If `RULE_AUDIT.md` already exists, read it first. Mark resolved findings `RESOLVED`, update stale ones, tag new findings `NEW`.
