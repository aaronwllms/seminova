# Phase 14 PRD: Tech Debt Hardening

**Status:** `Active`

---

## Problem

`TECH_DEBT_AUDIT.md` (2026-07-21 full pass) surfaced ~40 findings. The actionable ones cluster into duplicated admin-table helpers, two admin god-files, a hand-rolled cast chain in the logs queries, hand-synced settings types, thinning candidates, dependency and test gaps, and reference-demo drift. The audit deferred the sequencing decision to PM; this phase is the answer.

## Goal

Resolve the actionable clusters from the audit, batched so each epic is a single Cursor build session, sequenced so shared primitives land before the work that consumes them, and so the settings-registry derivation lands before Phase 16 (Magic Link Auth) adds a new settings key.

## Scope

**In scope:** the six epics below.

**Out of scope:**
- **F053 / F095** — CSP enforcement. L effort, requires a per-request nonce strategy; deferred to a future security phase per ROADMAP open questions.
- **F085** — hero screenshot. Requires a captured asset and design judgement; a manual PM/design task, not agent work.
- **Audit-resolved "no action" findings** — F022, F061, F062, F071, F072, F080, F082, F089, F091, F100 are documented as intentional or ceiling-gated in the audit and are not reopened here.
- **F066** (`banner-setting-row.tsx`, 425 LOC) — excluded **deliberately, not by oversight**. Re-examined against the deep-module-vs-god-file definition in [LEXICON.md](../../LEXICON.md) and [ADR-0001](../adr/ADR-0001-component-sizing-by-depth.md): it exposes a narrow interface (4 props) and owns one responsibility — editing a single banner setting. Its internal parts are implementation, which the rule permits decomposing freely without that being debt. No co-change signal, unlike F064/F065. It is a deep module, not a god file.

**Resolves an audit open question:** "Admin table extraction timing — fold into landing work, or a dedicated hardening epic before magic-link auth adds more admin settings?" This phase is the dedicated hardening pass. Close that entry on the next audit sync.

**Sequencing:** Epic 1 ships first — Epics 2, 3, and 6 consume its shared helpers. Epic 4 must land before Phase 16. Epics 5 and 6 have no ordering constraints beyond that.

---

### Epic 1: Foundation Sweep `Complete`

Consolidate the duplicated helpers behind admin table search, fetching, and error handling into single shared implementations, and clear the batch of independent one-line findings — so later epics build on one canonical version of each helper rather than duplicating them again.

- Debounced search behavior is extracted into one reusable hook, replacing the duplicated effects across the users table, logs table, and reference demo (F068).
- Retry and error-handling options for admin data fetches are unified into one shared configuration, replacing the pattern duplicated across four hooks (F069).
- Server action results are unwrapped through a single generic helper, folding in the mutation-result variant (F070, F088).
- Error-kind checks route through a single shared type guard instead of an unguarded cast (F077).
- The `LandingContainer` alias is removed and its consumers import `SiteContainer` directly (F011).
- The duplicated header/footer grid track string is extracted to one shared constant (F060).
- The duplicated catch-and-exit wrapper across the admin CLI entry scripts is extracted to one shared helper (F063).
- The `package.json` author field is updated from legacy template attribution to the current maintainer (F086).
- Remaining direct `process.env.NEXT_PUBLIC_SUPABASE_URL` reads route through a shared accessor rather than reading the env var inline (F097).
- The vitest coverage exclude for the workflow components tree is narrowed so the interactive diagram is measured, and its inaccurate "static" debt comment is corrected (F073 and F099 — these are one fix to the same config, not two).

**Success criteria:**
- Exactly one debounce hook, one shared admin query-options configuration, one generic unwrap helper, and one error-kind guard exist; all prior duplicates are removed, not merely supplemented.
- The reference demo's debounce consumes the shared hook alongside the two admin tables.
- The workflow diagram appears in the coverage denominator and thresholds still pass.
- No user-visible behavior change anywhere in this epic.

---

### Epic 2: Users Table Decomposition

Admins get the same users table experience, now backed by an extracted state hook rather than one wide orchestrating component.

- Paging, debounced search, tile filters, sort mapping, the three confirmation dialogs, and the ban/unban/role mutation state move out of the table component into a dedicated state hook.
- The table component is reduced to composing toolbar, shell, stat tiles, and dialog mounts.

