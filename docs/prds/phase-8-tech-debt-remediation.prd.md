# PRD — Phase 8: Tech Debt Audit Remediation

**Status:** `Active`
**Findings source:** [TECH_DEBT_AUDIT.md](../../TECH_DEBT_AUDIT.md) (full audit, 2026-07-04)
**Last updated:** 2026-07-05

---

## Problem

The 2026-07-04 tech-debt audit found 50+ open findings across the repo: a dead starter-demo layer every spinoff inherits, a duplicated Radix dependency graph, coverage exclusions hiding the admin shell and service client, wide-interface god files, silently swallowed errors, and assorted config, type, and documentation drift. As a template, Seminova multiplies each of these into every product spun off from it.

## Goal

Resolve every open finding in TECH_DEBT_AUDIT.md except the explicitly deferred items below, so the audit's next sync pass shows a clean findings table. Quality gates (`pnpm pre-push`) stay green throughout; no user-visible behavior changes except where a finding is itself a behavior bug (swallowed errors, missing error boundaries, permissive production proxy).

## Scope decisions (made at planning)

- **Radix (F014/F056):** the `radix-ui` umbrella is canonical — remove all individual `@radix-ui/react-*` packages. F056 is mooted by deleting the unused checkbox primitive.
- **`Profile` type alias (F024):** keep and wire in as the canonical domain-type pattern for spinoffs, not delete.
- **Missing env in production (F039):** fail closed — production hard-errors without Supabase env; the dev clone-and-configure bypass stays.
- **F011 (`LandingContainer` wrapper):** keep — intentional marketing import boundary per the audit's own assessment.
- **F022 (two form stacks):** intentional per `forms.mdc` — no story.
- **F053 (CSP enforce):** **deferred out of this phase.** Requires a per-request nonce strategy — a design-and-build effort, not remediation. The `// debt:` marker stays; tracked as a ROADMAP open question.
- Ordering follows severity: demo purge → dependencies → coverage → wide interfaces → runtime hygiene → types/naming/docs.

## Out of scope

- CSP enforcement (F053) — see above.
- The profile-as-modal redesign discussed at planning — logged as a ROADMAP open question; it depends on a real app home existing first. It does not block or invalidate the profile-form decomposition in Epic 5.
- Any new product features, schema changes, or migrations.

---

## Epics & stories

### Epic 1: Purge starter demo & dead code `Complete`

Findings: F001–F005, F010, F012, F013, F019, F020, F043, F044, F046

- **1.1 Remove the demo data-fetching layer** (F001, F002, F003, F019, F020, F043, F046). Delete the demo TanStack Query hook and its test, the axios dependency, the demo MSW handler, and the unused MSW browser entry; keep the MSW node infrastructure for future route tests. Update the TanStack Query and testing rule examples to reference a real hook in the repo instead of the deleted demo.
  *Success: no reference to the demo hook, axios, or its mock endpoint remains anywhere in source or rules; `pnpm pre-push` green.*
- **1.2 Remove dead components and re-exports** (F004, F005, F010, F012, F013, F044). Delete the unused starter auth button (including its coverage exclusion), the unused theme-provider wrapper, the unused copyright re-export alias, and the unused checkbox and collapsible primitives with their dependency imports. The landing container wrapper stays (see scope decisions).
  *Success: knip no longer reports these files; all surfaces render unchanged.*

### Epic 2: Dependency & config hygiene `Complete`

Findings: F014, F015, F045, F052

- **2.1 Deduplicate Radix dependencies** (F014). Remove all individual `@radix-ui/react-*` packages; the `radix-ui` umbrella is the sole Radix dependency.
  *Success: the lockfile contains no direct `@radix-ui/react-*` entries; build and tests green.*
- **2.2 Resolve the animation plugin question** (F015). Visually QA dialog, sheet, and dropdown open/close animations in light and dark; wire the animation plugin if the animation classes are inert on Tailwind v4, or remove the dependency if they work without it.
  *Success: animations verified working, and the dependency state matches reality (wired or gone).*
- **2.3 Config cleanup** (F045, F052). Document the optional Vercel URL env var in the env example; remove the stale component-config alias that points at a non-existent directory.
  *Success: the env example covers every env var the app reads; no config alias targets a missing path.*

### Epic 3: Close coverage blind spots `Complete`

Findings: F028–F034, F051

- **3.1 Bring admin chrome into coverage** (F028, F051). Remove the admin-shell component exclusions from the coverage config and add smoke/integration tests so thresholds still pass; add direct tests for the admin gate's redirect branches (unauthenticated and non-admin).
  *Success: no admin components remain in the coverage exclude list; admin-gate redirect paths are covered; `pnpm test:ci` meets thresholds.*
- **3.2 Cover the service client and remaining action branches** (F029, F030, F031). Unit-test the service client's env-failure paths; cover the remaining promote/demote catch and not-found branches; add one integration test rendering the app shell with a mocked profile.
  *Success: the service client is no longer at 0% coverage; admin action catch branches covered; the app shell is above 0%.*
