# LEXICON.md — Seminova's architectural language

**Purpose:** The shared vocabulary for Seminova's _architecture_ — the named concepts that recur across rules, skills, plans, and code. When a plan or an agent says "service client" or "operational error," this file is what those words mean. One definition, one home.

**What this is:** An _architectural_ lexicon, not a _domain_ glossary. Seminova is a template, so its domain language is deliberately near-empty — there are no products' nouns here yet. But its architectural language is rich and worth pinning down, because every product spun off from Seminova **inherits** these concepts. Spinoffs keep this layer and grow a domain layer on top (see _Domain terms_ at the bottom).

**Discipline:** Entries are short — a sentence or two of meaning, plus a pointer to the canonical home (a rule, `DESIGN.md`, [AGENTS.md § Hard constraints](AGENTS.md#hard-constraints), an ADR) where the authoritative detail and any values live. Do not duplicate token values, rule wording, or schema here; point to the source of truth instead.

**Last updated:** 2026-07-10

---

## Contents

- [Architectural terms](#architectural-terms)
  - [Primitive-first](#primitive-first)
  - [Semantic token](#semantic-token)
  - [Structure vs theme](#structure-vs-theme)
  - [Auth boundary](#auth-boundary)
  - [Admin gate](#admin-gate)
  - [Defense in depth (admin)](#defense-in-depth-admin)
  - [Supabase clients](#supabase-clients-browser--server--service)
  - [Operational vs fault error](#operational-vs-fault-error)
  - [Deep module vs god file](#deep-module-vs-god-file)
  - [Route groups](#route-groups-marketing--app)
  - [App shell / Admin shell](#app-shell--admin-shell)
  - [Server Action](#server-action)
  - [Response envelope](#response-envelope)
  - [Site config](#site-config)
  - [Save model](#save-model)
  - [Feedback routing](#feedback-routing)
  - [Post-auth redirect](#post-auth-redirect)
  - [Owned storage path](#owned-storage-path)
  - [Avatar cache bust](#avatar-cache-bust)
  - [Canonical data table](#canonical-data-table)
- [Domain terms](#domain-terms)

---

## Architectural terms

### Primitive-first

UI is built from a collection of _owned_ low-level shadcn/ui primitives (Radix-based) in [`src/components/ui/`](src/components/ui/), composed upward into app components — rather than reaching for ad-hoc markup or third-party composite widgets. The primitives are vendored into the repo and owned, not imported from a package, so they can be themed and audited in place. Hard constraint (enforced: `check:no-shadcn-pkg`); consumption detail in [`.cursor/rules/ui-shadcn.mdc`](.cursor/rules/ui-shadcn.mdc). See [AGENTS.md § Hard constraints](AGENTS.md#hard-constraints).

### Semantic token

A design value referred to by _role_, not by raw value — `primary`, `muted-foreground`, `sidebar-border` — defined once in [`src/app/globals.css`](src/app/globals.css) and consumed through semantic utilities (`bg-background`, `text-destructive`). Components never hardcode hex/oklch or use palette scales (`text-red-500`). The token **names** are inherited structure; the **values** behind them are the re-skinnable theme. Architecture and re-skin workflow in [DESIGN.md](DESIGN.md).

### Structure vs theme

The split that makes Seminova re-skinnable. _Structure_ — token names, component primitives, the `@theme inline` bridge, the agent workflow — is fixed and inherited by every spinoff. _Theme_ — color/font/radius/shadow values — is replaced per product. Guidance in [`.cursor/rules/ui-styling.mdc`](.cursor/rules/ui-styling.mdc). See [DESIGN.md › Structure vs theme](DESIGN.md#structure-vs-theme).

### Auth boundary

The line between public and authenticated routes. A small allowlist of paths is public — the landing page, the auth screens, the pattern reference page, and the legal pages — and everything else requires an authenticated session. The allowlist values are constants in [`src/constants/app-paths.ts`](src/constants/app-paths.ts); the boundary is enforced in [`proxy.ts`](proxy.ts) (→ [`src/supabase/proxy.ts`](src/supabase/proxy.ts)), which refreshes the session and redirects unauthenticated users to the login path. Adding a public route is a hard-constraint change, not a routing detail. Hard constraint (enforced: `check:auth-boundary`). See [AGENTS.md § Hard constraints](AGENTS.md#hard-constraints).

The proxy reads session state via `getClaims()`, not `getUser()`. `getClaims()` reads the JWT locally with no network round-trip; `getUser()` hits the Supabase Auth server. The proxy comment warns explicitly against swapping them — doing so can cause users to be randomly logged out.

When the Supabase env vars are absent (`hasPublicSupabaseEnv` is false), the proxy **fails closed in production** — it serves a 503 rather than any route — and skips enforcement only outside production, as a dev-setup affordance. The affordance is gated on `NODE_ENV`; there is no bypass to remove before deploying.

### Admin gate

Admin access is keyed on `app_metadata.role` on the Supabase user — **not** a `role` column on `profiles`. The gate is enforced in [`proxy.ts`](proxy.ts) (non-admins redirected away from `/admin/**`) and [`AdminAuthGate`](src/app/admin/_components/admin-auth-gate.tsx). Roles are granted in-app on `/admin/users` (promote/demote) or via the secret-key CLI (`pnpm promote-admin`). Keeping the gate on `app_metadata` rather than the database is a hard constraint (enforced: `check:admin-gate`). See [AGENTS.md § Hard constraints](AGENTS.md#hard-constraints).

### Defense in depth (admin)

Admin privilege is re-verified at every layer that can reach elevated operations: proxy redirect → [`AdminAuthGate`](src/app/admin/_components/admin-auth-gate.tsx) in the layout → `assertAdminCaller()` in each server action before `createServiceClient()` runs. No single gate is considered sufficient. The service client is never reached without passing all three. Enforcement: [`proxy.ts`](proxy.ts), [`AdminAuthGate`](src/app/admin/_components/admin-auth-gate.tsx), and `assertAdminCaller()` in [`src/app/admin/users/_lib/assert-admin-caller.ts`](src/app/admin/users/_lib/assert-admin-caller.ts).

### Supabase clients (browser / server / service)

Three distinct Supabase clients, each with a different trust level — picking the right one is a recurring decision:

- **Browser client** ([`src/supabase/client.ts`](src/supabase/client.ts)) — runs in the browser, acts as the signed-in user, subject to RLS.
- **Server client** ([`src/supabase/server.ts`](src/supabase/server.ts)) — SSR/server components and actions, still user-scoped via the session cookie, subject to RLS.
- **Service client** ([`src/supabase/service.ts`](src/supabase/service.ts)) — uses the **secret key**, bypasses RLS, and must only be used inside an already-gated server path (e.g. listing all auth users for the admin table). Never reachable from the browser.

"Service client" specifically means the RLS-bypassing secret-key client — reach for it only when a gated server operation genuinely needs to act outside a single user's row.

### Operational vs fault error

Seminova classifies every error by `kind` on [`AppError`](src/types/app-error.ts):

- **Operational** — an expected, user-actionable failure (bad credentials, validation, forbidden, rate-limited).
- **Fault** — an unexpected system failure the user cannot fix (thrown exception, network failure, internal error).

`kind` is set at the producer or catcher — the only place with enough context to classify honestly — and travels as data on the **response envelope**. UI branches on `kind` to choose its error surface and how much detail to show; it never infers severity from `code`, from message text, or from where the error was caught. Consumption detail in [`.cursor/rules/error-handling.mdc`](.cursor/rules/error-handling.mdc).

### Deep module vs god file

Two opposed shapes a file can take, and the basis for how Seminova sizes components (replacing the old 150-line cap):

- **Interface** — the surface a module exposes to callers: its exports, props, the public functions other code depends on.
- **Implementation** — the hidden internals behind that interface.
- **Deep module** — _one_ responsibility, a _narrow_ interface, and a _large hidden_ implementation. Acceptable, even desirable: complexity is contained behind a small surface.
- **God file** — _many_ responsibilities and a _wide_ interface. The thing to avoid: callers couple to a sprawling surface.

File size is a _symptom_, not the signal — a large deep module is fine; a wide interface is the real smell. Reconciliation principle: decompose the implementation freely (private helpers are fine); resist proliferating the interface. Static definition lives in [`.cursor/rules/project-standards.mdc`](.cursor/rules/project-standards.mdc); the decision and trade-off in [docs/adr/ADR-0001-component-sizing-by-depth.md](docs/adr/ADR-0001-component-sizing-by-depth.md); `tech-debt-audit` judges god-files on interface width + responsibility count, with >500 LOC as an inspect-trigger.

### Route groups `(marketing)` / `(app)`

Parenthesized App Router folders that co-locate layout and components without affecting the URL. Seminova ships two: `(marketing)` for the public landing surface and `(app)` for the authenticated product surface. Each carries its own `layout.tsx` and `_components/`. New surfaces belong in one of these two groups — adding a third is an architectural decision, not a file-organization call.

### App shell / Admin shell

The authenticated layout wrappers. [`AppShell`](src/app/(app)/_components/app-shell.tsx) composes site chrome, nav, and page content for the main app surface. [`AdminShell`](src/app/admin/_components/admin-shell.tsx) adds a sidebar and breadcrumb behind the admin gate. Both are the composition point for navigation state — extending authenticated layouts means extending a shell, not adding chrome elsewhere.

### Server Action

A `'use server'` function — the default path for authenticated reads and mutations in Seminova. Actions return a typed **response envelope** (see below) rather than raw HTTP responses, and are co-located with the surface they serve: `actions.ts` beside the route's `page.tsx`, or in the route group's `_lib/` when the surface has no route of its own (e.g. the profile modal). Reach for a server action before reaching for an API route. Placement rule in [`.cursor/rules/project-standards.mdc`](.cursor/rules/project-standards.mdc); action pattern in [`.cursor/rules/forms.mdc`](.cursor/rules/forms.mdc).

### Response envelope

The standard return shape for server actions: `{ success: true, data }` or `{ success: false, error: { message, code, kind } }`. The `kind` field carries the operational/fault classification. Callers discriminate on `success` before using `data`. Never return raw thrown errors or untyped objects from an action. The shape, the error-code taxonomy, and the equivalent envelope for API routes are canonical in [`.cursor/rules/error-handling.mdc`](.cursor/rules/error-handling.mdc).

### Site config

The re-skin entry point for product identity. [`src/config/site.ts`](src/config/site.ts) holds the product name, metadata, and nav links. [`src/config/landing-content.ts`](src/config/landing-content.ts) holds marketing copy. When spinning off a new product, these two files are the first things that change. Keep product-specific values here — not hardcoded in components.

### Save model

The rule for when a form field persists. The mode is a property of the _field_, not of the form — a single form can mix all three, and the choice is intentional per field:

- **Blur-save** — persists when the field loses focus (e.g. display name).
- **Explicit submit** — for coupled or high-stakes fields (e.g. password change).
- **Upload-on-complete** — persists immediately when an upload finishes (e.g. avatar).

Each mode carries its own success feedback (see _Feedback routing_). Consumption detail in [`.cursor/rules/forms.mdc`](.cursor/rules/forms.mdc).

### Feedback routing

User-facing outcome routing by persistence type — runs parallel to error classification:

- **Toast** — transient feedback for discrete completed actions.
- **Field save indicator** — inline, auto-dismissing feedback for blur-save fields.
- **Inline error / Error panel** — errors never toast; always inline or panel depending on `kind`.

Consumption detail in [`.cursor/rules/notifications.mdc`](.cursor/rules/notifications.mdc).

### Post-auth redirect

After sign-in, the destination is role-derived: admins → `ADMIN_HOME`, everyone else → `APP_HOME`. That path is a _fallback_ — a `next` parameter carried through the flow wins over it, provided it passes `isSafeRedirect()`. The role logic lives in [`getPostAuthRedirectPath()`](src/utils/admin.ts); the `next` override is applied in [`/auth/confirm`](src/app/auth/confirm/route.ts). Path values live in [`src/constants/app-paths.ts`](src/constants/app-paths.ts) and [`src/constants/admin-paths.ts`](src/constants/admin-paths.ts). When adding new roles or surfaces, extend those constants and this function — not the auth flow itself.

### Owned storage path

A storage URL is only valid if it belongs to the current user's bucket path (`{userId}/avatar.webp`). `isOwnedAvatarStorageUrl()` enforces this server-side before persisting any URL — rejecting external or cross-user paths. When extending storage to new file types, apply the same ownership check at the server boundary. See [`src/utils/avatar-cache-bust.ts`](src/utils/avatar-cache-bust.ts) and [`src/constants/storage-paths.ts`](src/constants/storage-paths.ts).

### Avatar cache bust

Public avatar URLs are versioned with a `?v=` query param so browsers fetch the new image after an upload without CDN staleness. The param is appended at persist time via `withAvatarCacheBust()`. When adding other user-uploaded assets served from public storage, apply the same pattern. Reference implementation: [`src/utils/avatar-cache-bust.ts`](src/utils/avatar-cache-bust.ts).

### Canonical data table

The reference pattern for admin tables: `DataTableShell` with single-column search, server-side Next/Previous pagination (page size 15), and skeleton loading via column meta. See [`src/components/data-table-shell.tsx`](src/components/data-table-shell.tsx) and the users table as the production reference; the [`/reference`](src/app/(marketing)/reference/_components/reference-table-section.tsx) fixture demo is the sanctioned client-side pagination exception. New admin list views should follow this pattern before reaching for a custom table.

---

## Domain terms

_Empty by design._ Seminova is a template — it ships only the `User` / `Profile` primitives every product needs, and presumes no product schema. Spinoffs add their domain vocabulary here (e.g. the kind of rich domain language a real product develops: "a 'standalone X' is an X with a null Y"). The architectural terms above are inherited unchanged; this section is where a product's own language accumulates.
