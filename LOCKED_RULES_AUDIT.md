# Locked Rules Reference Audit

**Date:** 2026-07-03  
**Scope:** Entire repo — `.cursor/` (rules, skills, plans), `docs/` (including `docs/claude-skills/` bundle contents), and all root-level `.md` files.

**Search patterns (case-insensitive):** `LOCKED_RULES.md`, `LOCKED_RULES`, `locked rule`, `locked rules`, `locked-rule`, `locked-rules`

**Results:** 154 hits across 45 files.

**Zero hits:** `src/`, `docs/prds/`, `docs/claude-skills/` (all 5 `.skill` bundles searched).

---

## Root (`/`)

| File                | Line | Usage                                                                                         |
| ------------------- | ---- | --------------------------------------------------------------------------------------------- |
| `AGENTS.md`         | 3    | Purpose blurb — mentions locked-rule governance                                               |
| `AGENTS.md`         | 36   | Skills table — `pre-release-review` includes locked-rule check                                |
| `AGENTS.md`         | 89   | Section heading — `## Locked rules` (pointer section, not full text)                          |
| `AGENTS.md`         | 91   | **Canonical pointer** — rule text lives in `LOCKED_RULES.md`; consumption in `.cursor/rules/` |
| `AGENTS.md`         | 93   | **Change-protocol anchor** — edits require PM approval; edit text in `LOCKED_RULES.md`        |
| `AGENTS.md`         | 101  | Implemented-now summary — doc layer includes locked-rule text in `LOCKED_RULES.md`            |
| `AGENTS.md`         | 186  | Where-things-live table — `LOCKED_RULES.md` as canonical locked-rule text                     |
| `AGENTS.md`         | 225  | **Change-protocol table row** — routing for text-only vs code-conformance locked-rule edits   |
| `AGENTS.md`         | 230  | Change-protocol footer — `/sync-repo-docs` mirror-only for locked-rule changes                |
| `DESIGN.md`         | 3    | Purpose — cross-ref to AGENTS for locked rules                                                |
| `DESIGN.md`         | 15   | Doc map table — AGENTS holds locked rules (semantic tokens, structure/theme)                  |
| `DESIGN.md`         | 160  | Cross-ref — full locked-rule wording via AGENTS › Locked rules (stale vs current split)       |
| `DESIGN.md`         | 209  | Related docs link — AGENTS locked rules                                                       |
| `LEXICON.md`        | 7    | Discipline — `LOCKED_RULES.md` named as canonical home for rule wording                       |
| `LEXICON.md`        | 17   | Lexicon entry — primitive-first UI labeled "Locked rule"; points to `ui-shadcn.mdc`           |
| `LEXICON.md`        | 25   | Lexicon entry — structure/theme split labeled "locked rule"; points to DESIGN.md              |
| `LEXICON.md`        | 29   | Lexicon entry — auth boundary as locked-rule change; points to `LOCKED_RULES.md`              |
| `LEXICON.md`        | 37   | Lexicon entry — admin gate paraphrased as locked rule; points to `LOCKED_RULES.md`            |
| `LOCKED_RULES.md`   | 1    | **Self-title** — `# LOCKED_RULES — Canonical locked-rule text`                                |
| `LOCKED_RULES.md`   | 3    | Purpose — owns authoritative locked-rule wording; change protocol in AGENTS                   |
| `LOCKED_RULES.md`   | 9    | Section heading — `## Locked rules` (canonical rule bullets follow)                           |
| `README.md`         | 200  | Doc map table — `LOCKED_RULES.md` role/description                                            |
| `README.md`         | 203  | Doc map table — AGENTS described as including locked rules                                    |
| `RULE_AUDIT.md`     | 6    | Audit scope — rules cross-checked against `LOCKED_RULES.md`                                   |
| `RULE_AUDIT.md`     | 34   | Finding RA-009 — `ui-styling.mdc` duplicates `LOCKED_RULES.md` content                        |
| `RULE_AUDIT.md`     | 35   | Finding RA-010 — `ui-accessibility.mdc` restates `LOCKED_RULES.md` WCAG blocks                |
| `SECURITY_AUDIT.md` | 141  | Clean finding — admin gates/RLS align with AGENTS.md locked rules                             |

---

## `docs/`

