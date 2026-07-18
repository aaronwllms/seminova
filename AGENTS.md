# AGENTS.md — Repo truth for coding agents

**Purpose:** What exists in this repo today — hard-constraint governance, implemented features, routes, data model, and where to look. For planning and roadmap, see [ROADMAP.md](ROADMAP.md) and the per-phase PRDs in [docs/prds/](docs/prds/). For human setup, see [README.md](README.md). For how to write code, see [.cursor/rules/](.cursor/rules/) (not duplicated here).

**Last updated:** 2026-07-18

Document roles and the doc-maintenance procedure are authoritative in [docs/DOC_RULES.md](docs/DOC_RULES.md).

---

## Agent workflow

1. **Read** AGENTS.md + relevant `.cursor/rules/` and skills before coding.
2. **Migrations:** agents write SQL files in `supabase/migrations/` only. Humans run `pnpm db:push` and `pnpm db:types`. See [.cursor/rules/do-migrations-agent.mdc](.cursor/rules/do-migrations-agent.mdc).

> [!IMPORTANT]
> **Migrations are human-only.** Agents write SQL migration files; humans run `pnpm db:push` and `pnpm db:types` against the linked Supabase project.

3. **Quality bar** before finishing work:

```bash
pnpm type-check && pnpm lint && pnpm format-check && pnpm test:ci
```

4. **Doc sync** after behavior, routes, schema, or env changes:
   - `/sync-repo-docs` — AGENTS.md, README.md, DESIGN.md, `.cursor/rules/README.md`

---

## Agent skills (.cursor/skills/)

Beyond `/sync-repo-docs` (above), the repo ships a library of invokable Cursor skills for repo maintenance and quality work. These are situational — invoke by name (`/skill-name`) when the task calls for it, not as part of every session.

For the planning-loop skills (`kickoff-phase`, `plan-next-epic`, `mark-epic-complete`, `ship-phase`) and the planning-system skill `lexicon-audit`, see [docs/WORKFLOW_GUIDE.md](docs/WORKFLOW_GUIDE.md) — those operate on the planning docs, not repo code.

### Quality & review

| Skill | Use when |
| ----- | -------- |
| `pre-release-review` | Finishing an epic or before opening a PR — quality gates, scoped code review, security check, hard-constraints check, manual test checklist |
| `code-review` | Reviewing an epic or branch since a fixed git ref — two-axis (Standards + Spec) review via parallel readonly subagents |
| `audit-tech-debt` | Codebase health check or architecture review — full pass or sync → `TECH_DEBT_AUDIT.md` |
| `audit-tests` | Test suite health check — full pass or sync → `TEST_AUDIT.md` |
| `audit-rules` | Rules health check — full pass or sync → `RULE_AUDIT.md` |
| `audit-security` | Before launch, after auth/RLS changes, or periodic hygiene — full pass or sync → `SECURITY_AUDIT.md` |

### Design & copy

| Skill | Use when |
| ----- | -------- |
| `design-critique` | Reviewing a mockup, screenshot, or screen at any stage — usability, hierarchy, consistency, accessibility feedback |
| `ux-copy` | Writing or reviewing microcopy — CTAs, empty states, error messages, confirmation dialogs |
| `github-docs-authoring` | GitHub Docs Authoring — write or review repo markdown (README, workflow docs, PRDs) for GFM conventions and renderer gaps |

### Housekeeping

| Skill | Use when |
| ----- | -------- |
| `create-migration` | Adding tables, columns, indexes, or RLS policies — writes a correctly-named, RLS-compliant migration file |
| `archive-cursor-plans` | After a phase ships, or before a planning push — moves completed plans from `.cursor/plans/` to `.cursor/plans/archive/` |
| `research` | Exploratory investigation (product, technical, competitive, codebase) → `docs/research/` brief or chat-only |
| `archive-research` | Retires served research briefs to `docs/research/archive/` — @-attach brief(s) in the same invocation |

All skills are read-only or scoped-write as documented in their own `SKILL.md` — see `.cursor/skills/<name>/SKILL.md` for full workflow detail. None auto-invoke except `sync-repo-docs`.

---

## Setup and quality commands

