# BACKLOG.md — Product Idea Backlog

Product ideas — not ordered, no PRD.
Distinct from [ROADMAP.md](ROADMAP.md) (confirmed, numbered, sequenced phases) and
[docs/WORKFLOW_BACKLOG.md](docs/WORKFLOW_BACKLOG.md) (deferred decisions about the
workflow system itself, not product scope).

**Promotion:** an idea moves to ROADMAP.md as a numbered phase stub only when the PM
explicitly commits it in a planning conversation — no automatic trigger. (Mental filter
for deciding: would I build this in the next 2-3 phases if nothing else changed? Yes →
propose promoting it. No/unsure → leave it here.)

**Promoted entries stay here.** A promoted idea keeps its entry, marked
`**Promoted:** Roadmap phase "Name"`, and is deleted when that phase's PRD locks at
`Ready`. Its ROADMAP stub points here rather than copying the contents, so the
constraints, rejected options, and research an entry carries survive into phase planning.
An entry without that marker is uncommitted.

**Notes or Brief, never both.** An entry carries **Notes** until it earns a brief in
[docs/briefs/](docs/briefs/); `write-product-brief` then absorbs the Notes into the brief
and trims the entry to What and a `**Brief:**` line. Deleting an entry that carries a
`**Brief:**` line deletes the brief file in the same edit.

## Entry shape

```markdown
## Idea name

**Brief:** … (or **Promoted:** …) — marker lines, if any, directly under the heading

**What:** One or two sentences. What the idea is, not why it's parked — being here
already says that.

**Notes:**

- **Short label:** at most two lines. One idea per bullet, a blank line between
  bullets. Anything longer splits into sub-bullets.
```

Blank lines between every field and every bullet are deliberate — an entry is meant to
scan as separate blocks, not a paragraph.

---

## Blog Page

**What:** Add a `/blog` page with publish-without-deploy.

**Notes:**

- **Shape constraint:** publish-without-deploy rules out MDX. That means DB-backed posts
  with an admin authoring UI (editor, draft/published states, slugs) — larger than a
  route addition.

- **Deletable:** an optional module if unwanted (see ROADMAP.md's optional module
  contract).

---

## Pricing Page

**What:** Add a `/pricing` page.

**Notes:**

- **Open:** static content vs. plan-driven (tied to billing).

- **Deletable:** inherits the same optional-module shape as Blog.

---

## Optional module contract

**What:** A contract for making features deletable if unwanted (Blog, Pricing).

**Notes:**

- **Why it's more than a directory:** removal touches a migration, one or more
  directories, and line-edits to shared files the feature registers with (nav links,
  settings registry, sitemap, generated Supabase types).

- **Options:** a self-registering manifest pattern vs. documented per-feature removal
  steps run through `initialize-project`.

- **Revisit when:** a second optional feature exists — only worth designing once there's
  something to design it against. Candidate for a LEXICON entry and/or ADR once the
  shape settles.

---

## Supabase auth config as code

**What:** Manage the remote project's auth settings (redirect allowlist, `site_url`,
email templates) from the repo instead of the dashboard.

**Notes:**

- **Considered and dropped as a phase.** The CLI path (`config.toml` +
  `supabase config push`) is all-or-nothing — it serializes one `UpdateAuthConfig`
  object, so pushing any field pushes all of them, and there is no `config pull` to
  reconcile the other way. Cost of working around that outweighed saving a few dashboard
  pastes.

- **Viable path if revisited:** the Management API, not the CLI.
  `PATCH /v1/projects/{ref}/config/auth` is a true partial update — Supabase's own Google
  provider guide sends only three fields.

- **Requires:** a Supabase personal access token (account-wide across every org the
  account belongs to).

- **Unverified:** whether `additional_redirect_urls` replaces the whole array or merges.
  A raw PATCH also bypasses the CLI's schema validation.

- **Revisit when:** Supabase ships a usable partial-update path. Blocked on the
  vendor, not on a decision here — today's CLI is all-or-nothing and the
  Management API route is unvalidated.