- **3.3 Eliminate test warnings** (F032, F033, F034). Fix the `act(...)` warnings in the users-table debounce tests and the profile blur-save tests; render the footer test inside a Suspense boundary matching production.
  *Success: `pnpm test:ci` output contains no `act(...)` or Suspense warnings.*

### Epic 4: Decompose the sidebar primitive

Findings: F006

- **4.1 Split the sidebar into focused modules** (F006). Decompose the 700+-line sidebar primitive into a directory of focused files with the provider as orchestrator, preserving every existing export path and name so no consumer changes. Judge the split by interface width and responsibility count per the deep-module-vs-god-file principle (ADR-0001), not by line count.
  *Success: no resulting file has a wide multi-responsibility surface; all existing sidebar imports compile unchanged; sidebar behavior identical.*

### Epic 5: Refactor form, actions & env loading

Findings: F007, F008, F026, F049, F055, F057, F058

- **5.1 Decompose the profile settings form** (F007). Extract a reusable blur-save field hook and per-field components, keeping the orchestrator thin. Preserve the shipped save models exactly — blur-save, upload-on-complete, and explicit-submit dialog — including per-field in-flight guards and save indicators.
  *Success: form behavior is identical to before; the orchestrator no longer holds field-level logic.*
- **5.2 Slim the admin user actions** (F008, F049). Extract the admin-caller assertion and a shared fault mapper into a route-local lib; collapse the near-duplicate promote/demote envelopes into one shared role-mutation runner.
  *Success: the actions file holds thin action exports only; promote and demote share one mutation envelope.*
- **5.3 One env-loading module** (F026, F055, F057, F058). Consolidate the three Supabase env-loading patterns (app service client, admin CLI, boolean check) into one shared module with consumer-appropriate failure modes (throw vs exit vs boolean); replace non-null env assertions in the browser client with it; fold the redundant service-env alias into a single export.
  *Success: exactly one module answers "are Supabase env vars set"; app and CLI both consume it; no non-null assertions on Supabase env vars remain.*

### Epic 6: Runtime & error-handling hygiene

Findings: F016, F017, F018, F035, F037, F038, F039, F047, F048, F050

- **6.1 Production bundle & resource fixes** (F016, F017, F050). Gate the React Query devtools behind a development-only check; revoke avatar preview object URLs on replace and cleanup; compress the oversized OG image and note the re-skin step.
  *Success: devtools are absent from the production bundle; repeated avatar uploads leak no object URLs; the OG image is materially smaller with unchanged appearance.*
- **6.2 Surface swallowed errors** (F035, F037). Propagate avatar-upload failures to the field's error handler instead of silently resetting the preview; surface an inline fault indication when the profile read fails rather than rendering silently empty fields.
  *Success: a failed avatar upload and a failed profile read each produce visible user-facing feedback per the operational/fault classification.*
- **6.3 Error boundaries for admin and auth** (F038). Add route-group error boundaries to the admin and auth segments, consistent with the existing one on the authenticated app group and the error-handling rule.
  *Success: an unhandled server error in either group renders the project's fault UI, not the framework default.*
- **6.4 Fail closed in production** (F039). The proxy's skip-when-unconfigured bypass applies only outside production; in production, missing Supabase env produces a hard, clear error. Document the dev-mode bypass in the README.
  *Success: a production build without Supabase env errors loudly; the dev clone-and-configure flow is unchanged.*
- **6.5 Small runtime defaults** (F018, F047, F048). Set conservative query-client defaults; make the logo component's link target a required prop so every consumer targets explicitly; document the avatar resize cap as the accepted main-thread bound.
  *Success: no consumer relies on an implicit logo link target; query-client defaults are explicit; the resize bound is documented.*

### Epic 7: Types, naming & docs

Findings: F009, F021, F023, F024, F025, F027, F041, F042

- **7.1 Wire the domain type pattern** (F024, F025, F027). Make the profile domain type the base consumed by the current-user profile read and the profile actions, with the enriched current-user shape composing from it; narrow the app-metadata type to a typed role shape; validate the JWT claims shape at the proxy boundary instead of a bare cast.
  *Success: the profile type aliases have real consumers; role checks and claims reads go through typed boundaries.*
- **7.2 Canonical data-table naming** (F009, F023). Rename the canonical data-table shell to a descriptive name and update all imports, AGENTS.md, and the data-tables rule in one pass, keeping hook and type names consistent with the new filename.
  *Success: no reference to the old placeholder filename remains anywhere in repo or docs.*
- **7.3 Doc sync** (F021, F041, F042). Mirror the claims-vs-user auth split into the AGENTS.md auth section per the require-auth docblock; fix stale pre-Phase-6 admin route-group references in the frozen context archive; add a path-migration header note to the plans archive rather than bulk-editing archived plans.
  *Success: no doc claims the old admin route-group layout; AGENTS.md documents the read/mutation auth split.*

---

## Resolution discipline

Per the audit skill's living-file model: as findings are fixed, verify in code and move each to the audit file's Resolved section with the date — never mark resolved from memory. F054 (stale ROADMAP Phase 8 stub) is resolved at planning time by this PRD's creation.
