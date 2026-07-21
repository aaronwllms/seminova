# Architecture Decision Records

An **ADR** (Architecture Decision Record) captures a single architectural
decision: what was decided and the trade-off accepted. This directory is
decision *history* — a log, not mutable state. Placement in the doc stack is
defined in [DOC_RULES.md › Document roles](../DOC_RULES.md#document-roles).

## When to write one

Write an ADR only when **all three** hold (same bar as
[DOC_RULES.md › Write discipline](../DOC_RULES.md#write-discipline), rule 7):

1. **Hard to reverse** — unwinding it later would be costly or disruptive.
2. **Surprising without context** — a reasonable engineer would otherwise
   wonder "why was it done this way?"
3. **Real trade-off** — a genuine cost was accepted, not a free win.

If any one is missing, don't write an ADR. Most decisions don't need one.

## Format

Keep it **decision-first and short** — state what was decided and the
trade-off accepted. Add context only when a reader needs it to understand
*why* the trade-off was worth it; don't pad with background, alternatives, or
restated context. One paragraph is fine; several are fine when the surprise
or trade-off isn't obvious without setup. See
[ADR-0001](ADR-0001-component-sizing-by-depth.md) for a tight example and
[ADR-0003](ADR-0003-no-refresh-in-rsc-auth-reads.md) for one that carries
more context.

Each file follows this shape:

```markdown
# ADR-NNNN: Short title

**Status:** Accepted

[Decision and trade-off — as many sentences or paragraphs as the bar above
requires.]
```

## Numbering & filenames

- Next sequential number, zero-padded to four digits (`0001`, `0002`, …).
- Filename: `ADR-NNNN-short-slug.md` (e.g. `ADR-0001-component-sizing-by-depth.md`).

**Rename note:** `ADR-0005` was renamed from `ADR-0005-proxy-as-sole-session-authority.md` to [`ADR-0005-proxy-session-gate-two-authority-refresh.md`](ADR-0005-proxy-session-gate-two-authority-refresh.md) when Phase 13 amended the decision to a two-authority refresh model. Same record number and decision history — filename only.

## Immutability — never edit a past ADR

> [!IMPORTANT]
> An accepted ADR is **immutable**. When a decision changes, you do **not**
> edit the old record — you write a **new** ADR that supersedes it, and set
> the old file's `**Status:**` to `Superseded by ADR-NNNN`. The only edit
> ever made to an existing ADR is that status change. This applies to humans
> and agents alike: the record is history, and history is not rewritten.

One exception: formatting or rendering repairs that don't alter the decision
content (e.g. fixing a markdown artifact that breaks display) are permitted —
immutability protects what was decided, not rendering accidents.
