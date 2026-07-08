# Seminova — Roadmap

The planning horizon: anticipated phases as thin stubs, plus living status. Shipped phase detail lives in [docs/archive/CONTEXT_ARCHIVE.md](docs/archive/CONTEXT_ARCHIVE.md); build-time workflow and authoritative schema in [AGENTS.md](AGENTS.md). Phase status vocabulary and PRD lifecycle in [docs/DOC_RULES.md](docs/DOC_RULES.md).

**Last updated:** 2026-07-07

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
| 10 | Pattern Reference Page | `Draft` | — |

> [!NOTE]
> Phases 1–7 pre-date the per-phase PRD system, so their PRD column is empty; their shipped detail lives in [docs/archive/CONTEXT_ARCHIVE.md](docs/archive/CONTEXT_ARCHIVE.md). From Phase 8 on, shipped rows link the archived PRD per [docs/DOC_RULES.md](docs/DOC_RULES.md).

---

## Upcoming phases

### Phase 10 — Pattern Reference Page `Draft`

A dedicated page that demonstrates the canonized component patterns established across prior phases: data table, error states (operational `InlineError` + fault `ErrorPanel`), skeleton loading, toast, and the form/settings pattern (from Phase 6). The page imports and showcases the real, already-established components — it does not reimplement them.

It is explicitly deletable scaffolding: deleting it loses zero canonical pattern, since every pattern it demonstrates is established in real code elsewhere (admin users table, profile page, etc.). Sequenced after Phase 6 so it can show the form/profile pattern alongside everything from Phase 5, rather than shipping thin now and needing a follow-up addition later.

Also folds in the **PM/agent workflow explainer page** (moved here from open questions): a click-through page off the landing surface explaining Seminova's two differentiators:

- The agent-ready conventions (`AGENTS.md` + `.cursor/rules/` + `.cursor/skills/`)
- The PM/agent collaboration model (the Claude Desktop planning setup, MCP, and paired skills)

A one-line landing card for each doesn't convey how either works. Whether the explainer co-ships with the pattern reference or broadens this phase's name/scope is settled at Phase 10 planning.

---

## Open questions / deferred decisions

Nothing here is blocking current work unless noted.

<details>
<summary>Theme regeneration as skill vs mode</summary>

**Problem:** The "put a new spin on the design for this project" capability should not regenerate structure, only theme values.
**Solution:** Implement as a separate, theme-only skill distinct from the structure-establishing design-system skill.
_Defer until: Phase 10_

</details>

<details>
<summary>CSP enforcement (nonce strategy)</summary>

**Problem:** The template-default CSP ships report-only (`// debt:` marker in `security-headers.ts`, audit F053). Flipping to enforcing (`CSP_ENFORCE=true`) requires per-request nonce handling for Next.js inline bootstrap scripts — a design-and-build effort, deliberately excluded from Phase 8 remediation.
**Solution:** Not yet scoped. Implement per-request nonces in middleware, then tighten directives per product surface.
_Defer until: a future security phase_

</details>

<details>
<summary>Profile settings as a modal</summary>

**Problem:** The profile settings surface could work better as a modal than a dedicated page — keeping the current blur-save / upload-on-complete save models, which suit a dismissable container well (no unsaved state to lose). But `/profile` is currently `APP_HOME`: non-admins land there after login, so a modal conversion first requires a real app home to exist.
**Solution:** Not yet scoped. Depends on APP_HOME diverging from the profile path; revisit when a genuine app home surface is planned.
_Defer until: a real app home exists_

</details>

<details>
<summary>Admin Logging page</summary>

**Problem:** Warn/error/info/debug logs now have a canonical taxonomy (`logging.mdc`), but they currently only surface in Vercel's log viewer — there's no in-app way to browse them. A dedicated admin page (filterable by level, color-coded — e.g. debug in green) would make this template-level convention actually visible and useful day-to-day.
**Solution:** Not yet scoped. Needs a data-storage decision first — whether to read/relay Vercel's log stream, or persist log entries to a table — before this can become a real epic.
_Defer until: unscoped — revisit when a storage approach is decided_

</details>

<details>
<summary>Name / domain finalization</summary>

**Problem:** Name is Seminova; `.com` is contested (out-of-lane semiconductor/agriculture firms).
**Solution:** Plan to claim `seminova.dev` (or similar) and carry keywords in the repo description/topics rather than the name. Low priority.
_Defer until: opportunistic_

</details>

<details>
<summary>Admin shell feature copy revisit</summary>

**Problem:** Feature card #4's punchline ("start building your product, not your login screen") implies login/auth is the thing skipped, but the actual content is the admin shell + role gating. As more reference surfaces ship (Phase 5+), this card should describe the fuller set of packaged components available, not just admin shell.
**Solution:** Revisit copy now that Phase 5 reference surfaces (error, loading, toast, in-app promote/demote) are shipped.
_Defer until: opportunistic_

</details>

<details>
<summary>Deterministic a11y enforcement (h1 / alt / heading order)</summary>

**Problem:** `ui-accessibility.mdc` ships as guidance only — no `check:*` script. Several of its standards are genuinely deterministic and lintable: exactly one `<h1>` per page, images carry non-empty `alt`, headings nest in order without skipping levels. Nothing enforces them today, so an agent can violate them silently. Surfaced during Phase 9 planning, where SEO deliberately declined to add an SEO-only lint for these (they're a11y's domain, not SEO's).
**Solution:** Not yet scoped. Add a `check:a11y` (lint-based) covering the deterministic subset, leaving subjective a11y (contrast intent, screen-reader UX) as guidance. Enforcement decision belongs with the a11y rule, not SEO.
_Defer until: unscoped — revisit when prioritizing rule-enforcement hardening_

</details>
