# Seminova

An opinionated, AI-native starter for building SaaS products with Next.js and Supabase.

Seminova gives product managers who build with AI coding tools (Cursor, Claude) a curated foundation — design-system structure, UI conventions, accessibility defaults, and a documented agent workflow — so new projects start with good bones instead of a blank slate.

For roadmap and phase planning, see [CONTEXT.md](CONTEXT.md). For agent repo truth, see [AGENTS.md](AGENTS.md).

---

## Stack

- **Next.js 16** (App Router) — React 19, TypeScript
- **Supabase** — auth, database, storage via `@supabase/ssr`
- **Tailwind CSS + shadcn/ui** — owned primitives in `src/components/ui`
- **TanStack Query v5** — client-side data fetching
- **next-themes** — light/dark theming over CSS variables
- **Vitest + React Testing Library + MSW v2** — testing and request mocking
- **pnpm** — exclusive package manager
- **Husky + lint-staged** — pre-commit quality checks
- **GitHub Actions** — CI on pull requests

---

## Prerequisites

- Node.js `>=22.22.2` (see [.nvmrc](.nvmrc))
- [pnpm](https://pnpm.io/) 11
- A [Supabase](https://supabase.com) project

---

## Quick start

1. Clone this repository and install dependencies:

   ```bash
   git clone <your-repo-url> seminova
   cd seminova
   pnpm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

3. Fill in your Supabase credentials in `.env.local` (from [Project Settings → API](https://app.supabase.com/project/_/settings/api)):

   | Variable | Description |
   | -------- | ----------- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable (anon) key |

4. Start the development server:

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Command | Description |
| ------- | ----------- |
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm start` | Run production build |
| `pnpm type-check` | TypeScript validation |
| `pnpm lint` | ESLint (repo-wide) |
| `pnpm lint-fix` | ESLint with auto-fix |
| `pnpm format` | Prettier write |
| `pnpm format-check` | Prettier check |
| `pnpm test` | Vitest watch mode (local dev) |
| `pnpm test:ci` | Vitest run once (CI / agents) |
| `pnpm test:ui` | Vitest UI |
| `pnpm analyze` | Bundle analyzer |

---

## Import paths

TypeScript path alias `@/` maps to `src/`:

```tsx
import { Button } from '@/components/ui/button'
import { createClient } from '@/supabase/client'
```

---

## Contributing and quality

**Pre-commit** (Husky): lint-staged on staged JS/TS files (ESLint + Prettier) plus full-project type-check.

**CI** (pull requests to `main`): type-check → lint → format-check → `test:ci`. See [.github/workflows/pull-request.yaml](.github/workflows/pull-request.yaml).

Before opening a PR, run locally:

```bash
pnpm type-check && pnpm lint && pnpm format-check && pnpm test:ci
```

> **Note:** Pre-push hook mirroring CI and 80% test coverage thresholds are planned (Phase 1 Epic 1D) — not enforced yet.

---

## Documentation

| Document | Audience | Purpose |
| -------- | -------- | ------- |
| [CONTEXT.md](CONTEXT.md) | PM + agents | Roadmap, active epics, planning decisions |
| [AGENTS.md](AGENTS.md) | Agents | Repo truth — routes, locked rules, data model |
| [.cursor/rules/](.cursor/rules/) | Agents | Coding standards and conventions |
| [.cursor/skills/](.cursor/skills/) | Agents | Workflows (`/sync-repo-docs`, `/create-migration`, etc.) |

---

## License

MIT — see [LICENSE.md](LICENSE.md).
