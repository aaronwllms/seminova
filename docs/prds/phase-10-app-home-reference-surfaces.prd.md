# PRD — Phase 10: App Home, Form Primitives & Reference Surfaces

**Status:** `Active`
**Last updated:** 2026-07-10

---

## Problem

Seminova's canonized component patterns — the data table, the operational/fault error surfaces, skeleton loading, toast, and the form/settings save models — exist only inside the real surfaces that happen to use them. There is no single place to see them, so a PM evaluating the template has to read admin code to learn what they inherit. The same legibility gap applies to the template's two actual differentiators — its agent-ready conventions and its PM/agent collaboration model — which today are a line of landing copy each.

Underneath that sits a structural gap. The template's save models — blur-save, explicit submit, upload-on-complete — are documented as conventions but exist only as one profile form, typed to that form's schema and welded to its server action. A spinoff inherits a reference implementation to reverse-engineer, not a component to import. The same duplication shows in error routing: seven surfaces each hand-write the identical fault-versus-operational ternary, and the eighth has already drifted — the admin table renders role-mutation faults as inline errors, silently dropping their reportable panel.

## Goal

Give the authenticated surface a real home, convert profile settings to a modal, extract the form primitives a spinoff should inherit rather than copy, and ship the two pages that make the template legible — a pattern reference page and a PM/agent workflow explainer — while clearing the chrome defects (nav centering, favicon, legal links) that every spinoff would otherwise inherit. `pnpm pre-push` stays green throughout.

## Scope decisions (made at planning)

- **`APP_HOME` is a placeholder that signposts, not an empty surface.** The reference page and the workflow explainer both ship public, so neither can serve as the post-auth landing. The app home stays a minimal, obviously-disposable surface — but it names the two pages a spinoff should read before replacing it, rather than sitting blank.
- **Profile settings is modal-only — the profile route is removed.** No deep link, no shareable settings URL. Accepted because the surface's blur-save and upload-on-complete save models leave no unsaved state to lose on dismiss. Recorded as an ADR.
- **The profile modal carries no footer.** Saving is automatic, so a Save button would be misleading and a Close-only footer would duplicate the dialog's own dismiss affordances.
- **Password change becomes an inline section of the profile modal,** retaining its explicit-submit save model, rather than a nested dialog.
- **Legal ships as two routes, not one.** Terms and Privacy render the same placeholder today, but keeping the conventional URLs means a spinoff drops real content into each without rewiring links or splitting a combined page later.
- **The auth boundary is extended** to admit the two legal routes publicly. This is a hard-constraint change and routes through the AGENTS.md change protocol.
- **The favicon is generated from site config's logo mark,** on the same primary-filled square the header uses, via the dynamic image pattern already established for social previews. A spinoff changes the logo once and the header, social preview, and favicon all track together — no second place to customize.
- **Two form primitives are extracted before the reference page is built.** The reference page cannot demonstrate what a spinoff does not inherit. `useBlurSaveField` is typed to the profile form's schema and imports its server action directly; the fault-versus-operational ternary is copy-pasted across seven surfaces. Both become real, importable components. Normally extracting a generic from a single call site is speculative — but a template will never see its second and third consumer before committing, because producing them is the spinoff's job. Waiting for evidence the template is structurally prevented from receiving is not discipline.
- **Only blur-save yields a primitive.** Upload-on-complete owns a storage bucket, a user id, and a cache-bust convention; generalizing it invents an abstraction with no second use case. Explicit submit, stripped of its password call, is a `<form onSubmit>` with a loading state. Both stay patterns — documented in `forms.mdc` and demonstrated in prose on the reference page rather than live.
- **Error routing stays with the surface-owning component.** No hook in the codebase renders error UI; `error-handling.mdc` states that `kind` is set at the producer and the surface branches on it. The extracted error component does not change that — it collapses the branch itself into one file, so the routing decision is made once rather than restated seven times. Hooks still hand back an `AppError`; callers still choose where it renders.
- **The pattern reference page is public.** Its audience is someone evaluating the template, who by definition has no account. Public also reunites it with the workflow explainer — the template's two differentiators, both reachable from the landing surface — and makes it indexable, which an authenticated route is not. Every component it demonstrates is props-only and session-free once the form primitives land. This extends the auth boundary a second time this phase, through the AGENTS.md change protocol.
- **The table demo runs on a static fixture, not real data.** A demo table needs enough rows to exercise search, sort, and pagination; the users table has one. A checked-in fixture in a synthetic business domain never rots, needs no build-time machinery, and reads to a spinoff as "the shape my list view should be" rather than a table of the template's internals. Its data source is artificially delayed, so skeleton loading renders naturally on every page change and search keystroke rather than being staged as a separate demo.
- **The workflow explainer is a purpose-written page, not a rendering of the workflow guide.** The guide is a long in-repo operating manual — wrong audience, wrong depth, and its relative links and callouts do not survive being rendered as an app route. The page stays concept-only (the two-environment split, the document set, the plan → review → build loop) and links out to the full guide, so the fast-changing details live in exactly one place.
- **The theme-regeneration skill is out of scope,** despite its ROADMAP deferral naming this phase. It is workflow tooling, not product surface, and ships independently.

