# Seminova — Planning Brief

**Purpose:** Dual-use — planning reference for the builder (PM) and context for coding agents. Seminova is currently a **template**: a curated foundation that real products are built from. It is written in product shape so that the structure itself is inherited by every project spun off it. Agents: read this file for living state; build-time workflow and authoritative schema live in [AGENTS.md](AGENTS.md); shipped phase detail in [CONTEXT_ARCHIVE.md](CONTEXT_ARCHIVE.md).

**Last updated:** 2026-06-19
**Status:** Phase 1 — Foundation (shipped). Phase 2 — Design-System Token Layer (shipped). Phase 3 — App Shell (Admin sidebar) + Auth restyle is **ACTIVE** (in progress).
**Migrations:** none yet — no custom schema; Supabase `auth.users` only.

**Shipped phase detail →** [CONTEXT_ARCHIVE.md](CONTEXT_ARCHIVE.md)

---

## File Management Rules

These rules apply to anyone updating this file — PM or coding agent.

- **The ACTIVE section is the source of truth for what is planned but not yet shipped.** Cursor has access to the codebase and can verify live state independently. This file should never contradict the repo.
- **Authoritative schema and the build-time agent workflow live in [AGENTS.md](AGENTS.md).** Do not duplicate per-table schema or Cursor/rules/skills detail here.
- **Locked rules are canonical in [AGENTS.md](AGENTS.md).** §3 below is a pointer + at-a-glance only — do not expand it back into a full duplicate.
- **Locked-rule changes decided in chat must be routed.** A text-only rule edit lands directly in AGENTS.md (and the §3 at-a-glance only if the topic list changes). A rule change that requires code conformance becomes an ACTIVE story that updates AGENTS.md, `.cursor/rules/`, and the affected code together.
- **When a phase ships in full**, append its epic/story detail to [CONTEXT_ARCHIVE.md](CONTEXT_ARCHIVE.md) (append-only — never edit existing archive entries), then update the Roadmap status and the Status line here and remove the shipped ACTIVE content.
- **Resolved open-question one-liners** append to `## Resolved decisions` in [CONTEXT_ARCHIVE.md](CONTEXT_ARCHIVE.md); remove from this file.
- **HTML mockups:** save new explorations as `.mockups/*.html`. When a mockup is superseded or tied to a shipped phase, move it to `.mockups/archive/`.
- **Epics must be numbered.** Format as `### Epic N: Name` (sequential within the phase, starting at 1). Never `### Epic: Name` with no number.
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

At a glance, the locked rules cover: pnpm-only package management; primitive-first shadcn/ui; semantic-token theming with no hardcoded color; fixed structure / swappable theme; mobile-first responsive; components ≤150 lines; WCAG 2.1 AA accessibility; non-interactive shadcn CLI; `next/image` with explicit dimensions; the `/` + `/auth/**` auth boundary enforced in `proxy.ts`; and agent guidance confined to `.cursor`. See AGENTS.md for the authoritative wording of each.

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
| 3 | App Shell (Admin sidebar) + Auth restyle | `Active` |
| 4 | Landing Page | `Draft` |
| 5 | Reference Implementations | `Draft` |
| 6 | Data Model Foundation (profiles, non-admin shell, profile/settings page) | `Draft` |
| 7 | Agent Tooling: Skills Suite | `Draft` |

---

# ACTIVE

## Phase 3 — App Shell (Admin sidebar) + Auth restyle

The Phase 3 shell is **admin-scoped**, using the sidebar pattern — the only authenticated identity concept the template currently has. Non-admin authenticated users get a separate header+content shell (Phase 6) — sidebar is reserved for admin/management surfaces; header+content is for end-user-facing ones.

### Prerequisite (not a Cursor story)
A Supabase project must exist and be wired into local `.env` before any of this is functional. No migration is needed (no new tables — `auth.users` already exists), but there's nothing for `listUsers()` or the promote-admin script to call against otherwise. This is manual setup, not something to hand to Cursor.

---

### Epic 1: Admin authentication

Admin status is gated by `app_metadata.role` on `auth.users` — sensitive, low-churn, JWT-embedded, set only via secret-key-authenticated tooling (`SUPABASE_SECRET_KEY`). This is a deliberate boundary: `app_metadata` is for the one bit that gates god-mode access (admin/not-admin); future product-level roles (editor, viewer, etc.) belong in `profiles` or a roles table instead (Phase 6), which have live-query consistency rather than JWT refresh lag.

**Story: Promote a user to admin from the command line**
As the person setting up a fresh clone of this repo, I want to grant myself admin access via a CLI command so I can access the admin shell without manually editing the database.
- `pnpm promote-admin <email>` sets `app_metadata.role = 'admin'` via the Supabase secret key (`SUPABASE_SECRET_KEY` in `.env.local`)
- Errors clearly if no user with that email exists yet: "no user found with that email — sign up first"
- Idempotent — running it again on an existing admin confirms/no-ops rather than erroring
- Companion commands: `pnpm demote-admin <email>`, `pnpm list-admins`
- Promote/demote print the target Supabase project URL (from env) and require a y/N confirmation before acting; `list-admins` is read-only, no confirmation needed
- README gets a human-facing "Initial setup" section documenting this as a required step after cloning
- AGENTS.md gets a locked-rule entry: `app_metadata.role` is the canonical admin gate — do not move this to a `profiles` column without PM approval

---