**Success criteria:**
- Depends on Epic 1 — consumes its debounce, query-options, and unwrap helpers rather than reimplementing them.
- The extracted hook is the single owner of users-table state; the component holds no orchestration beyond composition.
- No visible behavior change; existing coverage passes against the new structure.

---

### Epic 3: Logs Table Decomposition

The same decomposition applied to the logs table, preserving current admin-facing behavior including the live feed.

- Cursor paging, debounced search, filter wiring, the live toggle and its localStorage preference, the Realtime INSERT subscription, mark-read mutations, and detail-dialog state move into a dedicated state hook mirroring the users-table pattern.
- The thin `use-admin-log-tags` wrapper is merged into the new hook rather than kept as a separate module (F094) — its interface nearly equals its implementation and it exists only to serve this surface.

**Success criteria:**
- Depends on Epic 1.
- The extracted hook is the single owner of logs-table state, including the tags query.
- `use-admin-log-tags` no longer exists as a standalone module.
- Realtime behavior, the live toggle's persisted preference, and the manual refresh button all behave exactly as before; existing coverage passes.

---

### Epic 4: Type Derivation

Hand-maintained types that can drift from their source are replaced with types derived from that source — in the settings registry and in the logs query layer.

- The app-settings key union and value map are derived from the registry constant rather than hand-synced beside it, so adding a registry entry cannot compile with mismatched types (F059).
- The shared log-filter helper is typed generically over Supabase's real query-builder type, so each call site — the list select, the mark-all-read update, and the unread-count head select — keeps its own correct terminal type without a cast (F074, F075, F076).

**Success criteria:**
- Adding a new settings registry entry alone is sufficient for the type to pick it up; there is no second place to update.
- Must ship before Phase 16 (Magic Link Auth) adds its settings key, so that work inherits the derived type.
- The hand-rolled `FilterableAppLogsQuery` duck-type interface and every associated `as unknown as` cast in the logs `_lib/` are removed.
- **No RPC and no migration.** The users-table RPC precedent was for server-side *sort*, a narrower reason that does not carry to filtering — PostgREST expresses this filtering natively, so introducing an RPC-per-filtered-table here would be the heavier default, not the sound one.
- If the generic cannot be satisfied cleanly against supabase-js's type parameters, fall back to a per-operation typed wrapper — never back to an unsafe cast.

---

### Epic 5: Actions-Layer Thinning

The logs and users server-action files are split into per-operation modules behind a barrel, using one consistent pattern across both surfaces.

- The logs actions file is split so mark-read mutations live in their own module, with the actions file becoming a thin re-export barrel (F067).
- The users actions file receives the same treatment, completing the pattern that was only partially applied there (F087).
- The users actions test file is split by action group to mirror the new source layout (F078).

**Success criteria:**
- Both actions files follow the same barrel pattern; neither retains inline action bodies.
- Existing call sites are unchanged — the barrel preserves the current import surface.
- The split test files cover the same cases as before with no loss; `test:ci` passes.

---

### Epic 6: Hygiene & Drift

A batch of independent maintenance items: dependency patches, two coverage gaps, and documenting the reference demos' intentional divergence.

- `brace-expansion` and `js-yaml` are patched to versions that clear the reported high-severity advisories (F081).
- `@eslint/eslintrc` is verified against the ESLint flat-config dependency graph and removed if genuinely orphaned, or left with a documented reason if still required (F092).
- The `getPublicSupabaseEnv` throw branches for missing URL and missing key gain test coverage, following the existing pattern for the service env (F079).
- The `toJsonSafeContext` array and primitive context shapes gain test coverage (F093).
- The reference table demo consumes the shared debounce hook from Epic 1, and its client-side pagination is documented as the sanctioned fixture exception it already is per `data-tables.mdc` — not converted to server-side paging (F090).
- The reference profile-settings demo is documented as an intentional parity fixture rather than refactored. It already composes the real field components and hooks; only its local password sub-form and its non-persisting save stub are demo-only, and a showroom surface not actually writing to the database is correct behavior, not drift (F098).

**Success criteria:**
- `pnpm audit` no longer reports the brace-expansion and js-yaml high-severity paths; build and lint still pass.
- Both previously-uncovered paths have passing tests exercising them.
- Both reference demos carry inline documentation naming which parts are intentional fixtures and why.
- **No re-implementation of either demo** beyond the debounce-hook reuse and the documentation. In particular, the real profile dialog is not restructured to serve the demo.
