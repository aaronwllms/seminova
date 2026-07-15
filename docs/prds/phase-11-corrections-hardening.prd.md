# PRD — Phase 11: Corrections & Hardening

**Status:** `Active`
**Last updated:** 2026-07-15

---

## Problem

Phase 10 shipped the app home, form primitives, and the public reference and workflow pages. Closing it surfaced a list of corrections that sit *on top of* that shipped state — UI defects, stale copy, missing affordances, and a few decisions deferred rather than made. They span the profile modal, the app header and admin sidebar, the feedback system, the reference and workflow pages, and site chrome. None is large on its own; left unbatched they collide, because several touch the same files (the toast icon config, the reference page, the site header).

Two structural gaps sit alongside the corrections. The design system has no semantic `success`/`warning` color tokens, so status UI falls back to `primary` (blue) and `muted` (gray) for states that mean something else. And `ui-accessibility.mdc` ships as guidance with no enforcement, so its deterministic standards — one `<h1>` per route, non-empty `alt`, ordered headings — can be violated silently.

Separately, the loose end that began as "make the reference page the authenticated landing" resolved into a distinct public surface: a GitHub page presenting live repo stats, reached from the header's existing GitHub link. Folding that content into the reference page would muddy it, so it earns its own route.

## Goal

Clear the Phase 10 correction list, extend the token system with the missing status colors, promote the lintable a11y subset from guidance to an enforced `check:*`, and add the public GitHub page — grouped into epics that respect file coupling so each lands as a clean single commit. `pnpm pre-push` stays green throughout.

## Scope decisions (made at planning)

- **The GitHub content is its own public page, not reference-page content.** Built as a standalone surface (its mockup already is), reached from the header's GitHub link, with a "View on GitHub" outbound to the repo. This keeps the reference page focused on component patterns rather than mixing in project-stats content.
- **Epic grouping is by surface affinity, not item order.** Single-commit epics mean items touching the same files must land together: every reference-page edit in one epic, both header-avatar changes in one, and the coupled toast-icon / token / error-panel work in one.
- **`success`/`warning` become real tokens, shaped like `destructive`.** Not a new pattern — the missing slots filled in the existing token structure across every theme layer. Values are chosen to read as siblings to `destructive` and are worth eyeballing in-app rather than locking from numbers alone.
- **The a11y check covers only the deterministic subset.** One `<h1>` per route, non-empty `alt`, no skipped heading levels — enforced. Subjective a11y (contrast intent, screen-reader UX) stays guidance.

## Out of scope

- **JWT session handling** — resolved separately via [ADR-0005](../adr/ADR-0005-proxy-as-sole-session-authority.md); not part of this phase.
- **CSP enforcement, the theme-regeneration skill, the admin logging page, and name/domain finalization** — remain deferred ROADMAP open questions.
- **Email change as a capability** — the profile email field is display-only; editing email is not built here.
- **Upload-on-complete and explicit-submit primitive extraction** — unchanged from Phase 10; neither is revisited.

---

## Epics & stories

### Epic 1: Profile modal corrections `Complete`

- **1.1 Read-only email field.** Repurpose the former username field as a read-only email display — present but non-editable, since email change isn't a capability today.
- **1.2 Collapsible password section.** Collapse the password fields behind a "Change Password" accordion whose control shows its open/closed state; the section slides open inline below it.
- **1.3 Appearance above Password.** Reorder the Appearance section above the Password section.
- **1.4 Segmented theme toggle.** Fix the theme toggle so it reads as a bordered segmented control rather than floating buttons.
- **1.5 Avatar/bio helper text and avatar removal.** Add avatar and bio helper text ("JPG, PNG or WebP. Max 2MB." / "Brief description for your profile. Max 160 characters."), shorten "Change Photo" to "Change", and add a "Remove" avatar control. Removing clears the profile's avatar *and* deletes the stored file, not just the reference — but a storage-delete failure must not block the profile update from succeeding. Bio's schema max drops from 500 to 160.

*Success:*
- Email shows in a non-editable field; no username field remains.
- Password fields stay hidden until expanded, with a persistent open/closed affordance.
- Appearance renders above Password; the theme toggle reads as a bordered segmented control.
- Avatar has both Change and Remove controls; avatar and bio carry helper text.
- Removing the avatar deletes the underlying storage file, and a delete failure still lets the profile update succeed.
- Bio rejects input over 160 characters.
- `pnpm pre-push` is green.

