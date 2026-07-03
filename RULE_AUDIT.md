# Rule Audit

**Audited:** 2026-07-03  
**Standard:** [`.cursor/skills/rule-authoring/SKILL.md`](.cursor/skills/rule-authoring/SKILL.md)  
**Scope:** All 27 files in `.cursor/rules/*.mdc`, cross-checked against `AGENTS.md` and `LOCKED_RULES.md`  
**Prior run:** None on disk (fresh audit; pass-2 remediations from `.cursor/plans/fix_rule_audit_pass_2.plan.md` verified in place)

---

## Executive summary

Ranked by what would most confuse Cursor if left unfixed:

1. **`security.mdc` Server Actions example throws instead of returning typed envelopes** — contradicts `error-handling.mdc` and shipped `actions.ts` patterns; agents copying the security example will bypass `kind`, `code`, and inline/panel routing.
2. **`security.mdc` “Broken Access Control” example uses bare `{ error: '…' }` JSON** — same envelope mismatch; collides with `error-handling.mdc` and `api-development.mdc` on the same page as corrected 401/403 examples.
3. **`project-standards.mdc` auto-attaches to every `**/_.ts`/`\*\*/_.tsx` edit\*\* — 196 lines of mostly generic SOLID/DRY/OWASP tutorial content loads on nearly every code task, crowding out project-specific rules.
4. **`git-workflow.mdc` auto-attaches when editing `src/**/\*.ts`\*\* — commit/PR conventions load during ordinary feature work where they add little signal.
5. **`project-standards.mdc` duplicates owned concerns** — Error Handling, Security, Quality Standards, and RORO restate (or dilute) content owned by `error-handling.mdc`, `security.mdc`, `testing.mdc`, and `typescript.mdc`.
6. **`create-rls-policies.mdc` embeds broken `mdc:docs/guides/…` links** — links point at Supabase doc paths, not repo files; one GitHub URL is malformed (`mdc:https:/github.com/…`).
7. **`testing.mdc` at 340 lines crosses the 300-line inspect trigger** — excess is mostly good-vs-bad tutorial blocks; philosophy is sound but expensive when tests are edited.
8. **SQL Agent Requested rules (`create-db-functions`, `postgres-sql-style-guide`, `create-rls-policies`) are tutorial-heavy** — multiple full SQL templates teach generic Postgres patterns the agent already knows.
9. **UI rules (`ui-styling`, `ui-accessibility`, `ui-shadcn`) carry redundant code examples** — several multi-block tutorials where file references and one principle would suffice.
10. **`.cursor/rules/README.md` says “150-line component size guideline”** — `project-standards.mdc` § File and Component Organization says ~300–400 lines is the inspect threshold; maintainers get conflicting guidance.

---

## Findings

