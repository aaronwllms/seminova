---
name: Phase 11 Epic 7 Isolated chrome copy
overview: "Close Epic 7 in Phase 11: legal-generator callouts on /terms and /privacy, fix the Features nav anchor from non-home pages, and rewrite landing feature card #4 admin copy to reflect the shipped admin console — single commit, Epic 11.7."
todos:
  - id: capture-baseline
    content: "Precondition: verify clean tree + run git rev-parse HEAD; record SHA in Epic baseline section"
    status: completed
  - id: story-7-1-legal
    content: "Story 7.1: Add legal-generator callouts + not-legal-advice disclaimer to LegalPlaceholder (terms notes both policies)"
    status: completed
  - id: story-7-2-features-anchor
    content: "Story 7.2: Fix Features nav link to resolve /#features from any page"
    status: completed
  - id: story-7-3-admin-card
    content: "Story 7.3: Rewrite admin feature card #4 description in landing-content.ts (one concise sentence)"
    status: completed
  - id: quality-gate
    content: Run pnpm type-check && pnpm lint && pnpm format-check && pnpm test:ci
    status: completed
  - id: commit-epic
    content: "Single conventional commit with Epic: 11.7 trailer"
    status: completed
isProject: false
---

# Phase 11 Epic 7 — Isolated chrome & copy

> **Track progress:** as you complete each step, update the corresponding `todos` entry's `status` to `completed` in this plan's frontmatter.

> **Precondition:** confirm `git branch --show-current` outputs `phase-11/corrections-hardening`. If it doesn't match, halt and ask the user — do not switch branches.

> **Precondition:** `git status --porcelain` must be empty before the first implementation edit. If dirty, halt and ask the user to commit or stash. The epic must land as a single commit containing only this epic's work — `code-review` derives its range from that commit.

> **Precondition (baseline capture):** at that same clean-tree checkpoint — before the first implementation edit — run `git rev-parse HEAD`, record the output in the **Epic baseline** section below, and mark the `capture-baseline` todo complete. This SHA is the fixed range start for `code-review` (paired with `Epic: 11.7`).

---

## Epic baseline

**Epic id:** `11.7`

**Epic baseline:** _(record via `git rev-parse HEAD` at the clean-tree checkpoint above — before any implementation edit)_

---

## Context

Epics 1–6 are `Complete`. Epic 7 is the final open epic in [`docs/prds/phase-11-corrections-hardening.prd.md`](docs/prds/phase-11-corrections-hardening.prd.md). Stories are isolated — no shared files between 7.1 and 7.2; 7.3 touches only [`landing-content.ts`](src/config/landing-content.ts).

| Story | Problem today |
|-------|----------------|
| **7.1** | [`LegalPlaceholder`](src/app/(marketing)/_components/legal-placeholder.tsx) mentions replacing copy but has no generator link or disclaimer |
| **7.2** | [`siteConfig.nav`](src/config/site.ts) Features href is `#features` — from `/workflow` etc. resolves to `/workflow#features` (missing section) |
| **7.3** | Card #4 ("Admin shell out of the box") understates what shipped — sidebar, users table, promote/demote, CLI, gate, profile link |

## Story 7.1 — Legal generator callouts

Extend [`LegalPlaceholder`](src/app/(marketing)/_components/legal-placeholder.tsx) (shared by [`terms/page.tsx`](src/app/(marketing)/terms/page.tsx) and [`privacy/page.tsx`](src/app/(marketing)/privacy/page.tsx)):

- Add a visible callout linking [App Privacy Policy Generator](https://app-privacy-policy-generator.firebaseapp.com/) (external, `rel="noopener noreferrer"`).
- Include a **not legal advice** disclaimer.
- **Terms page variant:** note the generator produces both Terms and Privacy policies (pass a prop or thin page-specific wrapper — minimal diff).
- Use semantic tokens; keep one `<h1>` per route (placeholder title stays the h1).

**Tests:** only if a non-trivial branch warrants it (e.g. terms-only copy differs from privacy). Static callout copy may rely on visual review per [`testing.mdc`](.cursor/rules/testing.mdc).

## Story 7.2 — Features nav anchor

Fix so Features always lands on the home features section (`/#features`) regardless of current page.

**Preferred (one-line config fix):** change Features href in [`site.ts`](src/config/site.ts) from `#features` to `/#features`.

**Verify:** from `/workflow`, `/reference`, `/terms` — Features link href resolves to `/#features` (Next.js `Link` treats root-absolute hash correctly).

**Tests:** optional unit test on nav config or `SiteNavLinks` if a quick assertion adds value; not required for a literal href change.

## Story 7.3 — Admin feature card copy

Rewrite the **description** (not title) for card #4 in [`landing-content.ts`](src/config/landing-content.ts) — index 3 in `features.items` ("Admin shell out of the box").

**Hard constraint:** one concise marketing sentence — same tone and approximate length as sibling cards (scan cards 1–3 and 5–6 for calibration; ~20–30 words).

**Source menu (draw from as fits — not a checklist):** pick whichever shipped admin capabilities best support a single tight sentence. Candidates to choose from, not combine exhaustively:

- Sidebar admin shell with dashboard + users routes
- Real users table (search, pagination)
- In-app promote/demote with confirmation
- Secret-key CLI (`promote-admin` / `demote-admin` / `list-admins`)
- `app_metadata.role` admin gate (not a profiles column)
- Profile settings modal from the admin sidebar

Covering all six is **not** required. Brevity wins — one sentence that honestly signals "real admin console, not a stub" beats a feature laundry list.

**Out of scope:** renaming the card title, changing icons, or editing other cards.

## Out of scope

- Marketing header avatar account menu (separate workstream)
- Replacing placeholder legal body copy with real policies
- New routes, migrations, or hard-constraint changes

## Verification

Quality bar — stop on failure:

```bash
pnpm type-check && pnpm lint && pnpm format-check && pnpm test:ci
```

### Manual checklist

- `/terms` and `/privacy` show generator link + not-legal-advice disclaimer; terms mentions both policy types
- Features from `/workflow` (and one other non-home page) → `/#features` on home
- Landing card #4 reads as one concise sentence; tone matches siblings; reflects shipped admin set without listing every item

## Commit epic

Authorized by this approved plan:

1. Review diff; stage only files in scope for this epic.
2. Write a conventional commit message. It **must** end with an `Epic:` git trailer:

   ```
   fix(phase-11): legal callouts, features anchor, admin card copy

   Epic: 11.7
   ```

3. Commit (request `git_write`). Pre-commit hook runs automatically — if it fails, fix and retry the commit.
4. Verify `git status --porcelain` is empty after commit.

**Do not push** — push remains `ship-phase`.

## Handoff

Epic **11.7** committed.

**Epic baseline SHA:** `<SHA recorded in Epic baseline section above>`

**Epic id:** `11.7`

Next: open a new agent window and run `/code-review` — epic baseline `<SHA>`, Epic `11.7`.
