# Rule Audit

**Audited:** 2026-07-03 (repeat run — pass 4)  
**Remediation:** 2026-07-03 (pass 3 — project-standards retire-in-place, git-workflow globs, README, RLS links, RA-020, audit dispositions)  
**Standard:** [`.cursor/skills/rule-authoring/SKILL.md`](.cursor/skills/rule-authoring/SKILL.md)  
**Scope:** All 27 files in `.cursor/rules/*.mdc`, cross-checked against `AGENTS.md` and `LOCKED_RULES.md`  
**Prior run:** 2026-07-03 (pass 3 remediation verified this run)

---

## Executive summary

Ranked by what would most confuse Cursor if left unfixed:

1. **NEW — `pm-collaboration.mdc` vs user-rule code citations (C-004 / RA-021)** — always-on “never include code blocks in chat” collides with user rules requiring `startLine:endLine:filepath` citations; agents get contradictory instructions every session.
2. **UI rules (`ui-styling`, `ui-accessibility`, `ui-shadcn`) carry redundant code examples** — several multi-block tutorials where file references and one principle would suffice (RA-009–RA-011; deferred).
3. **`rule-authoring` ownership table incomplete** — omits `logging.mdc`, `notifications.mdc`, `forms.mdc`, `data-tables.mdc` (RA-019; meta, next maintenance pass).
4. **Pass-3 remediations verified stable** — `project-standards.mdc`, `git-workflow.mdc`, README, RLS links, `security.mdc` Input Validation merge, `forms.mdc` / `notifications.mdc` glob comments all hold.
5. **Accepted dispositions unchanged** — `testing.mdc` length (RA-006), SQL verbatim templates (RA-008), `code-minimalism.mdc` word count (RA-016), broad `forms.mdc` / `notifications.mdc` globs deliberate.

---

## Findings