| ID     | File                                                      | Principle violated                     | Description                                                                                                                                                                                                                                              | Recommendation                                                                                                                                                                                                    |
| ------ | --------------------------------------------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RA-001 | `security.mdc`                                            | Single ownership / activation conflict | § Server Actions (lines 56–72) shows `throw new Error('Unauthorized')` / `throw new Error('Forbidden')`. `error-handling.mdc` § Response Envelopes (lines 68–68) and shipped server actions return `{ success: false, error: { message, code, kind } }`. | Replace the Server Actions block with a one-line cross-ref to `error-handling.mdc` and `src/app/admin/users/actions.ts`; if an example stays, match the envelope shape with `kind: 'operational'`.                |
| RA-002 | `security.mdc`                                            | Single ownership                       | § Broken Access Control (lines 228–231) returns `NextResponse.json({ error: 'Unauthorized' })` — not the `{ success: false, error: { message, code, kind } }` envelope defined in `error-handling.mdc` § Response Envelopes.                             | Align the “secure” example with the canonical envelope or replace with a file reference to a shipped route handler/action.                                                                                        |
| RA-003 | `project-standards.mdc`                                   | Activation mode                        | Frontmatter globs `**/*.ts` and `**/*.tsx` (lines 4–6) attach 196 lines on almost every code edit. Body is largely generic best practice (SOLID, DRY, OWASP, React.memo guidance) rather than project-specific signal.                                   | Narrow globs (e.g. new-file scaffolding only), convert to Agent Requested with a specific description, or aggressively trim to project-only conventions (paths, depth heuristic, utils layout).                   |
| RA-004 | `git-workflow.mdc`                                        | Activation mode                        | Globs include `src/**/*.ts` and `src/**/*.tsx` (lines 4–5) — conventional-commit and PR guidance loads while editing application code unrelated to git.                                                                                                  | Drop `src/**` globs; keep `.husky/**` and `.github/workflows/**`, or switch to Agent Requested (“Use when committing, branching, or opening PRs”).                                                                |
| RA-005 | `project-standards.mdc`                                   | Signal-to-noise                        | § Development Philosophy (lines 11–24), § Import Conventions good/bad block (lines 42–48), § Component Structure full example (lines 83–115), § Performance (lines 152–157), § Anti-patterns (lines 188–196) teach generic patterns.                     | Collapse to principles + file refs (`src/utils/`, depth heuristic); delete good/bad blocks per rule-authoring § Signal-to-noise.                                                                                  |
| RA-006 | `testing.mdc`                                             | Size budget                            | 340 lines — exceeds the 300-line inspect trigger (rule-authoring § Size budgets). ~120 lines are good-vs-bad comparison blocks (lines 183–256).                                                                                                          | Keep minimalism philosophy and H/I/B table; collapse comparison blocks to one principle each; point at `extract-auth-form-error.unit.test.ts` and `login-form.integration.test.tsx` instead of inline duplicates. |
| RA-007 | `create-rls-policies.mdc`                                 | Currency (stale paths)                 | Links use non-repo `mdc:docs/guides/…` paths (lines 44, 141, 161) and a malformed GitHub URL (line 157: `mdc:https:/github.com/…`). Files do not exist in this repo.                                                                                     | Replace with standard markdown URLs to Supabase docs, or drop links; fix the GitHub href.                                                                                                                         |
| RA-008 | `create-db-functions.mdc`, `postgres-sql-style-guide.mdc` | Signal-to-noise                        | `create-db-functions.mdc`: 5 full SQL templates (lines 48–136). `postgres-sql-style-guide.mdc`: multiple generic query examples (lines 40–133). Content is portable Supabase starter material, not project-specific.                                     | Keep invoker/search_path/trigger principles; one minimal template max; cross-ref `supabase/migrations/` for real patterns (e.g. `handle_new_user`).                                                               |
| RA-009 | `ui-styling.mdc`                                          | Signal-to-noise                        | 167 lines with redundant responsive examples (lines 78–122), three separate dark-mode code blocks (lines 52–76), and ✅/❌ Best Practices list (lines 159–167) duplicating `LOCKED_RULES.md` semantic-token rule.                                        | One `cn()` example; cross-ref `src/app/globals.css`, `ThemeProvider.tsx`, and `LOCKED_RULES.md`; delete checklist-style good/bad block.                                                                           |
| RA-010 | `ui-accessibility.mdc`                                    | Signal-to-noise                        | 218 lines; many generic tutorial blocks (keyboard pattern lines 76–93, form accessibility lines 134–151, skip links lines 187–198) restate WCAG guidance already locked in `LOCKED_RULES.md` and Radix/shadcn defaults.                                  | Keep project-specific shadcn customization guardrails and focus-visible token pattern; cross-ref `LOCKED_RULES.md` § Accessibility; collapse generic examples to principles.                                      |
| RA-011 | `ui-shadcn.mdc`                                           | Signal-to-noise                        | 223 lines with full composite examples (UserMenu lines 107–128, LoadingButton lines 143–164, Form/Dialog patterns lines 169–213) teach shadcn usage the agent already knows.                                                                             | Keep CLI flags table and customization guardrails; replace composite examples with refs to shipped components (e.g. `AppNavUser`, admin sidebar).                                                                 |
| RA-012 | `security.mdc`                                            | Single ownership                       | § Enable RLS on All Tables (lines 100–123) and § Public Read Pattern (lines 126–128) duplicate RLS authoring owned by `create-rls-policies.mdc` and migration patterns in `supabase.mdc`.                                                                | Replace SQL blocks with “See `create-rls-policies.mdc` / `create-migration` skill”; keep only the mandatory “enable RLS” principle.                                                                               |
| RA-013 | `security.mdc`                                            | Signal-to-noise / currency             | § Open Redirect Prevention (lines 181–194) re-implements `isSafeRedirect` inline instead of pointing at [`src/utils/is-safe-redirect.ts`](src/utils/is-safe-redirect.ts).                                                                                | Delete inline function; reference the shipped util and `/auth/confirm` route.                                                                                                                                     |
| RA-014 | `project-standards.mdc`                                   | Single ownership                       | § Error Handling (lines 159–163), § Security (lines 170–175), § Quality Standards (lines 181–186) restate owned rules and `AGENTS.md` § Agent workflow quality bar.                                                                                      | Cross-ref only — one line each to `error-handling.mdc`, `security.mdc`, and AGENTS quality commands (`format-check`, not `format`).                                                                               |
| RA-015 | `project-standards.mdc`, `typescript.mdc`                 | Single ownership                       | RORO pattern duplicated: `project-standards.mdc` § RORO (lines 132–150) and `typescript.mdc` § RORO (lines 50–66).                                                                                                                                       | Keep in `typescript.mdc` only; `project-standards.mdc` cross-references it.                                                                                                                                       |
| RA-016 | `code-minimalism.mdc`                                     | Always Apply size budget               | Body is ~438 words — exceeds the ~200-word per-file always-apply guidance (rule-authoring § Size budgets). Set total (~751 words across four always-on rules) is under the ~800-word cap.                                                                | Acceptable if intentional; otherwise trim Cross-References / Not Lazy About lists to stay under 200 words per file.                                                                                               |
| RA-017 | `.cursor/rules/README.md`                                 | Currency / internal consistency        | § What we adopted (line 18) claims “150-line component size guideline”; `project-standards.mdc` § File and Component Organization (lines 70–73) uses ~300–400 lines as the inspect signal.                                                               | Update README to match project-standards (or cite Ousterhout depth heuristic explicitly).                                                                                                                         |
| RA-018 | `.cursor/rules/README.md`                                 | Currency                               | README enumerates most rule files but omits `forms.mdc` and `notifications.mdc` despite both being load-bearing (profile save model, toast routing).                                                                                                     | Add entries under Rule files; note globs and ownership split with `error-handling.mdc`.                                                                                                                           |
| RA-019 | `rule-authoring` SKILL                                    | Single ownership table                 | Ownership table (SKILL lines 71–77) lists five concerns but omits `logging.mdc`, `notifications.mdc`, `forms.mdc`, `data-tables.mdc` — all have clear primary ownership in practice.                                                                     | Extend the table on the next rule-authoring maintenance pass (meta finding; not an `.mdc` fix).                                                                                                                   |

