---
name: rule-authoring
disable-model-invocation: true
description: >-
  The standard for .cursor/rules/*.mdc files — size budgets, signal-to-noise,
  ownership, activation modes, and the pre-creation/pre-example checklists.
  rule-audit reads this in full each run; the rule-authoring-pointer.mdc
  stub triggers it on ordinary rule edits.
---

# Rule Authoring

`.cursor/rules/` is loaded selectively — by glob, or by the agent judging
relevance — and the context budget is shared across everything loaded at
once, so signal density matters more here than readability for its own sake.
Unlike Claude-side skills, which must stay portable across projects, these
rules intentionally favor project-specific content — that's a deliberate
scope difference, not an oversight.

## Size budgets

- **Always Apply** (`alwaysApply: true`): budget the **set**, not the file.
  All always-apply rules combined: ~800 words (~1,000 tokens) max — this
  cost is paid on every request. Any single file over ~200 words must
  justify why its content earns always-on placement instead of a scoped
  mode.
- **Everything else** (Auto Attached, Agent Requested, Manual): **300 lines
  is an inspect trigger, not a violation** — crossing it prompts a check
  that every section is high-signal, project-specific, and singly owned.
  500 lines is the hard ceiling. Cost here is paid only when the rule
  loads, so relevance density matters more than raw length.

These numbers are our own calibration — Cursor's docs prescribe no size
limits, and community guidance varies (~150–200 words always-apply;
300–500 line ceilings). The mechanically grounded constraint is token cost;
length alone has not been shown to reduce rule compliance.

## Signal-to-noise

**Keep:** project-specific patterns and configs, unique setup/workflow
requirements, safety protocols, anti-pattern warnings stated as principles,
file paths to reference implementations, version numbers where behavior is
version-dependent (e.g. "TanStack Query v5", "Next.js 16 App Router").

**Cut:** verbose code examples of common patterns, tutorial walkthroughs,
anything already covered in another rule file, "good vs bad" comparison
blocks, generic programming advice the agent already knows. Showing 3+
similar examples means you're teaching, not guiding — collapse to one
principle statement plus at most one example.

Point at a real file over writing a code block: reference an existing
implementation instead of demonstrating the pattern inline — it stays DRY
and current with the codebase. Every path a rule cites must exist and still
match the described pattern; a rule citing a moved, renamed, or deleted file
is stale and needs fixing, not left alone. Prefer stable locations (a
directory, a well-established file) over files likely to churn.

Document **why**, not just what — for project-specific anti-patterns only.
Generic anti-patterns (N+1 queries) don't need justification; "avoid Edge
Functions to prevent vendor lock-in" does, because the reason is local to
this project.

## Single ownership

Each concern has exactly one primary-owner file; every other rule
cross-references it rather than repeating it ("See `error-handling.mdc` for
retry patterns"). The overlap check spans `AGENTS.md` and `LOCKED_RULES.md`
too — a rule restating something already governed there is the same
single-source-of-truth violation, just outside this directory.

| Concern | Owner | Secondary mentions |
|---|---|---|
| Security threats | `security.mdc` | Cross-ref from `api-development.mdc` |
| API structure | `api-development.mdc` | Cross-ref from `security.mdc` |
| Supabase tools | `supabase.mdc` | Cross-ref from `security.mdc` |
| Test writing | `testing.mdc` | Security testing lives in `security.mdc` |
| Error patterns | `error-handling.mdc` | Cross-ref from everywhere |

*This table is the highest-churn content in this file — it hardcodes
filenames that can be renamed or split. Verify it against the actual
directory listing during the quarterly maintenance pass, not from memory.*

## Activation modes

Frontmatter has exactly three real keys: `description`, `globs`,
`alwaysApply`. Any other key (e.g. `autoAttach`) is silently ignored — the
rule still resolves from these three alone. A rule using an invalid key
needs auditing against its actual field values to find its real mode.

- **Always Apply** — `alwaysApply: true`. Loads every request.
- **Auto Attached** — `alwaysApply: false` + globs set. Loads when an
  open/edited file matches a glob. Use a YAML list, not brace expansion —
  `src/**/*.{ts,tsx}` can fail to match silently; write `.ts` and `.tsx` as
  separate list entries.
- **Agent Requested** — `alwaysApply: false`, no globs, a specific detailed
  `description`. The agent decides at runtime whether it's relevant. This is
  a normal working mode, not degraded — third-party linters routinely
  misflag these as "unreachable"; they're only actually broken if the
  description is missing or too vague to match on ("helpful guidelines for
  X" is effectively unreachable — write what it's actually for).
- **Manual** — no globs, no meaningful description. Loads only via explicit
  `@rule-name`.

In each rule's frontmatter, document *why* its globs trigger it — helps
future maintainers judge applicability at a glance.

## Rule hierarchy

When rules conflict: project-specific > general best practice; security >
performance; explicit requirement > implicit convention. Document
exceptions with reasoning inline.

## Deprecation

Mark retired patterns `⚠️ DEPRECATED (YYYY-MM)` with a migration path to the
replacement. Remove once all code has migrated — don't let deprecated
guidance accumulate as sediment.

## Creating a new rule

See [`TEMPLATE.md`](TEMPLATE.md) for the structure to follow, then work
through this checklist:

- [ ] Overlap with an existing rule, `AGENTS.md`, or `LOCKED_RULES.md`?
      Cross-reference instead of duplicating.
- [ ] Project-specific, or generic best practice the agent already knows?
- [ ] Scope focused enough for the size budget above?
- [ ] Glob patterns identified, and does `alwaysApply` actually match the
      intended reach?
- [ ] Which activation mode does this resolve to (see Activation modes
      above)? If Agent Requested, is the description specific enough to
      match on?
- [ ] If Manual, confirm that's intentional, not an oversight.
- [ ] Does this rule's directive conflict with another's in any scenario —
      even where the topics don't overlap enough to trip the duplication
      check?
- [ ] Does it contradict itself anywhere in its own body?

**Before adding a code example:** is the pattern unique to this project?
Could a file reference replace it? Does showing code add value over
describing the principle? Will it still be accurate as the code evolves?

## Consolidating an oversized rule (past the inspect trigger)

1. Measure the current line count.
2. Find verbose multi-line code blocks; convert to principle statements.
3. Remove anything redundant with another rule file.
4. Preserve unique project-specific patterns.
5. Target back within the size budget above.
6. Verify no valuable guidance was lost in the cut.

## Maintenance

Quarterly: check for outdated patterns, redundancy across files, stale
version numbers, glob patterns that no longer match the codebase, and
deprecated guidance whose migration is complete — including the ownership
table above. When refactoring code that a rule documents, update the rule
in the same pass — don't let it drift.