### Epic 2: User avatar & identity display `Complete`

- **2.1 Header avatar-only.** Revert the app header to avatar-only, removing the full name shown beside it.
- **2.2 Admin sidebar identity + shared avatar component.** Fix the admin sidebar user button to show full name when present (email only as fallback), correct first-plus-last initials, and the real avatar image when one exists — matching the app header, which already does this. The cause is a data gap: the admin side only reads email off the JWT and never loads the cached profile carrying name and avatar; close that. Extract the avatar image-with-initials-fallback into one shared presentational component used by both the header and the admin sidebar; each surface keeps its own dropdown contents.

*Success:*
- The header shows the avatar alone.
- The admin sidebar button shows full name (email fallback), correct initials, and the real image when present.
- One shared avatar component renders in both surfaces; neither hand-writes avatar markup; dropdown contents stay per-surface.
- `pnpm pre-push` is green.

### Epic 3: Feedback system & reference page `Complete`

- **3.1 Destructive toast icon + shared icon config.** Swap the destructive toast icon (octagon → the circular icon inline errors use) and extract the toast-icon mapping into one exported config the reference page's feedback demo consumes, removing its duplicate mapping and debt comment.
- **3.2 Success/warning tokens.** Add semantic success and warning color tokens — the system has none today — shaped like the existing destructive pair across every theme layer, then point the success and warning toast icons at them (green / orange). Info is unchanged.
- **3.3 Error-panel code display.** Render the error code on the error panel — accepted and copyable today but never shown — in a neutral chip row with a labeled Copy control; danger color stays on icon and title only, no filled background. Fix the reference caption claiming the code isn't shown.
- **3.4 Reference example de-duplication.** Remove the duplicate reference-page example, keeping Display Name and dropping Bio.
- **3.5 Reference table width.** Widen the reference page's content-heavy data table to the wide width while prose stays narrow, matching home's per-content-type widths.

*Success:*
- The destructive toast uses the circular icon; a single exported icon config is the only source, consumed by the reference demo with no duplicate mapping or debt comment left.
- Success and warning tokens exist across all theme layers; success reads green, warning orange, info unchanged.
- The error panel shows its code in a neutral chip with a labeled Copy control and no filled danger background; no caption claims the code is hidden.
- Only the Display Name example remains; the data table renders wide while reference prose stays narrow.
- `pnpm pre-push` is green.

This epic owns every reference-page edit in the phase, so nothing else touches that page.

### Epic 4: Public GitHub page `Complete`

*Note: shipped, then reverted. The live GitHub REST fetches caused heavy, intermittent dev-server AbortError noise (six parallel long-running calls per render), unresolved after multiple fix attempts. Reverted via git reset to pre-epic baseline; the header's GitHub link now points to the external repo instead.*

- **4.1 The GitHub page.** Add a new public page, reached from the header's existing GitHub link, presenting live repo data top-to-bottom: stat tiles (stars, forks, open issues, contributors), a contributor avatars row, recent commits and merged PRs side by side, a latest release summary, a language breakdown bar, and "Built with" stack badges — with a "View on GitHub" button linking out to the actual repo. Data is pulled live from GitHub's public REST API (no token, the repo is public) through a server-side stats module using fetch caching (`revalidate`) to stay under the unauthenticated rate limit; repo owner/name lives in one constant or env var, not scattered literals. The header's GitHub link repoints from the external repo URL to this internal page. Mockup (built as a standalone page despite its filename): `.mockups/reference_page_full_github_section_mockup.html`.
- **4.2 Auth-boundary allowlist.** Admit the new page to the auth-boundary public allowlist — a hard-constraint change routed through the AGENTS.md change protocol, the same one Phase 10 used for its two boundary widenings.

*Success:*
- The page renders all six live sections, the "Built with" badges, and a working "View on GitHub" outbound.
- All data is fetched tokenless and cached under the rate limit; repo identity is centralized in one place.
- The header's GitHub link lands on the internal page, not the external repo.
- A signed-out visitor reaches the page; the auth-boundary check passes and reflects the widened allowlist; the hard-constraint statement matches enforcement.
- `pnpm pre-push` is green.

### Epic 5: Workflow page rethink `Complete`

