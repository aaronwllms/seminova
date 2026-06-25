# LOCKED_RULES — Canonical locked-rule text

**Purpose:** The authoritative wording of the template's locked rules — non-negotiable constraints inherited by every product built from this template. This file owns the rule **text** only. How a locked rule is _changed_ (PM approval, text-only vs. code-conformance routing) is governed by [AGENTS.md › Change protocol](AGENTS.md#change-protocol).

Consumption detail lives in `.cursor/rules/`; CONTEXT.md §3 is a pointer + at-a-glance summary back here.

---

## Locked rules

These must not be violated.

- **Ecosystem alignment over aesthetic divergence:** Don't canonize a non-standard convention for tidiness or taste alone. Diverge from an ecosystem default (shadcn, Next.js, Supabase) only when our way has a real, articulable benefit — clarity, safety, consistency — that outweighs the cost of fighting it: tooling that assumes the standard, AI agents trained on it, and copy-paste examples that won't match. When it's a wash, follow the standard. A template multiplies both the benefit and the cost across every spinoff.
- **Package manager:** pnpm only — never npm or yarn. One lockfile (`pnpm-lock.yaml`); no `package-lock.json`.
- **UI is primitive-first:** own shadcn/ui components in `src/components/ui`; extend via `cva`; compose with Radix `asChild`/`Slot`. Never install shadcn as an npm package.
- **Theming via semantic tokens only:** `bg-background`, `text-foreground`, `ring-ring`, `text-destructive`, etc. Never hardcode colors — no raw hex or `color-500` utilities for themeable color. Tokens in `src/app/globals.css`.
- **Structure is fixed; theme is swappable:** token architecture and accessibility rules are inherited; token values are re-skinned per product.
- **Mobile-first responsive:** design from smallest breakpoint up.
- **Component size:** ≤150 lines; extract subcomponents when larger.
- **Accessibility:** WCAG 2.1 AA — semantic HTML first, ARIA only when needed; visible `focus-visible` states using token rings.
- **shadcn CLI:** always non-interactive — `pnpm dlx shadcn@latest add <component> -y -o`. Use `--dry-run`/`--diff` before overwriting customized components.
- **Images:** `next/image` with explicit dimensions.
- **Auth boundary:** public routes are `/` and `/auth/**` only; all other routes require a session. Enforced in `proxy.ts` → `src/supabase/proxy.ts`.
- **Admin gate:** `app_metadata.role === 'admin'` on `auth.users` is the canonical admin check — set via in-app promote/demote on `/admin/users` (admin-gated server actions + service client) **or** secret-key CLI (`pnpm promote-admin`, `pnpm demote-admin`). Do not move this to a `profiles` column without PM approval.
- **Agent guidance:** lives in `.cursor` (rules + skills) — not duplicated into product code.
