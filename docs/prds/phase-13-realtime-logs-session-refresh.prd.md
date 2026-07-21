# PRD — Phase 13: Realtime Logs & Session Refresh

**Status:** `Active`
**Last updated:** 2026-07-21

---

## Problem

The admin logs page shows persisted rows but only updates on reload — an admin triaging live activity has to manually refetch to see new entries, which is the wrong interaction for a monitoring surface. Adding a live feed via Supabase Realtime requires the browser to hold a long-lived authenticated subscription, but the current session model disables browser token auto-refresh entirely — the proxy is the sole refresh authority ([ADR-0005](../adr/ADR-0005-proxy-session-gate-two-authority-refresh.md)). A Realtime socket left without a fresh token silently drops when the access token expires (~1 hour), so the feed can't be built without first resolving how the browser keeps its token fresh.

[RESEARCH-0004](../research/RESEARCH-0004-supabase-realtime-session-refresh-nextjs.md) investigated this and recommends re-enabling default browser auto-refresh — the model Supabase's SSR + Realtime docs assume — now safe because the third refresh authority that caused the original refresh-token race (server-component-path refresh) has already been removed, returning the app to the two-authority model Supabase's built-in mitigations are designed for.

Separately, the admin users page has the same reload-to-see-changes staleness for a lower-stakes case (another admin's ban or promotion), warranting a lighter freshness mechanism than a live feed.

This PRD was fully grilled in a planning chat before decomposition into epics/stories.

## Goal

Give the admin logs page a live feed via Supabase Realtime — new rows appear without reload, respecting active filters — built on a browser session that refreshes its own token so the subscription stays alive. Bring the admin users page to a lighter freshness tier (refetch-on-focus) in the same phase.

## Out of scope

- **Web Worker anti-throttling** for backgrounded tabs — built-in foreground refresh plus the client's heartbeat is sufficient for normal admin use; only relevant if an admin backgrounds the logs tab beyond the token lifetime.
- **Gap backfill / missed-row replay on reconnect** — the manual refresh and the next invalidation catch up after an offline gap; no gap-detection or replay logic.
- **Client-side row merge into the cache** — invalidate-and-refetch is the chosen pattern per [ADR-0008](../adr/ADR-0008-realtime-scoped-to-logs-tiered-freshness.md).
- **Realtime on any other surface** (settings, profile) — scoped to the logs page only per ADR-0008.
- **JWT expiry tuning** — stays at the current 1-hour default per RESEARCH-0004; a longer token is not a substitute for timely token propagation.
- **A page-scoped refresh fallback** — the phase commits to re-enabling default browser auto-refresh. If the refresh race re-appears, that is scoped as its own work, not carried as a branch in this plan.

---

## Epics & stories

### Epic 1: Browser session refresh `Complete`

- **1.1 The browser client refreshes its own token.** Re-enable the browser client's default token auto-refresh, currently disabled so the proxy is the only refresh authority. The proxy stays the server-side refresh authority and server-component auth reads stay validate-only (no refresh) — this adds foreground browser refresh back on top, returning to the two-authority model Supabase's refresh-token reuse interval and cross-tab lock are built to handle. [ADR-0005](../adr/ADR-0005-proxy-session-gate-two-authority-refresh.md) is amended in place to reflect that the proxy is no longer the *sole* refresh authority; the reasoning for why this is now safe is carried by [RESEARCH-0004](../research/RESEARCH-0004-supabase-realtime-session-refresh-nextjs.md) §6.

*Success:*
- The historical refresh-race flows all pass with no `Invalid Refresh Token: Already Used` error and no unexpected sign-out: sign-in followed by immediate parallel navigation; rapid navigation near token expiry; two tabs open concurrently; an idle tab returned to after the token would have expired.
- The proxy still refreshes on matched server requests; server-component auth reads still validate without refreshing.
- ADR-0005 reflects the amended two-authority model.
- `pnpm pre-push` is green.

### Epic 2: Realtime logs feed `Complete`

- **2.1 Logs opt into Realtime replication.** The logs table is added to Supabase's Realtime publication so its inserts are broadcast to subscribers. This is publication membership only — it confers no live behavior until a page subscribes. (Human runs the migration.)
- **2.2 The logs page shows a live feed.** The admin logs page subscribes to new-row (INSERT) events only and, on each, invalidates and refetches the current view so new rows appear without a reload while respecting the active level / tag / read-status / search filters and cursor position. A toolbar indicator shows connection state (Live / Reconnecting / Offline) and a manual refresh button forces an immediate catch-up. Reconnection relies on the client library's built-in heartbeat and backoff — no manual resubscribe loops. INSERT-only is deliberate: read-state updates and the retention purge carry no live value, per [ADR-0008](../adr/ADR-0008-realtime-scoped-to-logs-tiered-freshness.md).

*Success:*
- A new log row appears on the page without a reload, and only when it belongs to the active filtered view.
- The connection indicator reflects real subscription state across live, reconnecting, and offline.
- The manual refresh button forces a catch-up refetch of the current view.
- After a dropped connection, the feed recovers on its own without a page reload.
- Delivery stays admin-only (governed by the existing logs-table read policy).
- `pnpm pre-push` is green.

### Epic 3: Users-page freshness `Complete`

- **3.1 The users list refreshes on focus.** The admin users list refetches when the tab regains focus, so another admin's ban or promotion surfaces within a focus cycle rather than only on a manual reload. No live feed and no connection indicator — a deliberately lighter freshness tier than the logs page, per [ADR-0008](../adr/ADR-0008-realtime-scoped-to-logs-tiered-freshness.md). A manual refresh control ships as a catch-up safety valve (toolbar and filtered empty state), the same tier-2 pattern ADR-0008 documents for users alongside refetch-on-focus — not a live-feed substitute.

*Success:*
- Returning focus to the users page surfaces another admin's ban or promote without a manual reload.
- No connection indicator is added to the users page (lighter tier than logs).
- A manual refresh control is available as catch-up (toolbar and filtered empty state), consistent with ADR-0008.
- `pnpm pre-push` is green.

### Epic 4: Logs toolbar & empty-state polish `Complete`

- **4.1 Live indicator becomes a toggle.** Replace the static "Live" badge with a pressable toggle button. Off state: play icon + "Live" text, styled identically to the adjacent refresh button (no special muted treatment). On state: pause icon + "Live" text, `success` token color applied as text + border only (no background fill) — same token as the settings-page live pattern (which uses a filled pill), different treatment here (outline vs. filled). Toggling on subscribes to the Epic 2 Realtime feed; toggling off unsubscribes (manual refresh still works in either state). Positioned left of the existing refresh button, right of search.
- **4.2 Empty-state refresh.** When the filtered view has zero rows, show "No logs found for selected filters" with a primary "Reset filters" button and a secondary "Refresh" button beside it.

*Success:*
- Off-state styling matches the refresh button exactly.
- On-state uses `success` text + border, no background fill.
- Toggling subscribes/unsubscribes from the Epic 2 Realtime feed correctly.
- Empty state shows correct copy and correct button variants (primary/secondary).
- `pnpm pre-push` is green.
