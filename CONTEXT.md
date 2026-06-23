# Seminova — Planning Brief

**Purpose:** Dual-use — planning reference for the builder (PM) and context for coding agents. Seminova is currently a **template**: a curated foundation that real products are built from. It is written in product shape so that the structure itself is inherited by every project spun off it. Agents: read this file for living state; build-time workflow and authoritative schema live in [AGENTS.md](AGENTS.md); shipped phase detail in [CONTEXT_ARCHIVE.md](CONTEXT_ARCHIVE.md).

**Last updated:** 2026-06-22
**Status:** Phase 1 — Foundation (shipped). Phase 2 — Design-System Token Layer (shipped). Phase 3 — App Shell (Admin sidebar) + Auth restyle (shipped). Phase 4 — Landing Page (shipped). Phase 5 — Admin Surface Polish & Toasting (shipped). Phase 6 — Data Model Foundation (`Active`).
**Migrations:** none yet — no custom schema; Supabase `auth.users` only.

**Shipped phase detail →** [CONTEXT_ARCHIVE.md](CONTEXT_ARCHIVE.md)

---

## File Management Rules

File management rules (write discipline, doc roles, archive policy) are canonical in **[DOC_RULES.md](DOC_RULES.md)** — do not duplicate here.

---

## 1. What Is Seminova?

Seminova is an opinionated, AI-native starter for building SaaS products. It is built on the `supa-next-starter` foundation (Next.js, Supabase, Tailwind, shadcn/ui) and adds the layer that starter deliberately leaves out: a real design-system structure, primitive-first UI conventions, accessibility defaults, and a documented agent workflow.

Its purpose is to give product managers who build with AI coding tools (Cursor, Claude) a starting point that already has good bones — so a vibe-coded project begins curated instead of blank, and doesn't drift into inconsistency or generic AI-generated sameness.

Seminova is a template today, but it is shaped like a product foundation on purpose. Every convention, file, and section here is meant to be **inherited** by the products built from it — including this planning brief, which doubles as the CONTEXT.md pattern each new project starts from.

**It is not:** a finished product; a heavy boilerplate stuffed with billing, teams, or other features (those belong to individual products, not the template); or a fixed visual identity. The *structure* is fixed and inherited — semantic tokens, primitive-first components, accessibility, the agent workflow. The *theme* — colors, type, radius — is meant to be re-skinned per product.

**Core differentiator:** A curated starting point, not a blank one. Codified design-system structure, UI conventions, and Cursor rules and skills mean the foundation enforces good patterns from the first commit — while leaving each product free to define its own identity and features on top.

---

## 2. Who It's For

**Primary builder:** A product manager who builds with AI coding tools rather than writing most code by hand. Comfortable directing Cursor/Claude, making product and design decisions, and reviewing output — but relies on the template to encode engineering and design best practices so they don't have to hold them all in their head.

**Contributors:** Seminova is intended to be public and open to contribution. The conventions, rules, and skills are documented precisely so that others can adopt the template, understand its opinions, and improve it.

**Per-product end users:** Each product built from Seminova defines its own end user. The template stays user-agnostic; only the User/Profile primitives (section 5) are assumed to exist everywhere.

---

## 3. Locked Rules / Principles (planning must not violate)

These constraints are non-negotiable, and planning must not violate them. The **canonical list lives in [AGENTS.md › Locked rules](AGENTS.md)** — the repo-truth file for the layer that enforces them — with consumption detail in `.cursor/rules`. Keep one copy: when a locked rule changes (PM approval required), edit AGENTS.md, not this section.

At a glance, the locked rules cover: ecosystem alignment over aesthetic divergence; pnpm-only package management; primitive-first shadcn/ui; semantic-token theming with no hardcoded color; fixed structure / swappable theme; mobile-first responsive; components ≤150 lines; WCAG 2.1 AA accessibility; non-interactive shadcn CLI; `next/image` with explicit dimensions; the `/` + `/auth/**` auth boundary enforced in `proxy.ts`; admin gate via `app_metadata.role` (in-app promote/demote on `/users` or secret-key CLI); and agent guidance confined to `.cursor`. See AGENTS.md for the authoritative wording of each.

