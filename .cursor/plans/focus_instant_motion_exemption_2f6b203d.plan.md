---
name: Focus instant motion exemption
overview: Make focus rings appear instantly by excluding box-shadow (and outline-color where used) from transition property lists, with a scoped focus-visible override on tabs where box-shadow carries both the ring and active elevation. Documentation-only motion-tier carve-out; no ESLint rule change.
todos:
  - id: css-ring-only
    content: Narrow transitions on ring-only call sites (banner field, input/textarea/select/toggle/badge/checkbox/button/accordion)
    status: completed
  - id: css-tabs-explicit
    content: Add focus-visible:transition-none to tabs trigger; leave transition-all and duration-swept in place
    status: completed
  - id: docs-sync
    content: Document focus carve-out in DESIGN.md, ui-styling.mdc, and AGENTS.md § Design system & theming
    status: completed
  - id: quality-commit
    content: Run quality gate and commit
    status: completed
isProject: false
---

# Focus states exempt from motion tiers

## Confirmed facts (blocking the CSS approach)

**Focus indicator property at delayed call sites:**

| Call site | Focus indicator | Current transition |
| --- | --- | --- |
| [`banner-starts-at-field.tsx`](src/app/admin/settings/_components/banner-starts-at-field.tsx), [`input.tsx`](src/components/ui/input.tsx), [`textarea.tsx`](src/components/ui/textarea.tsx), [`select.tsx`](src/components/ui/select.tsx), [`toggle.tsx`](src/components/ui/toggle.tsx), [`badge.tsx`](src/components/ui/badge.tsx) | Tailwind `ring-*` (`box-shadow`) + `outline-none` | `transition-[color,box-shadow]` |
| [`checkbox.tsx`](src/components/ui/checkbox.tsx) | `ring-*` + `outline-none` | `transition-shadow` |
| [`button.tsx`](src/components/ui/button.tsx), [`accordion.tsx`](src/components/ui/accordion.tsx) | `ring-*` + `outline-none` | `transition-all` |
| [`tabs.tsx`](src/components/ui/tabs.tsx) | `ring-*` **and** `focus-visible:outline-1` / `outline-ring` | `transition-all` |

App chrome that already uses `transition-colors` + `ring-*` (nav, footer, stat tiles, etc.) already has instant rings — no change.

**Tailwind v4.1.18 `transition-colors` property list** (from installed `default-theme.js`):

`color, background-color, border-color, outline-color, text-decoration-color, fill, stroke`

- Does **not** include `box-shadow` → ring fades stop if we drop box-shadow from the transition list / stop using `transition-shadow` / `transition-all` for those controls.
- **Does** include `outline-color` → for [`tabs.tsx`](src/components/ui/tabs.tsx), a blind swap to `transition-colors` would still animate the outline focus indicator.

**Chosen CSS approach:** narrow transition property lists at most call sites; scoped `focus-visible:transition-none` on tabs only, where `box-shadow` carries both the focus ring and active elevation. No ESLint rule change.

## 1. Call-site CSS — instant rings via property lists

**Ring-only (`box-shadow`) sites — swap/narrow:**

- `transition-[color,box-shadow]` → `transition-colors` on banner field + input/textarea/select/toggle/badge.
- `transition-shadow` on checkbox → remove (it only animated the ring); no replacement needed unless a non-focus color transition is required (it isn’t today).

**Button and accordion — explicit list, not `transition-colors`:**

- Replace `transition-all` with `transition-[color,background-color,border-color,opacity]` so `disabled:opacity-50` continues to animate at its current rate while `box-shadow` (ring) is excluded.
- Keep existing duration tokens unchanged.

**Tabs — scoped override, property list unchanged:**

- Do **not** change the transition property list. Keep `transition-all` and `duration-swept` exactly as they are.
- Add `focus-visible:transition-none` to the TabsTrigger class string in [`tabs.tsx`](src/components/ui/tabs.tsx).
- The ring animates on blur, since the variant applies only while focused — accepted trade-off for preserving active-state elevation on the same `box-shadow` channel.

Keep `duration-swept` / `duration-dwell` on non-focus transitions exactly as today everywhere else.

## 2. Docs (policy sync)

- [`DESIGN.md`](DESIGN.md) § Motion — state that focus indicators must appear instantly and are never placed on an animated property list; document the property-list pattern and the tabs `focus-visible:transition-none` override as the exception where `box-shadow` serves both ring and elevation.
- [`.cursor/rules/ui-styling.mdc`](.cursor/rules/ui-styling.mdc) — same carve-out next to the layout-transition exemption. State explicitly that this guidance is advisory for files under `src/components/ui/`, which `local/motion-tier` does not lint.
- [`AGENTS.md`](AGENTS.md) § Design system & theming — update the motion-tier sentence to note the focus carve-out.

No AGENTS.md hard-constraint change — motion tiers stay a coding standard.

## 3. Quality gate and commit

- Run `pnpm pre-push` and fix any failures before finishing.
- Commit the CSS and docs changes.

## Out of scope

- Enter/exit animation, layout transitions, easing tokens.
- Changing ring token design or focus-visible visual style — timing only.
- Modifications to [`eslint-rules/motion-tier.mjs`](eslint-rules/motion-tier.mjs) or its test suite.
