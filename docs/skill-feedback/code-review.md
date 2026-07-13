# code-review — skill feedback

Per-run audit findings from `code-review-review`. Append-only, machine-owned (see [README.md](README.md)).

## 2026-07-13 — epic 11.5
- **rubric-error** · slip — close-out note claimed a11y debt is marker-ineligible and must be fixed before mark-epic-complete; grading.md limits marker-ineligibility to credentials/tokens/sessions/auth-boundary, so the a11y debt was markable and the gate could hold. Guidance is explicit; an extra ineligibility class was invented against it.
- **rubric-error** · gap — labeled the "eight vs seven nodes" discrepancy a spec defect though the PRD fixes no count (plan said eight, mockup/code seven, code followed the authoritative mockup). grading.md's defect taxonomy has no slot for plan/authority drift the code resolved correctly, so the nearest-wrong bucket was chosen.