- **5.1 Page restructure.** Restructure the page to the order: two environments → loop → documents → agent-ready conventions → go-deeper CTA. The two-environment split becomes side-by-side Claude/Cursor cards with short "owns" lists instead of prose. The documents section keeps its table but fixes accuracy — real file names/paths, correct writer/reader fields (e.g. the roadmap is written by Claude Desktop, read by both environments where accurate). Conventions collapse from marketing prose to a short list of CI-enforced constraints (auth boundary, admin gate, semantic tokens, SEO base URL). The CTA is unchanged.
- **5.2 Interactive loop diagram.** Replace the static loop SVG with an interactive recreation — same nested phase/epic containers, connector routing, and visible dashed "revise" return arrow — adding hover-to-reveal that highlights a step and shows its skill name and owning environment below. It must handle light/dark itself, since the current asset is hardcoded hex across separate light/dark files. Mockup: `.mockups/workflow_loop_exact_recreation_interactive.html`.
- **5.3 Content-heavy width.** Widen the page's content-heavy sections (diagram, cards) to the wide width while prose stays narrow, matching home's per-content-type widths.

*Success:*
- The page follows the new order; the two-environment split renders as two "owns"-list cards, not prose.
- The loop diagram is interactive (hover highlights and reveals skill/environment), renders in light and dark, and preserves the original structure and revise arrow.
- The documents table uses real names/paths and correct writer/reader fields; conventions render as a CI-constraint list.
- Content-heavy sections render wide; prose stays narrow.
- `pnpm pre-push` is green.

### Epic 6: Deterministic a11y check `Complete`

- **6.1 check:a11y.** Add a `check:a11y` covering the lintable subset — exactly one `<h1>` per route, non-empty `alt`, no skipped heading levels — promoting those `ui-accessibility.mdc` standards from guidance to enforced, while subjective a11y stays guidance. A new `check:*` pairs one-to-one with a hard-constraint entry, so this routes through the AGENTS.md change protocol as a deliberate hard-constraint addition.

*Success:*
- `check:a11y` flags multiple/zero `<h1>`, empty/missing `alt`, and skipped heading levels, and passes clean on the codebase (fixing anything it flags).
- `ui-accessibility.mdc` reflects the enforced-vs-guidance split; the check runs in the same gate as the other `check:*` scripts; the change protocol is followed.
- `pnpm pre-push` is green.

### Epic 7: Isolated chrome & copy `Complete`

