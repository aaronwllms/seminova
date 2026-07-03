# Rule Audit

**Audited:** 2026-07-02 (repeat run)  
**Prior remediation:** 2026-07-02 (priority + contradictions pass); 2026-07-02 (pass 2 — NEW findings); 2026-07-03 (RA-006 resolved via grill session)  
**Standard:** `.cursor/skills/rule-authoring/SKILL.md`  
**Scope:** 27 files in `.cursor/rules/*.mdc` (+ cross-check against `AGENTS.md`, `LOCKED_RULES.md`)

---

## Executive summary

Ranked by likely confusion if left unfixed:

1. **`testing.mdc` exceeds the 300-line hard ceiling** (340 lines) — tutorial good-vs-bad blocks (~95 lines) still deferred (RA-016) **DEFERRED**
2. **`code-minimalism.mdc` exceeds Always Apply word budget** — ~435 words vs ~150-word target; loads on every request (RA-005) **DEFERRED**
3. **Cross-file duplication still deferred** — `project-standards.mdc`, `git-workflow.mdc`, `api-development.mdc`, `ui-styling.mdc` tutorial trims (RA-017–022, RA-019, RA-025) **DEFERRED**

**Remediation holdover:** Priority pass (RA-001–015, C-001–C-003) and pass 2 (C-004, RA-026–032, rules README refresh) remain **RESOLVED**. RA-006 (`pm-collaboration.mdc`) resolved 2026-07-03 via a grill session that rebuilt the file from first principles rather than trimming the old draft. No regressions found on activation modes, brace-expansion globs, or stale schema claims.

---

## Findings