---

## Contradictions found

### C-001 — Server Actions: throw vs typed envelope

- **Rules:** `security.mdc` § Server Actions (lines 66–69) vs `error-handling.mdc` § Response Envelopes (lines 63–68)
- **Scenario:** Agent implements a new server action for a protected mutation. Security rule says `throw new Error('Unauthorized')`; error-handling and shipped code return `{ success: false, error: { message, code, kind: 'operational' } }`. UI cannot branch on `kind`; uncaught throws become faults instead of operational errors.

### C-002 — API error JSON shape in the same security rule

- **Rules:** `security.mdc` § Authentication (lines 36–38, envelope with `kind`) vs `security.mdc` § Broken Access Control (lines 228–231, bare `{ error: string }`)
- **Scenario:** Agent reads both sections in one session and produces inconsistent response shapes within the same feature.

### C-003 — Component size guidance

- **Rules:** `.cursor/rules/README.md` § What we adopted (line 18) vs `project-standards.mdc` § File and Component Organization (lines 70–73)
- **Scenario:** Agent asked whether to split a 200-line component gets “150-line guideline” from README vs “inspect at 300–400, split only if low-depth” from project-standards.

---

## Rules that are fine

These files meet the rule-authoring standard — focused scope, correct activation mode, cross-refs instead of duplication, and cited paths verified on disk:

