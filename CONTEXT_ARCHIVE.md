# CONTEXT_ARCHIVE.md — Shipped phase detail

**Append-only.** When a phase ships in full, move its epic/story detail here from [CONTEXT.md](CONTEXT.md). Never edit existing archive entries.

**Resolved decisions** from the planning brief also append here under `## Resolved decisions`.

---

## Phase 1 — Foundation & Cleanup `Shipped` (2026-06-18)

Get the cloned starter into a clean, opinionated baseline, make the inherited rule set correct and project-agnostic, and stand up the documentation layer. The rules work lands here (not at the end) because everything built in Phases 2–6 is expected to comply with these rules — they must be correct before they govern downstream work.

### Epic 1A — Foundation cleanup `Shipped`

- [x] **1A.1 — Remove starter scaffolding.** Delete the `tutorial/` components and any demo/test-example pages so projects spun from the template start clean.
- [x] **1A.2 — Standardize on pnpm.** Delete `package-lock.json` (created by an accidental `npm install`); use pnpm exclusively. Confirm `pnpm install` produces a clean tree.
- [x] **1A.3 — Dependency security pass.** Resolve the `npm audit` advisories by updating dev tooling **forward** (vitest / vite / esbuild to current; keep Next.js on its latest patch to clear the bundled `postcss` issue). **Do not** run `npm audit fix --force` — it would downgrade Next.js to 9 and break the app. Verify build + tests pass after.

### Epic 1B — Rules correctness & de-specialization `Shipped`

- [x] **1B.1 — Rules describe the template's actual stack and structure.** Vitest (not Jest), Next.js 16, `@/supabase/client` + `@/supabase/server`, `proxy.ts` auth boundary, `cn()` from `@/utils/tailwind`.
- [x] **1B.2 — Rule examples are project-agnostic and obey the locked principles.** Prior-project residue removed; rules-dir README de-specialized; semantic token examples throughout.

### Epic 1C — Docs `Shipped`

- [x] **1C.1 — Establish docs.** [CONTEXT.md](CONTEXT.md) (planning brief), [AGENTS.md](AGENTS.md) (doc map, agent workflow, schema authority), and a public-facing root [README.md](README.md). The rules-dir README is owned by 1B.2; 1C owns only the root README.

### Epic 1D — Dev tooling hygiene `Shipped`

- [x] **1D.1 — Husky hooks.** Pre-commit: lint-staged (ESLint + Prettier on staged JS/TS; Prettier on md/json/yaml/css) + type-check. Pre-push: `pnpm pre-push` mirrors CI (type-check → lint → format-check → test:ci with coverage).
- [x] **1D.2 — Coverage thresholds.** 80% minimum (lines, functions, branches, statements) in `vitest.config.ts`; `pnpm test:ci` runs with coverage; CI enforces via existing workflow. Baseline merit-based tests for auth forms, proxy, hooks, and utils. Coverage exclude set omits UI primitives, page/layout shells, thin providers, and client factories — not filler tests to hit the metric.
- [x] **1D.3 — `.prettierignore` and `.gitignore` audit.** Build output, lockfiles, env, and coverage ignored. Agent-authored top-level docs (`CONTEXT.md`, `AGENTS.md`, `CONTEXT_ARCHIVE.md`, `README.md`) and `.cursor` remain Prettier-ignored so whole-file agent syncs do not churn formatting.
