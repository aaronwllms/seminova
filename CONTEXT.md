# Seminova — Planning Brief

**Purpose:** Dual-use — planning reference for the builder (PM) and context for coding agents. Seminova is currently a **template**: a curated foundation that real products are built from. It is written in product shape so that the structure itself is inherited by every project spun off it. Agents: read this file for living state; build-time workflow and authoritative schema live in [AGENTS.md](AGENTS.md); shipped phase detail in [CONTEXT_ARCHIVE.md](CONTEXT_ARCHIVE.md).

**Last updated:** 2026-06-21
**Status:** Phase 1 — Foundation (shipped). Phase 2 — Design-System Token Layer (shipped). Phase 3 — App Shell (Admin sidebar) + Auth restyle (shipped). Phase 4 — Landing Page (shipped). Phase 5 — Admin Surface Polish & Toasting (`Active`).
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

At a glance, the locked rules cover: ecosystem alignment over aesthetic divergence; pnpm-only package management; primitive-first shadcn/ui; semantic-token theming with no hardcoded color; fixed structure / swappable theme; mobile-first responsive; components ≤150 lines; WCAG 2.1 AA accessibility; non-interactive shadcn CLI; `next/image` with explicit dimensions; the `/` + `/auth/**` auth boundary enforced in `proxy.ts`; admin gate via `app_metadata.role` (secret-key CLI only); and agent guidance confined to `.cursor`. See AGENTS.md for the authoritative wording of each.

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
| 4 | Landing Page | `Shipped` |
| 5 | Admin Surface Polish & Toasting | `Active` |
| 6 | Data Model Foundation (profiles, non-admin shell, profile/settings page) | `Draft` |
| 7 | Security Audit | `Draft` |
| 8 | SEO & GEO | `Draft` |
| 9 | Pattern Reference Page | `Draft` |
| 10 | Agent Tooling: Skills Suite | `Draft` |

---

# ACTIVE

## Phase 5 — Admin Surface Polish & Toasting `Active`

Retrofits shared error/loading patterns and a toast system into the existing admin users surface, rather than building a standalone reference/demo page. Scope narrowed from the original "Reference Implementations" framing after review: the data-table pattern already exists for real (admin users table), and the form/settings pattern is owned by Phase 6, not duplicated here ahead of it.

### Epic 1: Shared Error State Component `Complete`

As a developer using a server action or async surface, I want a consistent error-display component so failures look the same everywhere and are easy to debug.

- Replace ad hoc inline error text (e.g. the users table's `role="alert"` paragraph) with a shared component.
- Component shows the error message plus a copy button that copies the error text (and any available underlying detail — code/context) to the clipboard, so it can be pasted into a chat/debugging tool.
- Retrofit into the users table; also retrofit into the auth forms (login, sign-up, forgot-password, update-password), which currently each handle errors ad hoc — consolidate rather than leaving them inconsistent.
- Auth forms additionally capture the raw `.code` from the caught Supabase `AuthError` (currently discarded) and pass it through to the shared component alongside `message`. Mapping these raw codes to the error taxonomy (e.g. `SUPABASE_AUTH_ERROR`) and deciding what's safe to surface per code is a security-sanitization decision, not a display concern — deferred to Phase 7 (Security Audit). This epic only ensures the raw code isn't lost before that pass can use it.

### Epic 2: Error Severity Architecture `Complete`

As a developer (and as an end user seeing errors), I want errors classified by severity at the point they're produced — not guessed at in the UI — so that routine, expected problems read as quiet feedback while genuine failures get the heavier, debuggable treatment.

**Supersedes Epic 1's single-component approach.** Epic 1 shipped one `ErrorState` component whose copy-to-debug affordance was gated on whether an error `code` happened to be present. Review found that's the wrong signal: a Supabase auth error like "invalid login credentials" carries a code yet is a completely routine, expected outcome — so it was wrongly getting a debug-oriented copy button. The real distinction follows the established operational-vs-fault error taxonomy in senior practice: expected failures during normal operation (bad credentials, password mismatch, rate-limited, forbidden) versus genuine faults (thrown exceptions, network failure, internal errors). This epic re-architects around that distinction and replaces the Epic 1 component.

- **Carry severity as data, not a UI guess.** Extend the error envelope used by server actions (and the auth-form error helper) to include a `kind: 'operational' | 'fault'` field, set at the point the error is produced or caught — the only place with enough context to classify it honestly. The UI renders what it's told; it does not infer severity from `code` presence or message text.
- **Classify at the producer/catcher.** The users-table server action sets `kind` from its typed error union (`FORBIDDEN` and `VALIDATION_ERROR` → operational; `INTERNAL_ERROR` → fault). The auth-form error helper sets `kind` from the caught value's type: a Supabase `AuthError` → operational (the SDK deliberately returned an expected auth outcome); any other throw — network, null, non-`Error` — → fault. The sign-up password-mismatch client check → operational. No per-code taxonomy table is needed for this — classification keys off the typed union and the `isAuthError` type guard already in use. (Finer per-code mapping remains Phase 7's concern.)
- **Two display components, chosen by `kind`, replacing the single Epic 1 component:**
  - `InlineError` (operational) — a plain inline message in `text-destructive` with a small leading `AlertCircle` icon (decorative/`aria-hidden`; color paired with an icon for non-color-reliant perception), `role="alert"`. No container, no fill, no copy affordance. This is the canonical form-field/validation error look already described in DESIGN.md, now a named reusable component.
  - `ErrorPanel` (fault) — a bordered, subtly destructive-tinted container (destructive-family border + faint destructive fill, semantic tokens only) with a leading `AlertTriangle` icon, the message, and a copy-to-clipboard button (destructive-tinted, vertically centered against the text, `aria-label`, keyboard-focusable with a visible focus ring), `role="alert"`. Copy payload includes message and `code`. Brief "Copied" feedback via an `aria-live` region — no toast (Epic 3 owns toasts).