| ID     | Status   | File                                                      | Principle violated                     | Description                                                                                                                                                                                                                                         | Recommendation / disposition                                                                                                                                                                 |
| ------ | -------- | --------------------------------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RA-001 | RESOLVED | `security.mdc`                                            | Single ownership / activation conflict | § Server Actions previously showed `throw new Error(…)`. Now cross-refs `error-handling.mdc` and `src/app/admin/users/actions.ts`.                                                                                                                  | No action — verified fixed (pass 2).                                                                                                                                                         |
| RA-002 | RESOLVED | `security.mdc`                                            | Single ownership                       | § Broken Access Control previously returned bare `{ error: '…' }`. Now uses canonical envelope.                                                                                                                                                     | No action — verified fixed (pass 2).                                                                                                                                                         |
| RA-003 | RESOLVED | `project-standards.mdc`                                   | Activation mode                        | Previously auto-attached on `**/*.ts` / `**/*.tsx`.                                                                                                                                                                                                 | **Pass 3:** globs removed; Agent Requested with specific description. Verified pass 4.                                                                                                       |
| RA-004 | RESOLVED | `git-workflow.mdc`                                        | Activation mode                        | Previously attached on `src/**/*.ts` / `src/**/*.tsx` during ordinary feature work.                                                                                                                                                                 | **Pass 3:** `src/**` and `scripts/**` globs removed; `.husky/**` and `.github/workflows/**` only. Verified pass 4.                                                                           |
| RA-005 | RESOLVED | `project-standards.mdc`                                   | Signal-to-noise                        | Generic Development Philosophy, SOLID/DRY, Performance, Anti-patterns, Component Structure example.                                                                                                                                                 | **Pass 3:** stripped; body is file layout, depth heuristic, utils placement only. Verified pass 4.                                                                                           |
| RA-006 | ACCEPTED | `testing.mdc`                                             | Size budget                            | 340 lines — exceeds 300-line inspect trigger; ~120 lines are good-vs-bad comparison blocks.                                                                                                                                                         | **Disposition:** intentional counterweight to observed over-testing failure mode; size-budget override is deliberate. No trim in pass 3.                                                     |
| RA-007 | RESOLVED | `create-rls-policies.mdc`                                 | Currency (stale paths)                 | Non-repo `mdc:docs/guides/…` links and malformed GitHub URL.                                                                                                                                                                                        | **Pass 3:** replaced with standard Supabase doc URLs and `https://github.com/GaryAustin1/RLS-Performance`. Verified pass 4 — no stale links remain.                                          |
| RA-008 | ACCEPTED | `create-db-functions.mdc`, `postgres-sql-style-guide.mdc` | Signal-to-noise                        | Multiple full SQL templates; portable Supabase starter material.                                                                                                                                                                                    | **Disposition:** kept verbatim for parity with `/create-migration` skill. No trim in pass 3.                                                                                                 |
| RA-009 | OPEN     | `ui-styling.mdc`                                          | Signal-to-noise                        | § Responsive Design, § Dark Mode, § Best Practices — redundant responsive/dark-mode examples and checklist duplicating `LOCKED_RULES.md` (lines 12–16, 78–122, 159–167).                                                                            | Deferred — incremental trim when bandwidth allows.                                                                                                                                           |
| RA-010 | OPEN     | `ui-accessibility.mdc`                                    | Signal-to-noise                        | § Custom Component Accessibility, § WCAG 2.1 AA Compliance — generic WCAG tutorial blocks restating `LOCKED_RULES.md` and Radix defaults (lines 32–151, 173–179).                                                                                   | Deferred — incremental trim when bandwidth allows.                                                                                                                                           |
| RA-011 | OPEN     | `ui-shadcn.mdc`                                           | Signal-to-noise                        | § Component Composition Patterns, § Creating Composite Components, § Common shadcn/ui Patterns — full composite examples teach shadcn usage the agent already knows (lines 86–213).                                                                 | Deferred — incremental trim when bandwidth allows.                                                                                                                                           |
| RA-012 | RESOLVED | `security.mdc`                                            | Single ownership                       | RLS SQL blocks previously duplicated `create-rls-policies.mdc`.                                                                                                                                                                                     | No action — verified fixed (pass 2).                                                                                                                                                         |
| RA-013 | RESOLVED | `security.mdc`                                            | Signal-to-noise / currency             | Open Redirect previously re-implemented `isSafeRedirect` inline.                                                                                                                                                                                    | No action — verified fixed (pass 2).                                                                                                                                                         |
| RA-014 | RESOLVED | `project-standards.mdc`                                   | Single ownership                       | Error Handling, Security, Quality Standards restated owned rules.                                                                                                                                                                                   | **Pass 3:** replaced with one-line cross-refs in § Cross-References. Verified pass 4.                                                                                                        |
| RA-015 | RESOLVED | `project-standards.mdc`, `typescript.mdc`                 | Single ownership                       | RORO duplicated across both files.                                                                                                                                                                                                                  | **Pass 3:** RORO removed from `project-standards.mdc`; cross-ref to `typescript.mdc`. Verified pass 4.                                                                                       |
| RA-016 | ACCEPTED | `code-minimalism.mdc`                                     | Always Apply size budget               | ~435 words per file vs ~200-word per-file guidance; always-apply set total ~767 words (under ~800-word cap).                                                                                                                                        | **Disposition:** set total within budget; per-file exceedance accepted as intentional.                                                                                                       |
| RA-017 | RESOLVED | `.cursor/rules/README.md`                                 | Currency / internal consistency        | "150-line component size guideline" conflicted with depth heuristic.                                                                                                                                                                                | **Pass 3:** updated to Ousterhout depth heuristic (~300–400 inspect threshold). Verified pass 4.                                                                                             |
| RA-018 | RESOLVED | `.cursor/rules/README.md`                                 | Currency                               | Omitted `forms.mdc` and `notifications.mdc`.                                                                                                                                                                                                        | **Pass 3:** entries added with globs and ownership split notes. Verified pass 4.                                                                                                             |
| RA-019 | OPEN     | `rule-authoring` SKILL                                    | Single ownership table                 | § Single ownership table omits `logging.mdc`, `notifications.mdc`, `forms.mdc`, `data-tables.mdc`.                                                                                                                                                  | Extend on next rule-authoring maintenance pass (meta finding).                                                                                                                               |
| RA-020 | RESOLVED | `security.mdc`                                            | Signal-to-noise                        | Duplicate `##` / `### Input Validation` headings.                                                                                                                                                                                                   | **Pass 3:** merged to single `## Input Validation` section. Verified pass 4.                                                                                                                 |
| RA-021 | **NEW**  | `pm-collaboration.mdc`                                    | Rule hierarchy / contradiction         | § Communication (lines 19–22): "Never include code blocks in chat responses, in any context." User rules in the same session require `startLine:endLine:filepath` citation blocks when referencing code. Both are explicit, always-on instructions. | Clarify intent: exempt navigation citations, or narrow the ban to illustrative/tutorial blocks only. Until resolved, agents will oscillate between prose-only and citation-format responses. |

