# Grading

Every finding carries a severity, and the severity **is** its disposition.

- **blocker** — fix before close-out. A violation of a documented standard (`AGENTS.md` § Hard constraints, any `.cursor/rules/*.mdc`), or a spec requirement that is missing, partial, or wrong.
- **debt** — merge-able, never silently dropped. Before close-out each debt finding is either **fixed** or **declared**: a `// debt:` marker at the finding's cited site, naming the ceiling and the upgrade path (`code-minimalism.mdc`). `audit-tech-debt` harvests markers from code — do not write to `TECH_DEBT_AUDIT.md`, and do not open a separate ledger.
- **nit** — no action.

Baseline smells max out at **debt**. They are judgement calls; only a documented standard produces a blocker.

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

**Defects carry no severity and feed no verdict.** A **spec defect** grades the PRD; a **standard defect** grades a rule. Neither grades the diff. Report them separately; they gate close-out on their own, and never take a `// debt:` marker — markers are harvested from code, and a wrong document is not a tradeoff to declare.

## Close-out gate

`mark-epic-complete` may run only when all three hold:

1. Zero blockers on both axes.
2. Every debt finding fixed, or carrying a `// debt:` marker at its cited site.
3. Zero open defects — each spec defect resolved by a PRD edit or an explicit decision from the user; each standard defect resolved by a rule edit.