| ID     | File                                            | Status       | Principle violated               | Description                                                                                                                           | Recommendation                                                                                                                             |
| ------ | ----------------------------------------------- | ------------ | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| RA-001 | `api-development.mdc`                           | **RESOLVED** | Activation modes                 | Invalid `autoAttach:` frontmatter                                                                                                     | Replaced with `alwaysApply: false` + split `.ts`/`.tsx` globs                                                                              |
| RA-002 | `error-handling.mdc`                            | **RESOLVED** | Activation modes                 | Invalid `autoAttach:` frontmatter                                                                                                     | Narrowed globs to API routes, `actions.ts`, `error.tsx`                                                                                    |
| RA-003 | `testing.mdc`                                   | **PARTIAL**  | Size budgets + activation        | `alwaysApply` fixed; file still 340 lines (300 ceiling)                                                                               | Collapse good-vs-bad tutorial blocks to principles (RA-016)                                                                                |
| RA-004 | `project-standards.mdc`                         | **RESOLVED** | Activation modes                 | `alwaysApply: true` at 199 lines                                                                                                      | Demoted to Auto Attached; React patterns cross-ref `typescript.mdc`/`nextjs.mdc`                                                           |
| RA-005 | `code-minimalism.mdc`                           | **DEFERRED** | Size budgets (Always Apply)      | ~54 lines / ~435 words vs ~30 lines / ~150 words                                                                                      | Compress ladder to essentials; keep cross-refs                                                                                             |
| RA-006 | `pm-collaboration.mdc`                          | **RESOLVED** | Size budgets (Always Apply)      | Was ~51 lines / ~309 words vs ~30 lines / ~150 words                                                                                  | Rebuilt via grill session (not a trim) into 4 sections — Decision Making, Communication, Collaboration, Testing — at ~145 words / 24 lines |
| RA-007 | `supabase.mdc`                                  | **RESOLVED** | Currency                         | Stale "no custom schema" claim                                                                                                        | Updated to 3 shipped migrations + `AGENTS.md` cross-ref                                                                                    |
| RA-008 | `testing.mdc`                                   | **RESOLVED** | Currency                         | Phantom example paths                                                                                                                 | Pointed at real repo test files                                                                                                            |
| RA-009 | `api-development.mdc`                           | **RESOLVED** | Currency                         | Phantom `api-contracts` path                                                                                                          | Interim `_lib/` schema guidance; dead glob removed                                                                                         |
| RA-010 | `react-tanstack-query.mdc`                      | **RESOLVED** | Currency                         | Aspirational paths + Phase 5 language                                                                                                 | `use-sign-out.ts` + legacy `useGetMessage`; links to error UI components                                                                   |
| RA-011 | `ui-shadcn.mdc`                                 | **RESOLVED** | Currency                         | Stale `style: default`                                                                                                                | Updated to `new-york`                                                                                                                      |
| RA-012 | `project-standards.mdc`                         | **RESOLVED** | Currency                         | `use-get-message.ts` example                                                                                                          | Changed to `use-sign-out.ts`                                                                                                               |
| RA-013 | `forms.mdc`, `notifications.mdc`, `logging.mdc` | **RESOLVED** | Activation modes                 | Brace-expansion globs                                                                                                                 | Split to separate `.ts` and `.tsx` entries                                                                                                 |
| RA-014 | `git-workflow.mdc`                              | **RESOLVED** | Activation modes                 | `**/*` glob too broad                                                                                                                 | Narrowed to `src/**`, `scripts/**`, `.husky/**`, `.github/workflows/**`                                                                    |
| RA-015 | `do-migrations-agent.mdc`                       | **RESOLVED** | Activation modes                 | `alwaysApply: true` on UI-only tasks                                                                                                  | Glob-scoped + new `do-migrations-pointer.mdc` alwaysApply stub                                                                             |
| RA-016 | `testing.mdc`                                   | **DEFERRED** | Signal-to-noise                  | Good-vs-bad tutorial blocks (lines 181–256, ~75 lines)                                                                                | Collapse to 1–2 principle statements + file refs                                                                                           |
| RA-017 | `git-workflow.mdc`                              | **DEFERRED** | Signal-to-noise                  | Verbose commit/PR examples (lines 46–160)                                                                                             | Trim; link to Conventional Commits + user PR rule                                                                                          |
| RA-018 | `project-standards.mdc`                         | **DEFERRED** | Signal-to-noise                  | Generic tutorial content (SOLID, import examples)                                                                                     | Cross-ref trim                                                                                                                             |
| RA-019 | `ui-styling.mdc`                                | **DEFERRED** | Signal-to-noise                  | Duplicate layout/image tutorials (lines 78–157)                                                                                       | Cut; point at `nextjs.mdc` / `LOCKED_RULES.md`                                                                                             |
| RA-020 | `project-standards.mdc`                         | **DEFERRED** | Single ownership                 | Duplicates `error-handling.mdc` / `git-workflow.mdc` / `AGENTS.md` (lines 159–186)                                                    | One-line cross-refs only                                                                                                                   |
| RA-021 | `project-standards.mdc`                         | **DEFERRED** | Single ownership                 | Duplicates `security.mdc` (lines 170–175)                                                                                             | One-line cross-ref                                                                                                                         |
| RA-022 | `api-development.mdc`                           | **DEFERRED** | Single ownership                 | Duplicates `error-handling.mdc` envelopes (lines 40–50, 64–76, 84–94)                                                                 | Cross-ref trim; keep API-specific checklist only                                                                                           |
| RA-023 | `project-standards.mdc`                         | **RESOLVED** | Contradiction                    | Test naming + arrow function inconsistency                                                                                            | Aligned with `testing.mdc` and `typescript.mdc`                                                                                            |
| RA-024 | `ui-styling.mdc`                                | **RESOLVED** | Contradiction                    | Hardcoded gray utilities vs `LOCKED_RULES.md`                                                                                         | Semantic token example from `globals.css`                                                                                                  |
| RA-025 | SQL helper rules                                | **DEFERRED** | Signal-to-noise                  | Persona boilerplate + multi-example templates in `create-db-functions.mdc`, `create-rls-policies.mdc`, `postgres-sql-style-guide.mdc` | Scope to project migrations; link `create-migration` skill                                                                                 |
| RA-026 | `error-handling.mdc`                            | **RESOLVED** | Currency                         | Lines 88, 100 referenced "Phase 5" for API routes and `ErrorBoundary` components                                                      | Rewritten present-tense; points at shipped `inline-error.tsx`, `error-panel.tsx`, `error.tsx`                                              |
| RA-027 | `supabase.mdc`                                  | **RESOLVED** | Currency                         | Line 62 "Epic 5 handoff" and line 180 "Phase 6 tooling"                                                                               | Present-tense avatar flow + `pnpm db:push` workflow                                                                                        |
| RA-028 | `supabase.mdc`                                  | **RESOLVED** | Currency                         | Lines 140–145 recommended `src/services/` repository pattern — directory does not exist                                               | Replaced with `_lib/`, hooks, `actions.ts` patterns; `src/services/` noted as future-only                                                  |
| RA-029 | `api-development.mdc`                           | **RESOLVED** | Single ownership + contradiction | Envelope examples omitted `kind`                                                                                                      | Quick-ref, example, and checklist updated to include `kind`                                                                                |
| RA-030 | `create-rls-policies.mdc`                       | **RESOLVED** | Contradiction (self)             | Line 32 canonical INSERT template used `USING` and `WITH (true)`                                                                      | Fixed to `WITH CHECK` only                                                                                                                 |
| RA-032 | `security.mdc`                                  | **RESOLVED** | Single ownership                 | Auth response examples omitted `kind`                                                                                                 | Added `kind: 'operational'` to inline examples                                                                                             |

---

## Contradictions found

### C-001: Test file naming — **RESOLVED**

`project-standards.mdc` cites `component.unit.test.tsx` and cross-refs `testing.mdc`.

### C-002: Component export style — **RESOLVED**

`project-standards.mdc` example uses `export const UserProfile = () =>`.

### C-003: Theme colors — **RESOLVED**

`ui-styling.mdc` uses semantic CSS variables; gray utility example removed.

### C-004: Error envelope `kind` field — **RESOLVED**

