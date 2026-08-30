# RESEARCH-0007: llms.txt and agent-readable content surfaces

**Researched:** 2026-08-29

**Type:** technical

## Question

Two questions, asked in sequence while updating `seo.mdc` and the `audit-seo` skill
against current SEO/GEO practice:

1. Is `llms.txt` an SEO or AI-retrieval lever? The answer decides what `seo.mdc` says
   about it and whether `audit-seo` should flag its absence.
2. Is there an established specification worth building against? If so, what does it
   actually specify, and should the template ship an implementation?

## Scope and constraints

- **In scope:** specification status and contents, evidence on search and AI-retrieval
  effect, evidence on agent-tooling adoption, and what implementation would mean for a
  template whose output is inherited by every spinoff.
- **Out of scope:** implementing anything. Build shape is carried by the BACKLOG entry,
  not decided here.
- **Method:** web search plus a direct fetch of the specification. Adoption and citation
  statistics below are reported from secondary sources (SEO industry blogs summarizing
  vendor studies); the underlying studies were not read directly.

## Findings

### The specification exists, but is not a standard

`llms.txt` was proposed by Jeremy Howard at Answer.AI on 2024-09-03. The canonical
specification lives at [llmstxt.org](https://llmstxt.org/) and is **v2, modified
2026-08-10**. It describes itself as a proposal open for community input — it is not a
W3C or IETF standard, and no standards body has adopted it.

### v2 carries two proposals, not one

Most secondary coverage describes only the first.

1. **The `llms.txt` catalog.** A markdown file giving agents a curated map of a site:
   a required H1 (project name), an optional blockquote summary, optional prose, then
   zero or more H2-delimited sections containing markdown link lists with one-line
   descriptions. An `## Optional` section is the convention for links an agent may skip
   when context is tight. The file stays small; detail lives behind the links.

2. **Clean `.md` versions of pages,** served at the same URL as the original with `.md`
   appended (`page.html.md`) or substituted (`page.md`). Discoverable via
   `rel="alternate" type="text/markdown"` and `rel="describedby"`, provided as HTML
   `<link>` elements **or** an HTTP `Link:` response header — the header form works for
   non-HTML resources and can be set in server or CDN config without touching pages.

Additional v2 details relevant to implementation:

- **Subpath scoping.** A file may sit at any path, covering the URLs beneath it
  (`/docs/llms.txt` covers `/docs/`). Where several apply, agents use the most specific.
- **`.well-known/` was considered and rejected** (RFC 8615): well-known URIs exist only
  at the origin root, so authors who control a path but not a host — a GitHub Pages
  project site, for example — could never publish one.
- **Positioned as complementary to `robots.txt` and `sitemap.xml`,** not a replacement.
  `robots.txt` governs access; `llms.txt` is consulted on demand during inference.

### It is not a search or retrieval lever

- **Google Search ignores it.** Google's
  [generative AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
  (updated 2026-07-10) states that no AI text files or special markup are needed, that
  Search itself does not use them, and that publishing one neither helps nor harms
  visibility.
- **No measured citation benefit.** An SE Ranking analysis of roughly 300,000 domains
  found no statistically significant correlation between having the file and AI citation
  frequency — removing it from their predictive model *improved* accuracy, indicating it
  contributed noise rather than signal. Of the 50 most AI-cited domains in that dataset,
  one had the file.
- **Crawler interest is negligible.** Independent log studies put direct fetches at
  roughly 0.1% of total AI bot traffic.
- **No retrieval vendor has committed to reading it** in production systems.

### It has real traction as agent-onboarding infrastructure

This is a different mechanism from crawling, and the evidence runs the other way.

- **Chrome Lighthouse audits for it** as part of its agentic browsing checks.
- **The AI labs publish one for their own developer documentation** — OpenAI, Anthropic,
  and Gemini all do.
- **Documentation platforms generate it automatically** — Mintlify, GitBook, Wix, and
  the major WordPress SEO plugins.
- **IDE coding agents fetch it** when pointed at a documentation site, and MCP servers
  exist specifically to expose these files to agent hosts.

The distinction that resolves the apparent contradiction: crawlers do not use it; agents
handed a URL by a human do.

### A widely-repeated claim that appears to be false

One secondary source asserted that the W3C published a working draft on 2026-06-16 to
standardize `llms.txt`, and that Princeton research from May 2026 measured a 23% AI
citation uplift for sites carrying one. Both claims are treated here as **unreliable**:
the specification itself, modified 2026-08-10 — two months after the alleged draft —
still describes itself as an informal community proposal and makes no reference to any
standards-body process. Neither claim was checked against a primary source.

## Options compared

| Option | Staleness risk | Notes |
| ------ | -------------- | ----- |
| **Ship nothing** | None | Current state. Costs nothing; forgoes the agent-onboarding case. |
| **Hand-author `llms.txt`** | High | Every spinoff inherits a file describing Seminova. Rots on first divergence, and a wrong map is worse than no map. |
| **Generate from the repo** | None by construction | Follows the precedent already set by `robots.ts` and `sitemap.ts` deriving from `discoverMarketingRoutes()`. Requires a markdown source to generate from. |

The `.md` variants have a prerequisite the catalog does not: marketing copy currently
appears to live inline in JSX, so there is no markdown source to serve. The version that
holds inverts the flow — content lives in one markdown source, the HTML page renders
from it, and the `.md` route serves it raw. That is a content-architecture change rather
than a route addition.

## Recommendation

**For `seo.mdc`:** record that Google Search ignores these files and that their presence
or absence is not an SEO finding either way — and stop there. The rule should not
legislate whether the template ships one; that is a different question in a different
domain. Applied 2026-08-29.

**For the build:** treat it as a genuine candidate rather than a hedge, on the
agent-onboarding case alone, and only in generated form. Captured in
[BACKLOG.md](../../BACKLOG.md) as *Agent-readable content surface*.

## Open questions

- **Which surface is worth more:** the marketing pages, or the repo's own agent docs
  (`AGENTS.md`, `LEXICON.md`, `DOC_RULES.md`)? Those are already markdown but live in
  git, unreachable from a deployed site. Possibly the higher-value half, and it needs no
  content-architecture change.
- **Is marketing copy actually inline in JSX?** Inferred from `page-meta.ts` carrying
  only titles and descriptions; the page components were not read. If some content
  already sits in a separate source, the prerequisite above is smaller than stated.
- **The W3C and Princeton claims** were not checked against primary sources — only
  against the specification's own silence on them.
- **What ages first:** the "no retrieval benefit" finding rests on correlation studies,
  not vendor statements. If a retrieval engine begins honoring the file, that is the
  clause in `seo.mdc` to revisit — not the Google Search one.

## Sources

- [llmstxt.org](https://llmstxt.org/) — the specification, v2, modified 2026-08-10
  (fetched directly)
- [Google, Optimizing your website for generative AI features on Google Search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
  — updated 2026-07-10 (fetched directly)
- Secondary coverage of the SE Ranking 300k-domain study, AI bot log analyses, and
  platform adoption — reported via SEO industry summaries, not read at source

## Related

- [`.cursor/rules/seo.mdc`](../../.cursor/rules/seo.mdc) § Crawler surface — the
  `llms.txt` position this brief settled
- [BACKLOG.md](../../BACKLOG.md) — *Agent-readable content surface (`llms.txt` + `.md`
  route variants)*
