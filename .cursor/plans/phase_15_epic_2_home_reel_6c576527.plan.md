---
name: Phase 15 Epic 2 Home Reel
overview: Migrate the home feature section to the shared features-content highlight subset (display-only cards + "See all features" CTA), repoint nav Features to `/features`, and sync AGENTS.md. No auth-boundary or schema changes.
todos:
  - id: story-2-1-home-reel
    content: Migrate home grid to getHomeHighlightCapabilities(); featureHighlights in landing-content; display-only LandingFeatureItem; remove dead features.items; extend features-content unit test
    status: completed
  - id: story-2-2-see-all-cta
    content: Render CTA from featureHighlights.cta below grid; leave proof CTA untouched
    status: completed
  - id: story-2-3-nav-repoint
    content: Repoint site.ts Features nav to FEATURES_PATH; update site-nav-links tests (hash case retargeted + /features active)
    status: completed
  - id: agents-md-sync
    content: Sync AGENTS.md landing section — highlight reel, CTA, nav href; grep for /#features
    status: completed
  - id: quality-gate
    content: Run pnpm type-check && pnpm lint && pnpm format-check && pnpm test:ci
    status: completed
  - id: commit-epic
    content: "Conventional commit with Epic: 15.2 trailer"
    status: completed
isProject: false
---

# Phase 15 Epic 2 — Home reel refresh & nav repoint

> **Track progress:** as you complete each step, update the corresponding `todos` entry's `status` to `completed` in this plan's frontmatter.

> **Precondition:** confirm `git branch --show-current` outputs `phase-15/features-page-landing-refresh`. If it doesn't match, halt and ask the user — do not switch branches.

> **Precondition:** `git status --porcelain` must be empty before the first implementation edit. If dirty, halt and ask the user to commit or stash. The epic must land as a single commit containing only this epic's work — `code-review` derives its range from that commit. *(Note: an untracked Epic 1 plan file may be present — commit it or archive via `/archive-cursor-plans` before starting.)*

> **Precondition:** Before the first implementation edit, run `git rev-parse HEAD` and record the output below as the epic baseline SHA (update this line if HEAD differs at execution time).

> **Epic baseline SHA:** `67a14147a214116913ded3f8562c2fc1e6331eb0`

**Depends on Epic 1:** [`features-content.ts`](src/config/features-content.ts) already ships the taxonomy with exactly six `homeHighlight: true` capabilities (guard-tested in [`features-content.unit.test.ts`](src/config/features-content.unit.test.ts)). [`FEATURES_PATH`](src/constants/app-paths.ts) and the public `/features` route are live.

**Sequential build** — home section, CTA, and nav are one marketing surface; not a parallel candidate.

---

## Step 1 — Home highlight reel (Story 2.1)

**Goal:** Six display-only cards from the shared source; updated section copy; no per-card links.

### Data wiring

Add a small exported helper in [`src/config/features-content.ts`](src/config/features-content.ts):

- `getHomeHighlightCapabilities()` — `flatMap` categories, filter `homeHighlight === true`, preserve category order (Admin shell → Semantic token theming → Owned UI primitives → Accessibility checks → Locked rules → Collaboration model).

[`landing-features.tsx`](src/app/(marketing)/_components/landing-features.tsx) imports this helper for card data.

Extend [`src/config/features-content.unit.test.ts`](src/config/features-content.unit.test.ts) with a case asserting `getHomeHighlightCapabilities()` returns exactly the six `homeHighlight` capabilities in category order.

### Section copy

Replace the old `features` block in [`landing-content.ts`](src/config/landing-content.ts) with a `featureHighlights` object:

```typescript
featureHighlights: {
  label: 'Feature highlights',
  heading: "The pieces you'd otherwise build first",
  cta: { label: 'See all features', href: FEATURES_PATH },
}
```

Import `FEATURES_PATH` from [`app-paths.ts`](src/constants/app-paths.ts) for the CTA href.

**Remove** the six hardcoded `features.items`, the `LandingFeature` interface, and icon imports used only by that block. Keep hero, proofCta, and techStack untouched.

The highlight section's eyebrow, heading, and CTA label/href live in `src/config/landing-content.ts` as `featureHighlights: { label, heading, cta }`, and [`landing-features.tsx`](src/app/(marketing)/_components/landing-features.tsx) reads all of them from it. No section copy or CTA label is hardcoded in the component.

| Field | Old | New (PRD) |
| ----- | --- | --------- |
| Eyebrow (`label`) | Features | Feature highlights |
| Heading | Everything a SaaS foundation should ship with | The pieces you'd otherwise build first |

### Display-only card component

Update [`landing-feature-item.tsx`](src/app/(marketing)/_components/landing-feature-item.tsx):

