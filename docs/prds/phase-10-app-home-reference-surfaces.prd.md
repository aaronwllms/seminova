# PRD — Phase 10: App Home, Reference Surfaces & Chrome Polish

**Status:** `Active`
**Last updated:** 2026-07-09

---

## Problem

Seminova's canonized component patterns — the data table, the operational/fault error surfaces, skeleton loading, toast, and the form/settings save models — exist only inside the real surfaces that happen to use them. There is no single place to see them, so a PM evaluating the template has to read admin code to learn what they inherit. The same legibility gap applies to the template's two actual differentiators — its agent-ready conventions and its PM/agent collaboration model — which today are a line of landing copy each.

Underneath that sits a structural knot. The profile page doubles as `APP_HOME`, so there is no real authenticated landing surface, and profile settings cannot become the dismissable modal its save models already suit. Alongside it, three smaller defects undercut the first impression a spinoff inherits: the header and footer navs are not truly centered, the favicon is still the framework default, and the footer's Terms and Privacy labels are inert text pointing nowhere.

## Goal

Give the authenticated surface a real home, convert profile settings to a modal, and ship the two pages that make the template legible — a pattern reference page and a PM/agent workflow explainer — while clearing the chrome defects (nav centering, favicon, legal links) that every spinoff would otherwise inherit. `pnpm pre-push` stays green throughout.

## Scope decisions (made at planning)

- **`APP_HOME` becomes its own placeholder surface, not the pattern reference page.** The reference page is explicitly deletable scaffolding; if the post-auth landing depended on it, a spinoff that deleted the demo would break its own login flow. A minimal placeholder that is *meant* to be replaced avoids the trap and keeps `APP_HOME` a stable inherited contract.
- **Profile settings is modal-only — the profile route is removed.** No deep link, no shareable settings URL. Accepted because the surface's blur-save and upload-on-complete save models leave no unsaved state to lose on dismiss. Recorded as an ADR.
- **The profile modal carries no footer.** Saving is automatic, so a Save button would be misleading and a Close-only footer would duplicate the dialog's own dismiss affordances.
- **Password change becomes an inline section of the profile modal,** retaining its explicit-submit save model, rather than a nested dialog.
- **Legal ships as two routes, not one.** Terms and Privacy render the same placeholder today, but keeping the conventional URLs means a spinoff drops real content into each without rewiring links or splitting a combined page later.
- **The auth boundary is extended** to admit the two legal routes publicly. This is a hard-constraint change and routes through the AGENTS.md change protocol.
- **The favicon is generated from site config's logo mark,** on the same primary-filled square the header uses, via the dynamic image pattern already established for social previews. A spinoff changes the logo once and the header, social preview, and favicon all track together — no second place to customize.
- **The workflow explainer is a purpose-written page, not a rendering of the workflow guide.** The guide is a long in-repo operating manual — wrong audience, wrong depth, and its relative links and callouts do not survive being rendered as an app route. The page stays concept-only (the two-environment split, the document set, the plan → review → build loop) and links out to the full guide, so the fast-changing details live in exactly one place.
- **The theme-regeneration skill is out of scope,** despite its ROADMAP deferral naming this phase. It is workflow tooling, not product surface, and ships independently.

## Out of scope

- Real Terms and Privacy content — the template ships a placeholder that points a spinoff at a generator or its counsel.
- Any change to the profile surface's save models, validation, or server actions beyond relocation.
- Theme regeneration as a skill — tracked separately.
- A markdown rendering pipeline for in-app documentation.
- Deterministic a11y enforcement — still a ROADMAP open question.

---

## Epics & stories

### Epic 1: App home & profile modal `Complete`

- **1.1 A real app home.** Introduce a minimal placeholder surface as the authenticated landing page and diverge `APP_HOME` from the profile path. Retarget the post-auth redirect and the admin gate's non-admin redirect at the new home, and give the admin shell's user menu a direct "open app" entry — previously unnecessary while the profile link doubled as the switch into the app.
  *Success: a non-admin signing in lands on the app home rather than profile settings; an admin can reach the app home in one step from the admin shell; the profile route still resolves.*
- **1.2 Profile settings as a modal.** Convert the profile settings surface from a page to a dialog opened from the app shell's user menu, laid out as a compact settings card — avatar with upload control, name and username paired, email and bio full-width — with no footer. Remove the profile route and relocate its server actions and components to a home that does not presume a route. Preserve every behavior of the current page: blur-save fields, upload-on-complete avatar, existing feedback routing. The trade-off (no settings deep link) is recorded in [ADR-0004](../adr/ADR-0004-profile-modal-app-home-divergence.md).
  *Success: profile settings opens as a dialog from anywhere in the app shell, saves exactly as the page did, dismisses without data loss, and the former profile URL no longer resolves.*
