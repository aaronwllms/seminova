# Seminova — Roadmap

The planning horizon: anticipated phases as thin stubs, plus living status. Shipped phase detail lives in [docs/archive/CONTEXT_ARCHIVE.md](docs/archive/CONTEXT_ARCHIVE.md); build-time workflow and authoritative schema in [AGENTS.md](AGENTS.md). Phase status vocabulary and PRD lifecycle in [docs/DOC_RULES.md](docs/DOC_RULES.md).

**Last updated:** 2026-07-05

---

## Status

| Phase | Name                                                                                 | Status    | PRD |
| ----- | ------------------------------------------------------------------------------------ | --------- | --- |
| 1     | Foundation & Cleanup                                                                 | `Shipped` | —   |
| 2     | Design-System Token Layer                                                            | `Shipped` | —   |
| 3     | App Shell (Admin sidebar) + Auth restyle                                             | `Shipped` | —   |
| 4     | Landing Page                                                                         | `Shipped` | —   |
| 5     | Admin Surface Polish & Toasting                                                      | `Shipped` | —   |
| 6     | Data Model Foundation (profiles, admin namespace, authenticated shell, profile page) | `Shipped` | —   |
| 7     | Security Audit Remediation                                                           | `Shipped` | —   |
| 8     | Tech Debt Audit Remediation                                                          | `Shipped` | [docs/prds/archive/phase-8-tech-debt-remediation.prd.md](docs/prds/archive/phase-8-tech-debt-remediation.prd.md) |
| 9     | SEO & GEO                                                                            | `Draft`   | —   |
| 10    | Pattern Reference Page                                                               | `Draft`   | —   |
| 11    | Agent Tooling: Skills Suite                                                          | `Draft`   | —   |

_Phases 1–7 pre-date the per-phase PRD system, so their PRD column is empty; their shipped detail lives in [docs/archive/CONTEXT_ARCHIVE.md](docs/archive/CONTEXT_ARCHIVE.md). From Phase 8 on, shipped rows link the archived PRD per [docs/DOC_RULES.md](docs/DOC_RULES.md)._

**Active phase:** none — next up is Phase 9 (SEO & GEO, `Draft`).

---

## Upcoming phases

### Phase 9 — SEO & GEO `Draft`

Not yet scoped. Covers traditional SEO (metadata, sitemap, structured data) and GEO (generative-engine optimization — how the product surfaces in AI assistant answers) for the marketing/landing surface shipped in Phase 4. No hard sequencing dependency beyond Phase 4 being shipped.

### Phase 10 — Pattern Reference Page `Draft`

A dedicated page that demonstrates the canonized component patterns established across prior phases: data table, error states (operational `InlineError` + fault `ErrorPanel`), skeleton loading, toast, and the form/settings pattern (from Phase 6). The page imports and showcases the real, already-established components — it does not reimplement them. It is explicitly deletable scaffolding: deleting it loses zero canonical pattern, since every pattern it demonstrates is established in real code elsewhere (admin users table, profile page, etc.). Sequenced after Phase 6 so it can show the form/profile pattern alongside everything from Phase 5, rather than shipping thin now and needing a follow-up addition later.

### Phase 11 — Agent Tooling: Skills Suite `Draft`

Finalize the generic (de-specialized) skills suite: a design-critique skill, a design-system skill (establish-structure + audit + AI-slop detection), and a separate theme "regenerate" skill. Skills land at the end because they operate on the token layer (Phase 2) and the reference surfaces (Phases 3–10). Rules correctness is handled in Phase 1; this phase includes only a light final pass to confirm the rules set is still complete and project-agnostic.

---

## Open questions / deferred decisions

Nothing here is blocking current work unless noted.

### Theme regeneration as skill vs mode

**Problem:** The "put a new spin on the design for this project" capability should not regenerate structure, only theme values.
**Solution:** Implement as a separate, theme-only skill distinct from the structure-establishing design-system skill.
_Defer until: Phase 10_

### CSP enforcement (nonce strategy)

**Problem:** The template-default CSP ships report-only (`// debt:` marker in `security-headers.ts`, audit F053). Flipping to enforcing (`CSP_ENFORCE=true`) requires per-request nonce handling for Next.js inline bootstrap scripts — a design-and-build effort, deliberately excluded from Phase 8 remediation.
**Solution:** Not yet scoped. Implement per-request nonces in middleware, then tighten directives per product surface.
_Defer until: a future security phase_

### Profile settings as a modal

**Problem:** The profile settings surface could work better as a modal than a dedicated page — keeping the current blur-save / upload-on-complete save models, which suit a dismissable container well (no unsaved state to lose). But `/profile` is currently `APP_HOME`: non-admins land there after login, so a modal conversion first requires a real app home to exist.
**Solution:** Not yet scoped. Depends on APP_HOME diverging from the profile path; revisit when a genuine app home surface is planned.
_Defer until: a real app home exists_

### Admin Logging page

**Problem:** Warn/error/info/debug logs now have a canonical taxonomy (`logging.mdc`), but they currently only surface in Vercel's log viewer — there's no in-app way to browse them. A dedicated admin page (filterable by level, color-coded — e.g. debug in green) would make this template-level convention actually visible and useful day-to-day.
**Solution:** Not yet scoped. Needs a data-storage decision first — whether to read/relay Vercel's log stream, or persist log entries to a table — before this can become a real epic.
_Defer until: unscoped — revisit when a storage approach is decided_

### Name / domain finalization

**Problem:** Name is Seminova; `.com` is contested (out-of-lane semiconductor/agriculture firms).
**Solution:** Plan to claim `seminova.dev` (or similar) and carry keywords in the repo description/topics rather than the name. Low priority.
_Defer until: opportunistic_

### PM/agent workflow explainer page

**Problem:** The landing page names both halves of Seminova's core differentiator — agent-ready conventions and the PM/agent collaboration model — but a one-line card each doesn't explain how either actually works. Someone who clones the template should be able to click through and understand the mechanics, not read a README.
**Solution:** Not yet scoped. Likely a dedicated in-app page (not a doc) reachable from the landing page, with two threads: (1) agent-ready conventions — how AGENTS.md + `.cursor/rules/` + `.cursor/skills/` keep any coding agent's output consistent; (2) PM/agent collaboration model — the Claude Desktop planning setup, MCP, and paired skills that turn a plan into agent-ready work. Needs its own epic to define content and layout.
_Defer until: unscoped — revisit when prioritizing landing UX expansions_

### Admin shell feature copy revisit

**Problem:** Feature card #4's punchline ("start building your product, not your login screen") implies login/auth is the thing skipped, but the actual content is the admin shell + role gating. As more reference surfaces ship (Phase 5+), this card should describe the fuller set of packaged components available, not just admin shell.
**Solution:** Revisit copy now that Phase 5 reference surfaces (error, loading, toast, in-app promote/demote) are shipped.
_Defer until: opportunistic_
