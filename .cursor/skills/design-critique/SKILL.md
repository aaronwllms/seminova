---
name: design-critique
description: >-
  Structured design feedback on usability, hierarchy, and consistency against
  Cookloop's Phase 10 design system. Use when the user says "review this design",
  "critique this mockup", "what do you think of this screen?", or shares a
  screenshot, HTML mockup, or description at any stage from exploration to
  final polish.
argument-hint: '<screenshot, HTML mockup path, or description>'
disable-model-invocation: true
---

# Design Critique

Structured design feedback for Cookloop mockups, screenshots, and explorations. **Do not change code** unless the user asks to implement recommendations.

For **shipped code** before PR, use [pre-release-review](../pre-release-review/SKILL.md) instead.

## Usage

```
/design-critique $ARGUMENTS
```

Review the design: @$1

**Input sources (no Figma connector in this repo):**

- Screenshot or image attachment — read with the Read tool
- HTML mockup — read file: **new mockups** in `.mockups/*.html`; **archived** mockups in `.mockups/archive/*.html`
- Live route — describe or `@`-reference the page; read relevant components under `src/app/` if comparing to shipped UI
- Verbal description — ask clarifying questions if context is thin

## What I Need From You

- **The design**: screenshot, mockup path, route, or detailed description
- **Context**: What is this? Who is it for? What stage (exploration, refinement, final)?
- **Focus** (optional): "Focus on mobile" or "Focus on the pantry row interaction"

## Read first (Cookloop design system)

When checking consistency, read only what applies:

1. **[AGENTS.md](../../../AGENTS.md)** — shipped UI patterns, routes, product shell
2. **Planning brief** — discover path from AGENTS.md documentation map; typically [`CONTEXT.md`](../../../CONTEXT.md) Phase 10 visual spec (Direction B); shipped detail in [`CONTEXT_ARCHIVE.md`](../../../CONTEXT_ARCHIVE.md)
3. **Tokens** — [`src/app/globals.css`](../../../src/app/globals.css): `#EFEFEC` page background, herb green `--primary`, status CSS vars
4. **Status surfaces** — [`src/utils/status-surface-styles.ts`](../../../src/utils/status-surface-styles.ts): have/low/out/selected row treatments
5. **Shared primitives** — `GroupedListContainer`, `SectionLabel`, `StatusPillToggle`, `RowActionsMenu`, dialog shell (540px, header/body/footer)
6. **Styling rules** — [`.cursor/rules/ui-styling.mdc`](../../rules/ui-styling.mdc): two-weight typography (400/500 only), shadcn tokens, mobile-first
7. **Accessibility** — [`.cursor/rules/ui-accessibility.mdc`](../../rules/ui-accessibility.mdc)

## Critique Framework

### 1. First Impression (2 seconds)

- What draws the eye first? Is that correct?
- What's the emotional reaction?
- Is the purpose immediately clear?

### 2. Usability

- Can the user accomplish their goal?
- Is the navigation intuitive?
- Are interactive elements obvious?
- Are there unnecessary steps?

**Interaction states** (when the artifact is interactive):

- Default, hover, active/selected, disabled, loading — are they visually distinct?
- Error, empty, and populated list states — does the design hold up?
- Destructive flows — amber **warning** confirm vs red **destructive** confirm (match existing dialog patterns)

### 3. Visual Hierarchy

- Is there a clear reading order?
- Are the right elements emphasized?
- Is whitespace used effectively?
- Is typography creating the right hierarchy?

### 4. Consistency (Cookloop-specific)

Use this lens — separate **token** drift from **component** or **pattern** breaks:

| Layer          | Cookloop examples                               | Critique question                     |
| -------------- | ----------------------------------------------- | ------------------------------------- |
| **Tokens**     | `globals.css`, status CSS vars                  | Wrong color, spacing, or type weight? |
| **Components** | shadcn primitives, `SectionLabel`, status pills | Wrong variant or missing state?       |
| **Patterns**   | grouped list row, dialog footer, sub-nav        | Breaks Direction B layout grammar?    |

Check against Phase 10 / Direction B when relevant:

