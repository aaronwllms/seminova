# PRD — Phase 9: SEO & GEO

**Status:** `Active`
**Last updated:** 2026-07-06

---

## Problem

Seminova ships no SEO/GEO scaffolding. A spinoff inherits no metadata conventions, no sitemap or robots policy, no structured-data or social-preview pattern, and no codified standard for building discoverable pages — so every product rebuilds this from scratch or ships without it. As a template, the gap multiplies into every spinoff.

## Goal

Ship the reusable technical-SEO foundation the template inherits — a metadata source-of-truth, a crawler-facing surface, structured-data and per-page social-preview patterns, and a codified SEO standard for agents — demonstrated on the current public surface, **without** optimizing specific page content. `pnpm pre-push` stays green throughout.

## Scope decisions (made at planning)

- **GEO collapses into the SEO foundation.** Per Google's May 2026 generative-AI-search guidance and the frontier labs' converged crawler model, there is no separate GEO technical layer to build — optimizing for AI answers is the same crawlable, indexed foundation as classic SEO. The one genuinely AI-specific artifact is the robots policy. No `llms.txt`, no content-chunking, no AI-specific markup — all named unnecessary by the current guidance.
- **robots policy is opinionated.** Allow search/retrieval and user-fetch bots (Googlebot, Bingbot, OAI-SearchBot, Claude-SearchBot, PerplexityBot, Applebot, DuckAssistBot, ChatGPT-User, Claude-User); **block training crawlers by default** (GPTBot, ClaudeBot, CCBot) plus the training opt-out tokens (Google-Extended, Applebot-Extended). The broader, churn-prone bot roster ships as a commented reference block. This makes "opt out of model training, stay in AI answers" the inherited default — a conscious template opinion a spinoff can reverse.
- **Structured data:** one reusable helper, `Organization` + `WebSite` only, on the landing page. No content-type schemas (Article, Product, etc.). FAQ excluded — removed from Google Search as of May 2026.
- **Open Graph:** dynamic per-page image generation, not a single static default.
- **`seo.mdc`** is standards + wire-up, and **references** `ui-accessibility.mdc` (semantic HTML, heading order, alt text) and `nextjs.mdc` (SSR, `next/image`, Web Vitals) rather than restating them. Enforcement is one deterministic check (`check:seo-base-url`); the soft standards stay guidance, consistent with `ui-accessibility.mdc` shipping guidance-only today.

## Out of scope

- Content optimization of existing pages — this phase builds framework, not tuning.
- The PM/agent explainer page — pulled into Phase 10.
- Deterministic a11y enforcement (one-h1 / alt / heading-order) — surfaced here, but it is a11y's domain, not SEO's; logged as a ROADMAP open question.
- Third-party auto-updating robots services (DarkVisitors, 51Degrees categories) — an external dependency a starter template should not impose.
- Content-type structured data and any dynamic sitemap for content that does not yet exist.

---

## Epics & stories

### Epic 1: Metadata foundation

- **1.1 Centralize SEO metadata defaults.** Establish the site-config file as the single source of truth for SEO defaults — site name, title template, default description, default OG image — with the root layout's metadata reading from it, and the canonical base URL sourced from an environment variable (with a localhost fallback for dev) so OG and canonical URLs resolve to absolute URLs per deployment. Individual pages override via the framework metadata API.
  *Success: every public page's rendered head carries an intentional title (via the template), a description, and a self-referential canonical URL, all resolving against the env-driven base URL.*
- **1.2 Per-surface indexing policy.** Public marketing routes are indexable; the auth screens set noindex; the authenticated app surface also sets noindex as defense-in-depth, even though the auth redirect already hides it — so a route accidentally made public cannot leak into an index.
  *Success: marketing routes are index-eligible while auth and app routes emit a noindex directive.*

### Epic 2: Crawler-facing surface

- **2.1 Opinionated robots policy.** Ship a robots policy with the allow/block split above and a reference to the sitemap. Active disallow lines block the training crawlers; the broader churn-prone bot roster ships as a clearly-labelled commented reference block a spinoff edits when it revisits training consent.
  *Success: fetching the robots policy shows retrieval and user-fetch bots allowed, training crawlers disallowed, and a sitemap reference present.*
- **2.2 Sitemap from public routes.** Generate a sitemap listing exactly the public marketing routes, derived so it cannot drift from the auth boundary — auth-gated routes never appear.
  *Success: the sitemap contains the public marketing route(s) and no authenticated or auth-screen routes.*
- **2.3 Structured-data helper.** A typed, reusable helper that emits `Organization` + `WebSite` JSON-LD, reading its values from site config, applied to the landing page — the pattern a spinoff extends, not a schema zoo.
  *Success: the landing page carries valid `Organization` and `WebSite` structured data that passes a schema validator, populated from site config.*

### Epic 3: Social preview images

- **3.1 Dynamic per-page OG images.** Establish the reusable dynamic OG-image pattern — a branded template that renders each page's own title/description into a preview image at request time, values drawn from page metadata and site config, with the font-loading and image-caching plumbing handled once in the template. Demonstrate it on the landing page and one auth route so two distinct per-page cards are visibly produced, proving it is per-page rather than a single global image. Depends on Epic 1's env-driven base URL.
  *Success: the landing page and a second route each generate a distinct social-preview image built from their own title, and the pattern is reusable on any new route.*

### Epic 4: Agent conventions

- **4.1 The SEO rule.** Author `seo.mdc` covering (a) the wire-up conventions from Epics 1–3 — metadata in site config, per-surface indexing, per-page OG, the structured-data helper, and the robots stance with its "review training-consent per product" note — and (b) SEO standards not owned elsewhere: unique intentional title + description per page, answer-first content structure, and canonical / no-duplicate-content. It points to `ui-accessibility.mdc` and `nextjs.mdc` for the semantic and performance bar rather than restating them.
  *Success: a new page built by an agent following only the rule inherits the metadata, indexing, OG, and structured-data conventions, and the rule restates nothing already owned by the a11y or Next.js rules.*
- **4.2 Deterministic base-URL check.** A lint-style `check:seo-base-url` that fails when a route hardcodes the site's base URL instead of reading the env var / metadata base.
  *Success: `check:seo-base-url` runs in the quality gate, fails on a hardcoded base URL, and passes when the env var is used.*

---

## Notes

- **LEXICON:** no new architectural term added at planning — the conventions live in `seo.mdc`, and per-surface indexing falls out of the existing **auth boundary** and **route groups** terms.
- **No ADR:** the opinionated "block training by default" robots stance is surprising and a real trade-off, but cheap to reverse, so it fails the three-part ADR bar. It is documented in the robots policy comment and `seo.mdc` instead.
