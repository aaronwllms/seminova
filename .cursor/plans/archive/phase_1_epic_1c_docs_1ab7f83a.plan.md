---
name: Phase 1 Epic 1C Docs
overview: "Establish the documentation layer for Seminova: create AGENTS.md as agent repo truth, rewrite the root README for human onboarding, and sync CONTEXT.md to reflect completed Epics 1A/1B. Sequential plan — AGENTS.md first because skills and other docs depend on it."
todos:
  - id: create-agents-md
    content: Create AGENTS.md with doc map, agent workflow, locked rules summary, implemented state, data model, where-things-live, merge checklist, change protocol
    status: completed
  - id: rewrite-readme
    content: "Rewrite root README.md for Seminova: pitch, prerequisites, clone/setup, env vars, scripts, contributing (current hooks only), doc map"
    status: completed
  - id: sync-context
    content: "Sync CONTEXT.md: mark 1A/1B shipped, update last-updated, verify AGENTS cross-links; optional CONTEXT_ARCHIVE stub + .cursor/README de-specialize"
    status: completed
  - id: verify-gate
    content: Run quality gate + manual doc link/route checks before closing epic
    status: completed
isProject: false
---

# Phase 1 Epic 1C — Docs

## Prerequisites (verified)

| Epic | Status | Evidence |
|------|--------|----------|
| **1A** Foundation cleanup | Shipped in code | Commit `668fc61`; no `tutorial/`, `test-examples/`, or `package-lock.json`; Vitest 3 / Vite 6 / Next 16.2.9 |
| **1B** Rules correctness | Shipped | `.cursor/rules/` clean of Jest, Next 14, Cookloop, `@/utils/supabase`, `middleware.ts` |
| **1C** Docs | **Next** | [CONTEXT.md](CONTEXT.md) exists (~227 lines); [AGENTS.md](AGENTS.md) missing; [README.md](README.md) still upstream SupaNext Starter |

**Out of scope for 1C** (per [CONTEXT.md](CONTEXT.md) ACTIVE): Epic 1D hooks/coverage, full Phase 1 archive to CONTEXT_ARCHIVE.md, rules-dir README (owned by 1B — already done).

---

## Why sequential (not parallel)

