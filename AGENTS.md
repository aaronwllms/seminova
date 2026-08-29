# AGENTS.md

Seminova is an opinionated AI-native Next.js + Supabase starter. This file holds hard constraints, agent workflow gates, the merge checklist, and the change protocol — not a feature or schema catalog.

**Last updated:** 2026-08-21

Document roles and the doc-maintenance procedure are authoritative in [docs/DOC_RULES.md](docs/DOC_RULES.md).

Per [ADR-0010](docs/adr/ADR-0010-agents-md-governance-not-repo-truth.md), do not add feature inventories, route lists, or schema catalogs to this file. Orient in the code and the owners below.

**Where to look:** Coding standards live in [`.cursor/rules/`](.cursor/rules/). Invokable workflows live in [`.cursor/skills/`](.cursor/skills/); planning-loop skills are documented in [docs/WORKFLOW_GUIDE.md](docs/WORKFLOW_GUIDE.md). Architectural decisions live in [docs/adr/](docs/adr/). Vocabulary lives in [LEXICON.md](LEXICON.md). Human setup and scripts live in [README.md](README.md). Schema authority lives in `supabase/migrations/` (and generated types).

---

## Agent workflow

1. **Read** AGENTS.md + relevant `.cursor/rules/` and skills before coding.
2. **Migrations:** agents write SQL files in `supabase/migrations/` only. Humans run `pnpm db:push` and `pnpm db:types`. See [.cursor/rules/do-migrations-agent.mdc](.cursor/rules/do-migrations-agent.mdc).

> [!IMPORTANT]
> **Migrations are human-only.** Agents write SQL migration files; humans run `pnpm db:push` and `pnpm db:types` against the linked Supabase project.

3. **Quality bar** before finishing work:

```bash
pnpm pre-push
```

4. **Doc sync** after env, scripts, token, or rule-file changes:
   - `/sync-repo-docs` — README.md, DESIGN.md, `.cursor/rules/README.md`

---

## Hard constraints

Non-negotiable constraints, each with deterministic enforcement:

> [!IMPORTANT]
> Every constraint below is mechanically enforced — a violation fails `pnpm pre-push` and CI. Changing a constraint requires updating its enforcement together with this list (see [Change protocol](#change-protocol)).

- **pnpm only** — never npm or yarn; one lockfile (`pnpm-lock.yaml`). **Enforced:** `check:pnpm-only`.
- **UI is primitive-first** — own shadcn/ui components in `src/components/ui`; extend via `cva`; compose with Radix `asChild`/`Slot`; never install shadcn as an npm package. **Enforced:** `check:no-shadcn-pkg` (ESLint scoped to the shadcn `no-restricted-imports` block; `pnpm lint` remains the catch-all).
- **Theming via semantic tokens only** — `bg-background`, `text-foreground`, etc.; never raw hex or numeric Tailwind color scales for themeable color; tokens in `src/app/globals.css`. **Enforced:** `check:semantic-tokens` (ESLint scoped to `local/semantic-tokens`; see documented limitation in `eslint-rules/semantic-tokens.mjs`).
- **Auth boundary** — public routes are `/`, `/auth/**`, `/terms`, `/privacy`, `/reference`, `/features`, `/workflow`, `/robots.txt`, `/sitemap.xml`, and `/api/client-logs` (client log relay — see [ADR-0007](docs/adr/ADR-0007-client-log-relay-unauthenticated.md)); all others require a session; enforced in `src/proxy.ts` → `src/supabase/proxy.ts`. **Enforced:** `check:auth-boundary` (discovered-route proxy tests and matcher tests).
- **Admin gate** — `app_metadata.role === 'admin'` on `auth.users` is the canonical admin check, set via in-app promote/demote on `/admin/users` or secret-key CLI. Never a `profiles` column. **Enforced:** `check:admin-gate` (source contract test + migration scanner).
- **SEO base URL centralization** — never hardcode `http://localhost:3000`, read `NEXT_PUBLIC_SITE_URL` outside the resolver, or construct `new URL()` with a literal origin; resolve absolute URLs via `getSiteUrl()` or `metadataBase`. **Enforced:** `check:seo-base-url`.
- **Deterministic a11y (structure)** — every route has exactly one `<h1>`; meaningful images have non-empty `alt`; heading levels do not skip. **Enforced:** `check:a11y-structure`.
- **Deterministic a11y (contrast)** — semantic token foreground pairs in `globals.css` meet WCAG AA 4.5:1 in both `:root` and `.dark`. **Enforced:** `check:a11y-contrast`.
- **Application logging via wrappers** — application code in `src/` and admin CLI scripts under `scripts/admin/` must log through `appLog`, `cliLog`, or `clientLog`; raw `console.*` is allowed only at the exempt surfaces listed in `logging.mdc`. **Enforced:** `check:no-raw-console` (ESLint scoped to `no-console` with category-aligned exemptions).

**Planning / judgment principle (not mechanically enforced):** **Ecosystem alignment over aesthetic divergence** — Don't canonize a non-standard convention for tidiness or taste alone. Diverge from an ecosystem default (shadcn, Next.js, Supabase) only when our way has a real, articulable benefit — clarity, safety, consistency — that outweighs the cost of fighting it: tooling that assumes the standard, AI agents trained on it, and copy-paste examples that won't match. When it's a wash, follow the standard. A template multiplies both the benefit and the cost across every spinoff.

Consumption detail for demoted guidance lives in `.cursor/rules/`. **Change protocol:** edits to hard constraints route through the [Change protocol](#change-protocol) table below.

---

## Checklist before merging

- [ ] Quality bar passes ([Agent workflow](#agent-workflow) step 3)
- [ ] New routes align with the auth boundary ([Hard constraints](#hard-constraints))
- [ ] New or changed **public** route updates the § Hard constraints auth-boundary route list in the same change
- [ ] New tables have RLS (when migrations exist)
- [ ] README updated if env or scripts changed
- [ ] Human runs `pnpm db:push` after migrations (agents do not)

---

## Change protocol

| Change type | Action |
| ----------- | ------ |
| Hard constraints | Decided in PM/Claude chat with PM approval. Changing a hard constraint means changing its enforcement (check script, lint rule, or test) and the AGENTS.md [Hard constraints](#hard-constraints) list together — never the list alone. |
| Implemented features, routes, data model | What exists lives in the code (`src/`, `supabase/migrations/`). Whys live in ADRs, scoped rules, or [LEXICON.md](LEXICON.md) — not in AGENTS.md. |
| Planning / roadmap | Update [ROADMAP.md](ROADMAP.md) and the active PRD in [docs/prds/](docs/prds/); uncommitted ideas go to [BACKLOG.md](BACKLOG.md) |
| Coding standards | Update `.cursor/rules/` — not AGENTS.md |

Sync skills never initiate hard-constraint changes — they mirror changes already made through this protocol.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