### Epic 2: Admin app shell

Canonical authenticated layout, based on shadcn's `sidebar-07` block (`npx shadcn add sidebar-07`), enhanced from its generic baseline into Seminova-real. Note: Phase 2 already handled token conformance on auth errors and layout chrome — this epic does not redo that work.

**Story: Authenticated admin layout with sidebar**
As an admin, I want a persistent sidebar with navigation and my account info so I can move around the admin area and sign out.
- Sidebar baseline: `sidebar-07` (collapsible-icon behavior retained as-is — `SidebarRail`, `SidebarTrigger` unchanged)
- Logo area: text wordmark ("Seminova") + a placeholder lucide icon replacing the stock shadcnblocks CDN image — same placeholder used in the auth screens (see Auth restyle epic)
- Nav: real items with real Next.js `Link`s, not placeholder `<a href="#">`s — minimum includes a Users item linking to the Users page
- Footer: user menu following the `nav-user.tsx` pattern from `sidebar-07` — avatar (initials/generic fallback, no `avatar_url` source yet) + email as the trigger row, dropdown containing only **Sign out** wired to real Supabase `signOut()`; strip the Account/Billing/Notifications items the reference ships with since nothing they'd link to exists yet
- Header breadcrumb is dynamic, reflecting the actual current page — not hardcoded
- Post-login redirect: after successful login or password update, admins go to `/users`; non-admins go to `/protected` (non-admin shell arrives in Phase 6)
- The shadcnblocks `sidebar1` block (`npx shadcn add @shadcnblocks/sidebar1`) was used as the reference for the header/breadcrumb/inset layout shape; `sidebar-07` from ui.shadcn.com is the reference for the `nav-user.tsx` footer pattern

---

### Epic 3: Users reference page

First real authenticated data page — also establishes the canonical data table pattern (search, pagination) for every future table in this template. Pattern decisions are now canonized in `.cursor/rules/data-tables.mdc`.

**Story: Admin can view all signed-up users**
As an admin, I want to see a list of everyone who has signed up so I can confirm accounts exist and check who has admin access.
- Data source: `auth.admin.listUsers()` via a Server Action (not a Route Handler — no external caller, per the convention now in `.cursor/rules/nextjs.mdc`)
- Columns: Email, Verified (from `email_confirmed_at` — shown as a badge/checkmark), Created, Last sign-in, Role (admin badge, from `app_metadata.role`)
- Read-only — no row actions (edit/promote/delete from the UI); admin promotion stays CLI-only this phase
- Real data, not mock — a mock users table would misrepresent actual system state on a page whose entire purpose is showing actual system state
- Data table baseline: `@shadcnblocks/data-table1` (`npx shadcn add @shadcnblocks/data-table1`), with the product/inventory demo schema and data stripped and replaced with the user schema above

**Story: Search and pagination on the Users table**
As an admin, I want to search and page through users so I can find someone without scrolling an unbounded list.
- Search: single input, explicitly designated to filter on the `email` column (canonical pattern per `data-tables.mdc` — one designated text column, not positional inference, not global multi-column search)
- Pagination: Next/Previous controls only, fixed page size of 50, no numbered pages, no page-size selector; table grows naturally and the page scrolls — no fixed-height internal scroll region
- **Follow-up to complete in this phase:** once real file paths exist, confirm/correct the glob pattern and reference-implementation path in `.cursor/rules/data-tables.mdc` — they are placeholder values written before the Users table file structure was known

---

### Epic 4: Auth screen restyle

Resolves the open question deferred from Phase 2: **restyle in place, not rebuild.** The form fields and flows are unchanged; only the page wrapper/layout and branding are updated.

**Story: Auth screens match the rest of the app**
As a user, I want the login/signup/password screens to look like they belong to this app, not stock Supabase styling.
- Visual pattern: shadcn `-03` style (muted background, centered form, no side image) applied uniformly across all `/auth/**` screens — login, signup, forgot password, reset password
- Install references: `npx shadcn add login-03`, `npx shadcn add signup-03` — use as structural reference, adapted to the existing `/auth/**` routes rather than dropped in as-is
- Branding: same Seminova text+icon placeholder used in the sidebar logo appears above the form, replacing the generic "Acme Inc." reference markup
- Background: `bg-muted` as currently defined in `globals.css` (`oklch(0.967 0.0029 264.5419)` light / `oklch(0.2427 0.0381 259.9437)` dark) — near-white/dark-slate, not purple-tinted; visual identity tuning is Phase 4 territory
- This is a structural/token-compliant pass, not a final visual identity decision

---

# DRAFT — Upcoming Phases

## Phase 4 — Landing Page `Draft`
A styled public landing/marketing page as the canonical public entry point.

## Phase 5 — Reference Implementations `Draft`
Working examples that demonstrate the patterns: a dashboard with widgets, a data table, a standard form (forms stack TBD — see Open Questions), and canonical loading / error / empty / toast states. A settings page pattern.

## Phase 6 — Data Model Foundation `Draft`
First real migration: `profiles` table, signup trigger, owner-scoped RLS. Seed AGENTS.md **Data model (summary)** as the authoritative schema source. Also builds the non-admin authenticated shell — header-row + content below, distinct from the admin sidebar pattern (sidebar is reserved for admin/management surfaces; header+content is for end-user-facing ones) — and a profile/settings page on top of it (display name, avatar, bio, password reset), the first real surface for `profiles` fields.

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
