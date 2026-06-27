# LEXICON.md — Seminova's architectural language

**Purpose:** The shared vocabulary for Seminova's _architecture_ — the named concepts that recur across rules, skills, plans, and code. When a plan or an agent says "service client" or "operational error," this file is what those words mean. One definition, one home.

**What this is:** An _architectural_ lexicon, not a _domain_ glossary. Seminova is a template, so its domain language is deliberately near-empty — there are no products' nouns here yet. But its architectural language is rich and worth pinning down, because every product spun off from Seminova **inherits** these concepts. Spinoffs keep this layer and grow a domain layer on top (see _Domain terms_ at the bottom).

**Discipline:** Entries are short — a sentence or two of meaning, plus a pointer to the canonical home (a rule, `DESIGN.md`, `LOCKED_RULES.md`, an ADR) where the authoritative detail and any values live. Do not duplicate token values, rule wording, or schema here; point to the source of truth instead.

**Last updated:** 2026-06-27

---

## Architectural terms

### Primitive-first

UI is built from a collection of _owned_ low-level shadcn/ui primitives (Radix-based) in `src/components/ui/`, composed upward into app components — rather than reaching for ad-hoc markup or third-party composite widgets. The primitives are vendored into the repo and owned, not imported from a package, so they can be themed and audited in place. Locked rule; consumption detail in [`.cursor/rules/ui-shadcn.mdc`](.cursor/rules/ui-shadcn.mdc).

### Semantic token

A design value referred to by _role_, not by raw value — `primary`, `muted-foreground`, `sidebar-border` — defined once in [`src/app/globals.css`](src/app/globals.css) and consumed through semantic utilities (`bg-background`, `text-destructive`). Components never hardcode hex/oklch or use palette scales (`text-red-500`). The token **names** are inherited structure; the **values** behind them are the re-skinnable theme. Architecture and re-skin workflow in [DESIGN.md](DESIGN.md).

### Structure vs theme

The split that makes Seminova re-skinnable. _Structure_ — token names, component primitives, the `@theme inline` bridge, the agent workflow — is fixed and inherited by every spinoff. _Theme_ — color/font/radius/shadow values — is replaced per product. "Fixed structure / swappable theme" is a locked rule. See [DESIGN.md › Structure vs theme](DESIGN.md).

### Auth boundary (`/` + `/auth/**`)

The only public routes are the landing page (`/`) and the auth screens (`/auth/**`). Everything else requires an authenticated session. The boundary is enforced in `proxy.ts` (→ `src/supabase/proxy.ts`), which refreshes the session and redirects unauthenticated users to `/auth/login`. Adding a public route outside these two is a locked-rule change. See [LOCKED_RULES.md](LOCKED_RULES.md).

### Admin gate

Admin access is keyed on `app_metadata.role` on the Supabase user — **not** a `role` column on `profiles`. The gate is enforced in `proxy.ts` (non-admins redirected away from `/admin/**`) and `AdminAuthGate`. Roles are granted in-app on `/admin/users` (promote/demote) or via the secret-key CLI (`pnpm promote-admin`). Keeping the gate on `app_metadata` rather than the database is a locked rule. See [LOCKED_RULES.md](LOCKED_RULES.md).

### Supabase clients (browser / server / service)

Three distinct Supabase clients, each with a different trust level — picking the right one is a recurring decision:

- **Browser client** (`src/supabase/client.ts`) — runs in the browser, acts as the signed-in user, subject to RLS.
- **Server client** (`src/supabase/server.ts`) — SSR/server components and actions, still user-scoped via the session cookie, subject to RLS.
- **Service client** (`src/supabase/service.ts`) — uses the **secret key**, bypasses RLS, and must only be used inside an already-gated server path (e.g. listing all auth users for the admin table). Never reachable from the browser.

"Service client" specifically means the RLS-bypassing secret-key client — reach for it only when a gated server operation genuinely needs to act outside a single user's row.

### Operational vs fault error

Seminova classifies errors by `kind` on [`AppError`](src/types/app-error.ts):

- **Operational** — an expected, user-actionable failure (bad credentials, validation). Surfaced inline with [`InlineError`](src/components/inline-error.tsx).
- **Fault** — an unexpected/system failure the user can't fix. Surfaced with [`ErrorPanel`](src/components/error-panel.tsx) (copy-to-clipboard for reporting).

The distinction drives which component renders and how much detail is shown. Consumption detail in [`.cursor/rules/error-handling.mdc`](.cursor/rules/error-handling.mdc).

### Deep module vs god file

Two opposed shapes a file can take, and the basis for how Seminova sizes components (replacing the old 150-line cap):

- **Interface** — the surface a module exposes to callers: its exports, props, the public functions other code depends on.
- **Implementation** — the hidden internals behind that interface.
- **Deep module** — _one_ responsibility, a _narrow_ interface, and a _large hidden_ implementation. Acceptable, even desirable: complexity is contained behind a small surface.
- **God file** — _many_ responsibilities and a _wide_ interface. The thing to avoid: callers couple to a sprawling surface.

File size is a _symptom_, not the signal — a large deep module is fine; a wide interface is the real smell. Reconciliation principle: decompose the implementation freely (private helpers are fine); resist proliferating the interface. Static definition lives in [`.cursor/rules/project-standards.mdc`](.cursor/rules/project-standards.mdc); the decision and trade-off in [docs/adr/ADR-0001-component-sizing-by-depth.md](docs/adr/ADR-0001-component-sizing-by-depth.md); `tech-debt-audit` judges god-files on interface width + responsibility count, with >500 LOC as an inspect-trigger.

---

## Domain terms

_Empty by design._ Seminova is a template — it ships only the `User` / `Profile` primitives every product needs, and presumes no product schema. Spinoffs add their domain vocabulary here (e.g. the kind of rich domain language a real product develops: "a "standalone X" is an X with a null Y"). The architectural terms above are inherited unchanged; this section is where a product's own language accumulates.