---

## 4. Tech Stack

| Tool | Purpose |
| ---- | ------- |
| Next.js 16 (App Router) | Framework — React 19, TypeScript |
| Supabase | Auth, Database, Storage — via `supabase-ssr` |
| Tailwind CSS + shadcn/ui | Styling + owned component collection (Radix primitives) |
| TanStack Query v5 | Client-side data fetching |
| next-themes | Light/dark theming over CSS variables |
| Vitest + React Testing Library + MSW | Testing + request mocking |
| pnpm | Package manager (exclusive) |
| Cursor | IDE / coding agent |
| Vercel | Deployment + Web Analytics |

---

## 5. Conceptual Data Model

Seminova ships a deliberately minimal model — only what every product needs in order for users to exist. Products extend this; the template does not presume a product schema.

- **User** — backed by Supabase's built-in `auth.users`. Available as soon as auth is wired (the starter already is).
- **Profile** — `public.profiles`, 1:1 with `auth.users`. Holds app-level user data (`display_name`, `avatar_url`, `bio`). Auto-created on signup via a database trigger, with owner-scoped RLS. **Not yet built** — this is the first planned schema entity (see Roadmap). Note: the admin gate deliberately stays on `app_metadata.role` (locked rule), so `profiles` carries no `role` column.

**Relationships:**

- Profile → belongs to one User (1:1, `profiles.id = auth.users.id`)

---

## 6. AI Architecture

_Stub — kept intentionally._

Seminova is an AI-native foundation, but it does not prescribe a product's runtime AI architecture; that is defined per project. The **build-time** agent workflow (Cursor + rules + skills + this file) is documented in [AGENTS.md](AGENTS.md). When a product adds runtime AI, this section is populated using the same shape as a product CONTEXT.md (invocation points, prompt handling, output format, logging conventions).

---

## 7. DB Schema — Current State

No custom schema or migrations exist yet. The only user-bearing table is Supabase's built-in `auth.users`.

- **First planned migration:** `profiles` table + signup trigger + owner-scoped RLS (see Roadmap — Data Model Foundation).
- **Authoritative schema** will live in [AGENTS.md](AGENTS.md) **Data model (summary)** once the first migration ships. Do not keep per-table detail in this file.
- **Storage buckets:** none yet (first one — avatars — lands in Phase 6).

---

## 8. Roadmap

| Phase | Name | Status |
| ----- | ---- | ------ |
| 1 | Foundation & Cleanup | `Shipped` |
| 2 | Design-System Token Layer | `Shipped` |
| 3 | App Shell (Admin sidebar) + Auth restyle | `Shipped` |
| 4 | Landing Page | `Shipped` |
| 5 | Admin Surface Polish & Toasting | `Shipped` |
| 6 | Data Model Foundation (profiles, non-admin shell, profile/settings page) | `Active` |
| 7 | Security Audit | `Draft` |
| 8 | SEO & GEO | `Draft` |
| 9 | Pattern Reference Page | `Draft` |
| 10 | Agent Tooling: Skills Suite | `Draft` |

---

# ACTIVE

## Phase 6 — Data Model Foundation `Active`

First real migration and the authenticated end-user surface. Establishes `profiles` as the one assumed schema primitive, the shared-chrome shell pattern, the first Supabase Storage bucket, and the canonical form stack. The non-admin authenticated landing becomes the profile/settings page; the generic `/protected` starter shell is removed.

**Sequencing:** Epics are ordered by dependency — Epic 1 (data) underpins everything; Epic 2 (shell) reads `profiles`; Epic 3 (storage) precedes Epic 4 because avatar upload needs the bucket; Epic 4 (settings page) depends on 1, 2, and 3.

### Epic 1: Profiles Data Foundation `Complete`

As a product built on Seminova, I want a `profiles` table that exists for every user automatically, so app-level user data has a home from the first signup without per-product setup.