All three deliverables touch the same facts (routes, auth boundary, stack, what's shipped). **AGENTS.md must land first** — [sync-repo-docs](.cursor/skills/sync-repo-docs/SKILL.md), [sync-context-md](.cursor/skills/sync-context-md/SKILL.md), [plan-next-epic](.cursor/skills/plan-next-epic/SKILL.md), and multiple skills already reference `AGENTS.md` as repo truth. README and CONTEXT then link to it without inventing conflicting content.

```mermaid
flowchart LR
  A[Create AGENTS.md] --> B[Rewrite README.md]
  B --> C[Sync CONTEXT.md]
  C --> D[Optional doc hygiene]
```

---

## Step 1 — Create [AGENTS.md](AGENTS.md)

**Purpose:** Agent repo truth — what exists today, locked rules summary, where to look, merge checklist. **Do not** duplicate `.cursor/rules/` coding standards (point there instead).

Use section ownership from [sync-repo-docs/reference.md](.cursor/skills/sync-repo-docs/reference.md). Target ~150–250 lines; factual, not roadmap.

### Recommended sections

1. **Documentation map** — table linking:
   - [CONTEXT.md](CONTEXT.md) — planning brief, ACTIVE epics, roadmap
   - [README.md](README.md) — human setup/onboarding
   - [.cursor/rules/](.cursor/rules/) — how to write code (not product truth)
   - [.cursor/skills/](.cursor/skills/) — user-triggered workflows (`/sync-repo-docs`, `/create-migration`, etc.)
   - [.cursor/plans/](.cursor/plans/) — ephemeral; not shipped truth
   - Note: `CONTEXT_ARCHIVE.md` does not exist yet (created when a phase ships in full)

2. **Agent workflow** — concise build-time loop:
   - Read AGENTS.md + relevant rules/skills before coding
   - Migrations: agents write SQL only; humans run `pnpm db:push` ([do-migrations-agent.mdc](.cursor/rules/do-migrations-agent.mdc))
   - Quality bar: `pnpm type-check && pnpm lint && pnpm format-check && pnpm test:ci`
   - Doc sync after behavior changes: `/sync-repo-docs`, `/sync-context-md`

3. **Setup and quality commands** — mirror [package.json](package.json) scripts table (dev, build, lint, format-check, type-check, test, test:ci)

4. **Locked rules** — canonical summary mirroring [CONTEXT.md §3](CONTEXT.md) (pnpm-only, primitive-first UI, semantic tokens, auth boundary, shadcn CLI flags, WCAG AA, component size, `next/image`). **Cross-reference** `.cursor/rules/` for consumption detail; do not paste full rule files.

5. **Implemented now** — factual bullets for current repo state:
   - Starter scaffolding removed (Epic 1A)
   - Rules de-specialized and stack-accurate (Epic 1B)
   - Auth: Supabase email/password flows under `/auth/**`
   - Session refresh + route protection via [proxy.ts](proxy.ts) → [src/supabase/proxy.ts](src/supabase/proxy.ts)
   - **Product routes:** `/` (public), `/auth/**` (public), `/protected` (authenticated)
   - UI primitives in `src/components/ui/`; TanStack Query provider configured
   - Husky pre-commit (lint-staged + type-check) — note pre-push/coverage is **planned Epic 1D**, not yet enforced

6. **Data model (summary)** — `0` custom migrations; only `auth.users`. First planned entity: `profiles` (Phase 6). Schema authority lives here once migrations ship.

7. **Where things live** — key paths:
   - `src/app/` — routes
   - `src/supabase/` — client, server, proxy
   - `src/components/ui/` — owned shadcn primitives
   - `src/test/` — test utils
   - `supabase/migrations/` — empty today

8. **Logging convention** — bracket-tagged `console.*` (referenced by [error-handling.mdc](.cursor/rules/error-handling.mdc); no `@/utils/logger`)

9. **Checklist before merging** — type-check, lint, format-check, test:ci; update AGENTS/README if routes/schema/env changed; human runs `db:push` after migrations

10. **Change protocol** — locked-rules edits require PM approval; everything else: minimal factual updates via sync-repo-docs

### Content sources to verify against code (not memory)

- Auth public routes: [src/supabase/proxy.ts](src/supabase/proxy.ts) lines 50–59 (`/` and `/auth/**` public; else redirect to `/auth/login`)
- Env vars: [.env.example](.env.example)
- Node version: [.nvmrc](.nvmrc) (`v22.22.2`)

---

## Step 2 — Rewrite [README.md](README.md)

**Purpose:** Public-facing human onboarding for **Seminova**, not Michael Troya's SupaNext Starter.

Replace upstream branding, clone-via-`create-next-app`, showcase section, and upstream issue links.

### Recommended structure

1. **Opening** — What Seminova is (opinionated AI-native SaaS starter); who it's for (PMs building with Cursor); link to CONTEXT.md for roadmap
2. **Features / stack** — concise bullet list from [CONTEXT.md §4](CONTEXT.md) (Next 16, Supabase, Tailwind/shadcn, Vitest, TanStack Query, pnpm)
3. **Prerequisites** — Node `>=22.22.2` (from `.nvmrc`), pnpm 11, Supabase project
4. **Quick start** — clone **this repo** (not upstream template URL); `pnpm install`; copy `.env.example` → `.env.local`; fill Supabase URL + publishable key; `pnpm dev`
5. **Environment** — table from `.env.example`
6. **Scripts** — table from `package.json` (include `test:ci` for CI parity)
7. **Import alias** — `@/` prefix (fix stale `Button` casing example in current README)
8. **Contributing & quality** — document **current** hook reality:
   - Pre-commit: lint-staged (JS/TS) + type-check
   - CI ([pull-request.yaml](.github/workflows/pull-request.yaml)): type-check → lint → format-check → test:ci
   - Note: full pre-push mirror + 80% coverage gates land in **Epic 1D** (avoid documenting hooks that don't exist yet)
9. **Documentation map** — CONTEXT.md (planning), AGENTS.md (agents), `.cursor/rules/` (coding standards)
10. **License** — MIT (keep [LICENSE.md](LICENSE.md) link)

**Remove:** "Switch to Yarn/npm" section (violates locked pnpm-only rule), upstream Twitter badges, showcase list.

---

## Step 3 — Sync [CONTEXT.md](CONTEXT.md)

CONTEXT.md is substantive but stale relative to code. Minimal updates only — **do not** archive Phase 1 yet (1D remains).

- Mark **Epic 1A** and **Epic 1B** stories as shipped (checkboxes or `Done` markers in ACTIVE section)
- Keep Phase 1 status `In progress` until 1D ships
- Update **Last updated** date to implementation day
- Ensure cross-links to AGENTS.md resolve
- **Do not** move ACTIVE content to CONTEXT_ARCHIVE.md until the full phase ships (per file management rules)

### Optional small fix (recommended)

- Create minimal [CONTEXT_ARCHIVE.md](CONTEXT_ARCHIVE.md) stub (title + "append-only; no entries yet") — fixes broken links in CONTEXT.md line 9 and [.cursor/README.md](.cursor/README.md). Low effort; not strictly required by 1C.1 wording but prevents 404s for agents following doc map.

### Optional doc hygiene (same PR, low risk)

- [.cursor/README.md](.cursor/README.md) still says **"Localfront"** (line 1) — de-specialize to Seminova while editing doc map; aligns with AGENTS documentation map

---

## Verification gate

Run before marking epic complete:

```bash
pnpm type-check && pnpm lint && pnpm format-check && pnpm test:ci
```

**Doc checks (manual):**

- [ ] `AGENTS.md` exists at repo root; all internal links resolve
- [ ] README describes Seminova, not SupaNext; setup steps work for a fresh clone
- [ ] AGENTS locked rules match CONTEXT.md §3 (no contradictions)
- [ ] AGENTS "Implemented now" matches actual routes in `src/app/`
- [ ] No duplication of full `.cursor/rules/` content in AGENTS.md
- [ ] Skills that grep for `AGENTS.md` ([pre-release-review](.cursor/skills/pre-release-review/SKILL.md), [sync-repo-docs](.cursor/skills/sync-repo-docs/SKILL.md), etc.) can load the file
- [ ] CONTEXT.md reflects 1A/1B shipped; 1C/1D still ACTIVE

**PM manual smoke test:**

1. Read README as a new contributor — can you get from clone to `localhost:3000`?
2. Ask Cursor to "read AGENTS.md" — does it correctly state public vs protected routes and migration constraints?
3. Confirm README does not instruct `npm install` or link to upstream supa-next-starter issues

---

## What comes after 1C

| Epic | Scope |
|------|-------|
| **1D** | Husky pre-push mirroring CI, 80% Vitest coverage thresholds, `.prettierignore`/`.gitignore` audit |
| **Phase 1 close** | When 1D ships: append Phase 1 to CONTEXT_ARCHIVE.md, update roadmap status, remove ACTIVE section |
