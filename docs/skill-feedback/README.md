# Skill Feedback

Per-skill logs of what a skill got wrong on a given run, captured so that one-off corrections accumulate into a dataset worth mining. A single audit finding is noise; a hundred of them, tagged and dated, show where a skill actually needs to change.

## Naming

One file per **target** skill — the skill being improved, not the one doing the reviewing. When `code-review-review` audits `code-review`, its findings land in `code-review.md`, because the feedback is about `code-review`'s behaviour. The auditor's name never appears in a filename.

## Ownership

These logs are **written only by the `collect-skill-feedback` skill**, append-only — the same discipline the audit files (`TECH_DEBT_AUDIT.md`, `SECURITY_AUDIT.md`, and the rest) follow: a machine-owned ledger, not a hand-edited one. Don't edit entries by hand during normal flow; a correction you make manually is a correction the next run can't see.

They are **read** by whoever revises a skill later — a human doing analysis, or a future absorb step that reads a log and proposes changes to the target skill's `SKILL.md`.

## The gap-vs-slip tag

Every entry is tagged **gap** or **slip**, and the distinction is the whole point of the log:

- **gap** — the miss traces to what the target skill's `SKILL.md` does or doesn't say. Revising the skill would prevent it. This is signal.
- **slip** — the skill's guidance was adequate; the model just didn't follow it that run. Revising the skill wouldn't help. This is noise.

Without this tag, a revision step patches every miss into the skill, including the slips — bloating it with instructions that fix nothing. The tag is what lets later analysis weight gaps and ignore slips.

## Entry format

Entries are written by `collect-skill-feedback`, which owns the exact format. Illustrative only:

```
## 2026-02-14 — epic 11.3
- **mis-grade** · gap — a session-touching finding was graded debt; the four-question test wasn't applied
- **false-citation** · slip — cited ui-styling.mdc for a rule it doesn't contain; rule lookup was skipped
```

A run the audit found clean gets a one-line `clean — no issues` entry, so the log records a rate, not only failures.
