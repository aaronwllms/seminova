# BACKLOG.md — Product Idea Backlog

Unscheduled product ideas — not committed, not ordered, no PRD.
Distinct from [ROADMAP.md](ROADMAP.md) (confirmed, numbered, sequenced phases) and
[docs/WORKFLOW_BACKLOG.md](docs/WORKFLOW_BACKLOG.md) (deferred decisions about the
workflow system itself, not product scope).

**Promotion:** an idea moves to ROADMAP.md as a numbered phase stub only when the PM
explicitly commits it in a planning conversation — no automatic trigger. (Mental filter
for deciding: would I build this in the next 2-3 phases if nothing else changed? Yes →
propose promoting it. No/unsure → leave it here.)

---

## Blog Page

**What:** Add a `/blog` page. Publish-without-deploy is a requirement, which rules out
MDX and means DB-backed posts with admin authoring UI (editor, draft/published states,
slugs) — larger than a route addition.
**Why backlog, not ROADMAP:** Not confirmed as something we're building.
**Notes:** Deletable as an optional module if unwanted (see ROADMAP.md's optional
module contract).

---

## Pricing Page

**What:** Add a `/pricing` page. Static content vs plan-driven (tied to billing) still
undecided.
**Why backlog, not ROADMAP:** Not confirmed as something we're building.
**Notes:** Inherits the same deletable-optional-module shape as Blog.

---

## Optional module contract

**What:** A contract for making features deletable if unwanted (Blog, Pricing). Removal
spans more than a directory — it touches a migration, one or more directories, and
line-edits to shared files the feature registers with (nav links, settings registry,
sitemap, generated Supabase types).
**Why backlog, not ROADMAP:** Not yet scoped, and only worth designing once there's
something to design it against.
**Notes:** Options include a self-registering manifest pattern vs. documented per-feature
removal steps run through `initialize-project`. Candidate for a LEXICON entry and/or ADR
once the shape settles. Revisit when a second optional feature exists.

---

## Name / domain finalization

**What:** Claim `seminova.dev` (or similar) and carry keywords in the repo description and
topics rather than in the name itself.
**Why backlog, not ROADMAP:** Low priority, opportunistic — not confirmed as something
we're doing.
**Notes:** Name is Seminova; the `.com` is contested by out-of-lane semiconductor and
agriculture firms.

---

## Slim AGENTS.md (instruction budget)

**What:** Cut AGENTS.md down to content that earns every-request load — hard constraints,
agent workflow gates, merge checklist, change protocol — and stop the doc system from
refilling it. Findings and per-section verdicts are in [AGENTS_AUDIT.md](AGENTS_AUDIT.md)
(first full pass 2026-08-06: 24 open findings; ~0.9% staleness, so this is a budget
problem, not a drift problem). Decision made: slim-AGENTS (AG022 option A).

**Why backlog, not ROADMAP:** Decided but not scheduled; sizing is an open question — the
generator fix is small and the deletions are large but mechanical, so this may be one
phase or a phase plus a slice.

**Notes:**

- **Ordering constraint:** fix the generator before deleting anything. `sync-repo-docs` is
  the one skill that auto-invokes, and it is currently instructed to write shipped
  features, routes, and schema back into AGENTS.md. Deleting first just loops.
- **Scope, four files:** `docs/DOC_RULES.md` (roles table AGENTS.md row, rule 3 schema
  authority, sync-order line, audit-artifacts row) → `.cursor/skills/sync-repo-docs/SKILL.md`
  (Step 3 ownership row, three Step 2 drift patterns, Step 4 migration count, Step 1
  evidence row, one anti-pattern) → `.cursor/skills/sync-repo-docs/reference.md` (four
  AGENTS.md section-map rows, four audit-checklist entries, examples A and B) → AGENTS.md
  itself (change-protocol row, then the AG deletions).
- **Dependency not in AGENTS_AUDIT.md:** DOC*RULES' sync-order line has ROADMAP and PRD
  status updates reading shipped truth \_out of* AGENTS.md. That chain breaks unless those
  updates are repointed at code and git in the same pass.
- **No new home needed for the deleted content.** The code is the agent-facing reference;
  whys already live in ADRs, `.cursor/rules/`, and LEXICON; the human-facing feature list
  already exists as `src/config/features-content.ts` rendered at `/features`.
- Audit skill is `/audit-agents-md` (`.cursor/skills/audit-agents-md/`), added 2026-08-06.

---

## Banner persistence setting

**What:** Add a persistence field to each banner setting (`banner_public`, `banner_authenticated`)
controlling whether a live banner pins or scrolls away, and whether it can be dismissed.
`persistent` stays in view while scrolling and shows no dismiss control; `dismissible` scrolls
with page content and shows the X. Today both behaviors are hardcoded per shell rather than
configured: the public banner is pinned and dismissible, the authenticated banner scrolls away
and is not dismissible in any durable sense.

**Why backlog, not ROADMAP:** Settings-schema change plus a migration and admin UI work — well
outside the header-polish epic that surfaced it. Not confirmed as something we're building next.

**Notes:**

- **Don't derive persistence from `variant`.** Considered and rejected: `variant` means tone,
  persistence means whether the user can afford to miss the message, and the two come apart
  (a red "maintenance finished, re-sync your data" needn't pin; a blue "action required by
  Friday" should). Atlassian's own announcement-banner admin ships a color control and a
  separate dismissible toggle for this reason. Use `variant` as the *default* instead —
  destructive and warning default to `persistent`, primary/success/info default to
  `dismissible` — and keep it overridable.
- **Pattern research (2026-08-22):** stickiness tracks severity, not shell. Carbon states
  banners are not sticky and scroll with page content, placing system-wide messages below the
  main header. Atlassian reserves the pinned top-of-screen banner for critical system-level
  messaging about loss of data or functionality. Polaris: dismissible unless the banner carries
  critical information or a required step.
- **Current state is inverted against that pattern.** The public banner (feature announcements,
  dismissible) pins; the authenticated banner (warning-shaped, non-dismissible) scrolls away.
- **Prerequisite:** `AuthenticatedBannerSlot` passes `dismissible` but never writes a cookie, so
  authenticated dismissal doesn't survive a reload. Making persistence configurable requires real
  dismissal plumbing there, mirroring `BANNER_DISMISSED_PUBLIC_COOKIE`.
- **Placement question, related but separable:** both shells render the banner above the header.
  That's the right convention for a marketing announcement bar; it's arguably wrong for an
  authenticated system message, which Carbon would place below the nav.
- Surfaced while planning the header-polish epic, which made the public banner scroll away —
  correct for an announcement bar, but it hardcodes what should be a setting.

---