| Command | Purpose |
| ------- | ------- |
| `pnpm dev` | Development server at `http://localhost:3000` |
| `pnpm build` | Production build |
| `pnpm start` | Run production build |
| `pnpm type-check` | TypeScript (`tsc --noEmit`) |
| `pnpm lint` | ESLint (repo-wide) |
| `pnpm lint-fix` | ESLint with auto-fix |
| `pnpm format` | Prettier write |
| `pnpm format-check` | Prettier check (CI) |
| `pnpm test` | Vitest run once (default; non-watch) |
| `pnpm test:watch` | Vitest watch mode (human dev only) |
| `pnpm test:file` | Run one test file or pattern (`pnpm test:file -- <path>`) |
| `pnpm test:ci` | Vitest run once with coverage gates (agents, CI, pre-push) |
| `pnpm pre-push` | Full CI mirror locally (type-check → hard-constraint checks → lint → format-check → test:ci) |
| `pnpm check:seo-base-url` | SEO base-URL centralization (hard constraint) |
| `pnpm check:a11y-structure` | Deterministic a11y structure (hard constraint) |
| `pnpm check:a11y-contrast` | Deterministic a11y token contrast (hard constraint) |
| `pnpm check:no-raw-console` | Application logging via wrappers (hard constraint) |
| `pnpm test:ui` | Vitest UI |
| `pnpm analyze` | Bundle analyzer |
| `pnpm promote-admin <email>` | Grant admin via secret key (`app_metadata.role`) |
| `pnpm demote-admin <email>` | Remove admin role |
| `pnpm delete-user <email>` | Delete user via CLI (test-account cleanup) |
| `pnpm list-admins` | List admin users (read-only) |
| `pnpm db:push` | Apply pending SQL migrations to linked Supabase project (human only; CLI prompts) |
| `pnpm db:types` | Regenerate `src/types/database.types.ts` from linked project schema |

