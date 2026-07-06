---
name: ux-copy
description: >-
  Write or review UX copy — microcopy, error messages, empty states, CTAs, and
  confirmation dialogs. Use when the user says "write copy for", "what should
  this button say?", "review this error message", or when wording a dialog,
  empty state, label, or alert.
argument-hint: '<context or copy to review>'
disable-model-invocation: true
---

# UX Copy

Write or review interface copy — button labels, error text, empty states, dialogs. **Do not change code** unless the user asks to implement recommendations. English only unless the user asks; don't open the browser unless asked.

If the ask is really about visual layout or shipped code rather than wording, point the user to `design-critique` or `pre-release-review`.

If the request doesn't name the screen/flow or say whether to write new copy or review existing copy, ask before proceeding.

## Read first (project voice & terminology)

When writing or reviewing, read only what applies — **do not invent a voice guide; discover it from the project**:

1. **[AGENTS.md](../../../AGENTS.md)** — product terms, routes, feature behavior, error UI patterns
2. **Planning brief** — [ROADMAP.md](../../../ROADMAP.md) + relevant phase PRD in [docs/prds/](../../../docs/prds/) for in-flight vocabulary and UX intent
3. **Shipped copy in the same flow** — read nearby components under `src/app/` and `src/components/` for labels, buttons, empty states, and dialog wording already in production
4. **Shared message constants** — search `src/utils/` and route `_lib/` for user-facing strings reused across flows (e.g. validation messages, auth errors)
5. **Errors** — [`.cursor/rules/error-handling.mdc`](../../rules/error-handling.mdc): clear, actionable, no internals; operational vs fault copy
6. **Notifications** — [`.cursor/rules/notifications.mdc`](../../rules/notifications.mdc) if toasts or success confirmations apply

If the project adds a dedicated copy or content guide later, read that too — this skill does not duplicate one.

## Voice and terminology

**Derive from shipped UI**, not from this file:

- Read 2–3 screens in the same flow (or sibling routes) and note: sentence length, button casing, level of formality, use of questions in titles, acknowledgment labels
- Pull product-specific terms from AGENTS.md and the active PRD — use the same nouns and verbs users already see elsewhere
- Flag **drift** when proposed copy conflicts with a neighbor screen or planning doc

**Structural habits** (template-level, not product voice):

- Prefer short sentences; lead with the verb on buttons
- Sentence case for body copy; title case sparingly (dialog titles as questions are fine when the project already does that)
- Avoid filler openers ("Oops!", "Uh oh") unless nearby screens use that tone

## Copy patterns (structural)

Apply these shapes; fill wording from discovered project copy.

### CTAs

- Verb-first, outcome-specific — name the real action, not generic **OK** / **Yes** when a specific verb exists in sibling screens
- Processing states: present participle + ellipsis on the disabled control (e.g. **Saving…**) — match ellipsis and casing used elsewhere in the app

### Empty states

Structure: **what this is** + **why empty** + **what to do**

- Keep to 1–2 sentences
- *(Illustrative example only — not this project's convention:)* "No items yet. Add one to get started."

### Error messages

Structure: **what happened** + **what to try**

- Follow error-handling.mdc — never expose stack traces, internal codes, or raw provider messages to users
- Match severity UI: operational (`InlineError`) vs fault (`ErrorPanel`) per existing patterns
- Auth and security-sensitive flows: use generic messages where the project already avoids leaking account existence

### Confirmation dialogs

Discover button labels and title patterns from existing `AlertDialog` / dialog components in the codebase:

- **Reversible / caution** — title as question; body states consequence and reversibility; **Cancel** + specific action label (warning variant when the project uses one)
- **Destructive** — title names the delete/remove action; body states consequence; **Cancel** + specific destructive label (not OK/Cancel alone)
- **Soft confirms** — when the user can proceed despite a gap, both buttons should name the choice (not OK/Cancel)

### Section labels & metadata

- Match casing and density of labels on comparable screens (e.g. table headers, form labels, sidebar groups)
- If the project uses micro-labels or counts, mirror that pattern from a reference component — do not introduce a new label style without reason

## Output

```markdown
## UX Copy: [Context]

**User state:** [goal / feeling]
**Mode:** Write / Review / Both

### Recommended Copy

| Element                               | Copy                   |
| ------------------------------------- | ---------------------- |
| [Button / title / body / empty state] | [Final recommendation] |

### Alternatives

| Option | Copy   | Best when  |
| ------ | ------ | ---------- |
| A      | [Copy] | [Scenario] |
| B      | [Copy] | [Scenario] |

### Consistency check

- [Matches shipped terms / nearby screens / or note drift]

### Rationale

[Why this works — clarity, tone, next action]

### Do's and Don'ts

| ✅ Do              | ❌ Don't       |
| ------------------ | -------------- |
| [For this context] | [Anti-pattern] |
```

Skip **Alternatives** when one clear option exists. Skip sections that don't apply.