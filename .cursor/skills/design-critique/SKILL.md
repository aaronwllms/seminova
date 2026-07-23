---
name: design-critique
description: >-
  Structured design feedback on usability, hierarchy, consistency, and
  accessibility against the project design system.
argument-hint: '<screenshot, HTML mockup path, or description>'
disable-model-invocation: true
---

# Design Critique

Structured design feedback for mockups, screenshots, and explorations — critique the design artifact, not shipped code, so no quality gates or security review here. **Do not change code** unless the user asks to implement recommendations. Don't open the browser unless asked. Calibrate depth to the stage: early exploration gets different feedback than final polish.

For **shipped code** before PR, use [pre-release-review](../pre-release-review/SKILL.md) instead.

**Locate the artifact:**

- Screenshot or image attachment — read with the Read tool
- HTML mockup — **new** mockups in `docs/mockups/*.html`; **archived** in `docs/mockups/archive/*.html` (if present)
- Live route — describe or `@`-reference the page; read relevant components under `src/app/` if comparing to shipped UI
- Verbal description — ask clarifying questions if context is thin

If the artifact or its stage (exploration / refinement / final) is unclear, ask before proceeding.

## Read first (project design system)

When checking consistency, read only what applies — **never assume token values or UI patterns from this skill file**:

1. **[DESIGN.md](../../../DESIGN.md)** — token architecture, structure-vs-theme split, re-skin workflow
2. **[AGENTS.md](../../../AGENTS.md)** — shipped UI patterns, routes, shells, shared components
3. **Planning brief** — [ROADMAP.md](../../../ROADMAP.md) + relevant phase PRD in [docs/prds/](../../../docs/prds/); shipped history in [docs/archive/CONTEXT_ARCHIVE.md](../../../docs/archive/CONTEXT_ARCHIVE.md) (if present)
4. **Token values** — [`src/app/globals.css`](../../../src/app/globals.css): authoritative source for colors, typography, radius, shadows, spacing (read `:root` and `.dark`; do not copy hex/oklch into critique prose unless comparing a mockup to the live system)
5. **Styling rules** — [`.cursor/rules/ui-styling.mdc`](../../rules/ui-styling.mdc), [`.cursor/rules/ui-shadcn.mdc`](../../rules/ui-shadcn.mdc): semantic tokens, mobile-first, shadcn primitives
6. **Accessibility** — [`.cursor/rules/ui-accessibility.mdc`](../../rules/ui-accessibility.mdc)
7. **Shipped primitives** — grep or read `src/components/` and route `_components/` for shared patterns (dialogs, tables, shells, error UI) relevant to the artifact under review

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
- Destructive flows — does the confirm pattern match existing dialog patterns in the codebase (warning vs destructive variants)?

### 3. Visual Hierarchy

- Is there a clear reading order?
- Are the right elements emphasized?
- Is whitespace used effectively?
- Is typography creating the right hierarchy?

### 4. Consistency (project-specific)

Use this lens — separate **token** drift from **component** or **pattern** breaks. Derive the checklist from sources above, not from memory:

| Layer          | Where to read live conventions              | Critique question                          |
| -------------- | ------------------------------------------- | ------------------------------------------ |
| **Tokens**     | `globals.css`, DESIGN.md                    | Wrong color, spacing, radius, or type?     |
| **Components** | `src/components/ui/`, shared app components   | Wrong variant, missing state, off-pattern? |
| **Patterns**   | AGENTS.md, route `_components/`, active PRD | Breaks established layout or flow grammar? |

After reading project sources, check the artifact against what is actually shipped:

- **Shell & navigation** — app/marketing/admin chrome, nav labels, breadcrumbs (per AGENTS.md and live layouts)
- **Lists & tables** — row density, actions, loading skeletons (per data-table and route patterns if applicable)
- **Status & feedback** — semantic colors (`primary`, `destructive`, `muted`, etc.), inline errors, toasts, empty states
- **Dialogs & sheets** — width, header/body/footer structure, button order, destructive placement
- **Typography** — font families and weights defined in the project (flag weights or families not in `globals.css` / `layout.tsx`)
- **Primary & destructive actions** — semantic token usage vs hardcoded colors

**System fit** (especially exploration and refinement stages):

- Which existing primitive already covers this? (discover from `src/components/` and the route under review)
- Is the mockup inventing a one-off, or should it compose existing building blocks?
- If genuinely new — flag **promote to shared primitive** vs **page-local OK for now**
- Do not run codebase token audits here (hardcoded hex sweeps) — stay at design judgment

### 5. Accessibility

- Color contrast ratios (especially text on tinted backgrounds)
- Touch target sizes for interactive controls
- Text readability (minimum sizes, line height, truncation)
- Keyboard/focus for interactive patterns (see ui-accessibility.mdc)
- Alternative text for images and icon-only buttons

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

### Consistency

| Layer                       | Element | Issue                              | Recommendation |
| --------------------------- | ------- | ---------------------------------- | -------------- |
| Token / Component / Pattern | [What]  | [Inconsistency vs shipped system] | [Fix]          |

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
