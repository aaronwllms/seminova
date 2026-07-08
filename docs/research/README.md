# Research briefs

A **research brief** captures exploratory findings before they become build
scope (PRD), immutable decisions (ADR), or planning commitments. This directory
is *revisable working knowledge* — not shipped truth. Placement in the doc
stack is defined in [DOC_RULES.md › Document roles](../DOC_RULES.md#document-roles).

## When to write one

Write a brief when the question is **durable** — likely to be referenced again
by phase planning, epic work, or later agent sessions. Skip the file for
one-off chat answers or throwaway lookups.

Good candidates: competitive landscape, technical option comparisons, codebase
investigations that inform upcoming epics, product questions that need evidence
before a PRD section is written.

## Staleness

Each brief carries `**Researched:** YYYY-MM-DD`. A brief is **stale** when that
date is more than **six months** old.

> [!IMPORTANT]
> There is no status field. Readers and the
> [`/research`](../../.cursor/skills/research/SKILL.md) skill refresh stale
> briefs **in place** on use — bump the date, update findings, and keep the
> same filename.

## Format

Each file follows this shape:

```markdown
# RESEARCH-NNNN: Short title

**Researched:** YYYY-MM-DD

**Type:** product | technical | competitive | codebase

## Question

What we needed to learn.

## Scope and constraints

What was in/out of scope for this investigation.

## Findings

What we learned — evidence-backed, concise.

## Options compared

When applicable — table or bullets comparing alternatives.

## Recommendation

Optional — a suggested direction, not a committed decision.

## Open questions

What remains unresolved.

## Sources

Links, docs, files consulted.

## Related

Optional links to ROADMAP open questions, PRD sections, ADRs.
```

## Numbering & filenames

- Next sequential number, zero-padded to four digits (`0001`, `0002`, …).
- Filename: `RESEARCH-NNNN-short-slug.md` (e.g. `RESEARCH-0001-auth-provider-options.md`).

## Cross-references

| When findings become… | Write to… |
| --------------------- | --------- |
| A committed architectural decision | [docs/adr/](../adr/) — see [adr/README.md](../adr/README.md) |
| Build scope for a phase | Active PRD in [docs/prds/](../prds/) |
| A planning horizon question | [ROADMAP.md › Open questions](../../ROADMAP.md#open-questions--deferred-decisions) (optional link from brief) |

## Spinoffs

The `docs/research/` directory ships with this README only. `RESEARCH-*.md`
files are project-specific — spinoffs inherit the mechanism, not Seminova's
briefs. `initialize-project` clears `RESEARCH-*.md` while preserving this
README.