- Accept `{ name, blurb, icon }` from `FeatureCapability` (not `LandingFeature`).
- **Remove** the conditional `Link` / "Learn more" block entirely — display-only per PRD.
- Keep the existing layout rhythm (accent circle icon, `h3`, muted blurb) so the reel visually matches today's grid density, distinct from the [`FeatureCapabilityCard`](src/app/(marketing)/features/_components/feature-capability-card.tsx) Card treatment on `/features`.

[`landing-features.tsx`](src/app/(marketing)/_components/landing-features.tsx): map `getHomeHighlightCapabilities()` → `LandingFeatureItem`; key on `capability.name`.

Keep `id="features"` on the section — home in-page anchor still works; nav just stops targeting it (Story 2.3).

---

## Step 2 — "See all features" CTA (Story 2.2)

Render the CTA below the card grid inside [`landing-features.tsx`](src/app/(marketing)/_components/landing-features.tsx), still within the `bg-background` section, sourcing label and href from `landingContent.featureHighlights.cta`:

- **Text link** (not a `Button`) — `featureHighlights.cta.label` + `ArrowRight` icon, same link styling as the old per-card affordance and `/features` cards (`text-sm font-medium`, hover primary, focus ring).
- **Href:** `featureHighlights.cta.href` (`FEATURES_PATH` / `/features`).
- **Placement:** centered below the grid (section header is already centered) — visually a footer to the reel, not a second band.

**Visual distinction from proof CTA** ([`landing-proof-cta.tsx`](src/app/(marketing)/_components/landing-proof-cta.tsx)): proof row stays on `bg-muted` with two `Button` components and its own heading; the features CTA is a single text link inside the white/background features section. Do not touch proof CTA.

---

## Step 3 — Nav repoint (Story 2.3)

In [`src/config/site.ts`](src/config/site.ts):

- Import `FEATURES_PATH` from [`app-paths.ts`](src/constants/app-paths.ts).
- Change Features nav entry: `href: '/#features'` → `href: FEATURES_PATH`.

Update [`site-nav-links.tsx`](src/components/site-nav-links.tsx) comment — Features is a route link now, not a hash anchor; `isSiteNavLinkActive` already handles non-hash paths correctly.

**Tests** in [`site-nav-links.unit.test.tsx`](src/components/site-nav-links.unit.test.tsx):

- Retain a hash-href case for `isSiteNavLinkActive`, retargeted to a hash href that is **not** a nav entry (e.g. `/#main-content`), so hash handling stays covered after Features leaves the nav.
- Add `/features` active-state case: `isSiteNavLinkActive('/features', '/features')` is true.
- Add render case: on pathname `/features`, the Features link gets `aria-current="page"`.

No changes to `isSiteNavLinkActive` logic unless a bug surfaces — pathname matching already works for `/features`.

---

## Step 4 — Doc sync

Update [`AGENTS.md`](AGENTS.md) Landing page section to reflect shipped behavior:

- Home section is a **six-card highlight reel** sourced from `features-content.ts` (`homeHighlight`), display-only, eyebrow "Feature highlights," heading "The pieces you'd otherwise build first."
- Section includes a **"See all features"** text link to `/features`.
- Nav **Features** href is `/features` (not `/#features`); home section keeps `id="features"` for in-page scroll only.
- Re-skin note: highlight **items** from [`features-content.ts`](src/config/features-content.ts); section chrome and CTA from [`landing-content.ts`](src/config/landing-content.ts) (`featureHighlights`).

Grep AGENTS.md for `/#features` and update all occurrences.

---

## Epic success verification (manual smoke)

After quality gate:

- Home `/` features section shows six cards with **no** per-card links; copy matches PRD eyebrow/heading.
- Cards reflect the six `homeHighlight` capabilities from `/features` inventory (names/blurbs match).
- "See all features" link reaches `/features`; proof CTA band below is unchanged (muted bg, two buttons).
- Nav Features from `/workflow` or `/reference` → `/features`; Features shows `aria-current` on `/features`.
- Home `id="features"` anchor still scrolls when linked directly (e.g. footer-less deep link to `/#features`).
- `pnpm pre-push` green.

**Out of scope:** `/features` page changes, auth boundary, new reference anchors, LEXICON (closed in Epic 1).

---

### Verification

```bash
pnpm type-check && pnpm lint && pnpm format-check && pnpm test:ci
```

### Commit epic

Authorized by this approved plan:

1. Review diff; stage only files in scope for this epic.
2. Conventional commit ending with the epic trailer:

   ```
   feat(phase-15): home highlight reel and features nav

   Epic: 15.2
   ```

3. Commit (request `git_write`). If pre-commit hook fails, fix and retry.
4. Verify `git status --porcelain` is empty after commit.

**Do not push** — push remains `ship-phase`.

### Handoff

Epic 15.2 committed. Next: open a new agent window and run `/code-review` against epic baseline SHA `67a14147a214116913ded3f8562c2fc1e6331eb0`.
