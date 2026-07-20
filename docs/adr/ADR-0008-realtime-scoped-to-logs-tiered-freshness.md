# ADR-0008: Realtime is scoped to the logs page; other admin surfaces get tiered freshness instead

**Status:** Accepted

Realtime (Supabase's Postgres-logical-replication-over-WebSocket push) is
adopted only where a table meets all three criteria: it has ongoing inserts an
admin needs to see, the surface is a monitoring/triage screen rather than a
CRUD form, and stale data would cause a wrong decision. `app_logs` is the only
table in this phase that clears the bar. `profiles` and `app_settings` are
low-churn, single-actor-at-a-time surfaces where a save-confirmation toast is
already the correct freshness signal; the admin users list reads `auth.users`
through an RPC, not a client-subscribable table, so Realtime doesn't apply
there regardless of churn. This is a template-level pattern, not a one-off:
a future table gets evaluated against these three criteria rather than added
by precedent.

The logs page subscribes to `INSERT` only, not `UPDATE` or `DELETE`. Read/unread
changes are `UPDATE`s the admin already knows about — they just performed the
action — so there's no gap to fill, and the nightly retention purge (`DELETE`)
and bulk "mark all as read" (`UPDATE`) would otherwise produce event bursts
with no corresponding UX value. On `INSERT`, the page invalidates and refetches
the current view — respecting active filters, tags, search, and cursor
position — rather than merging the new row into the client cache directly.
Merging is the more responsive option but requires deciding, per new row,
whether it belongs in the current filtered view, where it lands under
cursor-based paging, and how to reconcile that against a page the admin might
be mid-scroll on; invalidate-and-refetch reuses the existing query logic
unchanged and defers that complexity until it's actually needed.

The users page gets a lighter mechanism — refetch-on-focus — rather than
Realtime. A ban or promotion by another admin is a rare, low-stakes race in
practice; surfacing it "within a tab-focus cycle" is an acceptable freshness
bar for that screen, and building a live feed for an occasional event isn't
worth the same event-handling cost paid on the logs page.

A manual refresh button ships alongside the logs page's live feed. This is a
safety valve, not a redundant control: established live-monitoring UIs
(Sentry, Grafana) keep an explicit refresh even with a push feed, because
"catch up right now" is a distinct user intent from "notify me as things
happen." The admin users page uses the same manual-refresh pattern as that
safety valve — tier-2 freshness alongside refetch-on-focus, without Realtime.

Trade-off accepted: a table's Realtime *publication* membership (opted in via
migration) is distinct from a page's *subscription* to it — publishing
`app_logs` costs nothing extra later if another surface wants to read its
inserts, but publication alone confers no live behavior. Read-state changes
made by another admin on the logs page won't appear live (rare in practice,
single-admin-typical usage). The users page can lag up to one focus cycle
behind another admin's action. Both are accepted as correctly-scoped, not as
gaps to close later.
