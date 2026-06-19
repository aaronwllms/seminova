# Seminova — Planning Brief

**Purpose:** Dual-use — planning reference for the builder (PM) and context for coding agents. Seminova is currently a **template**: a curated foundation that real products are built from. It is written in product shape so that the structure itself is inherited by every project spun off it. Agents: read this file for living state; build-time workflow and authoritative schema live in [AGENTS.md](AGENTS.md); shipped phase detail in [CONTEXT_ARCHIVE.md](CONTEXT_ARCHIVE.md).

**Last updated:** 2026-06-19
**Status:** Phase 1 — Foundation (shipped). Phase 2 — Design-System Token Layer (shipped). Phase 3 — App Shell (Admin sidebar) + Auth restyle (shipped). Next up: Phase 4 — Landing Page (`Active`).
**Migrations:** none yet — no custom schema; Supabase `auth.users` only.

**Shipped phase detail →** [CONTEXT_ARCHIVE.md](CONTEXT_ARCHIVE.md)

---

## File Management Rules

These rules apply to anyone updating this file — PM or coding agent.

- **The ACTIVE section is the source of truth for what is planned but not yet shipped.** Cursor has access to the codebase and can verify live state independently. This file should never contradict the repo.
- **When a phase is fully fleshed out in a planning session** (PM + Claude collaboratively defining its epics), move it from `DRAFT — Upcoming Phases` into `ACTIVE`, tag the phase header and Roadmap row `` `Active` ``, and delete its old one-line Draft stub. `ACTIVE` holds at most one phase at a time in practice, but isn't structurally limited to one. When `ACTIVE` has no phase in it, leave a stub note saying so — do not delete the heading.
- **Authoritative schema and the build-time agent workflow live in [AGENTS.md](AGENTS.md).** Do not duplicate per-table schema or Cursor/rules/skills detail here.
- **Locked rules are canonical in [AGENTS.md](AGENTS.md).** §3 below is a pointer + at-a-glance only — do not expand it back into a full duplicate.
- **Locked-rule changes decided in chat must be routed.** A text-only rule edit lands directly in AGENTS.md (and the §3 at-a-glance only if the topic list changes). A rule change that requires code conformance becomes an ACTIVE story that updates AGENTS.md, `.cursor/rules/`, and the affected code together.
- **When a phase ships in full**, append its epic/story detail to [CONTEXT_ARCHIVE.md](CONTEXT_ARCHIVE.md) (append-only — never edit existing archive entries), then update the Roadmap status and the Status line here and remove the shipped ACTIVE content.
- **Resolved open-question one-liners** append to `## Resolved decisions` in [CONTEXT_ARCHIVE.md](CONTEXT_ARCHIVE.md); remove from this file.
- **HTML mockups:** save new explorations as `.mockups/*.html`. When a mockup is superseded or tied to a shipped phase, move it to `.mockups/archive/`.
- **Epics must be numbered.** Format as `### Epic N: Name` (sequential within the phase, starting at 1). Never `### Epic: Name` with no number. Once implemented, a `` `Complete` `` tag is appended to the heading (`### Epic N: Name \`Complete\``) by the mark-epic-complete skill — never added manually or inferred from code.
- **Stub sections are intentional.** Sections that are empty now (e.g. AI Architecture) are kept as stubs so the structure is inherited by every product built from this template. Do not delete them.

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

At a glance, the locked rules cover: pnpm-only package management; primitive-first shadcn/ui; semantic-token theming with no hardcoded color; fixed structure / swappable theme; mobile-first responsive; components ≤150 lines; WCAG 2.1 AA accessibility; non-interactive shadcn CLI; `next/image` with explicit dimensions; the `/` + `/auth/**` auth boundary enforced in `proxy.ts`; admin gate via `app_metadata.role` (secret-key CLI only); and agent guidance confined to `.cursor`. See AGENTS.md for the authoritative wording of each.

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
| Anthropic API | AI-native foundation — runtime AI architecture defined per product |

---

## 5. Conceptual Data Model

Seminova ships a deliberately minimal model — only what every product needs in order for users to exist. Products extend this; the template does not presume a product schema.

