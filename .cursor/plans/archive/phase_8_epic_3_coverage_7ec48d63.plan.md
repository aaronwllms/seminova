---
name: Phase 8 Epic 3 Coverage
overview: Phase 8 Epic 3 closes coverage blind spots on admin/security paths and the app shell, adds missing service-client and action-branch tests, and eliminates React act/Suspense warnings — all while keeping the 80% coverage gates green.
todos:
  - id: story-3-1-exclusions
    content: Remove four admin _components from vitest.config.ts coverage.exclude
    status: completed
  - id: story-3-1-auth-gate
    content: Add admin-auth-gate.unit.test.tsx — unauthenticated, non-admin redirect, admin happy path
    status: completed
  - id: story-3-1-smoke
    content: Add smoke tests for admin-shell, admin-sidebar, admin-breadcrumb as needed for thresholds
    status: completed
  - id: story-3-2-service
    content: Create service.unit.test.ts for getServiceEnv throw paths
    status: completed
  - id: story-3-2-actions
    content: Extend actions.unit.test.ts — promote/demote not_found + catch branches
    status: completed
  - id: story-3-2-app-shell
    content: Create app-shell.unit.test.tsx with mocked getCurrentUserProfile
    status: completed
  - id: story-3-3-warnings
    content: Fix act/Suspense warnings in users-table, profile-settings-form, site-footer tests
    status: completed
  - id: audit-resolve
    content: Move F028–F034, F051 to Resolved in TECH_DEBT_AUDIT.md
    status: completed
  - id: quality-gate
    content: Run pnpm pre-push; confirm zero act/Suspense warnings
    status: completed
  - id: mark-complete
    content: Run /mark-epic-complete after all work passes
    status: completed
isProject: false
---

# Phase 8 Epic 3 — Close coverage blind spots

**Active phase:** [Phase 8 Tech Debt Audit Remediation](docs/prds/phase-8-tech-debt-remediation.prd.md) (`Active`)

**Branch:** `phase-8/tech-debt-remediation` (already checked out — Epics 1–2 are `Complete`, no branch setup needed)

**Findings addressed:** F028, F029, F030, F031, F032, F033, F034, F051

Stories 3.1, 3.2, and 3.3 touch mostly disjoint files and **can run in parallel**. The [vitest.config.ts](vitest.config.ts) exclusion removal (3.1) must land together with its new tests before `pnpm test:ci` will pass; audit resolution and the quality gate wait until all three stories finish.

---

## Current state

| Finding | Location | Gap today |
|---------|----------|-----------|
| **F028** | [vitest.config.ts](vitest.config.ts) lines 24–27 | Four admin `_components` explicitly excluded from the coverage denominator despite real logic |
| **F051** | [admin-auth-gate.tsx](src/app/admin/_components/admin-auth-gate.tsx) | 0% direct coverage; security-critical redirect path untested |
| **F029** | [service.ts](src/supabase/service.ts) | `getServiceEnv` throw paths at 0%; no `service.unit.test.ts` exists |
| **F030** | [actions.ts](src/app/admin/users/actions.ts) lines 196–227, 267–298 | `not_found` and `catch` branches for promote/demote uncovered (~89% file) |
| **F031** | [app-shell.tsx](src/app/(app)/_components/app-shell.tsx) | Async layout at 0% (layout exclusion hides it; no test file) |
| **F032** | [users-table.unit.test.tsx](src/app/admin/users/_components/users-table.unit.test.tsx) | Debounce test leaves async updates un-awaited → `act(...)` warnings |
| **F033** | [profile-settings-form.integration.test.tsx](src/app/(app)/profile/_components/profile-settings-form.integration.test.tsx) | In-flight blur-save tests resolve promises without awaiting state flush |
| **F034** | [site-footer.unit.test.tsx](src/components/site-footer.unit.test.tsx) | Renders async [SiteCopyright](src/components/site-copyright.tsx) without the production [Suspense](src/components/site-footer.tsx) boundary |

**Existing assets to reuse (do not rewrite):**

