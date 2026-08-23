# PRD — Phase 18: Banner Persistence & Dismissal

**Status:** `Shipped`
**Last updated:** 2026-08-22

---

## Problem

Whether a banner stays in view and whether a user can close it are both hardcoded per shell rather than configured per banner. Today both banners render above a sticky header, so both scroll away; the public banner is dismissible with a durable cookie, while the authenticated banner accepts a dismiss control that only holds for the current page view — a reload brings it back.

That leaves no way to publish a message a user cannot afford to miss. The severity of a message and the surface it appears on are independent, but only the surface currently decides how the banner behaves.

This PRD was fully grilled in a planning chat before decomposition into epics/stories.

## Goal

Add a per-banner persistence setting with two values — `persistent` (stays in view while scrolling, no dismiss control) and `dismissible` (scrolls with the page, closable) — configurable by an admin on each banner setting, and make authenticated dismissal durable so `dismissible` means the same thing on both surfaces.

The organizing principle: **persistence follows severity, not surface.** A banner pins because the message can't be missed, not because it happens to be on the marketing page.

## Out of scope

- **Deriving persistence from `variant`, in either direction.** `variant` is tone; persistence is whether the message can be missed, and they come apart. A variant-keyed *default map* was designed and then rejected during planning: it would silently change the behavior of banners already live in a spinoff's database on deploy. The default is a flat `dismissible`, matching current behavior, so shipping this is a no-op until an admin opts in. Guidance for admins lives in help copy on the control, not in code.
- **Banners on the admin console.** No banner slot renders under `/admin/**` today. Whether the admin console is a third banner surface or part of "authenticated" is its own decision.
- **Moving the banner below the header.** Carbon places system messages under the nav; the current above-header placement is the right convention for a marketing announcement bar. Separable from persistence, and unchanged here.
- **Per-account dismissal in the database.** Dismissal stays a cookie. A DB-backed record would put a per-user query on every authenticated page render for ephemeral UI state. The accepted cost: dismissal is per-browser, so signing in elsewhere re-shows the banner.
- **A LEXICON entry for persistence.** One field on one feature — it doesn't recur across rules, skills, and code the way LEXICON entries do.
- **Representing pinning in the admin preview.** The preview will show the dismiss control appear and disappear, but it can't demonstrate scroll behavior; it isn't a scrollable page.

---

## Epics & stories

### Epic 1: Durable authenticated dismissal `Complete`

- **1.1 Dismissing the authenticated banner makes it stay dismissed.** A signed-in user who closes the authenticated banner does not see it again after a reload, and sees it again when an admin publishes new banner copy. This mirrors the mechanism already proven on the public banner — a dismissal cookie keyed to a content hash of the banner's headline and detail — rather than inventing a second approach. The public banner's behavior is unchanged.

*Success:*

- Dismissing the authenticated banner and reloading does not re-show it.
- Changing the authenticated banner's headline or detail re-shows it to a user who had dismissed the previous copy.
- The public banner's dismissal behavior is unchanged.
- `pnpm pre-push` is green.

### Epic 2: Persistence as a banner setting `Complete`

- **2.1 An admin chooses each banner's persistence.** The banner settings form gains a persistence control alongside the existing variant and icon controls, with help copy stating that persistent banners stay in view and cannot be dismissed, and are for messages a user can't afford to miss. The setting saves and reloads like every other banner field. Banner settings already stored without this field must continue to load — the field resolves to `dismissible` when absent, with no data migration and no backfill, because the template is cloned into databases that will never run one. The `/features` inventory's banners-admin entry names persistence among what an admin can configure.

- **2.2 A live banner honors its persistence setting.** The dismiss control on a live banner is present only when that banner is set to `dismissible`, on both the public and authenticated surfaces, replacing today's hardcoded always-dismissible behavior. A banner set to `persistent` ignores any stored dismissal, so a banner escalated from dismissible to persistent reaches users who had already closed it — its content, and therefore its dismissal key, hasn't changed. Flipping back to `dismissible` honors the earlier dismissal again.

*Success:*

- An admin can set either banner to `persistent` or `dismissible` and the choice survives a reload.
- A `persistent` banner renders no dismiss control on either surface; a `dismissible` one does.
- A banner setting saved before this phase loads without error and behaves as `dismissible`.
- A user who dismissed a banner sees it again once it is switched to `persistent`, and does not see it again when it is switched back.
- `pnpm pre-push` is green.

### Epic 3: Pinned rendering `Complete`

- **3.1 A persistent banner stays in view while the page scrolls.** On both the marketing and authenticated surfaces, a banner set to `persistent` remains visible as the user scrolls, together with the header, rather than scrolling away above it. A `dismissible` banner scrolls away exactly as it does today.

  Two constraints that are not inferable from the code: the banner and header must pin as a single unit rather than the banner pinning independently — banner height varies with detail copy and mobile wrapping, and a separately-pinned banner would require measuring that height to offset the header. And the header's scrolled-state treatment currently keys off a sentinel element positioned relative to the header alone; when the two pin together, that treatment applies to the combined surface, which is intended but is a visible change to the marketing page's scroll appearance.

*Success:*

- A `persistent` banner remains visible after scrolling on both surfaces; a `dismissible` one does not.
- The header's scrolled-state border and backdrop still appear on scroll, with no banner live.
- No layout gap or overlap between banner and header at any viewport width, with a banner long enough to wrap.
- `pnpm pre-push` is green.

---

## Notes

- **Epic 1 precedes Epic 2.** Until authenticated dismissal is durable, setting the authenticated banner to `dismissible` would promise behavior the code doesn't deliver.
- **Epic 3 follows Epic 2** — it renders a setting that must exist first. Between them, choosing `persistent` correctly removes the dismiss control but does not yet pin; that intermediate state is expected.
- **Persistence is one field, not two.** Pinning and dismissibility are bundled deliberately: every design system consulted moves them together, and splitting them into independent controls buys a combination nobody asked for at the cost of a second control on the form. A spinoff wanting a pinned-but-closeable announcement bar splits the field — a cheap change.
- **ADR candidates:** none. Reversing the bundling, the flat default, or the cookie-over-database choice is all cheap.