- **User** — backed by Supabase's built-in `auth.users`. Available as soon as auth is wired (the starter already is).
- **Profile** — `public.profiles`, 1:1 with `auth.users`. Holds app-level user data (e.g. `display_name`, `avatar_url`, `role`). Conventionally auto-created on signup via a database trigger, with owner-scoped RLS. **Not yet built** — this is the first planned schema entity (see Roadmap).

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
- **Storage buckets:** none yet.

---

## 8. Roadmap

| Phase | Name | Status |
| ----- | ---- | ------ |
| 1 | Foundation & Cleanup | `Shipped` |
| 2 | Design-System Token Layer | `Shipped` |
| 3 | App Shell (Admin sidebar) + Auth restyle | `Shipped` |
| 4 | Landing Page | `Active` |
| 5 | Reference Implementations | `Draft` |
| 6 | Data Model Foundation (profiles, non-admin shell, profile/settings page) | `Draft` |
| 7 | Agent Tooling: Skills Suite | `Draft` |

---

# ACTIVE

## Phase 4 — Landing Page `Active`
A styled public landing/marketing page as the canonical public entry point.

### Epic 1: Header & Footer Chrome

As a visitor, I see a consistent sticky header and footer across the public landing page that reflect Seminova's identity and provide navigation, so the page feels complete and on-brand rather than a bare starter shell.

- Header: adopt the visual language and spacing of shadcnblocks `navbar1`, simplified — flat top-level links only (no dropdown menus/mega-panels), plus Login and Sign Up buttons routing to existing `/auth/**` screens. Header is sticky (pinned on scroll).
- Footer: adopt shadcnblocks' footer pattern (logo + name, nav links, social icons row, copyright + legal links row) — using Seminova's actual nav and social presence, not placeholder links. Footer sits in normal document flow (not pinned).
- Header, hero, features, tech-stack strip, and footer all share one centered max-width container (1280px / `max-w-7xl` equivalent) with consistent horizontal padding (`px-6 lg:px-8`) — content edges align vertically down the page. Sections sit flush against each other with no vertical gaps between them; the container affects horizontal width only.
- Both header and footer read app name/logo from `src/config/site.ts` rather than hardcoding "Seminova."
- Reference mockup: `.mockups/landing-page.html`.
- Conform to locked rules already in place: primitive-first shadcn/ui, semantic tokens only, mobile-first, ≤150 line components.

### Epic 2: Landing Page Content

As a visitor, I land on a page that explains what Seminova is and why I'd adopt it as a starting point for my own product, so I can quickly judge fit and take action.

- Hero: adopt the visual language of shadcnblocks `hero7` — title, description, CTA button, central column layout — but drop the review/star-rating/avatar row entirely (no fake social proof).
- Tech-stack strip: a logo strip showing the stack the template is built on (Next.js, Supabase, Vercel, Tailwind/shadcn, etc.) — distinct from a testimonial/trust strip, communicates what's included, not who uses it.
- Features section: adopt shadcnblocks `feature17` (six-up icon grid, centered intro). Use these six cards, in this order, with this copy:

  1. **Design-system token layer** — Semantic design tokens, not hardcoded values — the industry-standard pattern for theme consistency at scale.
  2. **Primitive-first components** — shadcn/ui components owned as source, not installed as a dependency — the primitive-first pattern, not a black-box library.
  3. **Accessibility by default** — WCAG 2.1 AA conventions — semantic HTML, focus states, contrast — are baked into the foundation, not bolted on after launch.
  4. **Admin shell out of the box** — A working admin sidebar, Supabase auth flows, and role-gated access are already wired — start building your product, not your login screen.
  5. **Agent-ready conventions** — AGENTS.md, rules, and skills lock in coding standards for any agent working in the codebase.
  6. **PM/agent collaboration model** — A packaged collaboration model — Claude Desktop for PM-level planning, paired skills that turn the plan into agent-ready work.

- No pricing, no testimonials.

### Epic 3: Site Identity Audit

As a maintainer re-skinning Seminova for a new product, every visible "Seminova" reference updates from one place (`src/config/site.ts`), so the template is genuinely re-skinnable rather than partially wired.

- Grep the codebase for hardcoded "Seminova" / app-name strings not yet routed through `site.ts` — most notably root `layout.tsx` metadata and `<title>`.
- Wire any found instances through `site.ts`.
- Closes the open item deferred from Phase 3 Epic 4 (full site.ts adoption audit).

---

# DRAFT — Upcoming Phases