- `profiles` is 1:1 with `auth.users` (`profiles.id = auth.users.id`); columns limited to `display_name`, `avatar_url`, `bio`. **No `role` column** — the admin gate stays on `app_metadata.role` per the locked rule; do not shadow it here.
- A row is auto-created on signup via a database trigger, so a profile always exists for an authenticated user.
- Owner-scoped RLS: a user can read and update only their own profile.
- Seed the AGENTS.md **Data model (summary)** with `profiles` as authoritative schema once the migration lands (per the change protocol). Do not prescribe the migration filename — Cursor chooses it.

### Epic 2: Shared Chrome + Authenticated Shell

As a user crossing the auth boundary, I want the authenticated app to feel like the same product as the marketing site, so signing in doesn't feel like landing in a different app.

- Extract the shared visual chrome — header shell, container, logo treatment, footer — into reusable primitives. Refactor the existing marketing header/footer to consume them with **no intended visual change**.
- Build the non-admin authenticated shell on these primitives: a header with a plain **circle** avatar (image or initials, reading `profiles`), **not** the admin nav-user rectangle (avatar + name + email). Clicking it opens a dropdown with profile access and sign-out — reuse the admin nav-user *behavior*, not its presentation.
- Footer is shared with marketing.
- **No theme toggle in the header** (it lives in settings — Epic 4); the marketing header keeps its login CTA in the same right-side slot the avatar occupies in the app header.

### Epic 3: Avatar Storage

As a user, I want to upload a profile avatar, so my account feels personalized — and as a product, I want a storage convention established once.

- First Supabase Storage in the template: an avatar bucket. Owner-scoped storage RLS on **writes** (a user can write/replace only their own avatar); bucket is **public-read** (avatars render directly via public URL, no signed URLs).
- Establishes the canonical storage pattern (bucket + storage RLS) that later product features inherit. Document the convention where storage conventions belong.
- The uploaded avatar's reference is stored in `profiles.avatar_url` (Epic 1).

### Epic 4: Profile/Settings Page

As an authenticated non-admin user, I want a profile/settings page that I land on after login, so I have a real surface to manage my account — and as a template evaluator, I see a finished surface instead of a placeholder.

- A single combined view+edit surface for `display_name`, `avatar` (upload via Epic 3), `bio`, and change-password.
- This page **is the non-admin post-login landing**: repoint the post-login redirect for non-admins here, and **remove the `/protected` starter page**. Use a neutral route name describing the surface, not the auth property.
- Establishes the canonical **`react-hook-form` + `zod`** form pattern as the template's first real form. Document it in `.cursor/rules/` as a coding standard (not a locked-rule change).
- Houses the **dark-mode toggle**; confirm `defaultTheme="system"` + `enableSystem` so unauthenticated/marketing stays system-default with no exposed control.
- A successful save confirms via the Phase 5 toast system.
- Built on Epic 2's shell; depends on Epics 1, 2, and 3.

---

# DRAFT — Upcoming Phases

## Phase 7 — Security Audit `Draft`
A dedicated pass over security-relevant surfaces that don't exist yet at Phase 5 time — sequenced after Phase 6 so RLS policies and the `profiles` table are real before they're audited. Known scope so far: map raw Supabase `AuthError` codes (captured in Phase 5, passed through as operational/`kind`-tagged but unmapped) to the error taxonomy in `error-handling.mdc` and decide what's safe to surface/copy per code, per `security.mdc` guidance; review RLS policies on `profiles`; review the avatar bucket's public-read storage RLS; general secret-handling and auth-boundary review. Not yet fully scoped — flesh out epics once Phase 6 ships.

## Phase 8 — SEO & GEO `Draft`
Not yet scoped. Covers traditional SEO (metadata, sitemap, structured data) and GEO (generative-engine optimization — how the product surfaces in AI assistant answers) for the marketing/landing surface shipped in Phase 4. No hard sequencing dependency beyond Phase 4 being shipped.

