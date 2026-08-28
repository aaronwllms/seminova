---
name: SEO audit remediations
overview: Remediate SEO001–SEO004, widen the base-URL check to all of `src`, and reverse the robots default so training crawlers are allowed — matching the audit recommendations and the PM decision that Seminova wants to be in training data.
todos:
  - id: og-base
    content: Extract a shared Open Graph base in site.ts; spread it in getSiteMetadata, getPageMetadata, and the landing page (fixes SEO002 + SEO003)
    status: pending
  - id: seo001-twitter
    content: Add twitter.card to getSiteMetadata; verify rendered head before deciding whether per-page twitter copy is needed
    status: pending
  - id: seo004-scan-roots
    content: Widen SCAN_ROOTS to src in seo-base-url.mjs
    status: pending
  - id: robots-training-on
    content: Add ALLOW_TRAINING_CRAWLERS flag defaulting to true; keep roster and mapping live; test both branches
    status: pending
  - id: docs-audit
    content: Update seo.mdc, audit-seo D4, and SEO_AUDIT.md (resolve SEO001–4, close training-crawler question)
    status: pending
  - id: verify
    content: Run check:seo-base-url, targeted tests, and pre-push; give PM the view-source / robots.txt checklist
    status: pending
isProject: false
---

# Remediate SEO001–4, widen SCAN_ROOTS, allow training crawlers

Four metadata/enforcement edits plus one template-default reversal. Deferred findings (SEO005 login OG copy, SEO007 branded 404) and accepted SEO006 stay untouched.

## Metadata merge semantics — read before touching `site.ts`

Next.js shallow-merges **top-level** metadata keys only. A nested `openGraph` or `twitter` object defined by a child segment **replaces the parent's object entirely** — unset fields are dropped, not inherited. This is why the shipped `getPageMetadata` already re-specifies `siteName` and `description` inside its own `openGraph`.

Consequence for every edit below: any segment that sets `openGraph` must carry the complete set of site-level fields. Spreading a shared base is the mechanism; do not rely on field-level inheritance anywhere in this plan.

## SEO002 + SEO003 — shared Open Graph base, `og:url` on `/`, site-wide `og:type`

Handle these together — they are the same edit.

In [`src/config/site.ts`](src/config/site.ts), add an exported base object holding the site-level Open Graph fields:

- `title` and `description` from `siteConfig`
- `siteName: siteConfig.name`
- `type: 'website'` (SEO003)

Then:

- `getSiteMetadata` — `openGraph` is the base.
- `getPageMetadata` — `openGraph` spreads the base, then overrides `title`, `description`, and `url: path`. This is what carries `type` and `siteName` onto `/features`, `/reference`, and `/workflow`; without the spread they lose both.
- Landing page ([`src/app/(marketing)/page.tsx`](src/app/(marketing)/page.tsx)) — keep the hand-written `metadata` export (routing `/` through `getPageMetadata` would produce `Seminova | Seminova`). Its `openGraph` spreads the base and adds `url: '/'` (SEO002). Spreading is required: a bare `openGraph: { url: '/' }` would strip `og:title`, `og:description`, `og:siteName`, and `og:type` from the home page.

Do **not** put `url` on the base — it would leak `og:url: /` onto any page that inherits the root object without setting its own.

Update [`src/config/site.unit.test.ts`](src/config/site.unit.test.ts): assert `getPageMetadata` output carries `siteName` and `type` alongside per-page `title`/`description`/`url`, and that `getSiteMetadata` carries `type: 'website'`. Those assertions are the pin against the merge trap above.

## SEO001 — Declare the large-image X card

**Problem:** No `metadata.twitter` exists, so X never gets `twitter:card` and renders the 1200×630 OG image as the small summary card.

**Step 1 — root only.** Add `twitter: { card: 'summary_large_image' }` to `getSiteMetadata`. Nothing on `getPageMetadata`. Do **not** add `twitter.images` — `opengraph-image.tsx` already supplies the image and X falls back to `og:image`.

**Step 2 — verify before writing more.** Next.js may already derive `twitter:title` from `og:title` and `twitter:description` from the page `description` when no twitter override exists. Check the rendered `<head>` of `/features` (dev server or `pnpm build` output):

- **If `twitter:title` / `twitter:description` are present and match the page copy** — done. No `getPageMetadata` change.
- **If they are absent or show site-level copy** — add a shared twitter base in `site.ts` the same way as the Open Graph base (`card` included), spread it in both `getSiteMetadata` and `getPageMetadata`, and override `title`/`description` per page. `card` **must** be repeated in the spread; a page-level `twitter` object without it drops `twitter:card`, reintroducing this exact defect on every inner page.

Update [`src/config/site.unit.test.ts`](src/config/site.unit.test.ts) for whichever shape lands.