- **Retrofit all five surfaces** (users table + four auth forms) to render the correct component based on `kind`. The single Epic 1 `error-state.tsx` component is removed and replaced by the two new components; do not keep it as a compatibility shim.
- **Drop the unused `detail` prop** that Epic 1's component carried — nothing fills it; reintroduce later only when a real fault-path caller has something to put there. Keep the component API minimal.
- **Update `.cursor/rules/error-handling.mdc`** to document the operational-vs-fault model, the `kind` field on the envelope, and which component to use for which — superseding the single-`ErrorState` guidance Epic 1 wrote.

### Epic 3: Skeleton Loading State for Users Table `Complete`

As an admin viewing the users list, I want a proper loading skeleton instead of placeholder text, consistent with the design system's existing skeleton primitive.

- Replace the "Loading users…" text state in the users table with the existing (currently unused) `skeleton.tsx` primitive, shaped to the table's rows/columns.
- Establish this as the pattern other tables/lists should follow.

### Epic 4: Toast Notification System `Complete`

As a user completing an action that needs brief confirmation, I want a toast notification so I know it succeeded without a full page state change.

- Install and wire up a toast primitive + provider (sonner, consistent with shadcn/ui conventions already in use).
- Consumed by Epic 5 (promote/demote) now, and by Phase 6's settings save later.

### Epic 5: In-App Admin Promote/Demote

As an admin, I want to promote or demote a user's role directly from the users page, instead of requiring CLI access.

- Add promote/demote action to the users table/page, gated to admin role.
- Action confirms success via the Epic 4 toast.
- **Locked-rule change required:** the current admin-gate rule (`app_metadata.role`, secret-key CLI only) must be updated in AGENTS.md and `.cursor/rules/` to permit this in-app path, alongside the code that implements it — per [DOC_RULES.md](DOC_RULES.md) rule 5 and AGENTS.md change protocol (code-conforming locked-rule changes land as a story, not a standalone doc edit).

---

# DRAFT — Upcoming Phases

## Phase 6 — Data Model Foundation `Draft`
First real migration: `profiles` table, signup trigger, owner-scoped RLS. Seed AGENTS.md **Data model (summary)** as the authoritative schema source. Also builds the non-admin authenticated shell — header-row + content below, distinct from the admin sidebar pattern (sidebar is reserved for admin/management surfaces; header+content is for end-user-facing ones) — including an avatar dropdown in the header reusing the admin sidebar's nav-user pattern (sign-out, profile access) — and a profile/settings page on top of it (display name, avatar, bio, password reset), the first real surface for `profiles` fields. Settings save confirms via the Phase 5 toast system. Also owns the standard form pattern (forms stack TBD — see Open Questions).

## Phase 7 — Security Audit `Draft`
A dedicated pass over security-relevant surfaces that don't exist yet at Phase 5 time — sequenced after Phase 6 so RLS policies and the `profiles` table are real before they're audited. Known scope so far: map raw Supabase `AuthError` codes (captured in Phase 5, passed through as operational/`kind`-tagged but unmapped) to the error taxonomy in `error-handling.mdc` and decide what's safe to surface/copy per code, per `security.mdc` guidance; review RLS policies on `profiles`; general secret-handling and auth-boundary review. Not yet fully scoped — flesh out epics once Phase 6 ships.

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

**Forms stack**
**Problem:** The starter ships no form library. The settings page (Phase 6) and other product forms need a standard.
**Solution:** Likely adopt `react-hook-form` + `zod` as the canonical stack and bake it into the template. Confirm before Phase 6.
_Defer until: Phase 6_

---

**Profiles in template vs per-product**
**Problem:** Should the template ship the `profiles` migration by default, or leave it for each product to add?
**Solution:** Leaning toward shipping it as the one assumed primitive, since "users must exist" is universal. Confirm in Phase 6.
_Defer until: Phase 6_

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
**Solution:** Not yet scoped. Likely a dedicated in-app page (not a doc) reachable from the landing page, with two threads: (1) agent-ready conventions — how AGENTS.md + `.cursor/rules/` + `.cursor/skills/` keep any coding agent's output consistent; (2) PM/agent collaboration model — the Claude Desktop planning setup, MCP, and paired skills that turn a plan into agent-ready work. Needs its own epic to define content and layout once Phase 4 ships.
_Defer until: unscoped — revisit after Phase 4_

---

**Admin shell feature copy revisit**
**Problem:** Feature card #4's punchline ("start building your product, not your login screen") implies login/auth is the thing skipped, but the actual content is the admin shell + role gating. As more reference surfaces ship (Phase 5+), this card should describe the fuller set of packaged components available, not just admin shell.
**Solution:** Revisit copy once more reference implementations exist to describe.
_Defer until: after Phase 5_

---

**`useGetMessage` filename violates kebab-case rule**
**Problem:** `src/hooks/useGetMessage.ts` (and its test `useGetMessage.unit.test.tsx`) is camelCase, violating the locked kebab-case file-naming convention in `project-standards.mdc`. The sibling `use-mobile.ts` is correct; this is the lone deviation.
**Solution:** Rename to `use-get-message.ts` + `use-get-message.unit.test.tsx` and update any imports. Low priority, low risk — straightforward cleanup whenever convenient.
_Defer until: opportunistic_
