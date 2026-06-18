---
name: ux-copy
description: >-
  Write or review Cookloop UX copy — microcopy, error messages, empty states,
  CTAs, and confirmation dialogs. Use when the user says "write copy for",
  "what should this button say?", "review this error message", or when wording
  a dialog, empty state, label, or cook-mode alert.
argument-hint: '<context or copy to review>'
disable-model-invocation: true
---

# UX Copy

Write or review interface copy for Cookloop. **Do not change code** unless the user asks to implement recommendations.

| Skill                                                | Role                                         |
| ---------------------------------------------------- | -------------------------------------------- |
| **This skill**                                       | Words — CTAs, empty states, errors, confirms |
| [design-critique](../design-critique/SKILL.md)       | Visual layout, hierarchy, system fit         |
| [pre-release-review](../pre-release-review/SKILL.md) | Shipped code before PR                       |

## Usage

```
/ux-copy $ARGUMENTS
```

## What I Need From You

- **Context**: Screen, flow, or feature (e.g. pantry row click, shopping empty state)
- **User state**: What are they trying to do? How might they feel (stuck, rushing, cooking)?
- **Mode**: Write new copy, review existing copy, or both
- **Constraints** (optional): Character limits, must include a term, tone tweak

## Read first (Cookloop voice)

When writing or reviewing, read only what applies:

1. **[AGENTS.md](../../../AGENTS.md)** — product terms, routes, feature behavior
2. **Planning brief** — discover path from AGENTS.md documentation map; typically [`CONTEXT.md`](../../../CONTEXT.md) Phase 10 dialog/CTA spec (Dialogs section under Epic 3)
3. **Shipped copy in the same flow** — read nearby components under `src/app/` for consistency (pantry ↔ shopping ↔ recipes)
4. **Shared message constants** — e.g. [`process-recipe-validation.ts`](../../../src/utils/process-recipe-validation.ts), [`resolve-recipe-archive-plan.ts`](../../../src/utils/resolve-recipe-archive-plan.ts)
5. **Errors** — [`.cursor/rules/error-handling.mdc`](../../rules/error-handling.mdc): clear, actionable, no internals; 1–2 sentences

## Voice and terminology

**Tone:** Direct, helpful, calm — a patient kitchen companion, not corporate SaaS. No exclamation overload.

**Use consistently:**

| Term                              | Not                                                 |
| --------------------------------- | --------------------------------------------------- |
| Pantry · Recipes · Shopping       | Kitchen (retired nav label)                         |
| have / low / out                  | in stock / missing (unless explaining to new users) |
| Ready / Needs / Archived          | cookable / missing ingredients                      |
| Cook                              | Start recipe, Begin                                 |
| Save & process / Save & reprocess | Submit, Save                                        |
| Got it (acknowledge alert)        | OK, Dismiss                                         |
| Done shopping                     | Complete trip, Check out                            |

**Sentence style:** Prefer short sentences. Lead with the verb on buttons. Use sentence case for body copy; title case sparingly (dialog titles OK as questions: "Archive recipe?").

## Copy patterns (Cookloop)

### CTAs

- Verb-first, outcome-specific: **Cook**, **Save meal**, **Add ingredient**, **Finish anyway**
- Match the real action — **Archive** not OK; **Delete recipe** not Yes
- Processing states: **Processing…**, **Archiving…**, **Saving…** (ellipsis, disabled control)

### Empty states

Structure: **what this is** + **why empty** + **what to do**

Examples from shipped UI:

- "No meals yet. Create one to coordinate multi-recipe cooks."
- "Nothing missing — nice! All recipes are ready to cook."
- "No appliances yet. Add your kitchen appliances so recipes can…"

Keep to 1–2 sentences. Avoid guilt or filler ("Oops!", "Uh oh").

### Error messages

Structure: **what happened** + **what to try**

- Follow error-handling.mdc — never expose stack traces or codes to users
- Recipe process failure pattern: "Your recipe was saved but could not be processed. Try saving again."
- Auth: generic credentials message — do not leak whether an account exists

### Confirmation dialogs

**Archive (amber, reversible):**

- Title: action as question — "Archive recipe?"
- Body: consequence + reversibility; meal cascade when applicable
- Buttons: **Cancel** + **Archive** (warning variant)

**Delete / remove (red, destructive):**

- Title: "Delete recipe?" / "Remove appliance?"
- Body: consequence; list affected meals/recipes when cascading
- Buttons: **Cancel** + action label (**Delete recipe**, **Remove**) — not OK/Cancel alone

**Soft confirms (shopping):**

- Title: "Finish shopping?"
- Body: state the gap ("You still have N items unchecked.")
- Buttons: **Keep shopping** / **Finish anyway** — both name the choice

### Cook mode

- Timer expiry: instruct acknowledgment — user must **Mark done** (no auto-complete copy implying otherwise)
- Starting soon: recipe + appliance + time; **Got it** to dismiss
- Exit cook mode: "Are you sure? You'll start from the beginning next time."

### Section labels

- Uppercase micro-labels with counts: **GOT IT · 3**, **TO BUY · 5** (see `SectionLabel` pattern)
- Category labels under lists: normal case

## Principles

1. **Clear** — one meaning; no jargon
2. **Concise** — cut words that don't help the next action
3. **Consistent** — same thing, same word everywhere
4. **Useful** — every string should help the user act or understand
5. **Human** — plain language for a solo home cook

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

- [Matches Cookloop terms / nearby screens / or note drift]

### Rationale

[Why this works — clarity, tone, next action]

### Do's and Don'ts

| ✅ Do              | ❌ Don't       |
| ------------------ | -------------- |
| [For this context] | [Anti-pattern] |
```

Skip **Alternatives** when one clear option exists. Skip sections that don't apply.

## Principles (workflow)

- **Do not open the browser** unless the user explicitly asks
- **Do not fix code** without permission
- **Project truth lives in CONTEXT.md + shipped UI** — propose copy that fits existing patterns
- **English only** — no localization section unless user asks

## Tips

1. **Be specific** — "Error when Save & process fails after network drop" beats "error message."
2. **Read the neighbor screen** — shopping copy should sound like pantry copy.
3. **Flag drift** — if review copy conflicts with CONTEXT.md or another screen, say so.
4. **Pair with design-critique** — layout review separately from wording review.