- Async RSC test pattern: `render(await Component({}))` in [landing-auth-slot.unit.test.tsx](src/app/(marketing)/_components/landing-auth-slot.unit.test.tsx)
- Redirect mock pattern: throw `NEXT_REDIRECT` after recording the URL in [require-auth.unit.test.ts](src/supabase/require-auth.unit.test.ts)
- Admin nav smoke + sidebar mocks: [admin-nav-user.unit.test.tsx](src/app/admin/_components/admin-nav-user.unit.test.tsx)
- Env stubbing: `vi.stubEnv` in [env.unit.test.ts](src/utils/env.unit.test.ts)
- Action test harness: [actions.unit.test.ts](src/app/admin/users/actions.unit.test.ts) (extend, don't duplicate setup)

**Coverage config note:** Keep existing exclusions for `page.tsx`, `layout.tsx`, UI primitives, and Supabase client factories — only remove the four admin `_components` lines (F028). [admin-nav-user.tsx](src/app/admin/_components/admin-nav-user.tsx) already has a unit test; removing its exclusion should credit existing coverage immediately.

---

## Story 3.1 — Bring admin chrome into coverage (F028, F051)

### Step 1: Remove admin exclusions

Delete these four entries from [vitest.config.ts](vitest.config.ts) `coverage.exclude`:

- `admin-breadcrumb.tsx`
- `admin-nav-user.tsx`
- `admin-shell.tsx`
- `admin-sidebar.tsx`

Do **not** remove `page.tsx` / `layout.tsx` exclusions — those remain intentional per [TECH_DEBT_AUDIT.md](TECH_DEBT_AUDIT.md).

### Step 2: AdminAuthGate redirect branches (F051)

Create [admin-auth-gate.unit.test.tsx](src/app/admin/_components/admin-auth-gate.unit.test.tsx):

| Case | Mock setup | Assertion |
|------|------------|-----------|
| Unauthenticated | `requireAuthClaims` rejects with `NEXT_REDIRECT` (same pattern as [get-current-user-profile.unit.test.ts](src/app/(app)/_lib/get-current-user-profile.unit.test.ts)) | `AdminAuthGate({ children })` propagates redirect |
| Non-admin | `requireAuthClaims` resolves `{ sub, email, app_metadata: {} }`; mock `redirect` to throw after recording args | `redirect` called with [PROFILE_PATH](src/constants/app-paths.ts) |
| Admin | `requireAuthClaims` resolves admin claims (`app_metadata.role === 'admin'`); mock heavy `AdminShell` to a stub | Renders children / stub shell receives `userEmail` |

Follow the landing-auth-slot async pattern: `render(await AdminAuthGate({ children: ... }))`.

### Step 3: Smoke tests for remaining admin chrome (F028)

Add minimal render tests only where coverage still falls short after Step 2:

- **[admin-shell.unit.test.tsx](src/app/admin/_components/admin-shell.unit.test.tsx)** — mock sidebar primitives (same stub pattern as admin-nav-user test); assert breadcrumb trigger and children slot render
- **[admin-sidebar.unit.test.tsx](src/app/admin/_components/admin-sidebar.unit.test.tsx)** — mock `usePathname`, sidebar UI, and `AdminNavUser`; assert Users nav link and logo render
- **[admin-breadcrumb.unit.test.tsx](src/app/admin/_components/admin-breadcrumb.unit.test.tsx)** — mock `usePathname` for `/admin` (dashboard label) and `/admin/users` (Home + Users segments)

Target: behavior-level assertions (nav labels, links), not CSS or internal state. Stay within testing.mdc H/I/B — ~3–5 tests per file max.

**Success:** No admin `_components` in coverage exclude list; admin-gate redirect paths covered; `pnpm test:ci` meets 80% thresholds.

---

## Story 3.2 — Cover service client and remaining action branches (F029, F030, F031)

### Step 1: Service client env failures (F029)

Create [service.unit.test.ts](src/supabase/service.unit.test.ts):

- Use `vi.stubEnv` + `vi.unstubAllEnvs()` in `beforeEach`/`afterEach`
- **Missing URL:** unset `NEXT_PUBLIC_SUPABASE_URL` → `createServiceClient()` throws with `[supabase-service] Missing NEXT_PUBLIC_SUPABASE_URL`
- **Missing secret:** unset `SUPABASE_SECRET_KEY` → throws with `[supabase-service] Missing SUPABASE_SECRET_KEY`
- **Happy path (optional, one test):** both vars set → returns a client object (no need to call Supabase APIs)

Also cover `getServiceEnvForFetch()` delegates to the same throw paths (one representative case is enough).

### Step 2: Promote/demote catch and not_found branches (F030)

Extend [actions.unit.test.ts](src/app/admin/users/actions.unit.test.ts) — reuse existing mock harness:

| Action | Branch | Mock |
|--------|--------|------|
| `promoteUserAction` | `not_found` | `promoteUserByIdMock` → `{ status: 'not_found', email: '...' }` → operational `NOT_FOUND` envelope |
| `promoteUserAction` | catch | `createServiceClientMock.mockImplementation(() => { throw ... })` → fault `INTERNAL_ERROR` envelope |
| `demoteUserAction` | `not_found` | same pattern via `demoteUserByIdMock` |
| `demoteUserAction` | catch | same service-client throw pattern |

Keep assertions on envelope shape (`success`, `error.code`, `error.kind`) — match existing test style in the file.

### Step 3: App shell integration smoke (F031)

Create [app-shell.unit.test.tsx](src/app/(app)/_components/app-shell.unit.test.tsx):

- Mock [getCurrentUserProfile](src/app/(app)/_lib/get-current-user-profile.ts) to return a fixed profile (display name, email, `isAdmin: false`)
- Mock heavy chrome (`SiteHeader`, `AppNavUser`) to lightweight stubs if needed for speed
- `render(await AppShell({ children: <p>Profile content</p> }))`
- Assert: main landmark contains children; header/footer stubs (or real footer with Suspense wrapper) render

**Success:** `service.ts` no longer at 0%; promote/demote catch + not_found covered; app shell above 0%; thresholds still pass.

---

## Story 3.3 — Eliminate test warnings (F032, F033, F034)

### F032 — Users table debounce ([users-table.unit.test.tsx](src/app/admin/users/_components/users-table.unit.test.tsx))

In the debounce test (`should debounce search...`):

- After `vi.advanceTimersByTimeAsync(300)`, add a final `await waitFor(...)` that asserts the debounced call **and** that no further pending state updates remain (e.g. table settled, no loading flicker)
- Ensure `vi.useRealTimers()` runs in a `finally` block so timer mode doesn't leak to later tests

### F033 — Profile in-flight blur-save ([profile-settings-form.integration.test.tsx](src/app/(app)/profile/_components/profile-settings-form.integration.test.tsx))

In both in-flight guard tests (`skip duplicate blur-save while display name/bio save is in flight`):

- After `resolveUpdate(...)`, `await waitFor(...)` until the save indicator clears or mock settles — flush React state before test ends
- Prefer `waitFor` over bare `act` where possible (audit recommendation)

### F034 — Site footer Suspense ([site-footer.unit.test.tsx](src/components/site-footer.unit.test.tsx))

Match production structure from [site-footer.tsx](src/components/site-footer.tsx):

- Wrap `<SiteFooter />` in `<Suspense fallback={...}>` in **all** test cases (not just the async copyright test)
- Keep existing `connection` mock from `next/server`

**Success:** `pnpm test:ci` stdout/stderr contains no `act(...)` warnings and no Suspense boundary warnings.

---

## Audit resolution

After all stories pass, move these findings to **Resolved** in [TECH_DEBT_AUDIT.md](TECH_DEBT_AUDIT.md) with date **2026-07-05** (or the implementation date if later):

F028, F029, F030, F031, F032, F033, F034, F051

Verify each fix in code before marking — per PRD resolution discipline.

---

## Quality gate

```bash
pnpm pre-push
```

Must pass: type-check, lint, format-check, test:ci with 80% coverage thresholds and **zero** act/Suspense warnings in output.

If thresholds fail after removing exclusions, add targeted tests (Story 3.1 smoke tests) — do not re-add exclusions or lower thresholds.

---

## Manual testing checklist

1. **Admin gate (Story 3.1)** — sign in as non-admin, visit `/admin` → redirected to `/profile`; sign in as admin → admin shell loads
2. **Admin users (Story 3.2)** — `/admin/users` loads; promote/demote still work (tests mock actions; this confirms no accidental production regression)
3. **App shell (Story 3.2)** — `/profile` renders header with avatar menu and page content inside main landmark
4. **Test output (Story 3.3)** — scan `pnpm test:ci` output; confirm no yellow `act(...)` or Suspense warnings

---

## Out of scope (later epics)

- Sidebar decomposition (Epic 4 / F006)
- Profile form refactor (Epic 5 / F007)
- Swallowed errors, error boundaries, production env fail-closed (Epic 6)
- CSP enforcement (deferred per PRD)

---

## Close-out

When implementation is fully finished:

1. Confirm Phase 8 PRD and ROADMAP row remain **`Active`**
2. Run **`/mark-epic-complete`** to tag `### Epic 3: Close coverage blind spots` with `` `Complete` `` in [phase-8-tech-debt-remediation.prd.md](docs/prds/phase-8-tech-debt-remediation.prd.md)