- **1.3 Inline password change.** Fold password change into the profile modal as an inline section rather than a dialog within a dialog, retaining its explicit-submit save model and its own success and error feedback.
  *Success: a user changes their password without leaving the profile modal, with submit-triggered persistence and errors surfaced inline.*

### Epic 2: Site chrome & identity

- **2.1 True-center the site nav.** Both the header and the footer center their nav within the space left over between the flanking elements, so unequal left and right widths push the nav off the page's true center — visibly so in the footer, where a single social icon is far narrower than the logo. Re-lay both as a three-column arrangement whose outer tracks are always equal, pinning the nav to true center regardless of what flanks it. Mobile nav behavior is unchanged.
  *Success: header and footer navs are centered to the viewport, not to the gap; the offset does not reappear when the flanking content changes width; mobile navigation behaves as before.*
- **2.2 Favicon from the site logo.** Replace the framework-default icon with one generated at build time from site config's logo mark on the primary-filled square, reusing the dynamic image pattern established for social previews. Remove the default icon file so the generated one takes precedence.
  *Success: the browser tab shows the product's own mark; changing the logo in site config changes the favicon, the header, and the social preview together, with no separate icon asset to maintain.*

### Epic 3: Public legal pages

- **3.1 Extend the auth boundary to legal routes.** Admit the Terms and Privacy routes to the public allowlist alongside the landing page and the auth screens, updating the boundary's enforcement check and the hard-constraint statement in the same pass, per the change protocol.
  *Success: a signed-out visitor reaches both legal routes without being redirected to login; the auth-boundary check passes and reflects the new allowlist; the hard-constraint statement matches enforcement.*
- **3.2 Legal placeholder and footer links.** Render both routes from one shared placeholder that tells a spinoff to generate its policies or engage counsel, and turn the footer's inert legal labels into real links by giving site config's legal entries destinations.
  *Success: clicking Terms or Privacy in the footer from a signed-out session lands on the placeholder; both routes render the same content; nothing in the footer is a dead label.*

### Epic 4: Pattern reference page

- **4.1 Reference page shell.** Stand up the pattern reference page on the authenticated surface with its section scaffolding and a route in from the app home. The page imports the real, already-canonized components; it reimplements nothing.
  *Success: the page is reachable from the app home, renders its section structure, and introduces no new component definitions.*
- **4.2 Forms and save models section.** Demonstrate the three save models side by side — blur-save, explicit submit, and upload-on-complete — each with the feedback its model calls for, so the reader can see why the choice is per-field rather than per-form.
  *Success: all three save models are demonstrated with their distinct success feedback, drawn from the existing form components.*
- **4.3 Feedback and error states section.** Demonstrate the operational-versus-fault error split and its two surfaces, transient toast feedback, and skeleton loading, making the classification visible rather than implied.
  *Success: an operational error renders inline and a fault renders in the reportable panel; toast and skeleton are both demonstrated live.*
- **4.4 Canonical data table section.** Demonstrate the canonical table pattern — single-column search, server-side pagination, skeleton loading via column metadata — as the shape a new list view should copy.
  *Success: the section renders the canonical table with search, pagination, and loading state, using the established table component.*

### Epic 5: Workflow explainer page

- **5.1 The PM/agent workflow explainer.** A public, concept-only page reached from the landing surface, covering the template's two differentiators: its agent-ready conventions, and the PM/agent collaboration model — the two-environment split, the document set each side owns, and the plan → review → build loop. It carries no file paths, commands, or setup steps; it links out to the full workflow guide for those.
  *Success: a visitor reaches the page from the landing surface and can describe the two-environment split and the plan-review loop without having opened the repo; the page restates no setup detail owned by the workflow guide.*

---

## Notes

- **ADR-0004** (written at planning, not by Cursor): `APP_HOME` diverging from the profile path and the profile route being removed.
- **LEXICON impact — update after the build lands, not before.** Four entries go stale as this phase ships: **auth boundary** (its definition names only the landing and auth routes), **post-auth redirect** (names the profile path as `APP_HOME`), **response envelope** and **save model** (both cite the profile route's files as reference implementations, and that route is removed). A fifth question falls out of story 1.2: with no route to co-locate against, the convention for where a modal-only surface's server actions live needs restating.
- **Hard constraint:** the auth boundary changes in story 3.1 and must route through the AGENTS.md change protocol, including its enforcement check.
- **ROADMAP open questions resolved by this phase:** *Profile settings as a modal* — its stated blocker was the absence of a real app home, which story 1.1 supplies. Remove on PRD landing. *Theme regeneration as skill vs mode* — deferred to this phase but descoped from it; the entry stays until the skill ships.
