# Grading

Every finding carries a severity, and the severity **is** its disposition.

Severity is set by **what the finding breaks**, not by which document it violates. Name the consequence, then read the label off the ladder.

- **blocker** — fix before close-out. Breaks behaviour at runtime, mishandles credentials or auth, violates `AGENTS.md` § Hard constraints, or leaves a spec or plan requirement missing, or implemented so the user-visible outcome differs from what was specified.
- **debt** — merge-able, never silently dropped. Violates a documented convention (`.cursor/rules/*.mdc`), or diverges from the spec or plan, with no runtime or user-visible consequence. Before close-out each debt finding is either **fixed** or **declared**: a `// debt:` marker at the finding's cited site, naming the ceiling and the upgrade path (`code-minimalism.mdc`). `audit-tech-debt` harvests markers from code — do not write to `TECH_DEBT_AUDIT.md`, and do not open a separate ledger.
- **nit** — no action. Cosmetic only.

Baseline smells max out at **debt**. They are judgement calls.

**A count is never a reason.** Grade each finding on its own consequence before you look at the set. Five blockers is a legitimate verdict; a long report is a legitimate report. Never soften a severity because the total would read as severe, and never pick the verdict first and fit the findings to it.

**Pre-existing never lowers a severity.** Seminova is a template — every pattern in it is inherited by each spinoff, so a pre-existing pattern carried into new code is amplified, not excused. Grade the pattern, not its novelty.

## Verdict

The verdict is a function of the worst finding, not a separate assessment:

| Worst finding | Verdict           |
| ------------- | ----------------- |
| any blocker   | **BLOCKED**       |
| else any debt | **PASS WITH DEBT**|
| else          | **PASS**          |

Each axis derives its own verdict from its own findings. Never rank findings across axes.

**Every finding carries an explicit severity label.** A section written into cannot report zero findings — if you listed something, grade it, and let the ladder move the verdict.

## Defects

**Defects carry no severity and feed no verdict.** A **spec defect** grades the PRD; a **standard defect** grades a rule. Neither grades the diff. Report them separately; they never take a `// debt:` marker — markers are harvested from code, and a wrong document is not a tradeoff to declare.

**Sort by fault, not by fix.** A rule made stale *by* a legitimate change is a defect — the code was right to move, and the rule must follow. A rule the diff was *obligated* to update and didn't — a glob it must match or extend, a registry it must join — is a **violation** of that rule, graded on the ladder. Both are remedied by a rule edit; the remedy never decides which it is.

A story built by the epic under review is **spent**: the code is now the truth, and the story text steers nothing further. Resolve a spec defect in a spent story by reporting it for the user's decision. Do not propose a PRD edit.

A story in a later epic is **live** — Cursor will read it before building it. A spec defect there requires a PRD edit before that story is planned.

A standard defect is always live, because a rule steers every later build. Resolve it by a rule edit.

## Close-out gate

`mark-epic-complete` may run only when all three hold:

1. Zero blockers on both axes.
2. Every debt finding fixed, or carrying a `// debt:` marker at its cited site.
3. Zero open defects — each resolved as § Defects prescribes.