**Prerequisites:** Node `>=22.22.2` (see [.nvmrc](.nvmrc)), pnpm 11, Supabase project. Env vars in [.env.example](.env.example) (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` for admin CLI; optional `NEXT_PUBLIC_SITE_URL` for production metadata base URL). `next-env.d.ts` is Next.js-generated and gitignored — run `pnpm dev` or `pnpm build` once after clone if `pnpm type-check` reports a missing file.

---

## Hard constraints

Non-negotiable constraints, each with deterministic enforcement:

> [!IMPORTANT]
> Every constraint below is mechanically enforced — a violation fails `pnpm pre-push` and CI. Changing a constraint requires updating its enforcement together with this list (see [Change protocol](#change-protocol)).

- **pnpm only** — never npm or yarn; one lockfile (`pnpm-lock.yaml`). **Enforced:** `check:pnpm-only`.
- **UI is primitive-first** — own shadcn/ui components in `src/components/ui`; extend via `cva`; compose with Radix `asChild`/`Slot`; never install shadcn as an npm package. **Enforced:** `check:no-shadcn-pkg` (ESLint `no-restricted-imports`).
- **Theming via semantic tokens only** — `bg-background`, `text-foreground`, etc.; never raw hex or numeric Tailwind color scales for themeable color; tokens in `src/app/globals.css`. **Enforced:** `check:semantic-tokens` (custom ESLint rule; see documented limitation in `eslint-rules/semantic-tokens.mjs`).
- **Auth boundary** — public routes are `/`, `/auth/**`, `/terms`, `/privacy`, `/reference`, `/workflow`, and `/api/client-logs` (client log relay — see [ADR-0007](docs/adr/ADR-0007-client-log-relay-unauthenticated.md)); all others require a session; enforced in `proxy.ts` → `src/supabase/proxy.ts`. **Enforced:** `check:auth-boundary` (discovered-route proxy tests).
- **Admin gate** — `app_metadata.role === 'admin'` on `auth.users` is the canonical admin check, set via in-app promote/demote on `/admin/users` or secret-key CLI. Never a `profiles` column. **Enforced:** `check:admin-gate` (source contract test + migration scanner).
- **SEO base URL centralization** — never hardcode `http://localhost:3000`, read `NEXT_PUBLIC_SITE_URL` outside the resolver, or construct `new URL()` with a literal origin; resolve absolute URLs via `getSiteUrl()` or `metadataBase`. **Enforced:** `check:seo-base-url`.
- **Deterministic a11y (structure)** — every route has exactly one `<h1>`; meaningful images have non-empty `alt`; heading levels do not skip. **Enforced:** `check:a11y-structure`.
- **Deterministic a11y (contrast)** — semantic token foreground pairs in `globals.css` meet WCAG AA 4.5:1 in both `:root` and `.dark`. **Enforced:** `check:a11y-contrast`.
- **Application logging via wrappers** — application code in `src/` and admin CLI scripts under `scripts/admin/` must log through `appLog`, `cliLog`, or `clientLog`; raw `console.*` is allowed only at the exempt surfaces listed in `logging.mdc`. **Enforced:** `check:no-raw-console` (ESLint `no-console` with category-aligned exemptions).

**Planning / judgment principle (not mechanically enforced):** **Ecosystem alignment over aesthetic divergence** — Don't canonize a non-standard convention for tidiness or taste alone. Diverge from an ecosystem default (shadcn, Next.js, Supabase) only when our way has a real, articulable benefit — clarity, safety, consistency — that outweighs the cost of fighting it: tooling that assumes the standard, AI agents trained on it, and copy-paste examples that won't match. When it's a wash, follow the standard. A template multiplies both the benefit and the cost across every spinoff.

Consumption detail for demoted guidance lives in `.cursor/rules/`. **Change protocol:** edits to hard constraints route through the [Change protocol](#change-protocol) table below.

---

## Implemented now

Grouped by feature area. History of which phase/epic shipped what lives in git and in the archived PRDs (`docs/prds/archive/`) — this section describes current state only.

### Foundation & tooling

Starter tutorial/demo scaffolding removed; pnpm-only; Vitest 3 / Vite 6 / Next 16.2.x. `.cursor/rules/` stack-accurate and project-agnostic. Pre-push hook mirrors CI (`pnpm pre-push`: type-check → hard-constraint checks including `check:a11y-structure` and `check:a11y-contrast` → lint → format-check → `test:ci`); 80% Vitest coverage thresholds; `.prettierignore` / lint-staged audit (agent-authored docs remain Prettier-ignored). Planning layer is `ROADMAP.md` + per-phase PRDs in `docs/prds/`; doc roles in `docs/DOC_RULES.md`; hard constraints in this file (enforced via `check:*` scripts); architectural vocabulary in `LEXICON.md`; ADR process in `docs/adr/`.

### Auth & session

Supabase email/password flows under `/auth/**` (login, sign-up, forgot/update password, confirm, error) with shared auth layout. `proxy.ts` → `src/supabase/proxy.ts` is the **sole session authority**: it refreshes sessions; on protected routes without a session, an ordinary logged-out request redirects to `/auth/login` (with safe `next` preservation via [`buildLoginRedirectUrl`](src/utils/build-login-redirect-url.ts)), while a request carrying a stray auth `code` param logs a diagnostic and redirects to `/auth/error?source=stray_code` instead; non-admins on `/admin/**` redirect to `/home`. When public Supabase env is unset, production returns **503** for all routes; in development, public routes (`/`, `/auth/**`, `/terms`, `/privacy`, `/reference`, `/workflow`, `/api/client-logs`) pass through and **protected routes return 503** — RSC reads no longer gate auth. Post-login redirect: admins → `/admin`, non-admins → `/home` (`getPostAuthRedirectPath` in [`admin.ts`](src/utils/admin.ts); `APP_HOME` in [`app-paths.ts`](src/constants/app-paths.ts)); the login form and [`/auth/confirm`](src/app/auth/confirm/route.ts) honor a safe `next` query param via [`isSafeRedirect`](src/utils/is-safe-redirect.ts). **Read vs mutation split:** layouts, server components, and gates (`AdminAuthGate`, `getCurrentUserProfile`) read via `getDisplayAuthClaims` / `hasServerAuthSession` from [`require-auth.ts`](src/supabase/require-auth.ts) — these validate the cookie-read access token via `getClaims(accessToken, { allowExpired: true })` (signature-verified, exp-tolerated, never refresh); missing or invalid tokens on protected routes throw (proxy should have gated). Server actions use `getUser()` at the trust boundary so the Auth server validates the access token (see [`updateProfileAction`](src/app/(app)/_lib/profile/actions.ts) and [`forms.mdc`](.cursor/rules/forms.mdc) step 1). Do not call bare `getClaims()` or `getSession()` on RSC read paths — always pass an explicit token. Refresh is proxy-only ([ADR-0005](docs/adr/ADR-0005-proxy-as-sole-session-authority.md)). Idle-tab avatar uploads use `probeSessionAction` + one retry after `router.refresh()` — not a second refresh authority. [`extractAuthFormError`](src/utils/extract-auth-form-error.ts) is fallback-first — enumerated `AUTH_ERROR_OVERRIDES` for known Supabase codes, generic operational copy for unmapped codes, never raw Supabase messages. Four auth forms carry `autocomplete` tokens per [`forms.mdc`](.cursor/rules/forms.mdc); update-password includes a hidden paired username field from the recovery session.

### Admin console

`/admin` route segment — dashboard landing plus `/admin/users` and `/admin/settings` — gated by `proxy.ts` + [`AdminAuthGate`](src/app/admin/_components/admin-auth-gate.tsx); sidebar layout (`sidebar-07` baseline) with sidebar-header [`SeminovaLogo`](src/components/seminova-logo.tsx) linking to marketing home (`/`), not the admin dashboard; dynamic breadcrumb; path constants in [`src/constants/admin-paths.ts`](src/constants/admin-paths.ts). Admin identity loads from [`getCurrentUserProfile`](src/app/(app)/_lib/get-current-user-profile.ts) in `AdminAuthGate`; [`AdminShell`](src/app/admin/_components/admin-shell.tsx) wraps [`ProfileDialogProvider`](src/app/(app)/_components/profile/profile-dialog-provider.tsx) so the sidebar can open profile settings modally. Admin CLI (`pnpm promote-admin` / `demote-admin` / `delete-user` / `list-admins`, secret-key scripts in `scripts/admin/`) and in-app promote/demote and ban/unban (row actions on `/admin/users` with confirmation dialogs + toasts; ban uses a fixed duration set including permanent, self-ban blocked, unban idempotent) share mutation logic in [`src/utils/admin-user-mutations.ts`](src/utils/admin-user-mutations.ts). Users table lists real Supabase Auth users via a gated Server Action (caller gate in [`assert-admin-caller.ts`](src/app/admin/users/_lib/assert-admin-caller.ts)) + `admin_list_users` RPC (migration-shipped `SECURITY DEFINER` function reading `auth.users` with in-function admin gate and static sort allowlist); email search, a "Show banned" checkbox beside the search input (defaults unchecked — hides currently-banned users server-side; toggling resets to page 1 and refetches), server-driven sort on all six columns, configurable page size (10 / 15 / 25 / 50, default 15) via shared [`DataTablePaginationControls`](src/components/data-table-pagination-controls.tsx), canonical data-table pattern (see [`.cursor/rules/data-tables.mdc`](.cursor/rules/data-tables.mdc)) with per-column width/alignment via column meta `cellClassName` and skeleton shape via `skeletonClassName` through [`DataTableShell`](src/components/data-table-shell.tsx) + [`DataTableSkeletonBody`](src/components/data-table-skeleton-body.tsx). [`/admin/settings`](src/app/admin/settings/page.tsx) renders registry-driven runtime configuration grouped by feature area — each setting is a row with a type-matched control (log level select, positive-integer input) and per-row Save via [`saveAppSettingAction`](src/app/admin/settings/_lib/actions.ts) with toast confirmation; initial values load server-side via [`getResolvedAppSettings`](src/utils/app-settings.ts). Sidebar nav includes Users and Settings. [`AdminNavUser`](src/app/admin/_components/admin-nav-user.tsx) sidebar button shows display name (email fallback), correct initials, and avatar image via shared [`UserAvatar`](src/components/user-avatar.tsx); dropdown offers Profile, Open app (`APP_HOME`), and sign-out. [`AppNavUser`](src/app/(app)/_components/app-nav-user.tsx) header trigger is avatar-only (same `UserAvatar`); dropdown opens profile settings in a dialog and adds an admin-gated Admin console link for admins — `isAdmin` derived server-side via `isAdminFromAppMetadata`.

### App home & profile

[`/home`](src/app/(app)/home/page.tsx) is the authenticated landing surface under the `(app)` shell — a minimal placeholder that signposts the public [`/reference`](src/app/(marketing)/reference/page.tsx) pattern page and [`/workflow`](src/app/(marketing)/workflow/page.tsx) explainer, and is meant to be replaced when spinning off. Profile settings are **modal-only** — there is no `/profile` route ([ADR-0004](docs/adr/ADR-0004-profile-modal-app-home-divergence.md)). [`AppShell`](src/app/(app)/_components/app-shell.tsx) wraps children in [`ProfileDialogProvider`](src/app/(app)/_components/profile/profile-dialog-provider.tsx) and uses shared [`SiteHeader`](src/components/site-header.tsx) / [`SiteFooter`](src/components/site-footer.tsx) with default [`SeminovaLogo`](src/components/seminova-logo.tsx) href `/` (marketing home); the account menu opens [`ProfileSettingsDialog`](src/app/(app)/_components/profile/profile-settings-dialog.tsx) via [`useProfileDialog`](src/app/(app)/_components/profile/profile-dialog-provider.tsx). Settings use `react-hook-form` + zod (see [`forms.mdc`](.cursor/rules/forms.mdc)). `public.profiles` is 1:1 with `auth.users`, owner-scoped RLS, auto-created via a signup trigger; no `role` column (admin gate stays on `app_metadata.role`). Display name and bio are blur-save (bio max 160 characters) with per-field in-flight guards and inline [`FieldSaveIndicator`](src/components/field-save-indicator.tsx) via [`useBlurSaveField`](src/hooks/use-blur-save-field.ts) and [`BlurSaveTextField`](src/components/blur-save-text-field.tsx); email is a read-only display field (change not supported). Avatar upload is upload-on-complete (validate → resize to WebP 256px cap → fixed `{userId}/avatar.webp` path → versioned public URL via `withAvatarCacheBust`; client pipeline in [`avatar-storage.ts`](src/utils/avatar-storage.ts)) with Change and Remove controls — removal clears `avatar_url` and deletes the storage object (storage delete failure does not block the profile update). Appearance (theme toggle via [`ProfileThemeSegment`](src/app/(app)/_components/profile/profile-theme-segment.tsx) — outline `ToggleGroup` Light/Dark/System) renders above password change, which is collapsed behind an accordion via [`ProfilePasswordSection`](src/app/(app)/_components/profile/profile-password-section.tsx) requiring `current_password`. Partial-only [`updateProfileAction`](src/app/(app)/_lib/profile/actions.ts) persists `avatar_url` only for owned storage paths via [`isOwnedAvatarStorageUrl`](src/utils/avatar-cache-bust.ts) — external or other-user URLs are omitted. Shared [`useSignOut`](src/hooks/use-sign-out.ts) hook used by `AppNavUser`, `AdminNavUser`, and [`LogoutButton`](src/components/logout-button.tsx).

### Landing page

`(marketing)` route group at `/`: hero, six-card features grid (`id="features"`), a proof CTA band ([`LandingProofCta`](src/app/(marketing)/_components/landing-proof-cta.tsx) — muted background, two-link row to `/reference` and `/workflow` between features and tech stack), and a tech-stack marquee (six logos, icon+name cells, edge fades, pause on hover; SVG assets in `public/tech/`; marquee primitive in [`src/components/kibo-ui/marquee/`](src/components/kibo-ui/marquee/)). Public pattern reference at [`/reference`](src/app/(marketing)/reference/page.tsx) showcases blur-save, error surfaces, toast variants (via shared [`toast-icon-config`](src/utils/toast-icon-config.tsx)), and the canonical data table over fixture data (client-side sort and pagination parity with production via shared [`DataTablePaginationControls`](src/components/data-table-pagination-controls.tsx)) — prose sections stay narrow while the table demo renders wide. Public workflow explainer at [`/workflow`](src/app/(marketing)/workflow/page.tsx) walks two-environment ownership cards, an interactive plan-review-build loop ([`WorkflowDiagram`](src/app/(marketing)/workflow/_components/workflow-diagram.tsx) — hover/focus reveals skill and environment per step), a documents table with real paths and writer/reader roles, CI-enforced hard constraints, and a go-deeper CTA to the workflow guide on GitHub — prose stays narrow while the diagram and cards render wide. Public legal placeholders at [`/terms`](src/app/(marketing)/terms/page.tsx) and [`/privacy`](src/app/(marketing)/privacy/page.tsx) share [`LegalPlaceholder`](src/app/(marketing)/_components/legal-placeholder.tsx) — spinoff replaces with real policy copy; each page shows an App Privacy Policy Generator callout and a not-legal-advice disclaimer (terms notes the generator produces both policy types). Features nav href is `/#features` in [`site.ts`](src/config/site.ts) so the anchor resolves from any page. Shared chrome — [`SiteHeader`](src/components/site-header.tsx), [`SiteFooter`](src/components/site-footer.tsx), [`SiteContainer`](src/components/site-container.tsx) (`max-w-7xl`), `SiteNavLinks`, `SiteCopyright` — is reused by both the marketing surface and the `(app)` shell; [`SeminovaLogo`](src/components/seminova-logo.tsx) (icon + wordmark, single link) in header/footer links to marketing home (`/`) on every surface; authenticated return to app home is via account-menu Open app on marketing/admin surfaces, not a separate footer link; header and footer use a matched three-column `minmax` grid so nav links stay viewport-centered regardless of unequal flanking content. Session-aware marketing header via [`LandingHeader`](src/app/(marketing)/_components/landing-header.tsx): desktop `rightSlot` and mobile chrome both use Suspense with [`AppNavUserSkeleton`](src/app/(app)/_components/app-nav-user-skeleton.tsx) fallbacks (desktop prioritizes signed-in continuity over anonymous first-paint layout shift). [`LandingAuthSlot`](src/app/(marketing)/_components/landing-auth-slot.tsx) probes session with `hasServerAuthSession` (read mechanics in [Auth & session](#auth--session) above) — anonymous visitors get Sign in / Sign up; signed-in visitors get shared [`AppHeaderAccountNav`](src/app/(app)/_components/app-header-account-nav.tsx) with `showOpenApp` (avatar account menu: Profile, Open app, Admin console when admin, Sign out) wrapped in [`ProfileDialogProvider`](src/app/(app)/_components/profile/profile-dialog-provider.tsx). Mobile signed-in chrome is [`LandingMobileHeaderChrome`](src/app/(marketing)/_components/landing-mobile-header-chrome.tsx) — hamburger for site nav plus header avatar; anonymous mobile keeps auth CTAs inside the sheet only. Marketing header avatar repaints after profile save via `persistField` → `router.refresh()` (`updateProfileAction` revalidates `(app)` layout only). All user-visible identity (name, description, logo, nav/social/legal links) is driven from [`src/config/site.ts`](src/config/site.ts); hero/features/proof-cta/tech-stack copy lives in [`src/config/landing-content.ts`](src/config/landing-content.ts) — re-skin from these two files.

### SEO & metadata

Metadata defaults (site name, title template, description) live in [`src/config/site.ts`](src/config/site.ts) with [`getSiteMetadata()`](src/config/site.ts) consumed by the root layout. Canonical base URL resolves via [`getSiteUrl()`](src/utils/site-url.ts): `NEXT_PUBLIC_SITE_URL` → `https://${VERCEL_URL}` → `http://localhost:3000`. Agent SEO wire-up and content standards: [`.cursor/rules/seo.mdc`](.cursor/rules/seo.mdc). Dynamic favicon via [`src/app/icon.tsx`](src/app/icon.tsx) — brand mark from [`src/utils/brand-mark-image.tsx`](src/utils/brand-mark-image.tsx) (`createBrandMarkImageResponse`, primary-filled square + `siteConfig.Logo`, shared `OG_COLORS` with OG template). Dynamic social preview images via the Next.js `opengraph-image.tsx` file convention — shared template in [`src/utils/og-image.tsx`](src/utils/og-image.tsx) (`createOgImageResponse`, primary-filled logo mark + site name header row, Inter SemiBold font at [`src/assets/fonts/Inter-SemiBold.ttf`](src/assets/fonts/Inter-SemiBold.ttf)); root fallback at [`src/app/opengraph-image.tsx`](src/app/opengraph-image.tsx) plus per-route segment files (e.g. [`src/app/auth/login/opengraph-image.tsx`](src/app/auth/login/opengraph-image.tsx)). Metadata image paths (`/icon`, nested `*/icon`, `/opengraph-image`, nested `*/opengraph-image`, same for `twitter-image`) bypass auth proxy via [`PROXY_MATCHER_PATTERN`](src/utils/proxy-matcher.ts) matcher carve-out (asset class, not a third public route). Landing page (`/`) is indexable with `alternates.canonical: '/'`; auth, `(app)`, and admin route-group layouts export `robots: { index: false, follow: false }`; per-page titles on auth screens, `/home`, and admin pages. Opinionated robots policy via [`src/app/robots.ts`](src/app/robots.ts) and [`buildRobotsConfig()`](src/utils/robots-policy.ts) — default allow `/`, disallow training crawlers (GPTBot, ClaudeBot, CCBot, Google-Extended, Applebot-Extended), sitemap reference. Dynamic sitemap at [`src/app/sitemap.ts`](src/app/sitemap.ts) via [`buildSitemapEntries()`](src/utils/sitemap-routes.ts) — routes from [`discoverMarketingRoutes()`](src/utils/discover-app-routes.ts) on the `(marketing)` route group only (auth/app/admin never listed). Landing page JSON-LD via [`getOrganizationWebSiteJsonLd()`](src/utils/structured-data.ts) (`Organization` + `WebSite` from site config).

### Design system & theming

tweakcn **Clean Slate** default theme in `src/app/globals.css`; semantic tokens via `@theme inline` + `next-themes` class-based light/dark — status colors include `destructive`, `success`, and `warning` (each with a foreground pair) across light and dark. **Inter** + **JetBrains Mono** via `next/font` (Merriweather CSS serif fallback). UI primitives in `src/components/ui/` (accordion, alert-dialog, avatar, badge, breadcrumb, button, card, checkbox, dialog, dropdown-menu, form, input, label, separator, select, sheet, sidebar, skeleton, sonner, table, textarea, toggle, toggle-group, tooltip) — sidebar implementation split under [`src/components/ui/sidebar/`](src/components/ui/sidebar/) and re-exported from [`sidebar.tsx`](src/components/ui/sidebar.tsx). See [DESIGN.md](DESIGN.md) for architecture and re-skin workflow.

### Error handling & feedback

Errors are classified by `kind: 'operational' | 'fault'` on [`AppError`](src/types/app-error.ts). [`AppErrorSurface`](src/components/app-error-surface.tsx) branches typed errors to [`InlineError`](src/components/inline-error.tsx) (operational) or [`ErrorPanel`](src/components/error-panel.tsx) (fault — destructive icon/message, neutral code chip when present, labeled Copy) — auth forms, profile, password section, and admin user mutations use it rather than hand-written ternaries. Server actions return a typed response envelope (`{success, data}` / `{success: false, error}`). Route-level fault boundaries at [`src/app/admin/error.tsx`](src/app/admin/error.tsx) and [`src/app/auth/error.tsx`](src/app/auth/error.tsx) render `ErrorPanel` with retry and escape links. Toasts (sonner via shadcn [`Toaster`](src/components/ui/sonner.tsx) with icons from [`toast-icon-config`](src/utils/toast-icon-config.tsx), [`showSuccessToast`](src/utils/app-toast.ts)) are for success confirmations only — errors always render inline or in a panel, never as a toast (see [`.cursor/rules/error-handling.mdc`](.cursor/rules/error-handling.mdc)).

### Security

Security headers via [`src/utils/security-headers.ts`](src/utils/security-headers.ts), wired through [`next.config.ts`](next.config.ts); CSP is report-only by default — flipping to enforcing (`CSP_ENFORCE=true`) requires nonce-based script handling, not just directive tightening (see the `// debt:` marker in that file). Avatar and redirect handling are covered under [App home & profile](#app-home--profile) and [Auth & session](#auth--session) above (`isOwnedAvatarStorageUrl`, `isSafeRedirect`).

### Data & storage

Seven custom migrations — filenames and per-table detail in [Data model](#data-model-summary) below. `avatars` storage bucket is public-read with owner-scoped write RLS. Types generated to [`src/types/database.types.ts`](src/types/database.types.ts) via `pnpm db:types`; domain aliases in [`src/types/profile.ts`](src/types/profile.ts), [`src/types/app-settings.ts`](src/types/app-settings.ts), and [`src/types/app-logs.ts`](src/types/app-logs.ts). Log persistence: [`appLog`](src/utils/app-logger.ts) (Next.js server contexts — deferred writes via `after()`, threshold from cached settings) and [`cliLog`](src/utils/app-logger-cli.ts) (CLI scripts — awaited writes, threshold loaded once); shared insert path [`persistAppLogRow`](src/utils/persist-app-log.ts) via service client. Browser call sites use [`clientLog`](src/utils/client-logger.ts) — immediate console mirror plus fire-and-forget POST to [`/api/client-logs`](src/app/api/client-logs/route.ts) (public, same-origin only, closed key registry in [`client-log-registry.ts`](src/config/client-log-registry.ts); relay forwards to `appLog` under `client-` tags — see [ADR-0007](docs/adr/ADR-0007-client-log-relay-unauthenticated.md)).

### Testing & data fetching

Vitest + React Testing Library (`src/test/`); Supabase/auth boundaries use `vi.mock` at module level; MSW v2 is a dev dependency with global setup deferred until HTTP handlers are needed (see [`.cursor/rules/testing.mdc`](.cursor/rules/testing.mdc)); unit/integration tests across auth, admin, profile, proxy, hooks, and utils; 80% coverage thresholds enforced via `pnpm test:ci`; ESLint enforces snapshot ban, unquarantined-skip quarantine, and test-scope file naming in test files. TanStack Query v5 provider configured for client-side data fetching; devtools lazy-loaded via [`react-query-devtools.tsx`](src/providers/react-query-devtools.tsx).

---

## Data model (summary)

**Custom migrations:** 7 — [`20260622120000_create_profiles.sql`](supabase/migrations/20260622120000_create_profiles.sql), [`20260623120000_create_avatars_bucket.sql`](supabase/migrations/20260623120000_create_avatars_bucket.sql), [`20260715003530_admin_list_users.sql`](supabase/migrations/20260715003530_admin_list_users.sql), [`20260715004901_admin_list_users_banned_sort.sql`](supabase/migrations/20260715004901_admin_list_users_banned_sort.sql), [`20260715175218_admin_list_users_show_banned_filter.sql`](supabase/migrations/20260715175218_admin_list_users_show_banned_filter.sql), [`20260716041928_create_app_settings.sql`](supabase/migrations/20260716041928_create_app_settings.sql), [`20260717234520_create_app_logs.sql`](supabase/migrations/20260717234520_create_app_logs.sql)

| Entity | Table / bucket | Notes |
| ------ | -------------- | ----- |
| User | `auth.users` | Supabase built-in; available via auth |
| App settings | `public.app_settings` | Admin-editable runtime configuration keyed by the code registry ([`app-settings-registry.ts`](src/config/app-settings-registry.ts)). Columns: `key` (PK), `value` (jsonb), `updated_at`. Absent keys resolve to registry defaults at read time. Admin-only RLS (SELECT/INSERT/UPDATE). Reads: [`resolveAppSettings`](src/utils/app-settings.ts) (uncached, service client — CLI and non-Next callers) and [`getResolvedAppSettings`](src/utils/app-settings.ts) (tagged `unstable_cache` per [ADR-0006](docs/adr/ADR-0006-settings-reads-cached-under-one-coarse-tag.md)). Saves: [`saveAppSettingAction`](src/app/admin/settings/_lib/actions.ts). Types: [`app-settings.ts`](src/types/app-settings.ts). |
| App logs | `public.app_logs` | Durable application log rows written by [`persistAppLogRow`](src/utils/persist-app-log.ts) (service client INSERT; failures silent-drop). Columns: `id` (identity PK), `level` (`debug`/`info`/`warn`/`error`), `tag`, `message`, `context` (jsonb, nullable), `created_at`. Admin-only SELECT RLS — no authenticated INSERT/UPDATE/DELETE policies. Index `(created_at desc, id desc)` for cursor paging. Wrappers: [`appLog`](src/utils/app-logger.ts), [`cliLog`](src/utils/app-logger-cli.ts). Types: [`app-logs.ts`](src/types/app-logs.ts). |
| Admin user list | `public.admin_list_users` | `SECURITY DEFINER` RPC — paginated, sortable admin listing over `auth.users` (email, verification, created, last sign-in, role, `banned_until`); optional `p_show_banned` filter excludes currently-banned users when false (unified `is_currently_banned` predicate shared by filter and sort); in-function admin gate via `auth.jwt()` `app_metadata.role`; static sort allowlist; `EXECUTE` granted to `authenticated` only. Called from [`list-admin-users.ts`](src/app/admin/users/_lib/list-admin-users.ts). |
| Profile | `public.profiles` | 1:1 with `auth.users` (`profiles.id` FK). Columns: `display_name`, `avatar_url`, `bio` (all nullable). **No `role` column** — admin gate stays on `app_metadata.role`. Auto-created on signup via `handle_new_user` trigger; backfills existing users. Owner-scoped RLS: authenticated SELECT/UPDATE own row only (`using` + `with check` on UPDATE). Types: [`Profile`](src/types/profile.ts). |
| Avatar files | `storage.avatars` | Public-read bucket; path `{user_id}/avatar.webp`. Owner-scoped INSERT/UPDATE/DELETE on `storage.objects` (first path segment = `auth.uid()`); public SELECT policy required for upsert. Versioned public URL stored in `profiles.avatar_url` (e.g. `…/avatar.webp?v={timestamp}`); server action rejects external or other-user URLs via [`isOwnedAvatarStorageUrl`](src/utils/avatar-cache-bust.ts). Upload: [`avatar-storage.ts`](src/utils/avatar-storage.ts). |

Schema authority for shipped tables lives in this section once migrations land. Do not duplicate per-table detail in PRDs or ROADMAP.

---

## Where things live

Directory-level map. File-level detail lives in the [Implemented now](#implemented-now) prose links — not here.

| Path | Purpose |
| ---- | ------- |
| `src/app/(marketing)/` | Public marketing routes (`/`, `/reference`, `/workflow`, `/terms`, `/privacy`) |
| `src/app/(app)/` | Authenticated user surfaces (`/home`; profile settings modal) with shared marketing chrome |
| `src/app/admin/` | Admin console (`/admin`, `/admin/users`, `/admin/settings`) |
| `src/app/auth/` | Auth screens, shared layout, confirm route |
| `src/app/api/` | Route handlers (`/api/client-logs` client log relay) |
| `src/app/globals.css` | Global styles and CSS variable tokens (authoritative token values) |
| `src/components/ui/` | Owned shadcn primitives (sidebar decomposed under `ui/sidebar/`) |
| `src/components/` | App components and shared chrome (site header/footer/container, error UI, data-table shell) |
| `src/components/kibo-ui/` | Vendored kibo-ui primitives (marquee) |
| `src/config/` | Product identity and landing content — re-skin surface |
| `src/constants/` | Route, storage, and admin-role constants |
| `src/hooks/` | Custom hooks |
| `src/providers/` | Client providers (TanStack Query + devtools) |
| `src/supabase/` | `client.ts`, `server.ts`, `service.ts` (secret key), `proxy.ts`, `require-auth.ts` |
| `proxy.ts` | Root auth proxy entry (delegates to `src/supabase/proxy.ts`) |
| `src/types/` | Shared types (`app-error.ts`, generated `database.types.ts`, `profile.ts`) |
| `src/utils/` | Shared utilities (auth error mapping, redirect/avatar guards, security headers, site URL, SEO helpers, admin helpers, toasts, env) |
| `src/test/` | Test utilities (`render` with providers) |
| `scripts/admin/` | Admin CLI (promote / demote / delete / list) |
| `supabase/migrations/` | SQL migrations (list in [Data model](#data-model-summary)) |
| `supabase/config.toml` | Supabase CLI project config |
| `ROADMAP.md` | Phase status and planning horizon stubs |
| `LEXICON.md` | Architectural vocabulary |
| `docs/DOC_RULES.md` | Doc roles and maintenance procedure |
| `docs/prds/` | Per-phase PRDs (`docs/prds/archive/` when shipped) |
| `docs/adr/` | Architecture Decision Records |
| `docs/research/` | Exploratory research briefs (`docs/research/README.md`; `docs/research/archive/` when retired) |
| `DESIGN.md` | Token architecture and re-skin workflow (names only — values in globals.css) |
| `.cursor/rules/` | Agent coding standards |
| `.cursor/skills/` | Agent workflows |

---

## Logging convention

Log level, tagging, and wrapper usage: [.cursor/rules/logging.mdc](.cursor/rules/logging.mdc).

---

## Checklist before merging

- [ ] Quality bar passes ([Agent workflow](#agent-workflow) step 3)
- [ ] New routes align with the auth boundary ([Hard constraints](#hard-constraints))
- [ ] New tables have RLS (when migrations exist)
- [ ] AGENTS.md / README updated if routes, schema, env, or scripts changed
- [ ] Human runs `pnpm db:push` after migrations (agents do not)

---

## Change protocol

| Change type | Action |
| ----------- | ------ |
| Hard constraints | Decided in PM/Claude chat with PM approval. Changing a hard constraint means changing its enforcement (check script, lint rule, or test) and the AGENTS.md [Hard constraints](#hard-constraints) list together — never the list alone. |
| Implemented features, routes, data model | Update AGENTS.md via `/sync-repo-docs` |
| Planning / roadmap | Update [ROADMAP.md](ROADMAP.md) and the active PRD in [docs/prds/](docs/prds/) |
| Coding standards | Update `.cursor/rules/` — not AGENTS.md |

Sync skills never initiate hard-constraint changes — they mirror changes already made through this protocol.