| File                     | Line | Usage                                                                                             |
| ------------------------ | ---- | ------------------------------------------------------------------------------------------------- |
| `docs/DOC_RULES.md`      | 18   | Doc roles table — AGENTS includes locked-rule change protocol                                     |
| `docs/DOC_RULES.md`      | 19   | Doc roles table — `LOCKED_RULES.md` as authoritative locked-rule text                             |
| `docs/DOC_RULES.md`      | 63   | File-management rule #4 — locked rules canonical in `LOCKED_RULES.md`                             |
| `docs/DOC_RULES.md`      | 65   | File-management rule #5 — locked-rule changes via AGENTS change protocol; sync skills mirror-only |
| `docs/WORKFLOW_GUIDE.md` | 42   | Doc map — `LOCKED_RULES.md` as non-negotiable constraints                                         |
| `docs/WORKFLOW_GUIDE.md` | 86   | Initialize-project inherit list — `LOCKED_RULES.md` unchanged on spinoff                          |
| `docs/WORKFLOW_GUIDE.md` | 99   | Phase-planning input — Claude reads `LOCKED_RULES` during decomposition                           |
| `docs/WORKFLOW_GUIDE.md` | 170  | Lexicon subsection heading — `### Locked rule`                                                    |
| `docs/WORKFLOW_GUIDE.md` | 171  | **Definition** — lives in `LOCKED_RULES.md`; change via AGENTS protocol; plan-review blocking     |

### `docs/adr/`

| File                                             | Line | Usage                                                            |
| ------------------------------------------------ | ---- | ---------------------------------------------------------------- |
| `docs/adr/ADR-0001-component-sizing-by-depth.md` | 5    | Historical context — 150-line cap removed from `LOCKED_RULES.md` |

### `docs/archive/`

| File                              | Line | Usage                                                                    |
| --------------------------------- | ---- | ------------------------------------------------------------------------ |
| `docs/archive/CONTEXT_ARCHIVE.md` | 65   | Shipped checklist — admin gate locked rule (historical CLI-only wording) |
| `docs/archive/CONTEXT_ARCHIVE.md` | 133  | Shipped checklist — locked-rule update for in-app promote/demote         |
| `docs/archive/CONTEXT_ARCHIVE.md` | 215  | Changelog — admin gate locked rule expanded                              |
| `docs/archive/CONTEXT_ARCHIVE.md` | 221  | Design note — no `profiles.role` per locked rule                         |

### `docs/claude-skills/`

**No matches** in `kickoff-grilling.skill`, `phase-planning.skill`, `plan-review.skill`, `lexicon-update.skill`, or `writing-great-skills.skill`.

---

## `.cursor/agents/`

| File                                 | Line | Usage                                                     |
| ------------------------------------ | ---- | --------------------------------------------------------- |
| `.cursor/agents/refactor-cleaner.md` | 23   | Guardrail — read AGENTS locked rules before removing code |
| `.cursor/agents/refactor-cleaner.md` | 40   | Out-of-scope — changes violating AGENTS locked rules      |
| `.cursor/agents/refactor-cleaner.md` | 64   | Workflow step — read AGENTS locked rules                  |
| `.cursor/agents/refactor-cleaner.md` | 110  | Checklist — must not violate AGENTS locked rules          |

---

## `.cursor/rules/`

| File                           | Line | Usage                                                            |
| ------------------------------ | ---- | ---------------------------------------------------------------- |
| `.cursor/rules/README.md`      | 13   | Intro — locked principles live in `LOCKED_RULES.md`              |
| `.cursor/rules/README.md`      | 191  | Related docs link — `LOCKED_RULES.md` canonical text             |
| `.cursor/rules/ui-styling.mdc` | 14   | Consumption rule — semantic CSS variables; see `LOCKED_RULES.md` |

### `.cursor/rules/*.mdc` — restate vs pointer

| File                          | Explicit `LOCKED_RULES` ref? | Restatement                                                                                                                                                                                                                                                                           |
| ----------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`ui-styling.mdc`**          | Yes (line 14)                | **Hybrid:** line 14 points to `LOCKED_RULES.md` and paraphrases the semantic-tokens rule inline. Additional sections (mobile-first, responsive/dark-mode examples, best-practices checklist — per `RULE_AUDIT.md` RA-009) paraphrase locked-rule content **without** citing the file. |
| **All other 26 `.mdc` files** | No search-term hits          | No explicit locked-rules reference in searchable text                                                                                                                                                                                                                                 |

**Note:** `ui-accessibility.mdc` has **no** search-term hits but `RULE_AUDIT.md` (RA-010) flags WCAG/tutorial blocks as paraphrasing `LOCKED_RULES.md` accessibility bullets.

---

## `.cursor/skills/`

