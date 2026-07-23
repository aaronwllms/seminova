# Seminova — Roadmap

The planning horizon: anticipated phases as thin stubs, plus living status. Shipped phase detail lives in [docs/archive/CONTEXT_ARCHIVE.md](docs/archive/CONTEXT_ARCHIVE.md); build-time workflow and authoritative schema in [AGENTS.md](AGENTS.md). Phase status vocabulary and PRD lifecycle in [docs/DOC_RULES.md](docs/DOC_RULES.md).

**Last updated:** 2026-07-23

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
| 16 | Motion System & Table Fetch Feedback | `Active` | [Phase 16 PRD](docs/prds/phase-16-motion-system-table-fetch-feedback.prd.md) |
| 17 | Magic Link Auth | `Draft` | — |
| 18 | Blog Page | `Draft` | — |
| 19 | Pricing Page | `Draft` | — |

> [!NOTE]
> Phases 1–7 pre-date the per-phase PRD system, so their PRD column is empty; their shipped detail lives in [docs/archive/CONTEXT_ARCHIVE.md](docs/archive/CONTEXT_ARCHIVE.md). From Phase 8 on, shipped rows link the archived PRD per [docs/DOC_RULES.md](docs/DOC_RULES.md).

---

## Upcoming phases

Thin stubs for anticipated phases — intent and shape only; decomposition into epics happens at phase-planning time. This section is kept even when empty, so the next phase always has a home.

### 17 — Magic Link Auth
Add magic-link (passwordless email) sign-in, toggleable from admin settings. Open question: alongside password auth (user chooses) or eventual replacement — undecided, resolve at phase-planning. Research: [RESEARCH-0005](docs/research/RESEARCH-0005-magic-link-auth-ux-patterns.md) (leans alongside, not replacement).

### 18 — Blog Page
Add a `/blog` page, toggleable from admin settings (nav + route both respect the toggle). Content model TBD at phase-planning (MDX files vs DB-backed posts vs CMS).

### 19 — Pricing Page
Add a `/pricing` page, toggleable from admin settings. Static content vs plan-driven (tied to actual billing) TBD at phase-planning.

## Open questions / deferred decisions

Nothing here is blocking current work unless noted.

<details>
<summary>Focus / focus-visible instant motion carve-out</summary>

**Problem:** Tabbing through a form is the highest-traversal-rate interaction in the app, and a focus ring is an accessibility affordance rather than an aesthetic one — delay there is a real cost. Phase 16's motion tier rule applies uniformly, so focus transitions take a tier like any other state transition.
**Solution:** Carve focus and focus-visible states out of the tier system as instant — exempt them in the `local/motion-tier` ESLint rule and document the carve-out in DESIGN.md's Motion section.
_Defer until: after Phase 16 ships and the tier system has real usage_

</details>

<details>
<summary>Theme regeneration as skill vs mode</summary>

**Problem:** The "put a new spin on the design for this project" capability should not regenerate structure, only theme values.
**Solution:** Implement as a separate, theme-only skill distinct from the structure-establishing design-system skill.
_Defer until: unscoped — skill ships independently_

</details>

<details>
<summary>CSP enforcement (nonce strategy)</summary>

**Problem:** The template-default CSP ships report-only (`// debt:` marker in `security-headers.ts`, audit F053). Flipping to enforcing (`CSP_ENFORCE=true`) requires per-request nonce handling for Next.js inline bootstrap scripts — a design-and-build effort, deliberately excluded from Phase 8 remediation.
**Solution:** Not yet scoped. Implement per-request nonces in middleware, then tighten directives per product surface.
_Defer until: a future security phase_

</details>

<details>
<summary>Name / domain finalization</summary>

**Problem:** Name is Seminova; `.com` is contested (out-of-lane semiconductor/agriculture firms).
**Solution:** Plan to claim `seminova.dev` (or similar) and carry keywords in the repo description/topics rather than the name. Low priority.
_Defer until: opportunistic_

</details>

<details>
<summary>Remove temporary sharp override when Next ships ≥0.35</summary>

**Problem:** Stable Next.js 16.2.x still declares optional `sharp@^0.34.5`. Phase 14 Epic 7 cleared the libvips advisory with a temporary `pnpm-workspace.yaml` override (`sharp: ^0.35.3`). 16.3 canary/preview already ships `^0.35.3`, but no stable release does yet.
**Solution:** When a **stable** Next.js release first ships `sharp >= 0.35`, bump `next` (and related Next packages as needed), remove the `sharp` override, re-run `pnpm install` / `pnpm audit`, and smoke-check `/icon`, OG image routes, and `next/image` surfaces.
_Defer until: first stable Next.js release that depends on sharp ≥ 0.35_

</details>
