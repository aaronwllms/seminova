---
name: rule-authoring
disable-model-invocation: true
description: >-
  Standard for authoring `.cursor/rules/*.mdc` files — size budgets,
  signal-to-noise, ownership, activation modes, and checklists.
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
- Accepted exception: the current Always Apply set runs ~12 words over budget;
  code-minimalism.mdc's always-on placement is justified as the project's core
  ethos rule. Do not re-flag unless the set grows further.
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

**The no-op test** — a **no-op** is a line the agent already obeys by
default, so you pay context cost to say nothing. The test: does the line
change behaviour versus the default? Run it on every sentence in
isolation; when one fails, delete the whole sentence rather than trim
words from it. A line can be project-specific and true and still fail —
"be thoughtful about RLS policies" changes no behaviour; "every table gets
an RLS policy in the same migration that creates it" does. The Keep/Cut
lists below are the common instances.

**Keep:** project-specific patterns and configs, unique setup/workflow
requirements, safety protocols, anti-pattern warnings stated as principles,
file paths to reference implementations, version numbers where behavior is
version-dependent (e.g. "TanStack Query v5", "Next.js 16 App Router").

**Cut:** verbose code examples of common patterns, tutorial walkthroughs,
anything already covered in another rule file, "good vs bad" comparison
blocks, generic programming advice the agent already knows. Showing 3+
similar examples means you're teaching, not guiding — collapse to one
principle statement plus at most one example.

### Canonical shapes vs file references

**Canonical shapes** — small inline blocks (types, envelopes, call signatures)
that define a **contract** agents must reproduce. Belong in the **primary-owner**
rule when the pattern is project-specific and easy to get wrong.

**File references** — point at one stable implementation for everything else
(hook wiring, component composition, test layout). Prefer utilities and shared
primitives over feature-specific paths.

**Repo-truth catalogs** — lists of what is shipped (routes, forms, migrations,
test files, production tables) belong in **AGENTS.md**, not rules. A rule may
cite **at most one** canonical reference per pattern; do not inventory every
consumer.

**The grep test** — if the agent could discover the same information with one
grep, do not catalog it in a rule.

**Enforcement allowlists** — tables listing every exempt lint or console call
site duplicate `eslint.config.mjs`, check scripts, or test fixtures. State
the principle and point at the enforcement file; do not inventory every path
in the rule.

Point at a real file over writing a code block for implementation detail —
see Canonical shapes vs file references above for when inline blocks belong.
Reference an existing implementation instead of demonstrating wiring inline —
it stays DRY and current with the codebase. Every path a rule cites must exist
and still match the described pattern; a rule citing a moved, renamed, or deleted
file is stale and needs fixing, not left alone. Prefer stable locations (a
directory, a well-established file) over files likely to churn.

Document **why**, not just what — for project-specific anti-patterns only.
Generic anti-patterns (N+1 queries) don't need justification; "avoid Edge
Functions to prevent vendor lock-in" does, because the reason is local to
this project.

## Leading words

A **leading word** is a compact pretrained concept the agent thinks with
while applying the rule — one word that carries what a sentence would
otherwise spell out. Two uses:

- **Collapse restatements.** A quality restated across a rule ("fast,
  deterministic, low-overhead") collapses into one pretrained word (a
  _tight_ loop). Assume every rule is carrying restatements that leading
  words retire — go find them.
- **Put the operative word first.** "Never commit directly to `main`", not
  "It's important to remember that committing directly to `main` should be
  avoided." The first word should signal whether the line is a command, a
  prohibition, or context.

A weak leading word is itself a **no-op** (_be thorough_ when the agent is
already thorough-ish); the fix is a stronger word (_relentless_), not a
different technique.

## Single ownership

This is the **single source of truth** principle applied to the rules
directory — each meaning lives in one authoritative place, so changing the
behaviour is a one-place edit; the same meaning in more than one place is
**duplication**.

