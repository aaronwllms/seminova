---
name: github-docs-authoring
description: >-
  GitHub Docs Authoring — write or review repo markdown for GFM alerts, links,
  tables, images, task lists, and renderer gaps (GitHub vs Cursor preview).
argument-hint: '<file path(s) or "write <section>" context>'
disable-model-invocation: true
---

# GitHub Docs Authoring

Write or review **markdown destined for GitHub** — README, workflow docs, PRDs,
ADRs, AGENTS.md, audit artifacts. **Do not edit files** unless the user asks to
implement recommendations. English only unless the user asks.

**Out of scope** — point elsewhere instead of duplicating:

| Topic | Skill / doc |
| ----- | ------------- |
| What belongs in README vs AGENTS vs PRD | [docs/DOC_RULES.md](../../../docs/DOC_RULES.md), [`sync-repo-docs`](../sync-repo-docs/SKILL.md) |
| UI microcopy in components | [`ux-copy`](../ux-copy/SKILL.md) |
| `.cursor/rules/*.mdc` authoring | [`rule-authoring`](../rule-authoring/SKILL.md) |
| Code quality before merge | [`pre-release-review`](../pre-release-review/SKILL.md) |

If the request doesn't name file(s) or say **Review** vs **Write**, ask before
proceeding.

## Read first

1. **[reference.md](reference.md)** — Seminova GFM defaults, renderer matrix, review checklist, GitHub doc links
2. **Target file(s)** — read in full before reviewing or drafting
3. **Sibling docs** — skim 1–2 nearby files for voice, alert density, and link style
4. **[docs/DOC_RULES.md](../../../docs/DOC_RULES.md)** — only when the ask touches *where* content belongs, not how it is formatted

Derive conventions from shipped docs + reference.md — do not invent a separate style guide.

## Modes

### Review (default)

Audit the named file(s) against [reference.md](reference.md). Report only —
no edits unless asked.

**Severity:**

| Level | Meaning |
| ----- | ------- |
| **Must-fix** | Broken links, missing alt text on meaningful images, absolute in-repo links that fail on clone, heading hierarchy that breaks GitHub's outline |
| **Should-consider** | Alert overload, optional depth that would benefit from collapsed sections, fragile section anchors, missing language tags on fenced blocks |
| **Optional** | Nice-to-have polish aligned with reference.md |
| **Already good** | Patterns worth keeping — include at least one when the file is mostly clean |

Do not flag intentional tradeoffs documented in the file (e.g. WORKFLOW_GUIDE's
GitHub-vs-Cursor diagram note). Do not restate generic Markdown tutorials.

### Write

Draft or revise markdown the user specifies. Match sibling doc voice. Apply
reference.md defaults. Prefer relative links. When adding warnings, use GFM
alert syntax over bold callouts.

## Output (Review)

```markdown
## GitHub Docs Authoring Review: [file or files]

**Mode:** Review
**Scope:** Formatting and GitHub rendering only

### Must-fix

| ID | Location | Issue | Recommendation |
| -- | -------- | ----- | -------------- |
| G001 | [heading/line] | [Issue] | [Fix] |

### Should-consider

| ID | Location | Issue | Recommendation |
| -- | -------- | ----- | -------------- |

### Optional

| ID | Location | Issue | Recommendation |
| -- | -------- | ----- | -------------- |

### Already good

- [Pattern the file gets right]

### Renderer notes

- [GitHub vs Cursor preview vs paste-into-chat, if relevant]

### Out of scope (if any)

- [Doc-role questions → DOC_RULES / sync-repo-docs]
```

Skip empty sections. Stable IDs (`G001`, …) if reviewing multiple files in
one pass.

## Output (Write)

```markdown
## GitHub Docs Authoring: [context]

**Mode:** Write

### Draft

[Markdown block ready to paste]

### Conventions applied

- [Bullet list — alerts, links, tables, etc.]

### Renderer notes

- [If picture/details/Mermaid/etc.]
```

## Related workflow

- After substantive doc edits that change repo truth, remind the user to run
  `/sync-repo-docs` when README or AGENTS content may be stale — this skill
  does not verify factual accuracy.
- PR bodies and issue comments: same GFM conventions apply; task lists and
  autolinked `#issue` / `@user` references are appropriate there.
