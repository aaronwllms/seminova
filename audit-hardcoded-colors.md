# Hardcoded color audit — `src/**`

**Date:** 2026-06-18  
**Rule:** [AGENTS.md › Locked rules](AGENTS.md#locked-rules) — theming via semantic tokens only; no raw hex or Tailwind color-scale utilities (`text-red-500`, etc.) for themeable color.

**Scope:** All non-test source under `src/`. Test files excluded unless a hardcoded color is asserted as real component behavior (none found).

---

## Summary

| Category                                         | Count             |
| ------------------------------------------------ | ----------------- |
| Tailwind color-scale violations (`text-red-500`) | 4                 |
| Raw hex violations                               | 1                 |
| Undefined semantic token references              | 2 (same root gap) |
| **Files with violations**                        | **6**             |

**Excluded (not violations):**

- `src/app/globals.css` — `oklch(...)` in `:root` / `.dark` is the token source of truth
- Structural utilities: `border-transparent`, `bg-transparent`, `text-current`, `fill-current`
- Test files — integration tests assert error _text_, not color classes

**Clean:** Remaining UI primitives, pages, layouts, and app components use semantic tokens (`bg-background`, `text-foreground`, `text-muted-foreground`, `bg-primary`, etc.).

---

## Violations by file

### `src/components/login-form.tsx`

| Line | Offending value | Recommended replacement |
| ---- | --------------- | ----------------------- |
| 91   | `text-red-500`  | `text-destructive`      |

### `src/components/sign-up-form.tsx`

| Line | Offending value | Recommended replacement |
| ---- | --------------- | ----------------------- |
| 104  | `text-red-500`  | `text-destructive`      |

### `src/components/forgot-password-form.tsx`

| Line | Offending value | Recommended replacement |
| ---- | --------------- | ----------------------- |
| 85   | `text-red-500`  | `text-destructive`      |

### `src/components/update-password-form.tsx`

| Line | Offending value | Recommended replacement |
| ---- | --------------- | ----------------------- |
| 68   | `text-red-500`  | `text-destructive`      |

All four auth forms share the same pattern — inline error `<p>` using Tailwind’s red scale instead of the destructive semantic token (matches `.cursor/rules/error-handling.mdc`).

### `src/components/ui/button.tsx`

| Line | Offending value               | Recommended replacement                                                                                                                                                                                                                                                        |
| ---- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 15   | `text-destructive-foreground` | **Token gap** — class is used but `--destructive-foreground` is not defined in `globals.css` and is missing from the `@theme inline` block (`--color-destructive-foreground`). Add the CSS variable (light + dark) and theme mapping, then keep `text-destructive-foreground`. |

`bg-destructive` and `hover:bg-destructive/90` on the same line are fine — `--destructive` exists.

### `src/components/ui/badge.tsx`

| Line | Offending value               | Recommended replacement                                                                                                     |
| ---- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 16   | `text-destructive-foreground` | **Token gap** — same as `button.tsx`; needs `--destructive-foreground` + `--color-destructive-foreground` in `globals.css`. |

### `src/app/layout.tsx`

| Line | Offending value                          | Recommended replacement                                                                                                                                                                                                                                                                                                                                                                                                    |
| ---- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 34   | `color="#2acf80"` (`NextTopLoader` prop) | **Token gap** (or product decision). `#2acf80` is a fixed green that does not map to any current token (`--primary` is neutral gray/black). Options: (1) add a semantic token e.g. `--loader` / `--progress` and pass `color="var(--loader)"`; (2) reuse an existing accent token if product accepts the visual shift; (3) `var(--primary)` for strict theme alignment but changes appearance from green to brand primary. |

---

## Token gaps

| Missing token              | Used by                                                               | Notes                                                                                               |
| -------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `--destructive-foreground` | `button.tsx` (destructive variant), `badge.tsx` (destructive variant) | Standard shadcn token; every other `*-foreground` pair in `globals.css` is defined except this one. |
| Loader / progress color    | `layout.tsx` (`NextTopLoader`)                                        | No dedicated semantic token; hardcoded brand green bypasses the theme system.                       |

---

## Suggested fix order

1. Add `--destructive-foreground` (and `@theme` mapping) to `globals.css` — unblocks button and badge without component changes beyond verification.
2. Replace `text-red-500` → `text-destructive` in all four auth forms (single-line change each).
3. Decide loader color strategy for `NextTopLoader` — new token vs. map to existing primary/accent.

---

## Re-audit checklist

After fixes:

- [ ] `pnpm lint` and `pnpm test:ci` pass
- [ ] Grep `src/` for `text-red-500`, `#[0-9a-fA-F]`, and `-(red|green|blue|gray|slate)-\d+` returns no component hits
- [ ] Destructive button/badge text has sufficient contrast in light and dark mode
- [ ] Top loader color respects theme when token is chosen