## Phase 9 — Pattern Reference Page `Draft`
A dedicated page that demonstrates the canonized component patterns established across prior phases: data table, error states (operational `InlineError` + fault `ErrorPanel`), skeleton loading, toast, and the form/settings pattern (from Phase 6). The page imports and showcases the real, already-established components — it does not reimplement them. It is explicitly deletable scaffolding: deleting it loses zero canonical pattern, since every pattern it demonstrates is established in real code elsewhere (admin users table, settings page, etc.). Sequenced after Phase 6 so it can show the form/settings pattern alongside everything from Phase 5, rather than shipping thin now and needing a follow-up addition later.

## Phase 10 — Agent Tooling: Skills Suite `Draft`
Finalize the generic (de-specialized) skills suite: a design-critique skill, a design-system skill (establish-structure + audit + AI-slop detection), and a separate theme "regenerate" skill. Skills land at the end because they operate on the token layer (Phase 2) and the reference surfaces (Phases 3–9). Rules correctness is handled in Phase 1; this phase includes only a light final pass to confirm the rules set is still complete and project-agnostic.

---

# OPEN QUESTIONS / DEFERRED DECISIONS

Nothing here is blocking current work unless noted.

---

**Theme regeneration as skill vs mode**
**Problem:** The "put a new spin on the design for this project" capability should not regenerate structure, only theme values.
**Solution:** Implement as a separate, theme-only skill distinct from the structure-establishing design-system skill.
_Defer until: Phase 9_

---

**Admin Logging page**
**Problem:** Warn/error/info/debug logs now have a canonical taxonomy (`logging.mdc`), but they currently only surface in Vercel's log viewer — there's no in-app way to browse them. A dedicated admin page (filterable by level, color-coded — e.g. debug in green) would make this template-level convention actually visible and useful day-to-day.
**Solution:** Not yet scoped. Needs a data-storage decision first — whether to read/relay Vercel's log stream, or persist log entries to a table — before this can become a real epic.
_Defer until: unscoped — revisit when a storage approach is decided_

---

**Name / domain finalization**
**Problem:** Name is Seminova; `.com` is contested (out-of-lane semiconductor/agriculture firms).
**Solution:** Plan to claim `seminova.dev` (or similar) and carry keywords in the repo description/topics rather than the name. Low priority.
_Defer until: opportunistic_

---

**PM/agent workflow explainer page**
**Problem:** The landing page names both halves of Seminova's core differentiator — agent-ready conventions and the PM/agent collaboration model — but a one-line card each doesn't explain how either actually works. Someone who clones the template should be able to click through and understand the mechanics, not read a README.
**Solution:** Not yet scoped. Likely a dedicated in-app page (not a doc) reachable from the landing page, with two threads: (1) agent-ready conventions — how AGENTS.md + `.cursor/rules/` + `.cursor/skills/` keep any coding agent's output consistent; (2) PM/agent collaboration model — the Claude Desktop planning setup, MCP, and paired skills that turn a plan into agent-ready work. Needs its own epic to define content and layout.
_Defer until: unscoped — revisit when prioritizing landing UX expansions_

---

**Admin shell feature copy revisit**
**Problem:** Feature card #4's punchline ("start building your product, not your login screen") implies login/auth is the thing skipped, but the actual content is the admin shell + role gating. As more reference surfaces ship (Phase 5+), this card should describe the fuller set of packaged components available, not just admin shell.
**Solution:** Revisit copy now that Phase 5 reference surfaces (error, loading, toast, in-app promote/demote) are shipped.
_Defer until: opportunistic_

---

**`useGetMessage` filename violates kebab-case rule**
**Problem:** `src/hooks/useGetMessage.ts` (and its test `useGetMessage.unit.test.tsx`) is camelCase, violating the locked kebab-case file-naming convention in `project-standards.mdc`. The sibling `use-mobile.ts` is correct; this is the lone deviation.
**Solution:** Rename to `use-get-message.ts` + `use-get-message.unit.test.tsx` and update any imports. Low priority, low risk — straightforward cleanup whenever convenient.
_Defer until: opportunistic_
