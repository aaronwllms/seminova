---
name: lexicon-audit
description: >-
  Read-only audit of the codebase for LEXICON.md candidate terms and drift;
  reports findings in chat (does not edit LEXICON.md).
disable-model-invocation: true
---

# Lexicon Audit

Scan the codebase and compare findings against `LEXICON.md`. Output candidate
terms and drift flags in chat for human review.

## Process

1. **Read `LEXICON.md`** — note the preamble (the scope filter) and all existing entries
2. **Scan the codebase** for architectural terms, patterns, and concepts in:
   - `src/`
   - `.cursor/rules/*.mdc`
   - `AGENTS.md` § Hard constraints
   - `supabase/migrations/`
   - Test files
3. **Identify problems**:
   - Same word used for different concepts (ambiguity)
   - Different words used for the same concept (synonyms)
   - Vague or overloaded terms
   - Terms used consistently but absent from `LEXICON.md`
   - Existing entries where code usage contradicts or is incomplete
4. **Output findings in chat** using the format below
5. **Do not write to `LEXICON.md`** — findings are for human review only. To add entries, use `/lexicon-update` or ask directly.

## Output Format

Output findings in chat with this structure:

```md
## Candidate terms

Grouped by how consistently they appear.

| Term | Where seen | Draft definition | Aliases to avoid |
| ---- | ---------- | ---------------- | ---------------- |
| **Term** | `src/...` | One sentence. | other-name, synonym |

## Relationships

- A **Response envelope** belongs to exactly one **Server Action**
- A **Service client** is reachable only through an **Admin gate**

## Example usage

A short conversation (3–5 exchanges) demonstrating how candidate terms
interact naturally and clarifying boundaries between related concepts:

> **Dev:** "Should I use the service client here?"
> **Domain expert:** "Only if you've passed the admin gate —
>   the service client bypasses RLS and must never be reached directly."

## Drift flags

Existing LEXICON.md entries where code usage diverges, is incomplete,
or is inconsistent.

### [Entry name]

[What the entry says vs. what the code does. Concrete recommendation.]

## Flagged ambiguities

- "[term]" was used to mean both **X** and **Y** — these are distinct
  concepts: [recommendation for which meaning to canonise].
```

## Rules

- **Use `LEXICON.md`'s own preamble as the scope filter.** Only flag terms that fit the stated purpose of this project's lexicon. Skip pure stack/framework vocabulary any agent would know unless the project uses it in a project-specific way.
- **Be opinionated.** When multiple words exist for the same concept, pick the best one and list the others as aliases to avoid.
- **Flag conflicts explicitly.** If a term is used ambiguously, call it out in Flagged ambiguities with a clear recommendation.
- **Only include terms relevant to the lexicon's stated scope.** Skip generic programming concepts unless they have project-specific meaning.
- **Keep draft definitions tight.** One sentence max. Define what it IS, not what it does.
- **Show relationships.** Use bold term names and express cardinality where obvious.
- **Group terms into multiple tables** when natural clusters emerge (e.g. by concern: auth/security, server patterns, UI/forms, storage). If all candidates belong to a single cohesive area, one table is fine — don't force groupings.
- **Write an example usage dialogue.** A short conversation (3–5 exchanges) that demonstrates how the candidate terms interact naturally and clarifies boundaries between related concepts.
- **Do not write to any file.** This skill produces chat output only.

## Re-running

When invoked again after changes to `LEXICON.md`:

1. Read the updated `LEXICON.md`
2. Re-scan for any new candidates the update surfaced or resolved
3. Re-check drift flags — mark any that have been resolved
4. Surface any new ambiguities introduced by recent code changes
