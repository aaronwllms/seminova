---
name: Phase 11 Epic 9 Home proof CTA
overview: Add a proof CTA section to the marketing home page between the features grid and tech-stack marquee — copy in landing-content.ts, a new LandingProofCta component, and a one-line wire-up in page.tsx.
todos:
  - id: capture-baseline-sha
    content: Run git rev-parse HEAD and record the SHA in this plan as the epic baseline
    status: completed
  - id: proof-cta-content
    content: Add proofCta entry (heading, subhead, two links) to landing-content.ts with typed link shape
    status: completed
  - id: proof-cta-component
    content: Create LandingProofCta server component — centered prose + two-link button row from landingContent
    status: completed
  - id: wire-home-page
    content: Insert LandingProofCta between LandingFeatures and LandingTechStack in page.tsx
    status: completed
  - id: quality-gate
    content: Run pnpm type-check && pnpm lint && pnpm format-check && pnpm test:ci
    status: completed
  - id: commit-epic
    content: "Conventional commit for Epic 11.9 with Epic: 11.9 trailer"
    status: completed
isProject: false
---

# Phase 11 Epic 9 — Home page proof CTA

> **Track progress:** as you complete each step, update the corresponding `todos` entry's `status` to `completed` in this plan's frontmatter.

> **Precondition:** `git status --porcelain` must be empty before the first implementation edit. The working tree currently has an untracked plan file (`.cursor/plans/phase_11_epic_8_contrast_5ae5f556.plan.md`) — archive or remove it before starting. The epic must land as a single commit containing only this epic's work.

**Epic baseline SHA:** _(capture in step 0 — do not edit files before recording)_

## Context

Epics 1–8 are `Complete`. Epic 9 is the next uncompleted epic in [phase-11-corrections-hardening.prd.md](docs/prds/phase-11-corrections-hardening.prd.md). Branch is already correct: `phase-11/corrections-hardening`.

Current home page composition in [`src/app/(marketing)/page.tsx`](src/app/(marketing)/page.tsx):

```mermaid
flowchart LR
  Hero --> Features --> TechStack
```

Target:

```mermaid
flowchart LR
  Hero --> Features --> ProofCta --> TechStack
```

No hard-constraint changes, no migrations, no AGENTS.md sync required.

## Implementation

### 0. Capture epic baseline SHA

Before any file edit:

1. Run `git rev-parse HEAD`.
2. Record the resulting SHA in this plan under **Epic baseline SHA** above (replace the placeholder).
3. Mark the `capture-baseline-sha` todo `completed`.

This SHA is the `code-review` baseline for Epic 11.9.

### 1. Add `proofCta` copy to landing content

In [`src/config/landing-content.ts`](src/config/landing-content.ts):

- Add a typed link shape (label + href) alongside the existing `LandingFeature` / `LandingTechLogo` interfaces.
- Add a `proofCta` entry to `landingContent` with the PRD-specified copy:
  - **heading:** "Explore the template"
  - **subhead:** "Live components to browse, and the process that builds them."
  - **links:** "Pattern reference" → `/reference`, "How planning works" → `/workflow`
- Keep the `as const` pattern; hrefs can be string literals (same style as `hero.cta.href`).

### 2. Create `LandingProofCta` component

New file: [`src/app/(marketing)/_components/landing-proof-cta.tsx`](src/app/(marketing)/_components/landing-proof-cta.tsx)

Follow existing landing section conventions:

| Pattern source | Reuse |
| --- | --- |
| [`landing-features.tsx`](src/app/(marketing)/_components/landing-features.tsx) | `LandingContainer`, centered `max-w-3xl` prose block, `aria-labelledby` + `h2` |
| [`workflow-guide-cta.tsx`](src/app/(marketing)/workflow/_components/workflow-guide-cta.tsx) | Required `border-t border-border` top separator on the section, two-link button row (`flex flex-wrap gap-2`), primary + outline variants |
| [`landing-hero.tsx`](src/app/(marketing)/_components/landing-hero.tsx) | `Button asChild` + Next.js `Link` for internal routes |

Design intent (per PRD success criteria):

- **Not a card grid** — no icons, no grid, no `Badge`.
- **Visually distinct from features** — a slim CTA band with a required `border-t border-border` top separator (matching [`workflow-guide-cta.tsx`](src/app/(marketing)/workflow/_components/workflow-guide-cta.tsx)), centered heading + muted subhead, then a horizontal two-button row.
- **Server component** — no client state needed (unlike tech-stack marquee).
- **a11y:** section with `aria-labelledby`; `h2` for the heading (page already has one `h1` in hero — no level skip).

Read all copy from `landingContent.proofCta`; do not hardcode strings in the component.

### 3. Wire into the home page

In [`src/app/(marketing)/page.tsx`](src/app/(marketing)/page.tsx):

- Import `LandingProofCta`.
- Render `<LandingProofCta />` between `<LandingFeatures />` and `<LandingTechStack />`.

No metadata, sitemap, or auth-boundary changes — `/reference` and `/workflow` are already public marketing routes.

## Out of scope

- Tests unless triggered by the coverage gate contingency in Verification (do not lower coverage thresholds).
- Admin feature card copy (Epic 7.3 already shipped).
- Visual mockup — none exists; follow the PRD's "CTA row, not a third feature grid" constraint using existing landing patterns.

## Verification

Quality bar — stop on failure:

```bash
pnpm type-check && pnpm lint && pnpm format-check && pnpm test:ci
```

**Coverage gate contingency:** if `pnpm test:ci` fails on coverage thresholds after adding `landing-proof-cta.tsx`, add a render test at [`src/app/(marketing)/_components/landing-proof-cta.test.tsx`](src/app/(marketing)/_components/landing-proof-cta.test.tsx) asserting the heading, subhead, and both link hrefs render from `landingContent.proofCta`. Do not lower coverage thresholds. Re-run the quality bar after adding the test.

Manual smoke on `http://localhost:3000/`:

- [ ] Proof CTA renders **after** the six-card features grid and **before** the "Built with" marquee.
- [ ] Proof CTA section has a top border separating it from the features grid.
- [ ] Heading and subhead match PRD copy.
- [ ] "Pattern reference" navigates to `/reference`; "How planning works" navigates to `/workflow`.
- [ ] Section reads as a CTA band (centered prose + buttons), not a feature card.
- [ ] Light and dark mode look correct.

## Commit epic

Authorized by this approved plan:

1. Review diff; stage only files in scope for this epic.
2. Write a conventional commit message ending with the `Epic:` trailer:

   ```
   feat(phase-11): add home page proof CTA section

   Epic: 11.9
   ```

3. Commit (request `git_write`). If pre-commit hook fails, fix and retry — do not amend.
4. Verify `git status --porcelain` is empty after commit.

**Do not push** — push remains `ship-phase`.

## Handoff

Epic 11.9 committed. Baseline SHA: _(value recorded in step 0)_. Next: open a new agent window and run `/code-review` against baseline _(value recorded in step 0)_.