---

## Gravatar fallback avatar

**What:** When a user has no uploaded avatar, fall back to their Gravatar image instead
of initials.

**Notes:**

- **Insertion point:** the shared `UserAvatar` component (Phase 10 loose end #7) already
  branches on avatar-present vs. initials. Gravatar becomes a third tier between them.

- **Open — privacy:** the lookup sends an MD5/SHA256 hash of every user's email to a
  third party by default, not opt-in. On-by-default, or a profile toggle?

- **Open — interaction with Remove avatar** (loose end #10): does "Remove" clear to
  initials, or to Gravatar-if-available?

---

## Change email address

**Brief:** [docs/briefs/change-email-address.brief.md](docs/briefs/change-email-address.brief.md)

**What:** Let a signed-in user change their account email from the profile modal,
alongside the existing display name, bio, avatar, and password fields.

---

## CSP violation report collector

**What:** Collect enforced Content-Security-Policy violation reports from real
browsers and route them into `app_logs`, surfaced on the existing admin logs page.

**Notes:**

- **Not a new subsystem:** ADR-0007 already ships the shape — public route handler,
  payload validation, size caps, server-constructed tag, retention purge, no rate limit.

- **Deferred on traffic, not cost:** the enforced policy was verified locally
  2026-08-26; with no production users there is nothing yet to collect.

- **Open — origin check:** `client-logs` gates on `isSameOriginRelayRequest`. Reports
  arrive from the browser's reporting infrastructure, batched — unverified whether a
  usable `Origin` comes with them.

- **Open — volume:** `client-logs` is bounded by a closed registry of call sites. The
  browser decides when to send a report, so a wrong directive costs a row per page load
  per user.

- **Research:** [RESEARCH-0006](docs/research/archive/RESEARCH-0006-csp-enforcement-nextjs-cache-components.md)

---

## Workflow diagram — brief step

**What:** Update the `/workflow` page and the README workflow images to show
`write-product-brief` as a numbered step in the phase loop.

**Notes:**

- **Three surfaces, one change:** the `/workflow` page's interactive loop diagram and
  its documents table, plus `public/images/workflow-{light,dark}.svg`.
  [WORKFLOW_GUIDE.md](docs/WORKFLOW_GUIDE.md) already numbers the brief as Step 4; all
  three still show the old eight-step loop.

- **Documents table gap:** the page's table carries no `docs/briefs/` row at all —
  briefs post-date it.

- **Open — consolidate or keep both:** [WORKFLOW_BACKLOG.md](docs/WORKFLOW_BACKLOG.md)
  carries a Mermaid-swimlane replacement for the SVG pair, blocked on Cursor preview
  rendering. If that lands, this is one diagram to update rather than three surfaces.

- **Sequencing:** cheap to fold into any phase already touching `/workflow`; not worth
  a phase of its own.

---

## Opt-in EXECUTE for new database functions

**What:** Stop Postgres and Supabase from auto-granting EXECUTE to client roles on newly
created `public` functions, so a function is unreachable from the API until a migration
grants it explicitly.

**Notes:**

- **Why it keeps coming up:** the same trap has been stepped in twice — migration
  `20260720151459` revoked all three roles on the trigger functions because
  `revoke … from public` was insufficient, then `purge_expired_app_logs` shipped with the
  same mistake (S007). The `supabase-sql.mdc` convention is a prompt, not enforcement.

- **Option A — platform default.**
  `alter default privileges for role postgres [in schema public] revoke execute on
  functions from public, anon, authenticated`. Two lines in a migration. Binds only
  objects created by role `postgres`, so it needs a create-a-throwaway-function probe to
  confirm it took, not just a `pg_default_acl` read.

- **Option B — `check:*` scanner.** The audit's own preferred structural fix: a pre-push
  check asserting every new `public` function carries explicit grants. Deterministic
  enforcement, which the repo prefers over both prose rules and platform
  reconfiguration. Costs a scanner.

- **Argument against A:** the failure mode is `permission denied for function foo` at
  runtime, with nothing pointing at a months-old migration. It also diverges from a
  Supabase ecosystem default, so copy-pasted examples and AI-generated migrations will
  all assume the standard behaviour — and every spinoff inherits the inversion.

- **ADR if A is chosen:** meets all three `docs/adr/README.md` criteria — costly to unwind
  once functions are written against it, surprising without context, and a real trade-off
  accepted. B needs no ADR.

- **Revisit when:** a third instance of the grant mistake appears, or a phase is already
  touching `scripts/checks/`.

---

## Password security baseline

**What:** Settle the template's password policy — minimum length, whether composition
rules apply, and leaked-password protection — as a single coherent baseline mirrored
between the Supabase dashboard and the repo.

**Notes:**

- **Current state:** dashboard minimum is 8, no composition rules. Audit finding S009.
  The 6 → 8 mirror in `src/constants/auth.ts` is handled separately; this entry is the
  baseline itself, not the mirror.

- **Leaked-password protection is the highest-value piece and is blocked** — Supabase
  gates it behind a paid plan. Revisit when the project is on a paid database.

- **Composition rules considered and dropped:** NIST 800-63B recommends against them,
  and enforcing them means dashboard settings and zod schemas holding four matching
  regexes in sync across every spinoff. Length is one integer in one constant.

- **Unverified:** whether `auth.admin.updateUserById` (the first-password path) applies
  the project's password policy at all. If it does not, the app-side zod floor is the
  only check on that route.

- **Per-project, not just code:** the dashboard is authoritative and lives outside the
  repo, so a spinoff inherits none of this.

---

## Agent-readable content surface (`llms.txt` + `.md` route variants)

**What:** Serve a clean markdown representation of public content — an `/llms.txt`
catalog plus `.md` variants of public routes — so an agent pointed at a deployed site
gets curated markdown instead of parsing rendered HTML.

**Notes:**

- **Spec:** [llmstxt.org](https://llmstxt.org/) v2 (Answer.AI, modified 2026-08-10)
  carries two proposals: the `llms.txt` catalog, and `.md` versions of pages at the same
  URL (`page.html.md` / `page.md`), discoverable via `rel="alternate"
  type="text/markdown"` and `rel="describedby"` as `<link>` elements or an HTTP `Link:`
  header. Files may sit at any subpath, covering the routes beneath them. Still a
  community proposal, not a standards-body standard.

- **Not an SEO play.** Google Search ignores these files and `seo.mdc` says so
  explicitly — correlation studies find no AI-citation benefit. The case is agent
  onboarding: Chrome Lighthouse audits for `llms.txt` under agentic browsing, and
  OpenAI, Anthropic, and Gemini all publish one for their own developer docs.

- **Shape constraint — the whole difficulty.** Marketing copy currently lives inline in
  JSX, so there is no markdown source to serve. A hand-written parallel file rots on
  contact; scraping our own rendered output is fragile. The version that holds inverts
  the flow: content lives in one markdown source, the HTML page renders from it, the
  `.md` route serves it raw. That is a content-architecture change, not a route
  addition.

- **Template multiplier:** every spinoff inherits whatever ships. A hand-authored file
  describing Seminova would follow spinoffs into products that are not Seminova — the
  same argument that makes `robots.ts` and `sitemap.ts` derive from
  `discoverMarketingRoutes()` rather than hardcode routes. Generation is the precedent
  to follow.

- **Open — which half, or both:** the marketing pages are one surface; the repo's own
  agent docs (`AGENTS.md`, `LEXICON.md`, `DOC_RULES.md`) are another. Those are already
  markdown but live in git, unreachable from the deployed site. Possibly the more
  valuable half, and it needs no content-architecture change.

- **Research:** [RESEARCH-0007](docs/research/RESEARCH-0007-llms-txt-agent-readable-content.md)
