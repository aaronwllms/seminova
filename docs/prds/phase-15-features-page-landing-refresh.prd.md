# PRD — Phase 15: Features Page & Landing Refresh

**Status:** `Active`
**Last updated:** 2026-07-22

---

## Problem

The template's real breadth isn't legible to the person evaluating it. The home page feature grid is a single six-card section headed "everything a SaaS foundation should ship with" — a claim that simultaneously overclaims (six cards are a fraction of what actually ships) and undersells (the admin console, observability, agent workflow, and SEO surfaces are invisible to a developer or PM sizing the template up). There is no surface that presents the full capability inventory in a scannable form, and the live-component demos on `/reference` aren't connected to any capability overview, so an evaluator can't get from "what's in the box?" to "show me."

Audience framing is a deliberate decision carried into this phase: the reader is a developer/PM evaluating the template ("what do I get out of the box"), not an end user being sold a product. Cards read as inventory, not marketing.

This PRD was fully grilled in a planning chat before decomposition into epics/stories.

## Goal

Add a standalone public `/features` page presenting the full capability set as categorized, scannable per-capability cards, each linking to its live demo on `/reference` where one exists. Refresh the home feature grid into a curated six-card highlight reel — display-only, drawn from the same single content source — that points to `/features` through its own call to action. Repoint the nav "Features" entry to the new page. Both surfaces read honestly as "here's the best of it / here's the whole shelf," never "here's everything."

## Out of scope

- **Interactive elements or live demos on `/features`** — it lists and links; `/reference` stays the single home for live component demos. `/features` links out to it rather than duplicating.
- **New `/reference` anchors** — the existing section anchors already cover every capability that has a demo; `/features` reuses them and adds none.
- **Per-card deep links from the home reel** — the home cards are display-only; one "see all features" CTA carries the traffic. This removes the few per-card links the current grid has.
- **Marketing / public pages as feature entries** — the landing, reference, and workflow pages are the demo surface, not catalogued capabilities. They earn no card.
- **Loose-end #19 (admin-shell feature card copy)** — already shipped in Phase 11 (its card-#4 rewrite). Not carried here; the ROADMAP stub line folding it in was stale.
- **Magic-link auth, blog, pricing** — later phases; the `/features` taxonomy must not pre-list capabilities that don't ship yet.

---

## Epics & stories

### Epic 1: Features content source & `/features` page

- **1.1 A single source defines the features taxonomy.** Introduce one structured content source describing the capability inventory: categories, and within each, capabilities carrying a name, a one-line "what you get" blurb, an icon, and — where a live demo exists — the reference anchor it links to. The six home-reel highlights are marked as a flagged subset of this same source, so the home grid and `/features` never drift out of sync. Reference-demo links reuse the existing `/reference` section anchors rather than defining new ones.

- **1.2 A public `/features` page renders the inventory.** A new `/features` route presents the taxonomy as category sections — each a heading over a grid of per-capability cards (icon, name, blurb). A card shows a "see it live" link to its `/reference` anchor only where a demo exists; capabilities without one show no link and no placeholder. Intro prose sits at the narrower text width while the card grids widen — the same per-content-type width pattern the home and reference pages already use, not one flat page width. Mockup: `.mockups/features_page_mockup.html`.

- **1.3 `/features` is publicly accessible.** The new route is admitted to the public surface so it loads without authentication, routed through the hard-constraint change protocol (the auth-boundary allowlist is a hard constraint). Same handling the existing public reference and GitHub surfaces already use.

*Success:*
- `/features` renders every category with its capability cards, all sourced from the single content source.
- A "see it live" link appears on exactly the cards whose capability has a `/reference` demo, and lands on the correct section; no dead or placeholder links anywhere else.
- Intro prose and card grids use the two-tier width pattern, matching home/reference.
- `/features` loads for an unauthenticated visitor and the auth-boundary check passes.
- `pnpm pre-push` is green.

### Epic 2: Home reel refresh & nav repoint

*Depends on Epic 1 — the shared content source must exist before the home reel can draw its subset from it.*

- **2.1 The home grid becomes a curated highlight reel.** The home feature section renders six display-only highlight cards drawn from the flagged subset of the shared content source, with no per-card links. The section eyebrow changes from "Features" to "Feature highlights," and the heading drops its completeness claim in favor of "The pieces you'd otherwise build first" — so the section reads as a curated sample, not the full set.

- **2.2 The grid carries a "see all features" call to action.** A "See all features →" action attached to the highlight grid links to `/features`. It must be visually distinct from the existing "Explore the template" proof row (reference / workflow), which stays untouched — the two must not read as duplicate CTAs stacked in the same band.

- **2.3 Nav "Features" points to the page.** The header "Features" entry navigates to `/features` from any route. The home section keeps its in-page anchor for scroll, but nav no longer targets that anchor — this supersedes the earlier nav behavior that resolved the home anchor from any route.

*Success:*
- The home grid shows six display-only highlight cards from the shared source, with no per-card links.
- The eyebrow reads "Feature highlights" and the heading no longer claims completeness.
- The grid's "See all features" CTA reaches `/features` and is visually distinct from the untouched "Explore the template" row.
- Nav "Features" reaches `/features` from a non-home route.
- `pnpm pre-push` is green.

---

## Notes

- **Build accuracy — do not trust the mockup's copy.** The `/features` card names and blurbs in the mockup are representative placeholders. The content source must be populated from a capability inventory re-derived from the codebase at build time; the mockup conveys layout and rhythm, not final copy.
- **Lexicon close-out.** The LEXICON "Site config" entry is updated to name the new features content source alongside the existing landing content, in the same phase — a one-line amendment.
- **ADR candidates:** none — nothing in this phase clears the hard-to-reverse bar.