---

## Contradictions found

### C-001 — Server Actions: throw vs typed envelope — RESOLVED (pass 2)

### C-002 — API error JSON shape in security rule — RESOLVED (pass 2)

### C-003 — Component size guidance — RESOLVED (pass 3)

- **Rules:** `.cursor/rules/README.md` vs `project-standards.mdc` § File and Component Organization
- **Resolution:** README now cites Ousterhout depth heuristic and ~300–400 inspect threshold; `project-standards.mdc` is the canonical owner.

### C-004 — Chat code blocks vs code citations — **NEW** (pass 4)

- **Rules:** `pm-collaboration.mdc` § Communication vs user rules ("Use code citation blocks… `startLine:endLine:filepath`")
- **Scenario:** Agent finishes a code change and summarizes for the PM. `pm-collaboration.mdc` forbids any code blocks in chat; user rules require citation-format blocks when pointing at existing code. Both load every request — the agent cannot satisfy both literally.
- **Recommendation:** Amend `pm-collaboration.mdc` to ban illustrative/tutorial code blocks in chat while permitting one-line filepath citations, **or** confirm prose-only is intentional and remove the citation requirement from user rules. PM decision.

---

## Rules that are fine

| File                           | Notes                                                                                                |
| ------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `api-development.mdc`          | Error envelope examples include `kind`; strong cross-refs to `error-handling.mdc`.                   |
| `code-minimalism.mdc`          | Clear always-on ladder; RA-016 accepted.                                                             |
| `create-rls-policies.mdc`      | Link hygiene fixed (pass 3); INSERT template correct; Supabase doc URLs verified.                    |
| `create-db-functions.mdc`      | RA-008 accepted — templates kept for skill parity.                                                   |
| `data-tables.mdc`              | Tight, project-specific; points at `users-table.tsx` and `DataTableShell`.                           |
| `do-migrations-agent.mdc`      | Agent constraints are precise and non-duplicative.                                                   |
| `do-migrations-pointer.mdc`    | Minimal always-on stub; correct indirection.                                                         |
| `documentation.mdc`            | Thin structural guardrail; `mdc:docs/…` links resolve to real repo paths.                            |
| `error-handling.mdc`           | Owns error taxonomy and UI routing; delegates logging and toasts.                                    |
| `forms.mdc`                    | Save-model and autofill rules; broad `src/**` globs documented intentional (pass 3).                 |
| `general-conventions.mdc`      | Appropriate always-on scope (~124 words).                                                            |
| `git-workflow.mdc`             | Globs scoped to `.husky/**` and `.github/workflows/**`; Agent Requested for commit/PR work (pass 3). |
| `logging.mdc`                  | Owns log levels and tags.                                                                            |
| `nextjs.mdc`                   | App Router guidance with server-action default.                                                      |
| `notifications.mdc`            | Toast routing; broad `src/**` globs documented intentional (pass 3).                                 |
| `postgres-sql-style-guide.mdc` | RA-008 accepted — templates kept for skill parity.                                                   |
| `project-standards.mdc`        | Retired-in-place (pass 3): Agent Requested, project-only body, cross-refs only for owned concerns.   |
| `react-tanstack-query.mdc`     | Labels legacy demo hook; points at real conventions.                                                 |
| `rule-authoring-pointer.mdc`   | Correct glob and indirection to skill.                                                               |
| `security.mdc`                 | Envelope/RLS/redirect fixes verified; RA-020 resolved; Input Validation single heading confirmed.    |
| `supabase.mdc`                 | Shipped schema refs accurate; cited paths exist.                                                     |
| `testing.mdc`                  | RA-006 accepted — didactic blocks intentional.                                                       |
| `typescript.mdc`               | Owns RORO; focused TS conventions.                                                                   |