- **7.1 Legal generator callouts.** Add visible legal-generator callouts to `/privacy` and `/terms` linking [the App Privacy Policy Generator](https://app-privacy-policy-generator.firebaseapp.com/) with a not-legal-advice disclaimer (the terms callout notes it generates both policies).
- **7.2 Features nav anchor.** Fix the Features nav anchor so it resolves to `/#features` from any non-home page rather than appending `#features` to the current URL.
- **7.3 Admin feature card copy.** Rewrite admin feature card #4 to reflect the fuller packaged set now shipped — written last in the phase, since its copy must describe the final shipped state.

*Success:*
- Both legal pages show the callout and disclaimer.
- Features from any non-home page lands on home's features section.
- Card #4 copy reflects the actually-shipped set.
- `pnpm pre-push` is green.

### Epic 8: Contrast enforcement & a11y check naming `Complete`

- **8.1 Rename `check:a11y` → `check:a11y-structure`.** Rename the script and every reference to it: `package.json` script entry, the `pnpm pre-push` chain, AGENTS.md's Hard constraints bullet and Setup/quality commands table, and `ui-accessibility.mdc`'s "Enforced (deterministic)" heading. Pure rename — no behavior change to what it checks (one `<h1>` per route, non-empty `alt`, no skipped heading levels).
- **8.2 `check:a11y-contrast` script.** New script scanning the semantic token pairs defined in `globals.css` (`:root` and `.dark` layers) — `primary`/`primary-foreground`, `secondary`/`secondary-foreground`, `accent`/`accent-foreground`, `destructive`/`destructive-foreground`, `success`/`success-foreground`, `warning`/`warning-foreground`, `background`/`foreground`, `card`/`card-foreground`, `muted`/`muted-foreground`, and any other defined foreground/background pair. Computes the WCAG contrast ratio for each pair from its OKLCH values and fails if a text-role pair is below 4.5:1 or a UI-component/graphical-role pair is below 3:1. Pure computation over CSS custom property values — no rendering, no browser.
- **8.3 Update the rule and AGENTS.md for both checks.** In `ui-accessibility.mdc`, move "Color contrast" out of "Guidance (manual/subjective)" into "Enforced (deterministic)," stating the real ratios and naming the token pairs as the checked surface; screen-reader UX and keyboard flows stay guidance. Add `check:a11y-contrast` to AGENTS.md's Hard constraints list (its own bullet, alongside the renamed `check:a11y-structure`) and commands table, wired into `pnpm pre-push` next to `check:a11y-structure`. Both changes route through the AGENTS.md change protocol together, in the same commit.
- **8.4 Fix any violations the check surfaces.** Run `check:a11y-contrast` against current token values (including Phase 11 Epic 3's `success`/`warning` pair); adjust any failing OKLCH values before landing.

*Success:*
- `check:a11y-structure` runs the old `check:a11y` logic under its new name; no reference to the old name remains anywhere in the repo.
- `check:a11y-contrast` flags any defined token pair below its threshold ratio and passes clean on the codebase.
- `ui-accessibility.mdc` shows contrast for token pairs under "Enforced," with real ratios; screen-reader UX and keyboard flows remain under "Guidance."
- AGENTS.md's Hard constraints list and commands table reflect both check names; both run in `pnpm pre-push`.
- `pnpm pre-push` is green.

**Out of scope:** rendered/usage-level contrast checking (axe-core/Lighthouse CI, catching token *misuse* rather than bad token *definitions*) — logged as a deferred ROADMAP open question, not built here.

### Epic 9: Home page proof CTA `Complete`

- **9.1 Copy in `landing-content.ts`.** Add a `proofCta` entry: heading "Explore the template", subhead "Live components to browse, and the process that builds them.", two links — "Pattern reference" → `/reference`, "How planning works" → `/workflow`.
- **9.2 `LandingProofCta` component.** New simple two-link row (not a card grid) rendered between `LandingFeatures` and `LandingTechStack` in `(marketing)/page.tsx`. Heading + subhead, then the two links as plain CTAs — visually distinct from the feature card grid above it.

*Success:*
- The section renders after the feature grid and before the tech-stack marquee.
- Heading, subhead, and both links render from `landing-content.ts`, not hardcoded in the component.
- Both links resolve to `/reference` and `/workflow`.
- Visually reads as a CTA row, not a third feature grid.
- `pnpm pre-push` is green.

### Epic 10: Real sort & page-size selector for data tables `Complete`

- **10.1 `admin_list_users` Postgres function, replacing the Admin API.** New migration adding a `SECURITY DEFINER` function in `public` (e.g. `admin_list_users(p_sort_column, p_sort_direction, p_page, p_per_page, p_search)`) that reads `auth.users` with elevated privilege and returns `id`, `email`, `email_confirmed_at`, `created_at`, `last_sign_in_at`, `app_metadata`, `banned_until` — no broader `auth` schema exposure, no `profiles` join. The function performs its own admin check internally using the same `app_metadata.role === 'admin'` check as everywhere else — never trusts only the calling Server Action's gate. Sort column is resolved through an explicit `CASE`/allowlist inside the function (Email, Created, Last sign-in, Verified via `email_confirmed_at`, Role via `app_metadata->>'role'`) — never string-interpolated, closing the SQL-injection surface. `list-admin-users.ts` calls it via `supabase.rpc('admin_list_users', {...})`, replacing the current two-branch Admin-API/filter logic with one path. `isAdmin` mapping stays sourced from the same `app_metadata` field. Plan-review confirms the function's admin check and sort allowlist before this lands — new security surface, not a routine migration.
- **10.2 All five columns sortable.** Set `enableSorting: true` on Email, Created, Last sign-in, Verified, and Role in `users-columns.tsx`, now that sort is real and server-driven for all of them.
- **10.3 Page-size selector.** Add a page-size `<Select>` (10 / 15 / 25 / 50) next to Previous/Next on `/admin/users`. `USERS_PAGE_SIZE` becomes the default rather than a fixed constant; `perPage` becomes request state passed through the RPC call.
- **10.4 Shared pagination-controls extraction.** Extract Previous/Next + the page-size selector into one shared component (parallel to Epic 2's `UserAvatar` and Epic 3's toast-icon-config extractions) — currently hand-duplicated between `users-table.tsx` and `reference-table-demo.tsx`. Both surfaces consume the same component.
- **10.5 Reference demo parity.** Update `use-reference-shipments.ts` to sort the full fixture set (across all its sortable columns) before paginating, and accept the same page-size control, so the reference demo matches the corrected production behavior rather than the pattern we just fixed away.

*Success:*
- `admin_list_users` exists as a migration-shipped function; the `auth` schema is never exposed via PostgREST; the function enforces its own admin check.
- Sorting on any of the five columns reorders the full user set, not just the visible page; paging afterward preserves sort order.
- A page-size selector exists on `/admin/users`, changes take effect immediately.
- One shared pagination-controls component is used by both `/admin/users` and the reference page's data-table demo.
- The reference demo sorts and pages its full fixture set correctly across all sortable columns.
- No new display columns added in this epic — `AdminUserRow` gains `banned_until` in the query only, in preparation for Epic 11.
- `pnpm pre-push` is green.

### Epic 11: Ban functionality `Complete`

- **11.1 Ban/unban Server Action.** New action wrapping `supabase.auth.admin.updateUserById(id, { ban_duration })`, alongside the existing promote/demote logic in `admin-role-mutations.ts` (shares the same Admin-API/service-role pattern — this stays on the Admin API, unlike Epic 10's listing query, since ban is the GoTrue-sanctioned mutation path; GoTrue enforces `banned_until` at sign-in time natively). Accepts a fixed duration set, not free text: `1h`, `24h`, `168h` (7d), `720h` (30d), and `876000h` (~100 years, functionally permanent — GoTrue's `ban_duration` has no native permanent value). `"none"` unbans immediately.
- **11.2 `Ban` column.** Add `banned_until` to `admin_list_users`' returned fields (already queried as of Epic 10.1); derive a single `banStatus` on `AdminUserRow` — `null` when not banned, `{ permanent: true }` when the ban duration crosses a permanence threshold (e.g. `banned_until` more than ~10 years out), or `{ until: date }` for a finite ban. One "Ban" column, following the same empty/badge convention as Role and Verified: empty cell when not banned, a badge reading "Banned" for permanent bans, a badge reading "Banned until {date}" for finite bans — date formatted with the same `dateFormatter` (medium date style) already used for Created and Last sign-in.
- **11.3 Ban/unban UI.** Row action in the existing actions dropdown (next to Promote/Demote) — "Ban user" opens a dialog offering the duration set from 11.1. Any banned row (permanent or time-based) shows "Unban" in place of "Ban user," mirroring the existing `PromoteDemoteDialog` confirmation pattern.
- **11.4 Self-ban guard.** An admin cannot ban themselves — same `currentAdminUserId` guard already used to block self-demote.
- **11.5 Banned-column sortability.** `banStatus`/`banned_until` becomes sortable through the same `admin_list_users` allowlist from Epic 10 — this epic extends that function's sort allowlist rather than adding a second one.

*Success:*
- Admins can ban a user for a fixed duration or permanently, and unban at any time.
- A permanently-banned row shows "Banned," not a literal 100-year date; a time-based ban shows "Banned until {date}."
- Self-ban is blocked the same way self-demote is.
- Ban status is sortable via the same real-sort mechanism Epic 10 builds.
- `pnpm pre-push` is green.

**Dependency:** Epic 11 builds on `admin_list_users` from Epic 10 (extends its column set and sort allowlist) — sequence Epic 10 before Epic 11.

### Epic 12: Email confirmation setup fix & stray-code hardening `Planned`

- **12.1 README — Supabase Auth setup step.** Add a new step at the top of "Initial setup," before signup, documenting two required Supabase dashboard changes:

  1. **Email templates** — Authentication → Email Templates. Update the link in each to route through `/auth/confirm` instead of Supabase's default hosted verify endpoint:
     - **Confirm signup:**
       ```
       {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}
       ```
     - **Reset Password:**
       ```
       {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next={{ .RedirectTo }}
       ```
  2. **Redirect URLs** — Authentication → URL Configuration → Redirect URLs. Add:
     ```
     http://localhost:3000/**
     ```
     (plus the production URL once deployed, e.g. `https://yourapp.com/**`)

  Include the exact error string (`Missing access token on protected route`) in the README step so it's findable by search if someone hits this before reading setup docs.

- **12.2 Proxy — detect stray auth `code` on protected routes.** In `proxy.ts`'s existing no-session branch, distinguish an ordinary logged-out visit (silent redirect to `/auth/login`, unchanged) from an unauthenticated request carrying a `code` search param (a failed or bypassed auth exchange — the signature of exactly this misconfiguration). The latter case logs an explicit `console.error` naming the likely cause (email template not routed through `/auth/confirm`) and redirects to `/auth/error?source=stray_code` instead of `/auth/login`, so the failure is visible rather than silently absorbed into a normal-looking login screen.

- **12.3 `/auth/error` copy for `stray_code`.** Add a `stray_code` entry to `auth-error-messages.ts`, distinct from the existing `confirm`/`invalid_link` messages, explaining in user-facing terms that the confirmation link didn't complete and pointing at the likely dashboard misconfiguration.

- **12.4 Auth-boundary test coverage.** `proxy.unit.test.ts` (the `check:auth-boundary` hard constraint) gains a case covering the stray-code branch — required since `proxy.ts` is hard-constraint-covered, not optional test hygiene.

*Success:*
- README documents both dashboard changes — the exact template strings and the redirect-URL entry — in the critical setup path, before the signup step.
- An unauthenticated request with a `code` param logs a specific diagnostic and lands on `/auth/error?source=stray_code`, not a plain login redirect.
- Ordinary logged-out visits are unaffected — no new console noise for the common case.
- `/auth/error` shows a distinct, actionable message for `stray_code`.
- `check:auth-boundary` passes with the new case covered.
- `pnpm pre-push` is green.

### Epic 13: Data-table column sizing & pattern refresh

- **13.1 Per-column cell styling.** The shared data-table shell accepts a per-column style hint through column meta, applied to both the header and body cells of that column — a sibling to the existing `skeletonClassName` hint, not a new mechanism.
- **13.2 Actions column shrinks to fit.** The users table's actions column claims only the width its ⋯ button needs, closing the trailing gap between it and the Ban column. Both columns are in scope for diagnosis — the Ban column's widest content is a full `Banned until {date}` badge, so it may be the real source of the gap; fix wherever it actually lives.
- **13.3 Reference demo alignment.** The reference table demo's right-aligned `departs` column uses the new hint instead of hand-rolled wrappers — it currently rolls alignment three ways (a `flex justify-end` header wrapper, a `text-right` cell wrapper, and `ml-auto` in its skeleton class). Same rendered result, no wrapper divs.
- **13.4 LEXICON `Canonical data table` refresh.** The entry describes the pattern as it now stands — it still claims a fixed page size of 15, which Epic 10 replaced with a selectable size and shared pagination controls, and it doesn't mention per-column sizing. No new term; an existing entry corrected.

*Success:*
- One meta hint controls both width and alignment per column; it reaches header and body cells alike.
- The users table's actions column sits flush against the ⋯ button with no dead space beside it, whether or not a banned row is on screen.
- The reference demo's `departs` column renders right-aligned identically to today, with no alignment wrapper divs and no `ml-auto` skeleton workaround.
- The LEXICON entry names selectable page size, shared pagination controls, and per-column sizing; nothing in it contradicts the code.
- `pnpm pre-push` is green.

### Epic 14: Show/hide banned users

- **14.1 Checkbox primitive.** The UI kit gains a vendored Checkbox — the kit has none today, and primitive-first rules out a native input.
- **14.2 Banned filter in `admin_list_users`.** The listing function accepts a show-banned flag and excludes currently-banned users when it's off, filtering server-side so pagination stays honest. Two constraints: the new parameter changes the function's signature, so the migration must drop the existing function and recreate it — `create or replace` with a different parameter list creates a *second overload* rather than replacing, which leaves PostgREST unable to disambiguate the RPC and the old signature holding its own grants. And the function must express "currently banned" **once** and have both the filter and the existing sort read from it; the sort already restates the rule inline, and a second restatement in the same query is drift for nothing.
- **14.3 Filter plumbing.** The flag travels from the table through the Server Action to the RPC, validated at the action boundary like the other list parameters, and participates in the query cache key.
- **14.4 The control.** A "Show banned" checkbox sits beside the search input on `/admin/users`, **checked by default** — an admin console shows its full set unless asked otherwise, and Ban is already a visible column. Unchecking hides currently-banned users and returns to page 1.

*Success:*
- A Checkbox primitive exists in the UI kit and is the control used here.
- Exactly one `admin_list_users` exists after the migration — no second overload, and execute grants match the pre-existing ones.
- The function derives "currently banned" in one place, consumed by both the filter and the sort.
- With the box unchecked, banned users are absent from *every* page, not just the visible one; paging and sorting continue to behave.
- The box is checked on load; toggling it resets to page 1 and refetches rather than serving a stale cached page.
- `pnpm pre-push` is green.

### Epic 15: CLI user delete

- **15.1 Delete mutation.** A delete lands beside the existing promote / demote / ban / unban mutations, following their shape — resolve the user, act, return a typed status including a not-found case.
- **15.2 `pnpm delete-user <email>`.** A script alongside `promote-admin` / `demote-admin` / `list-admins`, using the same confirmation prompt — which echoes the target Supabase project URL before asking, the guardrail that actually matters here. Deleting the auth user removes the profile row by cascade; the avatar file does **not** cascade, so the script deletes it too. Order is auth user first, then the avatar, with a storage failure logged but not failing the command — an orphan file an admin can sweep beats destroying a surviving user's avatar if the auth delete errors. Deleting a user *who has an avatar* must work: `storage.objects` carries an `owner` reference to `auth.users` whose current on-delete behavior we haven't confirmed, and if it's restrictive the delete throws and the order flips. Verify the constraint against the database before settling it. No self-delete guard — a service-key script has no calling admin — and no last-admin guard, matching `demote-admin`.

*Success:*
- `pnpm delete-user <email>` deletes the user after a confirmation that names the target project; declining leaves the account untouched.
- An unknown email exits with a clear not-found message rather than a stack trace.
- Deleting a user who has an avatar succeeds, and the avatar file is gone from the bucket afterward.
- A storage-delete failure still reports the user deleted, and says what was left behind.
- The profile row is gone.
- No delete surface appears in `/admin/users`.
- `pnpm pre-push` is green.

---

## Notes

- **No ADR candidates in this phase.** Nothing here clears the hard-to-reverse bar. (The JWT resolution's ADR-0005 predates this phase and is out of scope.)
- **Only LEXICON touch is Epic 4's auth-boundary allowlist widening,** which rides the change protocol; no new domain terms are introduced.
- **Hard-constraint changes route deliberately:** Epic 4 widens the auth boundary, Epic 6 adds a new `check:*`, and Epic 8 renames `check:a11y` while adding `check:a11y-contrast` — all through the AGENTS.md change protocol, not incidentally.
- **Sequencing:** Epic 7's card-#4 copy (7.3) is written last, since it must describe the final shipped state. No other hard ordering between epics.
- **Epic 9 is net-new home page scope, not a correction** — added deliberately rather than deferred to a future phase, since Phase 11 was already touching marketing copy this session. No hard-constraint or file-coupling implications for the rest of the phase.
- **Epics 10 and 11 are net-new admin-console scope, not corrections** — added deliberately during the same planning session. Epic 10 replaces the Admin-API-based user listing with a `SECURITY DEFINER` Postgres function for real server-side sort/pagination (a genuine new security surface — plan-review must confirm the function's internal admin check and sort-column allowlist before it lands). Epic 11 depends on Epic 10 and must sequence after it.
- **Plan-review flag — header file sharing.** Epic 4's header GitHub-link repoint and Epic 2's header avatar revert may touch the same header file. If they do, they merge or sequence — a plan-review-time check, not resolvable at planning.
- **Scope decision — user delete is CLI-only, deliberately.** The template's riskiest action shouldn't ship as a dropdown item every spinoff inherits by default. The need it serves is test-account cleanup, which is a dev concern; the secret-key script is the sanctioned break-glass path. Considered for an ADR and rejected — surprising and a real trade-off, but not hard to reverse, since adding a UI delete later is cheap.
- **Epics 13–15 make no hard-constraint changes.** Nothing in them touches the auth boundary, the admin gate, or a `check:*` script.
- **No dependencies between Epics 13, 14, and 15** — any build order.
- **No mockups for Epics 13–15** — no new surface worth seeing; Epic 14's checkbox sits in an existing toolbar.