| File                            | Line | Usage                                                                                                 |
| ------------------------------- | ---- | ----------------------------------------------------------------------------------------------------- |
| `initialize-project/SKILL.md`   | 73   | Inherit list — `LOCKED_RULES.md` kept unchanged on spinoff                                            |
| `lexicon-audit/SKILL.md`        | 22   | Input contract — read `LOCKED_RULES.md`                                                               |
| `plan-next-epic/SKILL.md`       | 17   | Input contract — AGENTS includes locked rules                                                         |
| `pre-release-review/SKILL.md`   | 5    | Frontmatter — checks locked rules from AGENTS                                                         |
| `pre-release-review/SKILL.md`   | 25   | Checklist step 5 — project locked rules                                                               |
| `pre-release-review/SKILL.md`   | 66   | Security step — read AGENTS auth/RLS locked rules                                                     |
| `pre-release-review/SKILL.md`   | 72   | RLS check — scope must match AGENTS locked rules                                                      |
| `pre-release-review/SKILL.md`   | 87   | Step 5 heading — project locked rules                                                                 |
| `pre-release-review/SKILL.md`   | 89   | Step 5 body — read AGENTS **Locked rules** section (points to AGENTS, not `LOCKED_RULES.md` directly) |
| `pre-release-review/SKILL.md`   | 96   | Fallback — skip if no locked rules section documented                                                 |
| `refactor-cleaner/SKILL.md`     | 50   | Pre-flight — read AGENTS locked rules                                                                 |
| `rule-audit/SKILL.md`           | 29   | Input contract — read `LOCKED_RULES.md`                                                               |
| `rule-audit/SKILL.md`           | 34   | Overlap check — cross-check rules against `LOCKED_RULES.md`                                           |
| `rule-authoring/SKILL.md`       | 67   | Overlap principle — spans AGENTS + `LOCKED_RULES.md`                                                  |
| `rule-authoring/SKILL.md`       | 124  | Checklist — overlap with `LOCKED_RULES.md`                                                            |
| `security-audit/SKILL.md`       | 29   | Input contract — AGENTS locked rules (auth/RLS/admin)                                                 |
| `security-audit/SKILL.md`       | 59   | Methodology — pattern may be required by a locked rule                                                |
| `security-audit/SKILL.md`       | 98   | Discipline — read relevant locked rules before judging                                                |
| `security-audit/SKILL.md`       | 111  | Guardrail — don't treat locked rules as findings                                                      |
| `sync-repo-docs/SKILL.md`       | 32   | Workflow — locked rules mirror-only per change protocol                                               |
| `sync-repo-docs/SKILL.md`       | 64   | Drift trigger — auth boundary changed but not in locked rules                                         |
| `sync-repo-docs/SKILL.md`       | 72   | Routing table — locked rules belong in AGENTS.md                                                      |
| `sync-repo-docs/SKILL.md`       | 83   | Edit rule — mirror locked-rule change; never initiate                                                 |
| `sync-repo-docs/SKILL.md`       | 96   | Post-edit note — proposing locked-rule changes                                                        |
| `sync-repo-docs/SKILL.md`       | 121  | Report template — locked-rule drift slot                                                              |
| `sync-repo-docs/SKILL.md`       | 133  | Anti-pattern — never initiate locked-rule changes                                                     |
| `sync-repo-docs/reference.md`   | 13   | Mirror-only routing for locked rules                                                                  |
| `sync-repo-docs/reference.md`   | 39   | Checklist — AGENTS locked rules › auth                                                                |
| `sync-repo-docs/reference.md`   | 47   | Checklist — AGENTS locked rules › RLS                                                                 |
| `sync-repo-docs/reference.md`   | 68   | Scenario — mirror locked-rule auth change                                                             |
| `sync-repo-docs/reference.md`   | 73   | Scenario — mirror any locked-rule change                                                              |
| `sync-repo-docs/reference.md`   | 101  | Scenario skip — no locked-rule change                                                                 |
| `sync-repo-docs/reference.md`   | 111  | Scenario — RLS locked rule if novel ownership                                                         |
| `sync-tech-debt-audit/SKILL.md` | 122  | False-positive bucket — code matching locked rules                                                    |
| `tech-debt-audit/SKILL.md`      | 38   | Guardrail — don't flag AGENTS locked rules as debt                                                    |

---

## Cross-cutting observations

1. **Canonical text home:** `LOCKED_RULES.md` is the stated owner of rule **text**; `AGENTS.md` owns **governance** (change protocol, mirror-only sync). Many older references still say "AGENTS.md Locked rules" for the rule bullets themselves — notably `DESIGN.md` (line 160), `pre-release-review`, `security-audit`, and several skills.

2. **Only one `.mdc` explicit hit:** `ui-styling.mdc` line 14. Per `RULE_AUDIT.md`, both `ui-styling.mdc` and `ui-accessibility.mdc` **paraphrase** locked-rule content beyond that pointer.

3. **No product-code references:** zero hits under `src/`.

4. **Claude skills bundle:** `docs/claude-skills/` is silent on locked rules — planning/review vocabulary there may rely on repo-root docs at runtime instead.