`api-development.mdc` and `security.mdc` examples now include `kind` per `error-handling.mdc` owner contract.

---

## Rules that are fine

| File                           | Notes                                                                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `rule-authoring-pointer.mdc`   | Thin trigger; correct glob scope; no duplication.                                                                         |
| `do-migrations-pointer.mdc`    | Thin alwaysApply stub pointing to `do-migrations-agent.mdc`; within budget.                                               |
| `general-conventions.mdc`      | Always Apply, 24 lines / ~124 words, repo-specific date/env awareness.                                                    |
| `documentation.mdc`            | Focused structural guardrail; links out instead of restating `DOC_RULES.md`.                                              |
| `data-tables.mdc`              | Project-specific patterns with real reference (`users-table.tsx`, `users-columns.tsx`).                                   |
| `logging.mdc`                  | Clean ownership split with `error-handling.mdc`.                                                                          |
| `notifications.mdc`            | Owns toast vs inline vs panel routing.                                                                                    |
| `forms.mdc`                    | Profile reference implementation, save-model rules, autofill tokens; envelope includes `kind`.                            |
| `error-handling.mdc`           | AppError envelopes, operational vs fault; activation fixed (RA-002); present-tense API/error UI guidance (RA-026).        |
| `api-development.mdc`          | Forward-looking API conventions; activation + schema path fixed; envelope `kind` aligned (RA-029, C-004).                 |
| `security.mdc`                 | Primary security owner; under 300 ceiling; envelope examples include `kind` (RA-032, C-004).                              |
| `do-migrations-agent.mdc`      | Agent-safety protocol; glob-scoped with pointer stub (RA-015).                                                            |
| `typescript.mdc`               | Reasonable Auto Attached scope; gradual named-export migration noted honestly.                                            |
| `nextjs.mdc`                   | App Router + Server Action defaults align with shipped architecture.                                                      |
| `ui-accessibility.mdc`         | WCAG guidance with shadcn/Radix specifics; under 250-line target.                                                         |
| `ui-shadcn.mdc`                | CLI flags and component-first policy; style string fixed (RA-011).                                                        |
| `ui-styling.mdc`               | Token theming fixed (RA-024); layout tutorials deferred (RA-019).                                                         |
| `create-rls-policies.mdc`      | Agent Requested SQL helper; INSERT template fixed (RA-030).                                                               |
| `create-db-functions.mdc`      | Agent Requested SQL helper; persona trim deferred (RA-025).                                                               |
| `postgres-sql-style-guide.mdc` | Agent Requested SQL style reference; under budget.                                                                        |
| `supabase.mdc`                 | Schema + avatar flow current; data-access patterns point at shipped code (RA-027, RA-028).                                |
| `react-tanstack-query.mdc`     | Real hook refs; legacy `useGetMessage` noted.                                                                             |
| `project-standards.mdc`        | Demoted to Auto Attached; contradictions fixed; tutorial trim deferred.                                                   |
| `testing.mdc`                  | Activation fixed; examples verified; size trim deferred (RA-016).                                                         |
| `git-workflow.mdc`             | Glob narrowed (RA-014); body trim deferred (RA-017).                                                                      |
| `pm-collaboration.mdc`         | Rebuilt via grill session 2026-07-03; intentional Always Apply partnership contract, now within budget (RA-006 resolved). |
| `code-minimalism.mdc`          | High-signal ladder; size trim deferred (RA-005).                                                                          |

---

## Open questions

1. **`do-migrations-agent.mdc` Always Apply** — **Decided:** glob-scoped + `do-migrations-pointer.mdc` alwaysApply stub.
2. **`pm-collaboration.mdc` Always Apply** — **Decided (2026-07-03):** kept Always Apply; content rebuilt via grill session into Decision Making / Communication / Collaboration / Testing sections, compressed to ~145 words / 24 lines (RA-006 resolved). Fork-to-team-without-a-PM question remains theoretical — no action needed until it's real.
3. **`api-development.mdc` without shipped API routes** — **Decided:** keep forward-looking with `_lib/` interim schema pattern.
4. **`useGetMessage.ts` legacy hook** — **Open**; referenced with legacy note until hook removed.
5. **`rule-authoring` ownership table** — No action; verify on next quarterly pass.
6. **`git-workflow.mdc` vs user Cursor rules** — **Open**; body trim deferred (RA-017).
7. **`.cursor/rules/README.md` stale** — **Decided:** refreshed in pass 2 (27 files, four alwaysApply rules, corrected globs).

---

## Follow-up

**Next priority (deferred pass):** RA-005 `code-minimalism.mdc` Always Apply size trim; RA-016–022/025 signal-to-noise and dedup trims.

**Open for next session:** Q4 (`useGetMessage.ts` legacy hook) and Q6 (`git-workflow.mdc` vs global Cursor rules) — to be resolved in a separate chat.

Re-run `/rule-audit` after the deferred pass to close remaining findings.
