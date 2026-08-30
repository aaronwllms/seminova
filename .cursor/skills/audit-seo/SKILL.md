---
name: audit-seo
description: >-
  Read-only SEO audit of the whole repo (full pass or sync); writes
  SEO_AUDIT.md at the repo root.
disable-model-invocation: true
---

# SEO Audit

Conducts a deliberate, read-only audit of the repo's SEO implementation against `seo.mdc` and writes `SEO_AUDIT.md` at the repo root with impact-ranked findings.

**Agent mode required** — this skill writes a file. Do not run in Ask mode.

**Read-only** — reviews and reports; never edits application code and never opens a browser. Fixing findings happens in separate chats.

**Not the same as:**

- **`audit-security`** — indexing is defense-in-depth on the auth boundary, but security owns the boundary itself. This skill audits the SEO surface only.
- **`audit-tech-debt`** — code health and architecture, not discoverability.
- **Accessibility** — heading order, single `<h1>`, and alt text are `ui-accessibility.mdc`'s domain. `seo.mdc` deliberately delegates them there. Do **not** audit them here even though crawlers read them.

**Scope:** this is a template-conventions audit, not content-marketing SEO. Keyword research, thin/duplicate content, cannibalization, and orphan-page analysis are out of scope — Seminova ships no content corpus. Core Web Vitals are out of scope for a different reason: they are CrUX field data, unmeasurable in a read-only repo pass. The code-level levers behind them — SSR, `next/image`, font loading — belong to `nextjs.mdc`.

## Run modes

**Mode gate** — first step, before anything else: if the invocation does not state full pass or sync, ask the user which mode as a numbered choice — `Which mode? 1 (Full pass) 2 (Sync)` — and stop. Do not proceed on an assumed or inferred mode, even when context makes one seem obvious (e.g. `SEO_AUDIT.md` already exists, so sync "must" be intended). Only after the mode is explicit, continue below.

**Full pass** — Phase 1 (surface map) → Phase 2 (dimensions D1–D7) → Phase 3 (write the deliverable). On a full pass, also prune the Resolved appendix: delete entries older than the previous full-audit date.

**Sync pass** — read the existing `SEO_AUDIT.md` → gather narrow evidence for **Open** findings only (re-read only the files those findings cite; no full dimension sweep) → verify each affected finding in code → make minimal edits → report what changed. Spot-check **Accepted** rows only when their cited code clearly changed. Never flatten Accepted back into Open without an explicit PM decision. Escalate to a full pass (after telling the user) if the file is stale, mostly wrong, or too many new findings surface mid-sync.

**Verify-in-code gate (both modes):** nothing is marked resolved without confirming the fix exists in the code. A ticked checkbox or a commit message claiming a fix does not count. Resolved findings are removed from **Open** / **Accepted** and moved to the Resolved appendix with the date, keeping their ID.

**Finding disposition (required):** every non-resolved finding lands in exactly one section — never leave disposition implied in Recommendation prose alone:

| Section | Meaning | At-a-glance |
| ------- | ------- | ----------- |
| **Open** | Still actionable. `Status` column is `Do next`, `Deferred` (named home), or `Needs decision` (blocked on PM). | Real backlog |
| **Accepted** | Deliberately not doing now. Rows carry **Why accepted** and **Reopen when**. | Not a todo list |
| **Resolved** | Fixed in code (appendix). | Done |

Accepted risks that lack a stable finding ID may appear as bullets under **Accepted**; ID'd findings always use the Accepted table.

## Read first

1. [AGENTS.md](../../../AGENTS.md) — **Hard constraints** (`check:seo-base-url`; the auth boundary, since indexing is defense-in-depth on it)
2. [.cursor/rules/seo.mdc](../../rules/seo.mdc) — the domain rule this audit checks against
3. [.cursor/rules/ui-accessibility.mdc](../../rules/ui-accessibility.mdc) — read only to fix the boundary in mind: what this audit must **not** flag (heading order, `<h1>` count, alt text)

## Phase 1 — Orient and map surfaces (read-only)

Do not form findings yet. Inventory the **current** repo state so the audit is grounded in what actually exists. Use `TodoWrite` to publish the phase plan so the user can see progress.

Inventory each surface with **counts and key paths**:

| Surface | Where to look |
| ------- | ------------- |
| Metadata source of truth | `src/config/site.ts`, `src/app/layout.tsx` |
| Base-URL resolver | `src/utils/site-url.ts`, `scripts/checks/seo-base-url.mjs` |
| Route groups & indexing | `src/app/(marketing)/`, `src/app/auth/`, `src/app/(app)/`, `src/app/admin/` layouts |
| Per-page metadata | `metadata` / `generateMetadata` exports across `src/app/**` |
| Crawler surface | `src/utils/robots-policy.ts`, `src/app/robots.ts`, `src/utils/sitemap-routes.ts`, sitemap route (`src/app/sitemap.ts`) |
| Structured data | `src/utils/structured-data.ts` and its call sites |
| Social previews | `src/utils/og-image.tsx`, `**/opengraph-image.tsx`, `src/utils/proxy-matcher.ts`, `src/proxy.ts` |

