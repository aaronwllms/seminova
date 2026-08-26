# Seminova — Roadmap

The planning horizon: anticipated phases as thin stubs, plus living status. Uncommitted product ideas live in [BACKLOG.md](BACKLOG.md) until explicitly promoted to a phase here. Shipped phase detail lives in [docs/archive/CONTEXT_ARCHIVE.md](docs/archive/CONTEXT_ARCHIVE.md); workflow gates and hard constraints in [AGENTS.md](AGENTS.md); schema in `supabase/migrations/`. Phase status vocabulary and PRD lifecycle in [docs/DOC_RULES.md](docs/DOC_RULES.md).

**Last updated:** 2026-08-25

---

## Status

| Phase | Name | Status | PRD |
| ----- | ---- | ------ | --- |
| 1 | Foundation & Cleanup | `Shipped` | — |
| 2 | Design-System Token Layer | `Shipped` | — |
| 3 | App Shell (Admin sidebar) + Auth restyle | `Shipped` | — |
| 4 | Landing Page | `Shipped` | — |
| 5 | Admin Surface Polish & Toasting | `Shipped` | — |
| 6 | Data Model Foundation (profiles, admin namespace, authenticated shell, profile page) | `Shipped` | — |
| 7 | Security Audit Remediation | `Shipped` | — |
| 8 | Tech Debt Audit Remediation | `Shipped` | [Phase 8 PRD](docs/prds/archive/phase-8-tech-debt-remediation.prd.md) |
| 9 | SEO & GEO | `Shipped` | [Phase 9 PRD](docs/prds/archive/phase-9-seo-geo.prd.md) |
| 10 | App Home, Form Primitives & Reference Surfaces | `Shipped` | [Phase 10 PRD](docs/prds/archive/phase-10-app-home-reference-surfaces.prd.md) |
| 11 | Corrections & Hardening | `Shipped` | [Phase 11 PRD](docs/prds/archive/phase-11-corrections-hardening.prd.md) |
| 12 | Observability & App Settings | `Shipped` | [Phase 12 PRD](docs/prds/archive/phase-12-observability-app-settings.prd.md) |
| 13 | Realtime Logs & Session Refresh | `Shipped` | [Phase 13 PRD](docs/prds/archive/phase-13-realtime-logs-session-refresh.prd.md) |
| 14 | Tech Debt Hardening | `Shipped` | [Phase 14 PRD](docs/prds/archive/phase-14-tech-debt-hardening.prd.md) |
| 15 | Features Page & Landing Refresh | `Shipped` | [Phase 15 PRD](docs/prds/archive/phase-15-features-page-landing-refresh.prd.md) |
| 16 | Motion System & Table Fetch Feedback | `Shipped` | [Phase 16 PRD](docs/prds/archive/phase-16-motion-system-table-fetch-feedback.prd.md) |
| 17 | Instruction Budget & Doc Ownership | `Shipped` | [Phase 17 PRD](docs/prds/archive/phase-17-instruction-budget-doc-ownership.prd.md) |
| 18 | Banner Persistence & Dismissal | `Shipped` | [Phase 18 PRD](docs/prds/archive/phase-18-banner-persistence-dismissal.prd.md) |
| 19 | Surface Coherence & Border Tokens | `Shipped` | [Phase 19 PRD](docs/prds/archive/phase-19-surface-coherence-border-tokens.prd.md) |
| 20 | Magic Link Auth | `Planning` | [Phase 20 PRD](docs/prds/phase-20-magic-link-auth.prd.md) |

> [!NOTE]
> Phases 1–7 pre-date the per-phase PRD system, so their PRD column is empty; their shipped detail lives in [docs/archive/CONTEXT_ARCHIVE.md](docs/archive/CONTEXT_ARCHIVE.md). From Phase 8 on, shipped rows link the archived PRD per [docs/DOC_RULES.md](docs/DOC_RULES.md).

---

## Upcoming phases

Thin stubs for anticipated phases — intent and shape only; decomposition into epics happens at phase-planning time. A stub may carry its own open questions, which `phase-planning` resolves when the phase is decomposed. This section is kept even when empty, so the next phase always has a home.

### 20 — Magic Link Auth
Add magic link (passwordless email) as a peer authentication path alongside password auth — available for both signup and sign-in, not sign-in-only. New accounts can be created via magic link and stay passwordless indefinitely; password-created accounts can use either method interchangeably. Passwordless-created users need a path to set a first password (the existing change-password flow assumes one already exists). No admin toggle. Includes a features-content update.

Email carries both a link and a typed code — the code is the only fix for the wrong-browser failure (mobile mail clients open links in sandboxed in-app browsers, landing the session somewhere the user isn't). A confirm-step landing page fixes the scanner-burns-the-token failure but not this one; they aren't substitutes.

Email templates move from Supabase stock into version-controlled repo HTML files — confirm-signup, password-reset, and magic-link — so they are reviewable in PRs and inherited by spinoffs. No push tooling and no `config.toml` reconcile: templates are pasted into the dashboard once per project, noted in setup docs. Templates target `/auth/confirm` via `{{ .TokenHash }}` and `{{ .RedirectTo }}`, reviving that currently-unreachable route, with `emailRedirectTo`/`redirectTo` updated to match.

**Open questions:** production uses 8-character email OTPs (`otp_length`), not the conventional 6 — decide deliberately. `otp_expiry` is 3600s; guidance for sign-in tokens is 10–15 minutes.

Research: [RESEARCH-0005](docs/research/RESEARCH-0005-magic-link-auth-ux-patterns.md).