**Note:** `pm-collaboration.mdc` is structurally sound (correct always-on placement, ~171 words) but carries RA-021 / C-004 — listed here for completeness of the 27-file inventory; the contradiction is with user rules, not with another `.mdc` file.

**UI rules with open signal-to-noise findings (not "fine"):** `ui-styling.mdc` (RA-009), `ui-accessibility.mdc` (RA-010), `ui-shadcn.mdc` (RA-011).

---

## Open questions

1. **Chat code blocks (RA-021 / C-004)** — Should `pm-collaboration.mdc` exempt `startLine:endLine:filepath` navigation citations, or is prose-only chat the hard requirement?
2. **UI rule trim pass (RA-009–RA-011)** — When to schedule incremental signal-to-noise cuts on `ui-styling`, `ui-accessibility`, `ui-shadcn`?
3. **`rule-authoring` ownership table (RA-019)** — Extend on next quarterly maintenance pass?
4. **`typescript.mdc` broad globs (`**/_.ts`, `\*\*/_.tsx`)** — Attaches alongside `security.mdc`, `supabase.mdc`, `forms.mdc`, and `notifications.mdc` on most edits. Likely intentional; watch for context-budget pressure if more broad globs are added.

**Closed in pass 3 (verified pass 4):**

- `project-standards.mdc` intent → retired-in-place as Agent Requested project-layout rule.
- `git-workflow.mdc` glob scope → intentionally `.husky` / `.github/workflows` only; Agent Requested otherwise.
- `testing.mdc` didactic length → **ACCEPTED** (RA-006).
- SQL rules as upstream copies → **ACCEPTED** (RA-008).
- `forms.mdc` / `notifications.mdc` broad globs → **intentional**; frontmatter comments present.

---

## Verification notes

**Pass-4 spot checks (all OK):**

- `project-standards.mdc` — no globs; `alwaysApply: false`; specific Agent Requested description; ~68 lines project-only body
- `git-workflow.mdc` — globs: `.husky/**`, `.github/workflows/**` only; frontmatter comment present
- `create-rls-policies.mdc` — no remaining `mdc:docs/guides/` or malformed GitHub links; Supabase URLs live
- `security.mdc` — single `## Input Validation` heading; no `throw new Error` or bare `{ error }` patterns
- `forms.mdc` / `notifications.mdc` — frontmatter rationale comments present
- `.cursor/rules/README.md` — depth heuristic, `forms.mdc` / `notifications.mdc` entries, Agent Requested `project-standards.mdc`
- Always-apply set word count — ~767 words combined (under ~800 cap); `code-minimalism.mdc` alone ~435 words (RA-016 accepted)
- Cited paths sampled — `ThemeProvider.tsx`, `useGetMessage.ts`, `.mockups/error-states.html`, `src/app/admin/users/actions.ts` all exist

**Prior pass regressions (still OK):** envelope shapes in `security.mdc` / `api-development.mdc`; RLS INSERT template in `create-rls-policies.mdc`.

---

## Suggested remediation order (remaining)

1. Resolve RA-021 / C-004 — clarify `pm-collaboration.mdc` vs user-rule code citations (PM decision)
2. Incremental signal-to-noise passes on UI rules (RA-009–RA-011) as bandwidth allows
3. Extend `rule-authoring` ownership table (RA-019) on next maintenance pass