Each concern has exactly one primary-owner file; every other rule
cross-references it rather than repeating it ("See `error-handling.mdc` for
retry patterns"). The overlap check spans `AGENTS.md` § Hard constraints
too — a rule restating something already governed there is the same
single-source-of-truth violation, just outside this directory. Hard-constraint
text lives in AGENTS.md plus its enforcement code; `.mdc` files carry guidance.

| Concern | Owner | Secondary mentions |
|---|---|---|
| Security threats | `security.mdc` | Cross-ref from `api-development.mdc` |
| API structure | `api-development.mdc` | Cross-ref from `security.mdc` |
| Supabase tools | `supabase.mdc` | Cross-ref from `security.mdc` |
| Test writing | `testing.mdc` | Security testing lives in `security.mdc` |
| Error patterns | `error-handling.mdc` | Cross-ref from everywhere |
| Forms stack & save model | `forms.mdc` | Cross-ref from `notifications.mdc`, `error-handling.mdc` |
| Toast / feedback routing | `notifications.mdc` | Cross-ref from `forms.mdc`, `error-handling.mdc` |
| TanStack Query patterns | `react-tanstack-query.mdc` | Cross-ref from `nextjs.mdc` |
| Data table conventions | `data-tables.mdc` | — |
| Logging wrappers & levels | `logging.mdc` | Cross-ref from `error-handling.mdc`, `security.mdc` |
| SEO wire-up + content standards | `seo.mdc` | Hard constraint text in AGENTS.md; cross-ref from `nextjs.mdc` |

*This table is the highest-churn content in this file — it hardcodes
filenames that can be renamed or split. Verify it against the actual
directory listing during the quarterly maintenance pass, not from memory.*

## Activation modes

Frontmatter has exactly three real keys: `description`, `globs`,
`alwaysApply`. Any other key (e.g. `autoAttach`) is silently ignored — the
rule still resolves from these three alone. A rule using an invalid key
needs auditing against its actual field values to find its real mode.

**Frontmatter shape**

- Only those three keys belong in frontmatter. Rationale comments go **below**
  the closing `---` as an HTML comment, before the rule heading — not inside
  frontmatter (unparsed territory in Cursor's non-YAML reader).
- `description` must be a **single-line string**. Folded scalars (`>-` plus
  indented continuation lines) are dropped by Cursor's reader and render as
  the literal two characters `>-` — the actual sentence never reaches the
  model.

Each rule resolves to **exactly one** activation path:

- **Always Apply** — `alwaysApply: true`. Loads every request. Globs and
  description are ignored.
- **Auto Attached** — `alwaysApply: false` + `globs` set. Loads when a
  matching file **enters agent context** (agent Read, edit, or @-mention).
  Editor focus alone does not attach; mid-session focus switches do not
  re-run glob attachment. The description is decoration — it is **not** used
  for agent-side relevance selection when `globs` is set.
- **Agent Requested** — `alwaysApply: false`, **no** `globs`, a specific
  detailed `description`. The agent decides at runtime whether it's relevant.
  This is a normal working mode, not degraded — third-party linters routinely
  misflag these as "unreachable"; they're only actually broken if the
  description is missing or too vague to match on ("helpful guidelines for
  X" is effectively unreachable — write what it's actually for).
- **Manual** — no globs, no meaningful description. Loads only via explicit
  `@rule-name`.

**Glob syntax**

Use one unquoted comma-separated line — comma + space between patterns.
Example: `docs/**/*.md, docs/**/*.mdx`. Do not use brace expansion —
`src/**/*.{ts,tsx}` can fail to match silently; write `.ts` and `.tsx` as
separate patterns on the same line. See [Cursor rules docs](https://cursor.com/docs/rules).

**Verifying Auto Attached rules**

A turn-1 self-report may show only always-on + Agent Requested until a
matching file is read. Glob rules then appear in the "relevant to files you
just read" injection. Do not treat editor focus or turn-1 attachment as the
check — read a matching file in a fresh session instead.

## Rule hierarchy

When rules conflict: project-specific > general best practice; security >
performance; explicit requirement > implicit convention. Document
exceptions with reasoning inline.

## Deprecation

Mark retired patterns `⚠️ DEPRECATED (YYYY-MM)` with a migration path to the
replacement. Remove once all code has migrated.

**Sediment** — stale layers that settle because adding feels safe and
removing feels risky — is the default fate of any rule without a pruning
discipline, and it isn't confined to deprecated blocks: a still-true line
whose reason has left the codebase is sediment too. Flag it anywhere it
appears.

## Creating a new rule

See [`TEMPLATE.md`](TEMPLATE.md) for the structure to follow, then work
through this checklist:

- [ ] Overlap with an existing rule, `AGENTS.md` § Hard constraints, or another `.mdc` owner?
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
- [ ] Does every line pass the no-op test — would deleting it change the
      agent's behaviour?
- [ ] If this rule owns a contract (envelope, action return, toast API, mutation
      branch), is the shape inline here or explicitly delegated to an owner that
      has it?
- [ ] File references: at most one per pattern? Stable path? No test-file inventory?
- [ ] Does any sentence answer "what did we build?" — if yes, move to AGENTS.md
      or delete.

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