| File                         | Notes                                                                                                      |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `api-development.mdc`        | Error envelope examples include `kind`; strong cross-refs to `error-handling.mdc`.                         |
| `code-minimalism.mdc`        | Clear always-on ladder; cross-refs guards. RA-016 is a budget note, not a structural flaw.                 |
| `data-tables.mdc`            | Tight, project-specific; points at `users-table.tsx` and `DataTableShell`.                                 |
| `do-migrations-agent.mdc`    | Agent constraints are precise and non-duplicative.                                                         |
| `do-migrations-pointer.mdc`  | Minimal always-on stub; correct indirection.                                                               |
| `documentation.mdc`          | Thin structural guardrail; defers to `DOC_RULES.md`.                                                       |
| `error-handling.mdc`         | Owns error taxonomy and UI routing; delegates logging and toasts. Pass-2 stale “Phase” language resolved.  |
| `forms.mdc`                  | Save-model table and autofill rules are project-specific and well-owned.                                   |
| `general-conventions.mdc`    | Appropriate always-on scope (dates, env awareness).                                                        |
| `logging.mdc`                | Owns log levels and tags; defers error taxonomy.                                                           |
| `nextjs.mdc`                 | App Router guidance with server-action default; cross-refs Supabase/RLS.                                   |
| `notifications.mdc`          | Owns toast vs inline vs panel routing; clean split with `forms.mdc` / `error-handling.mdc`.                |
| `pm-collaboration.mdc`       | Correct always-on partnership mode.                                                                        |
| `react-tanstack-query.mdc`   | Labels `useGetMessage.ts` as legacy demo; points at real provider and hook conventions.                    |
| `rule-authoring-pointer.mdc` | Correct glob (` .cursor/rules/**`) and indirection to skill.                                               |
| `supabase.mdc`               | Shipped schema refs accurate; data-access placement reflects `_lib/` / hooks / `actions.ts`.               |
| `typescript.mdc`             | Focused TS conventions; minor RORO overlap with project-standards noted in RA-015 only.                    |
| `do-migrations-pointer.mdc`  | (listed above)                                                                                             |
| `create-rls-policies.mdc`    | INSERT template (line 32) is correct after pass-2 fix; findings are link hygiene and length only (RA-007). |

---

## Open questions

1. **`project-standards.mdc` intent** — Is this file meant as a broad “onboarding catch-all,” or should it be retired in favor of scoped rules? Its glob breadth makes the answer high-impact for context budget.
2. **`git-workflow.mdc` glob scope** — Attaching to `src/**` may have been intentional so agents see commit format during feature work; if so, a one-line frontmatter comment documenting that rationale would prevent future “fix the globs” churn.
3. **`testing.mdc` didactic length** — The good-vs-bad blocks directly combat over-testing (a observed agent failure mode). Trimming may reduce compliance with minimalism — worth PM call on whether 340 lines is acceptable didactic cost.
4. **SQL rules as Supabase upstream copies** — `create-db-functions`, `create-rls-policies`, and `postgres-sql-style-guide` read like imported Supabase AI prompts. Keeping them verbatim aids `/create-migration` skill parity; trimming trades signal density against skill portability.

---

## Verification notes (pass-2 regressions checked)

- `api-development.mdc` error examples include `kind` (lines 73–74) — **OK**
- `security.mdc` 401/403 auth examples include `kind: 'operational'` (lines 37, 52) — **OK**
- `create-rls-policies.mdc` INSERT template uses `WITH CHECK` only (line 32) — **OK**
- `error-handling.mdc` / `supabase.mdc` use present-tense shipped references — **OK**
- Referenced paths spot-checked: `src/utils/is-safe-redirect.ts`, `src/providers/ThemeProvider.tsx`, `src/hooks/useGetMessage.ts`, `.mockups/error-states.html`, `docs/prds/README.md` — **all exist**

---

## Suggested remediation order

1. Fix C-001 / C-002 in `security.mdc` (small diff, high agent confusion)
2. Narrow or trim `project-standards.mdc` (RA-003, RA-005, RA-014, RA-015)
3. Adjust `git-workflow.mdc` globs (RA-004)
4. Refresh `.cursor/rules/README.md` (RA-017, RA-018)
5. Incremental signal-to-noise passes on UI and SQL rules (RA-008–RA-011) and `testing.mdc` (RA-006) as bandwidth allows
