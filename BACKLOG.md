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
