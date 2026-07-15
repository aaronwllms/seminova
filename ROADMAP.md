# Seminova — Roadmap

The planning horizon: anticipated phases as thin stubs, plus living status. Shipped phase detail lives in [docs/archive/CONTEXT_ARCHIVE.md](docs/archive/CONTEXT_ARCHIVE.md); build-time workflow and authoritative schema in [AGENTS.md](AGENTS.md). Phase status vocabulary and PRD lifecycle in [docs/DOC_RULES.md](docs/DOC_RULES.md).

**Last updated:** 2026-07-15

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
| 12 | Observability & App Settings | `Ready` | [Phase 12 PRD](docs/prds/phase-12-observability-app-settings.prd.md) |

> [!NOTE]
> Phases 1–7 pre-date the per-phase PRD system, so their PRD column is empty; their shipped detail lives in [docs/archive/CONTEXT_ARCHIVE.md](docs/archive/CONTEXT_ARCHIVE.md). From Phase 8 on, shipped rows link the archived PRD per [docs/DOC_RULES.md](docs/DOC_RULES.md).

---

## Upcoming phases

Thin stubs for anticipated phases — intent and shape only; decomposition into epics happens at phase-planning time. This section is kept even when empty, so the next phase always has a home.

### Phase 12 — Observability & App Settings

Two related capabilities the template lacks today. **App settings:** a generic, admin-editable key/value settings store (persisted to a table, cached to avoid per-read DB hits) plus a settings admin page to browse and edit values — the first reusable config-toggle infrastructure future products inherit. **Log persistence & viewer:** persist the existing `console.*` taxonomy (`logging.mdc`) to a table via a thin custom wrapper, route every existing call site through it, and add a filterable, level-colored logs admin page. The debug on/off control is the settings store's first consumer — so settings infrastructure lands before the debug gate. Storage-approach fork now resolved: persist-to-table (not Vercel-stream relay), custom wrapper (not Pino/Winston — their transport model fits long-running processes, not Vercel's short-lived functions).

---

## Open questions / deferred decisions

Nothing here is blocking current work unless noted.

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
<summary>JWT expiration recurring failure (resolved)</summary>

**Problem:** `JWT has expired` recurred when display auth reads validated `exp` on the cookie-read access token after the proxy had already refreshed the session on the same request.

**Resolution:** [ADR-0005](docs/adr/ADR-0005-proxy-as-sole-session-authority.md) — proxy is the sole session gate and refresh authority; RSC display reads use `getDisplayAuthClaims()` with `getClaims(accessToken, { allowExpired: true })` (signature verified, exp tolerated, no refresh).

</details>
