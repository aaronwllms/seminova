---
name: github-docs-authoring
description: Review or write repo markdown for GitHub rendering (user-invoked).
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

**Severity** — grade each finding by what it means, not by matching a fixed
example list. The concrete issue catalog (which specific problems land at each
level) lives in reference.md; these are the meanings:

| Level | Meaning |
| ----- | ------- |
| **Must-fix** | Breaks rendering or navigation — the doc is wrong on GitHub or a clone until fixed |
| **Should-consider** | Renders correctly but degrades skimmability, portability, or maintainability |
| **Optional** | Nice-to-have polish aligned with reference.md |
| **Already good** | Patterns worth keeping — include at least one when the file is mostly clean |

Apply every checklist item in reference.md to every named file — mark an item
N/A rather than skipping it silently — before writing the report. A finding is
done only when its severity is set from the reference.md catalog, not guessed.

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