- **Shell**: `ProductShell` top nav (Pantry · Recipes · Shopping); sub-nav for page tabs; cook routes (`/kitchen/cook*`) are **fullscreen outside** `ProductShell`
- **Lists**: grouped list containers with 0.5px borders; compact recipe rows (72×72 thumb); status dot + pill toggle + `⋯` menu on pantry/shopping rows
- **Status semantics**: have = clean white; low = amber left border + `#FFFBF5`; out = red left border + `#FFF8F8`; do not blur have/low/out meaning
- **Dialogs**: 540px max-width; Cancel + primary right; destructive confirm bottom-left when present
- **Typography**: 400 regular / 500 medium only — flag 600/700 usage
- **Primary actions**: herb green `#3B6D11`; destructive = red tint background, not solid red fill

**System fit** (especially exploration and refinement stages):

- Which existing primitive already covers this? (`GroupedListContainer`, `StatusPillToggle`, `RowActionsMenu`, dialog shell, etc.)
- Is the mockup inventing a one-off, or should it compose existing building blocks?
- If genuinely new — flag **promote to shared primitive** vs **page-local OK for now**
- Do not run codebase token audits here (hardcoded hex sweeps) — stay at design judgment

### 5. Accessibility

- Color contrast ratios (especially status tints on row backgrounds)
- Touch target sizes (pill toggles, row menus, cook mode controls)
- Text readability (11px labels, metadata lines)
- Keyboard/focus for interactive patterns (see ui-accessibility.mdc)
- Alternative text for images and icon-only buttons

## How to Give Feedback

- **Be specific**: "The CTA competes with the navigation" not "the layout is confusing"
- **Explain why**: Connect feedback to design principles or user needs
- **Suggest alternatives**: Don't just identify problems, propose solutions
- **Acknowledge what works**: Good feedback includes positive observations
- **Match the stage**: Early exploration gets different feedback than final polish

## Output

```markdown
## Design Critique: [Design Name]

**Context:** [what this is, stage, focus if any]

### Overall Impression

[1-2 sentence first reaction — what works, what's the biggest opportunity]

### Usability

| Finding | Severity                       | Recommendation |
| ------- | ------------------------------ | -------------- |
| [Issue] | Critical / High / Medium / Low | [Fix]          |

### Visual Hierarchy

- **What draws the eye first**: [Element] — [Is this correct?]
- **Reading flow**: [How does the eye move through the layout?]
- **Emphasis**: [Are the right things emphasized?]

### Consistency (Cookloop)

| Layer                       | Element | Issue                       | Recommendation |
| --------------------------- | ------- | --------------------------- | -------------- |
| Token / Component / Pattern | [What]  | [Inconsistency vs Phase 10] | [Fix]          |

### System Fit

| Related pattern                 | What's shared | Gap                                        |
| ------------------------------- | ------------- | ------------------------------------------ |
| [Existing primitive or pattern] | [Overlap]     | [What's missing or why reuse isn't enough] |

**Reuse vs invent:** [Compose existing primitives / promote new shared primitive / page-local OK]

### States

| State                                           | Pass / gap | Notes |
| ----------------------------------------------- | ---------- | ----- |
| Default / hover / selected / disabled / loading |            |       |
| Empty / populated / error                       |            |       |

### Accessibility

- **Color contrast**: [Pass/fail for key text]
- **Touch targets**: [Adequate size?]
- **Text readability**: [Font size, line height]

### What Works Well

- [Positive observation 1]
- [Positive observation 2]

### Do's and Don'ts

| ✅ Do                           | ❌ Don't                |
| ------------------------------- | ----------------------- |
| [Best practice for this design] | [Anti-pattern to avoid] |

### Priority Recommendations

1. **[Most impactful change]** — [Why and how]
2. **[Second priority]** — [Why and how]
3. **[Third priority]** — [Why and how]
```

## Principles

- **Mockups ≠ shipped code** — critique the design artifact; don't run quality gates or security review
- **Do not open the browser** unless the user explicitly asks
- **Do not fix code** without permission
- **Project truth lives in AGENTS.md + CONTEXT.md** — not in this skill file

## Tips

1. **Share the context** — "This is the pantry row click affordance for Phase 11" helps give relevant feedback.
2. **Specify your stage** — Early exploration gets different feedback than final polish.
3. **Ask me to focus** — "Just look at the navigation" gives more depth on one area.
4. **Reference mockups** — new explorations live in `.mockups/`; shipped-phase HTML is in `.mockups/archive/`.
5. **Ask about reuse** — "Should this compose existing list rows or need a new primitive?" focuses system-fit feedback.