## Out of scope

- Real Terms and Privacy content — the template ships a placeholder that points a spinoff at a generator or its counsel.
- Extraction of the upload-on-complete and explicit-submit save models — neither contains a primitive.
- Any change to the profile surface's save models, validation, or server actions beyond relocation and the persist-function injection Epic 4 requires.
- `check:auth-boundary` is not a step in `pnpm pre-push`; it runs only incidentally under `test:ci`. Logged, not fixed here.
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

### Epic 2: Site chrome & identity `Complete`

- **2.1 True-center the site nav.** Both the header and the footer center their nav within the space left over between the flanking elements, so unequal left and right widths push the nav off the page's true center — visibly so in the footer, where a single social icon is far narrower than the logo. Re-lay both as a three-column arrangement whose outer tracks are always equal, pinning the nav to true center regardless of what flanks it. Mobile nav behavior is unchanged.
  *Success: header and footer navs are centered to the viewport, not to the gap; the offset does not reappear when the flanking content changes width; mobile navigation behaves as before.*
- **2.2 Favicon from the site logo.** Replace the framework-default icon with one generated at build time from site config's logo mark on the primary-filled square, reusing the dynamic image pattern established for social previews. Remove the default icon file so the generated one takes precedence.
  *Success: the browser tab shows the product's own mark; changing the logo in site config changes the favicon, the header, and the social preview together, with no separate icon asset to maintain.*

### Epic 3: Public legal pages `Complete`

- **3.1 Extend the auth boundary to legal routes.** Admit the Terms and Privacy routes to the public allowlist alongside the landing page and the auth screens, updating the boundary's enforcement check and the hard-constraint statement in the same pass, per the change protocol.
  *Success: a signed-out visitor reaches both legal routes without being redirected to login; the auth-boundary check passes and reflects the new allowlist; the hard-constraint statement matches enforcement.*
- **3.2 Legal placeholder and footer links.** Render both routes from one shared placeholder that tells a spinoff to generate its policies or engage counsel, and turn the footer's inert legal labels into real links by giving site config's legal entries destinations.
  *Success: clicking Terms or Privacy in the footer from a signed-out session lands on the placeholder; both routes render the same content; nothing in the footer is a dead label.*

### Epic 4: Form primitives `Complete`

> This epic is a refactor: it changes no product surface a user sees, save for one bug fix. Its stories name deliverables rather than user behavior, deliberately — the inheritance the reference page demonstrates does not exist until they land.

- **4.1 A single error surface component.** Replace the fault-versus-operational ternary — hand-written identically across the four auth forms, the profile form, the password section, and the admin users table — with one component taking an `AppError`. The admin table's role-mutation branch renders faults inline and drops their reportable panel; it is corrected in the same pass.
- **4.2 Blur-save as an importable primitive.** Lift `useBlurSaveField` and its text field out of the profile feature: generic over the caller's form schema rather than the profile's, with the persist function injected rather than imported. Profile becomes the primitive's first consumer, its behavior unchanged.

*Success criteria:*
- *No surface hand-writes the fault-versus-operational branch; every one renders the shared error component.*
- *A fault raised by an admin role mutation surfaces in the reportable panel with its code, not inline.*
- *The blur-save primitive compiles against a form schema that is not the profile's, persisting through a function its caller supplies.*
- *Profile settings saves, fails, and surfaces errors exactly as before, with no user-visible change.*
- *`forms.mdc` and `error-handling.mdc` describe the primitives rather than their former reference implementations, and `forms.mdc`'s four stale references are cleared.*
- *`pnpm pre-push` is green.*

