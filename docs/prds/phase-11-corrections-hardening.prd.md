# PRD — Phase 11: Corrections & Hardening

**Status:** `Active`
**Last updated:** 2026-07-13

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

### Epic 7: Isolated chrome & copy

- **7.1 Legal generator callouts.** Add visible legal-generator callouts to `/privacy` and `/terms` linking [the App Privacy Policy Generator](https://app-privacy-policy-generator.firebaseapp.com/) with a not-legal-advice disclaimer (the terms callout notes it generates both policies).
- **7.2 Features nav anchor.** Fix the Features nav anchor so it resolves to `/#features` from any non-home page rather than appending `#features` to the current URL.
- **7.3 Admin feature card copy.** Rewrite admin feature card #4 to reflect the fuller packaged set now shipped — written last in the phase, since its copy must describe the final shipped state.

*Success:*
- Both legal pages show the callout and disclaimer.
- Features from any non-home page lands on home's features section.
- Card #4 copy reflects the actually-shipped set.
- `pnpm pre-push` is green.

---

## Notes

- **No ADR candidates in this phase.** Nothing here clears the hard-to-reverse bar. (The JWT resolution's ADR-0005 predates this phase and is out of scope.)
- **Only LEXICON touch is Epic 4's auth-boundary allowlist widening,** which rides the change protocol; no new domain terms are introduced.
- **Hard-constraint changes route deliberately:** Epic 4 widens the auth boundary and Epic 6 adds a new `check:*` — both through the AGENTS.md change protocol, not incidentally.
- **Sequencing:** Epic 7's card-#4 copy (7.3) is written last, since it must describe the final shipped state. No other hard ordering between epics.
- **Plan-review flag — header file sharing.** Epic 4's header GitHub-link repoint and Epic 2's header avatar revert may touch the same header file. If they do, they merge or sequence — a plan-review-time check, not resolvable at planning.