## SEO004 — Widen `SCAN_ROOTS` to `src`

Replace the eight-entry list in [`scripts/checks/seo-base-url.mjs`](scripts/checks/seo-base-url.mjs) with a single root: `src`. Test files and [`src/utils/site-url.ts`](src/utils/site-url.ts) are already skipped by `isScannableFile`. A current `src/` grep of the three banned patterns only hits `site-url.ts` and tests, so the wider scan should pass on the first run.

Existing unit tests already inject custom roots for violation cases and run the default roots for the “shipped paths pass” case — that last test becomes the coverage pin (it will now walk `src/components`, `src/hooks`, `src/supabase`, and unlisted utils). No AGENTS.md edit: the hard-constraint *claim* already covers all of `src`; this change makes enforcement match it.

## Training crawlers allowed

Confirmed PM decision against the audit’s open question: Seminova is a template that wants to be in training data.

In [`src/utils/robots-policy.ts`](src/utils/robots-policy.ts):

- Keep the `*` allow-`/` rule and the sitemap URL.
- Keep `TRAINING_CRAWLERS` and its `.map` as **live code** — do not comment them out.
- Add a module-level `ALLOW_TRAINING_CRAWLERS = true` flag. When true, no per-bot rules are emitted; when false, the existing per-bot `disallow: /` rules are.
- Make the flag injectable so both branches are testable — `buildRobotsConfig` takes it as a defaulted parameter, the same shape `checkSeoBaseUrl(scanRoots = SCAN_ROOTS)` already uses. [`src/app/robots.ts`](src/app/robots.ts) keeps calling `buildRobotsConfig()` with no argument.
- Flip the file comment: training crawlers allowed by default; a spinoff opts out by setting the flag to `false`. Name the flag in the comment — it is the edit surface.

The flag is deliberately live config, not a commented-out roster: a spinoff that wants blocking flips one token, and the opt-out path stays covered by tests instead of needing to be hand-rebuilt.

Update [`src/utils/robots-policy.unit.test.ts`](src/utils/robots-policy.unit.test.ts): default (flag true) — `*` allows `/`, no per-bot disallow rules, sitemap assertion unchanged; flag false — the five per-bot `disallow: /` rules are emitted.

This is **not** a hard constraint. Do not edit AGENTS.md. Do not edit archived Phase 9 PRDs.

## Docs that must move with the code

These describe the shipped default, so they go stale if left alone:

- [`.cursor/rules/seo.mdc`](.cursor/rules/seo.mdc):
  - Crawler surface bullet — training crawlers **allowed**; `ALLOW_TRAINING_CRAWLERS` in `robots-policy.ts` is the opt-out edit surface.
  - Metadata source of truth — record that `getSiteMetadata` / `getPageMetadata` now own `twitter` and a shared Open Graph base, and state the merge rule: a segment setting its own `openGraph` or `twitter` must spread the base, because Next.js replaces nested objects rather than merging their fields. Required, not optional — this rule is the inventory of what those two helpers own.
- [`.cursor/skills/audit-seo/SKILL.md`](.cursor/skills/audit-seo/SKILL.md) — D4 line currently treats “blocked by default” as the template norm. Flip it so a future audit does not flag the new default as drift.

[`SEO_AUDIT.md`](SEO_AUDIT.md) in the same change (verify-in-code, then move):

- SEO001–SEO004 → **Resolved** with date `2026-08-28`.
- Executive summary and Verified OK D1/D2/D4/D6 updated to match.
- Open question on training crawlers closed (allowed, PM confirmed).
- Leave SEO005, SEO007, SEO006 as they are.

No README/DESIGN change expected (`/sync-repo-docs` would skip this); `.cursor/rules/README.md` is unaffected because `seo.mdc`'s mode, globs, and purpose line do not change.

## Verification

- `pnpm check:seo-base-url`
- Targeted tests: `pnpm test:file -- src/config/site.unit.test.ts`, `pnpm test:file -- src/utils/robots-policy.unit.test.ts`, `pnpm test:file -- scripts/checks/seo-base-url.unit.test.ts`
- `pnpm pre-push` before finish

**Manual checklist**

- View-source `/`: `twitter:card` is `summary_large_image`; `og:type` is `website`; `og:title`, `og:description`, and `og:site_name` are all still present; `og:url` matches `rel=canonical` for `/`.
- View-source `/features`: `twitter:card` and `og:type` present; `twitter:title` / `og:title` are the page title (not “Seminova”); `og:site_name` present; `og:url` is the features path.
- Fetch `/robots.txt`: `User-agent: *` allows `/`; no GPTBot / ClaudeBot / CCBot / Google-Extended / Applebot-Extended `Disallow` lines; sitemap URL is absolute.
- After deploy (human): X card validator + Facebook/LinkedIn debuggers — production origin, not a preview URL.