### Epic 5: Pattern reference page

- **5.1 Reference page shell.** Stand up the page as a public route reached from the landing surface, admitting it to the auth boundary's allowlist per the change protocol. The app home gains a link to it. The page imports the real, already-canonized components; it reimplements nothing. Mockup: `.mockups/reference-page.html`.
- **5.2 Forms and save models.** Demonstrate the blur-save primitive live, persisting through a mock function, with the field-level save indicator its model calls for. Cover explicit submit and upload-on-complete in prose, explaining why the choice is per-field rather than per-form and pointing at their reference implementations.
- **5.3 Feedback and error states.** Demonstrate the operational-versus-fault split through the shared error component — an operational error inline, a fault in the reportable panel with its copy control — alongside transient toast feedback.
- **5.4 Canonical data table.** Demonstrate the canonical table on a checked-in fixture: single-column search, pagination, and sorting, over a data source whose artificial delay surfaces skeleton loading through the columns' own metadata.

*Success criteria:*
- *A signed-out visitor reaches the page from the landing surface; the auth-boundary check passes and reflects the widened allowlist.*
- *Blur-save is demonstrated live and persists nothing real; the other two save models are described, not staged.*
- *An operational error renders inline and a fault renders in the reportable panel, both through the shared error component.*
- *The table's search, pagination, and sort all operate over enough rows to be meaningful, and the skeleton appears on each fetch without being separately triggered.*
- *The page defines no new component; deleting it leaves every check green.*
- *`pnpm pre-push` is green.*

### Epic 6: Workflow explainer page

- **6.1 The PM/agent workflow explainer.** A public, concept-only page reached from the landing surface, covering the template's two differentiators: its agent-ready conventions, and the PM/agent collaboration model — the two-environment split, the document set each side owns, and the plan → review → build loop. It carries no file paths, commands, or setup steps; it links out to the full workflow guide for those.

*Success criteria:*
- *A visitor reaches the page from the landing surface and can describe the two-environment split and the plan-review loop without having opened the repo.*
- *The page restates no setup detail owned by the workflow guide.*
- *`pnpm pre-push` is green.*

---

## Notes

- **ADR-0004** (written at planning, not by Cursor): `APP_HOME` diverging from the profile path and the profile route being removed.
- **No ADR for the form-primitive extraction.** It clears two of the three bars in `adr/README.md` — surprising without context, and a real trade-off accepted — but not the first: unwinding the extraction is a refactor of eight call sites inside one repo, not a costly or disruptive reversal. The reasoning lives in the scope decision above.
- **LEXICON impact — update each entry after the code that stales it lands, not before.** Three entries are blocked until Epics 4–5 land: **save model** and **response envelope** (both cite the profile route's files as reference implementations, and blur-save's is now a primitive with a different home), and **operational vs fault error** (names `InlineError` and `ErrorPanel` directly, where the shared error component now stands). Epic 5 also widens the **auth boundary** entry's allowlist a second time, to admit `/reference`.

  Three entries this note previously flagged as stale after Epics 1–3 were not: **auth boundary** and **post-auth redirect** had both already been updated, and the **Server Action** entry already covers where a modal-only surface's actions live. A separate lexicon pass, reading the code rather than this note, found two real staleness bugs instead — the auth-boundary entry described an env bypass the proxy no longer has (production fails closed with a 503; only non-production skips), and the post-auth-redirect entry presented the role-derived path as the whole story, omitting that a `next` param passing `isSafeRedirect()` overrides it. Both are fixed. The lesson is the note's own: verify against code, not against the note.
- **Hard constraint:** the auth boundary changes twice this phase — story 3.1 (shipped) and story 5.1 — each routing through the AGENTS.md change protocol and touching `proxy.ts`, `proxy.unit.test.ts`, `AGENTS.md`, `LEXICON.md`, `security.mdc`, `supabase.mdc`, and `app-paths.ts`.
- **ROADMAP open questions resolved by this phase:** *Profile settings as a modal* — its stated blocker was the absence of a real app home, which story 1.1 supplies. Remove on PRD landing. *Theme regeneration as skill vs mode* — deferred to this phase but descoped from it; the entry stays until the skill ships.
