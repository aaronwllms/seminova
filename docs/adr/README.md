# Architecture Decision Records

An **ADR** (Architecture Decision Record) captures a single architectural
decision: what was decided and the trade-off accepted. This directory is
decision *history* — a log, not mutable state.

## When to write one

Write an ADR only when **all three** hold:

1. **Hard to reverse** — unwinding it later would be costly or disruptive.
2. **Surprising without context** — a reasonable engineer would otherwise
   wonder "why was it done this way?"
3. **Real trade-off** — a genuine cost was accepted, not a free win.

If any one is missing, don't write an ADR. Most decisions don't need one.

## Format

Keep it to **1–3 sentences**: the decision and the trade-off accepted.
Don't pad with background, alternatives, or restated context.

## Numbering & filenames

- Next sequential number, zero-padded to four digits (`0001`, `0002`, …).
- Filename: `ADR-NNNN-short-slug.md` (e.g. `ADR-0001-component-sizing-by-depth.md`).

## Immutability — never edit a past ADR

An accepted ADR is **immutable**. When a decision changes, you do **not**
edit the old record — you write a **new** ADR that supersedes it, and mark
the old one `Superseded by ADR-NNNN`. The only edit ever made to an existing
ADR is adding that superseded marker. This applies to humans and agents
alike: the record is history, and history is not rewritten.