Note review hotspots — not findings yet. This map becomes the surface-map section of the output file.

## Phase 2 — Run the dimensions (read-only)

Audit each dimension against the cited files. Read `seo.mdc` and AGENTS.md § Hard constraints before judging — a pattern that looks wrong may be required by the rule (e.g. bare external product links are allowed; only the site's own base URL must route through the resolver).

| ID | Dimension |
| -- | --------- |
| D1 | Metadata wire-up |
| D2 | Base URL |
| D3 | Per-surface indexing |
| D4 | Crawler surface |
| D5 | Structured data |
| D6 | Social previews |
| D7 | Content standards |

**D1 — Metadata wire-up:** `getSiteMetadata` in `src/config/site.ts` is the sole site-wide default source; root `layout.tsx` wires it up with the resolved base URL as `metadataBase`; per-page `metadata`/`generateMetadata` inherit the title template rather than redefining it; no page hardcodes site name/title defaults that duplicate site config.

**D2 — Base URL:** `pnpm check:seo-base-url` passes; `src/utils/site-url.ts` is the only resolver of `NEXT_PUBLIC_SITE_URL` / `VERCEL_URL` / localhost fallback; no hardcoded `http://localhost:3000`, no `NEXT_PUBLIC_SITE_URL` read outside the resolver, no `new URL()` built on a literal origin; canonicals prefer relative paths resolved against `metadataBase` over hardcoded absolute origins (a bare-string absolute canonical is a guidance-tier finding). Bare external product links (GitHub, docs) are fine — not findings.

**D3 — Per-surface indexing:** `(marketing)` is indexable; `auth/**`, `(app)`, and `admin/**` each carry `noindex` via their layout. A missing `noindex` on a non-marketing layout is high-severity — it's the defense-in-depth that stops an accidentally-public route from leaking into an index. Confirm the layout actually sets it; don't infer it from the route group.

**D4 — Crawler surface:** `robots.ts` reflects `robots-policy.ts` (retrieval bots allowed; training crawlers allowed by default via `ALLOW_TRAINING_CRAWLERS` — spinoffs that block them set the flag to `false`); `TRAINING_CRAWLERS` holds training-class agents only, so that flipping the flag opts out of training alone — a retrieval or user-fetch bot (`OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`, `ChatGPT-User`, `Claude-User`, `Perplexity-User`) listed there or disallowed anywhere removes the site from AI answers while the flag still reads as a training-only switch; the sitemap lists `(marketing)` routes only, via the marketing-route discovery helper; no auth/app/admin route appears in the sitemap; robots and sitemap reference the resolved base URL, never a literal.

**D5 — Structured data:** JSON-LD comes from `structured-data.ts`; `Organization` + `WebSite` on the landing page only; nothing inlines JSON-LD directly on a page; new schema types extend the helper rather than bypassing it; every marked-up claim appears in the page's rendered content.

**D6 — Social previews:** the shared OG template `og-image.tsx` backs per-route `opengraph-image.tsx` segment files; every public marketing route has one; OG/twitter image paths in `proxy-matcher.ts` match the bypass list in `src/proxy.ts` (drift = a broken preview on a public page, or an auth leak). Preview titles/descriptions derive from page metadata + site config, not hardcoded strings.

**D7 — Content standards** — three checks with different reach:

- **Title** — every page carries a unique, intentional `<title>` (via `metadata.title`). **Universal**: it's the browser-tab / bookmark / history label as well as an SEO signal, so it applies on `noindex` pages too (follow the auth-screen pattern). A blank, duplicated, or default title is a normal-severity finding anywhere.
- **Description** — unique `metadata.description` per page; **indexable-weighted**. It's the search-snippet and link-preview source, so full weight on `(marketing)`; near-noise on a `noindex` page never meant to be shared — score accordingly.
- **Canonical** — one self-referential canonical per **indexable** page, relative and resolved via `metadataBase`; no duplicate indexable URLs. A missing or added canonical on a `noindex` page is **not** a finding — it's a no-op there.
- **Answer-first structure** is a judgment call — record it under **Open questions**, not as an asserted finding, unless a page is egregiously buried.

For each finding: assign a stable **ID** (`SEO001`, `SEO002`, … — never renumber across passes), a **Category** (dimension D1–D7), a **Severity**, **File:Line** evidence, a **Description**, and a **Recommendation**. Place each finding in **Open** or **Accepted** per Finding disposition — do not keep accepted/parked items in Open. Clean areas go under **Verified OK**. **Do not invent issues** — if a dimension is solid, say so.

**Severity calibration (discoverability impact, not exploitability):**

- **Critical** — a `noindex` surface leaking into the index, or a base-URL break that corrupts production canonicals / sitemap / OG (wrong-origin URLs shipped)
- **High** — missing `noindex` on a non-marketing layout; a public marketing page with no title or a broken canonical; robots or sitemap exposing a protected route; a retrieval or user-fetch bot in `TRAINING_CRAWLERS` or otherwise disallowed
- **Medium** — missing or duplicate description on an indexable page; JSON-LD inlined instead of via the helper; an OG segment missing on a public page
- **Low** — bare-string absolute canonical where relative would resolve; blank title on a `noindex` page (tab-label polish); other guidance-tier drift

## Phase 3 — Write SEO_AUDIT.md

Write the audit to `SEO_AUDIT.md` at the repo root per the Output template below.

- **Executive summary** ranks by discoverability impact.
- On a **sync pass**, update **Last synced** only; preserve **Last full audit** unless the sync escalated to a full pass.
- Finding IDs are stable across passes — never renumber.

## Rules

- **Read-only** — never edit application code, never open a browser.
- Every finding carries: stable ID, category (D1–D7), severity, File:Line evidence, description, recommendation.
- **Do not invent issues** — clean areas go under Verified OK.
- Read `seo.mdc` and the relevant hard constraint before judging — flag doc-vs-reality mismatches rather than treating the rule itself as a finding.
- **Stay in lane** — heading order, `<h1>` count, and alt text belong to `ui-accessibility.mdc`, not here; don't flag them even though crawlers read them.
- The user commits the audit file; fixes happen outside this skill.

## When this skill ends

Stop after `SEO_AUDIT.md` is written or updated. Tell the user the file is ready at the repo root, summarize finding counts by severity, and note that fixes happen in separate chats.

## Principles

- **Discover first** — the surface map reflects the current repo before any finding is written.
- **Audit only** — never modify application code.
- **Severity by discoverability impact** — rank what actually affects indexing, snippets, and previews.
- **Rule is truth** — respect `seo.mdc` and AGENTS.md hard constraints; flag rule-vs-reality mismatches rather than treating the rule as debt.
- **Stay in lane** — a11y-owned checks are out of scope even though crawlers read them.

## Output quality bar

Before finishing:

- [ ] Surface map has real paths and counts from discovery
- [ ] Every dimension D1–D7 was reviewed (or explicitly scoped out)
- [ ] `pnpm check:seo-base-url` was run and its result recorded
- [ ] Every finding has stable ID, category, severity, File:Line, description, recommendation
- [ ] Findings are split into **Open** / **Accepted** / **Resolved** (no accepted risk left in Open)
- [ ] Verified OK is populated; no a11y-owned checks (headings, `<h1>`, alt) appear as findings
- [ ] Output written to `SEO_AUDIT.md` at repo root with **Last full audit** / **Last synced** / **Scope** set correctly for the run mode
- [ ] No application code was modified

## Output template

```markdown
# SEO Audit — <repo name>

Last full audit: YYYY-MM-DD
Last synced: YYYY-MM-DD
Scope: <full SEO surface, or narrowed scope>

## Executive summary

- (max 10 bullets, ranked by discoverability impact)

## Surface map

| Surface | Count | Key paths |
| ------- | ----- | --------- |
| Metadata source of truth |  |  |
| Base-URL resolver |  |  |
| Route groups & indexing |  |  |
| Crawler surface |  |  |
| Structured data |  |  |
| Social previews |  |  |

## Open

Actionable backlog only. `Status`: `Do next` | `Deferred` | `Needs decision`.

| ID | Status | Category | File:Line | Severity | Description | Recommendation |
| -- | ------ | -------- | --------- | -------- | ----------- | -------------- |
| SEO001 | Do next | D3 | ... | High | ... | ... |

## Accepted

Deliberately not doing now. Not a todo list.

| ID | Category | File:Line | Severity | Description | Why accepted | Reopen when |
| -- | -------- | --------- | -------- | ----------- | ------------ | ----------- |
| SEO0xx | ... | ... | Low | ... | ... | ... |

(Accepted risks without a stable ID may appear as bullets below the table.)

## Verified OK

- (areas reviewed and found sound — required)

## Human / tooling follow-ups

- (checks a read-only agent can't complete: validate JSON-LD in Google's Rich Results Test, preview OG cards in the social debuggers, submit/verify the sitemap in Search Console, confirm the property is included in Search Console's generative-AI-features setting)

## Open questions

- (e.g. answer-first structure judgment calls; rule-vs-reality ambiguities)

## Resolved

- YYYY-MM-DD — SEO002: <one-line description>
```
