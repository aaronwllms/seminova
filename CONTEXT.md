# Seminova — Planning Brief

**Purpose:** Dual-use — planning reference for the builder (PM) and context for coding agents. Seminova is currently a **template**: a curated foundation that real products are built from. It is written in product shape so that the structure itself is inherited by every project spun off it. Agents: read this file for living state; build-time workflow and authoritative schema live in [AGENTS.md](AGENTS.md); shipped phase detail in [CONTEXT_ARCHIVE.md](CONTEXT_ARCHIVE.md).

**Last updated:** 2026-06-24
**Status:** Phase 1 — Foundation (shipped). Phase 2 — Design-System Token Layer (shipped). Phase 3 — App Shell (Admin sidebar) + Auth restyle (shipped). Phase 4 — Landing Page (shipped). Phase 5 — Admin Surface Polish & Toasting (shipped). Phase 6 — Data Model Foundation (shipped). Phase 7 — Security Audit Remediation (shipped).
**Migrations:** 3 custom — `profiles`, `avatars` bucket + SELECT policy (see [AGENTS.md](AGENTS.md) data model).

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

At a glance, the locked rules cover: ecosystem alignment over aesthetic divergence; pnpm-only package management; primitive-first shadcn/ui; semantic-token theming with no hardcoded color; fixed structure / swappable theme; mobile-first responsive; components ≤150 lines; WCAG 2.1 AA accessibility; non-interactive shadcn CLI; `next/image` with explicit dimensions; the `/` + `/auth/**` auth boundary enforced in `proxy.ts`; admin gate via `app_metadata.role` (in-app promote/demote on `/admin/users` or secret-key CLI); and agent guidance confined to `.cursor`. See AGENTS.md for the authoritative wording of each.

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
- **Profile** — `public.profiles`, 1:1 with `auth.users`. Holds app-level user data (`display_name`, `avatar_url`, `bio`). Shipped in Phase 6; auto-created on signup via database trigger with owner-scoped RLS. Admin gate stays on `app_metadata.role` (locked rule) — no `role` column on `profiles`.

**Relationships:**

- Profile → belongs to one User (1:1, `profiles.id = auth.users.id`)

---

## 6. AI Architecture

_Stub — kept intentionally._

Seminova is an AI-native foundation, but it does not prescribe a product's runtime AI architecture; that is defined per project. The **build-time** agent workflow (Cursor + rules + skills + this file) is documented in [AGENTS.md](AGENTS.md). When a product adds runtime AI, this section is populated using the same shape as a product CONTEXT.md (invocation points, prompt handling, output format, logging conventions).

---

## 7. DB Schema — Current State

No custom schema beyond shipped Phase 6 migrations. Authoritative schema lives in [AGENTS.md](AGENTS.md) **Data model (summary)**.

- **Shipped migrations:** `profiles` table + signup trigger + owner-scoped RLS; `avatars` storage bucket + public SELECT policy for upsert.
- **Storage buckets:** `avatars` (public-read, owner-scoped writes).

---

## 8. Roadmap

| Phase | Name | Status |
| ----- | ---- | ------ |
| 1 | Foundation & Cleanup | `Shipped` |
| 2 | Design-System Token Layer | `Shipped` |
| 3 | App Shell (Admin sidebar) + Auth restyle | `Shipped` |
| 4 | Landing Page | `Shipped` |
| 5 | Admin Surface Polish & Toasting | `Shipped` |
| 6 | Data Model Foundation (profiles, admin namespace, authenticated shell, profile page) | `Shipped` |
| 7 | Security Audit Remediation | `Shipped` |
| 8 | SEO & GEO | `Draft` |
| 9 | Pattern Reference Page | `Draft` |
| 10 | Agent Tooling: Skills Suite | `Draft` |

---

# ACTIVE

_No active phase. Phase 8 (SEO & GEO) is next in Draft — promote via `phase-planning` when ready to start._

---

# DRAFT — Upcoming Phases

## Phase 8 — SEO & GEO `Draft`
Not yet scoped. Covers traditional SEO (metadata, sitemap, structured data) and GEO (generative-engine optimization — how the product surfaces in AI assistant answers) for the marketing/landing surface shipped in Phase 4. No hard sequencing dependency beyond Phase 4 being shipped.

## Phase 9 — Pattern Reference Page `Draft`
A dedicated page that demonstrates the canonized component patterns established across prior phases: data table, error states (operational `InlineError` + fault `ErrorPanel`), skeleton loading, toast, and the form/settings pattern (from Phase 6). The page imports and showcases the real, already-established components — it does not reimplement them. It is explicitly deletable scaffolding: deleting it loses zero canonical pattern, since every pattern it demonstrates is established in real code elsewhere (admin users table, profile page, etc.). Sequenced after Phase 6 so it can show the form/profile pattern alongside everything from Phase 5, rather than shipping thin now and needing a follow-up addition later.

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