## Phase 5 — Reference Implementations `Draft`
Working examples that demonstrate the patterns: a dashboard with widgets, a data table, a standard form (forms stack TBD — see Open Questions), and canonical loading / error / empty / toast states. A settings page pattern.

## Phase 6 — Data Model Foundation `Draft`
First real migration: `profiles` table, signup trigger, owner-scoped RLS. Seed AGENTS.md **Data model (summary)** as the authoritative schema source. Also builds the non-admin authenticated shell — header-row + content below, distinct from the admin sidebar pattern (sidebar is reserved for admin/management surfaces; header+content is for end-user-facing ones) — including an avatar dropdown in the header reusing the admin sidebar's nav-user pattern (sign-out, profile access) — and a profile/settings page on top of it (display name, avatar, bio, password reset), the first real surface for `profiles` fields.

## Phase 7 — Agent Tooling: Skills Suite `Draft`
Finalize the generic (de-specialized) skills suite: a design-critique skill, a design-system skill (establish-structure + audit + AI-slop detection), and a separate theme "regenerate" skill. Skills land at the end because they operate on the token layer (Phase 2) and the reference surfaces (Phases 3–5). Rules correctness is handled in Phase 1; this phase includes only a light final pass to confirm the rules set is still complete and project-agnostic.

---

# OPEN QUESTIONS / DEFERRED DECISIONS

Nothing here is blocking current work unless noted.

---

**Forms stack**
**Problem:** The starter ships no form library. Reference implementations and product forms need a standard.
**Solution:** Likely adopt `react-hook-form` + `zod` as the canonical stack and bake it into the template. Confirm before Phase 5.
_Defer until: Phase 5_

---

**Profiles in template vs per-product**
**Problem:** Should the template ship the `profiles` migration by default, or leave it for each product to add?
**Solution:** Leaning toward shipping it as the one assumed primitive, since "users must exist" is universal. Confirm in Phase 6.
_Defer until: Phase 6_

---

**Theme regeneration as skill vs mode**
**Problem:** The "put a new spin on the design for this project" capability should not regenerate structure, only theme values.
**Solution:** Implement as a separate, theme-only skill distinct from the structure-establishing design-system skill.
_Defer until: Phase 7_

---

**Admin Logging page**
**Problem:** Warn/error/info/debug logs now have a canonical taxonomy (`logging.mdc`), but they currently only surface in Vercel's log viewer — there's no in-app way to browse them. A dedicated admin page (filterable by level, color-coded — e.g. debug in green) would make this template-level convention actually visible and useful day-to-day.
**Solution:** Not yet scoped. Needs a data-storage decision first — whether to read/relay Vercel's log stream, or persist log entries to a table — before this can become a real epic. Likely Phase 5 (Reference Implementations) or later, once a clearer need emerges from actual product use.
_Defer until: unscoped — revisit when a storage approach is decided_

---

**Name / domain finalization**
**Problem:** Name is Seminova; `.com` is contested (out-of-lane semiconductor/agriculture firms).
**Solution:** Plan to claim `seminova.dev` (or similar) and carry keywords in the repo description/topics rather than the name. Low priority.
_Defer until: opportunistic_

---

**PM/agent workflow explainer page**
**Problem:** The landing page names both halves of Seminova's core differentiator — agent-ready conventions and the PM/agent collaboration model — but a one-line card each doesn't explain how either actually works. Someone who clones the template should be able to click through and understand the mechanics, not read a README.
**Solution:** Not yet scoped. Likely a dedicated in-app page (not a doc) reachable from the landing page, with two threads: (1) agent-ready conventions — how AGENTS.md + `.cursor/rules/` + `.cursor/skills/` keep any coding agent's output consistent; (2) PM/agent collaboration model — the Claude Desktop planning setup, MCP, and paired skills that turn a plan into agent-ready work. Needs its own epic to define content and layout once Phase 4 ships.
_Defer until: unscoped — revisit after Phase 4_

---

**Admin shell feature copy revisit**
**Problem:** Feature card #4's punchline ("start building your product, not your login screen") implies login/auth is the thing skipped, but the actual content is the admin shell + role gating. As more reference surfaces ship (Phase 5+), this card should describe the fuller set of packaged components available, not just admin shell.
**Solution:** Revisit copy once more reference implementations exist to describe.
_Defer until: after Phase 5_

---
