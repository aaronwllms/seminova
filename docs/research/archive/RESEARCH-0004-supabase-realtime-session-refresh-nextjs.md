# RESEARCH-0004: Supabase session refresh + long-lived Realtime in Next.js App Router

**Archived:** 2026-08-26

**Archived because:** Findings landed in ADR-0005 and ADR-0008; Phase 13 shipped the recommended two-authority refresh model.

**Researched:** 2026-07-19

**Type:** technical

## Question

What is Supabase's recommended architecture for cookie-backed auth session refresh in a Next.js App Router + `@supabase/ssr` app that must also sustain a long-lived admin Realtime (Postgres Changes) subscription — specifically token refresh coexistence, Realtime JWT lifecycle, reconnection behavior, RLS/publication setup, and JWT expiry trade-offs?

## Scope and constraints

**In scope:** Official Supabase documentation (primary), confirmed against current repo setup facts only (no ADR review).

**Given facts (not evaluated as decisions):**

- Next.js App Router on Vercel; `@supabase/ssr` with cookie-backed sessions (`createBrowserClient` / `createServerClient`).
- Auth proxy (`src/proxy.ts` → `src/supabase/proxy.ts`) refreshes sessions on matched requests; RSC read paths validate cookies without refreshing.
- Access-token expiry configured at 3600 s.
- Browser client currently calls `stopAutoRefresh()` (session refresh owned by proxy).
- Upcoming need: admin-only page with a long-lived Postgres Changes subscription on `app_logs`.

**Out of scope:** Committed architectural direction for this repo, implementation plans, ADR validation.

**Note (§6 added 2026-07-19):** the Historical RCA in §6 was folded in from a separate git-history / codebase investigation — a different source than the docs research in §1–§5 — to consolidate the refresh-race evidence. It re-weights the Recommendation toward validating Option B first (see Recommendation › Provenance).

## Findings

### 1. Session/token refresh in Next.js App Router + `@supabase/ssr`

**Official SSR pattern — proxy owns refresh on the server request path**

Supabase's Next.js SSR guide assigns session refresh to a **Proxy** (middleware) that:

1. Calls `supabase.auth.getClaims()` (which refreshes the access token when needed).
2. Writes refreshed tokens back into **request cookies** (so Server Components do not attempt their own refresh).
3. Writes refreshed tokens into **response cookies** (so the browser receives the new JWT).

Server Components cannot set cookies; the proxy is the designated refresh surface. The guide explicitly warns not to run code between `createServerClient` and `getClaims()`, and to always use `getClaims()` — not `getSession()` — for route protection on the server.

Sources: [Creating a Supabase client for SSR › Next.js › Hook up proxy](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [Advanced guide › CDN / ISR caching](https://supabase.com/docs/guides/auth/server-side/advanced-guide)

**Browser client role**

The same SSR guide states the browser `createBrowserClient` is for Client Components — **including Realtime subscriptions** — while the proxy "automatically refresh[es] the Supabase Auth session." The published Next.js example does **not** call `stopAutoRefresh()`; the default `@supabase/supabase-js` client has `autoRefreshToken: true`.

Sources: [Creating a Supabase client for SSR › Congratulations](https://supabase.com/docs/guides/auth/server-side/creating-a-client)

**Browser auto-refresh behavior (when enabled)**

`startAutoRefresh()` / default `autoRefreshToken`:

- Polls the session every few seconds; refreshes close to expiry; retries on failure.
- On **browsers**, refresh runs **only while the tab/window is in the foreground** — explicitly "to conserve resources as well as **prevent race conditions and flooding auth with requests**."
- `stopAutoRefresh()` stops background refresh; visibility-managed callbacks are removed.

Sources: [auth.startAutoRefresh](https://supabase.com/docs/reference/javascript/auth-startautorefresh), [auth.stopAutoRefresh](https://supabase.com/reference/javascript/auth-stopautorefresh)

**How Supabase expects server + client refresh to coexist (reuse interval + lock)**

Official docs do **not** instruct disabling browser auto-refresh when using middleware/proxy refresh. Instead they document mitigations for concurrent refresh:

| Mechanism | What Supabase documents |
| --- | --- |
| **Refresh-token reuse interval** | Default **10 seconds**. A refresh token may be reused within this window — explicitly to support **SSR where the same refresh token is used on the server and soon after on the client**. Supabase recommends **not changing** this value. |
| **Parent-token fallback** | If a stale (already-used) refresh token is presented but matches the parent of the active token, the active token pair is returned — handling clients that missed the refresh response due to network unreliability. |
| **Reuse detection** | Outside those exceptions, refresh-token reuse revokes the whole session (security against token theft). |
| **Cross-tab lock** | In browsers, `getSession()` refresh is synchronized across tabs via the **[LockManager API](https://developer.mozilla.org/en-US/docs/Web/API/LockManager)**; non-browser environments should supply a custom `lock` option. |

Sources: [User sessions › Refresh token reuse detection](https://supabase.com/docs/guides/auth/sessions), [auth.getSession reference](https://supabase.com/docs/reference/javascript/auth-getsession) (LockManager note in doc body)

**Stale refresh tokens on the server**

The Advanced guide notes server-side "invalid refresh token" errors often mean the browser sent a **stale** refresh token — and recommends ensuring `onAuthStateChange` is registered early and bug-free, deferring to the browser client when possible.

Source: [Advanced guide › My server is getting invalid refresh token errors](https://supabase.com/docs/guides/auth/server-side/advanced-guide)

**Takeaway for Q1:** Supabase's documented Next.js architecture is **proxy refresh + browser client for Realtime**, with **concurrency handled via reuse interval, parent-token fallback, and LockManager** — not by turning off browser auto-refresh. Disabling browser refresh is not documented as the recommended pattern; it is a valid app-level choice with trade-offs (see Recommendation).

---

### 2. Access token path to Realtime and keeping long-lived subscriptions alive

**How the JWT reaches Realtime**

On channel join (`phx_join`), the client may send an `access_token` in the join payload. If omitted, Realtime falls back to the **API key** (anon/publishable), which is insufficient for authenticated RLS-gated Postgres Changes.

Source: [Realtime Protocol › phx_join › access_token](https://supabase.com/docs/guides/realtime/protocol)

**Client-library wiring**

`@supabase/supabase-js` listens for auth state changes and pushes tokens to Realtime:

- On `SIGNED_IN` or `TOKEN_REFRESHED` → `realtime.setAuth(access_token)`.
- On `SIGNED_OUT` → `realtime.setAuth()` (clears auth).

This is library behavior (verified in `@supabase/supabase-js` v2.105.4); the Realtime Protocol documents the wire format the library uses.

Sources: [Realtime Protocol › access_token event](https://supabase.com/docs/guides/realtime/protocol), `@supabase/supabase-js` `_listenForAuthEvents` (implementation)

**Keeping the token fresh on an open WebSocket**

Realtime Authorization docs state the access-policy cache updates when:

1. The client connects and subscribes to a channel, or
2. A **new JWT is sent via the `access_token` message**.

> If a new JWT is never received on the Channel, **the client will be disconnected when the JWT expires.**

The Realtime Protocol adds:

- Mid-session expiry surfaces as a channel-level system error (`Token has expired`) followed by `phx_close` → **refresh token, then rejoin**.
- In-band refresh without rejoining: send an `access_token` event on the channel with the new JWT (no success reply; failure closes the channel).

Sources: [Realtime Authorization › Updating RLS policies](https://supabase.com/docs/guides/realtime/authorization), [Realtime Protocol › Access token refresh](https://supabase.com/docs/guides/realtime/protocol), [Realtime Protocol › Channel-level system errors](https://supabase.com/docs/guides/realtime/protocol)

**Implication for proxy-only refresh (`stopAutoRefresh`)**

Proxy refresh updates **cookies** on HTTP navigation but does **not** emit `TOKEN_REFRESHED` in the browser auth client. On an idle tab with an open Realtime socket and no HTTP requests:

- The WebSocket continues using the JWT from initial join.
- After ~3600 s (current expiry), Realtime disconnects unless a new JWT arrives via `access_token` / `setAuth`.
- `realtime.setAuth()` without arguments re-reads the current session from the auth client — but something must trigger a session read/refresh first.

**Documented failure mode:** silent loss of Postgres Changes delivery → channel close on JWT expiry → requires token refresh + rejoin (or proactive `access_token` push before expiry).

---

### 3. Realtime reconnection after network drops or channel errors

**Built-in behavior (prefer over manual resubscribe loops)**

| Layer | Documented behavior |
| --- | --- |
| **Transport heartbeats** | Client sends heartbeat every **25 s** (configurable). On timeout, client **automatically attempts reconnection**. |
| **Reconnection backoff** | Exponential backoff: **1 s → 2 s → 5 s → 10 s** (documented in troubleshooting; protocol specifies JS client default `[1000, 2000, 5000, 10000]` ms, configurable via `reconnectAfterMs`). |
| **Channel `phx_error`** | Should trigger **rejoin with exponential backoff** (same schedule). |
| **Join rejection** | Server adds its own backoff before replying — docs warn to **avoid aggressive client-side retry loops** on join errors. |

Sources: [Understanding and Monitoring Realtime Heartbeats](https://supabase.com/docs/guides/troubleshooting/realtime-heartbeat-messages), [Realtime Protocol › Error handling › Join errors](https://supabase.com/docs/guides/realtime/protocol), [Realtime Protocol › Reconnection](https://supabase.com/docs/guides/realtime/protocol)

**When manual intervention is appropriate**

- After repeated heartbeat `timeout` / `disconnected` status: call `supabase.realtime.connect()` (troubleshooting doc example).
- On React Native foreground: reconnect if `!supabase.realtime.isConnected()` when app becomes active.
- For long-running browser tabs: optional Web Worker mode to reduce timer throttling.

**Postgres Changes subscription errors** (distinct from transport): invalid filter / missing params → fix and rejoin; missing publication → server retries every 5–10 s (surface degraded state, don't spin tight loops).

Source: [Realtime Protocol › Postgres Changes subscription errors](https://supabase.com/docs/guides/realtime/protocol)

**Takeaway for Q3:** Rely on the **JS client's built-in heartbeat + backoff reconnection**. Subscribe once; monitor channel status / heartbeat for UI. Avoid tight manual resubscribe loops on join errors. Show connection health to users (best practice in heartbeat doc).

---

### 4. RLS, admin gating, publication, and INSERT-only Postgres Changes

**RLS interaction**

From Realtime Authorization (Postgres Changes section):

> When using Postgres Changes on tables with RLS, **database records are sent only to clients who are allowed to read them** based on your RLS policies.

Each INSERT triggers a **per-subscriber authorization check** against RLS (Postgres Changes scaling docs: throughput scales with subscriber count × change rate). For a single admin tab this is negligible.

Admin gating via JWT claims (e.g. `app_metadata.role`) in a `SELECT` policy is consistent with Supabase's JWT-claims RLS examples. Current `app_logs` policy shape matches this pattern (admin-only `SELECT` for `authenticated`).

Sources: [Realtime Authorization › Interaction with Postgres Changes](https://supabase.com/docs/guides/realtime/authorization), [Postgres Changes › Quick start (RLS step)](https://supabase.com/docs/guides/realtime/postgres-changes), repo migration `20260717234520_create_app_logs.sql`

**Publication requirement**

Table must be in the `supabase_realtime` publication (Dashboard toggle or `alter publication supabase_realtime add table …`). Without this, subscription fails; server retries periodically.

Source: [Postgres Changes › Enable Postgres replication](https://supabase.com/docs/guides/realtime/postgres-changes)

**INSERT-only subscription — replica identity**

- Default replica identity is sufficient for **INSERT** events (payload includes `new` record).
- `replica identity full` is only required to receive **`old` record** values on `UPDATE` / `DELETE`.
- Caution: RLS is **not applied to DELETE** events; with `replica identity full`, `old` on DELETE contains **primary key(s) only**.

For an INSERT-only `app_logs` tail: **default replica identity + INSERT filter** — no `replica identity full` needed.

Source: [Postgres Changes › Receiving old records](https://supabase.com/docs/guides/realtime/postgres-changes)

**Private Realtime channels vs Postgres Changes**

`private: true` channels + `realtime.messages` RLS govern **Broadcast/Presence authorization**, not Postgres Changes table RLS. Postgres Changes uses **table RLS** directly. Both public and private channels can subscribe to Postgres Changes.

Source: [Realtime Authorization › Interaction with Postgres Changes](https://supabase.com/docs/guides/realtime/authorization)

---

### 5. JWT / access-token expiry recommendations

From [User sessions › FAQ › Recommended values](https://supabase.com/docs/guides/auth/sessions):

| Setting | Supabase guidance |
| --- | --- |
| **Default** | **1 hour** — "Most applications should use the default." (Matches current 3600 s config.) |
| **> 1 hour** | "Generally discouraged for security reasons" — may make sense in specific situations. |
| **< 5 minutes** | Avoid in most cases; especially **< 2 minutes**. |
| **Why not shorter** | More refresh load on Auth; clock skew on user devices; client libraries refresh *ahead* of expiry — very short windows break this; JWT should cover your longest request. |
| **Session timeout settings** | Time-box / inactivity / single-session checks run on **next refresh**, so effective lifetime includes JWT expiry window. |

Long-lived Realtime does **not** require a longer JWT — it requires **timely token push to Realtime** before expiry (see §2).

### 6. Historical RCA — why the original refresh race occurred

> Folded in from a separate git-history / codebase investigation (different source than the docs research above), to keep the refresh-race evidence in one place.

The configuration that produced the original race had **three concurrent refresh authorities**, not the two the documented SSR model assumes:

1. Browser client auto-refresh (default `autoRefreshToken`).
2. The proxy calling `getClaims()` on every matched request.
3. RSC read paths — `getCurrentUserProfile()` via `getUser()` and the admin gate via bare `getClaims()` — which internally trigger a refresh on an expired token.

**Trigger:** sign-in → immediate navigation to a protected route, where App Router fires parallel requests (document load + RSC flight + `Link` prefetch). Each proxy invocation runs independently with no cross-request de-duplication, so a single navigation issued multiple concurrent `getClaims()` calls on top of the browser timer and the RSC reads. The error surfaced was `Invalid Refresh Token: Already Used`, after sign-in — not on idle expiry.

**Why the built-in tolerance was exceeded:** the 10 s refresh-token reuse interval (§1) is documented to cover ~two near-simultaneous refreshers (the SSR server-then-client case). Three-plus authorities interleaving across parallel proxy invocations pushed rotations outside that window, tripping reuse detection.

**The fix (commit `c3276dd`, 2026-07-04) bundled three changes at once:** it stopped RSC-path refresh, added `allowExpired` display reads, *and* called `stopAutoRefresh()` on the browser client. It was **never isolated** whether `stopAutoRefresh()` was necessary once the RSC authority was removed — no later commit re-enabled browser refresh to test the two-authority model alone. Relevant config: `jwt_expiry = 3600`, `refresh_token_reuse_interval = 10`, rotation enabled (`supabase/config.toml`).

**Classification: fixable within a disciplined `@supabase/ssr` setup — not structural.** Nothing in the architecture requires three refreshers; the fix over-corrected by removing browser refresh authority wholesale. Because the RSC authority is already gone, re-enabling browser auto-refresh (Option B) returns the app to the two-authority model the reuse interval + foreground throttle + LockManager are built to handle — which is why the Recommendation validates B first rather than adopting the scoped Option C by default.

---

## Options compared

| Approach | Session refresh | Realtime token on idle tab | Conflict risk | Doc alignment |
| --- | --- | --- | --- | --- |
| **A. Proxy-only** (current `stopAutoRefresh`) | Proxy on HTTP requests | **Gap** — JWT expires ~1 hr unless something else refreshes | Lowest concurrent refresh | Partial — proxy matches SSR guide; stopping browser refresh is undocumented |
| **B. Proxy + default browser auto-refresh** | Both (reuse interval + LockManager) | **Auto** — `TOKEN_REFRESHED` → `setAuth` | Low if reuse interval unchanged | **Strongest** match to published SSR + sessions docs |
| **C. Proxy + scoped `startAutoRefresh`** | Proxy globally; browser refresh only on Realtime page while mounted/foreground | **Auto** on that page | Low on Realtime page; none elsewhere | Good — mirrors React Native foreground pattern from `startAutoRefresh` docs |
| **D. Proxy + periodic `getSession()` / `router.refresh()`** | Explicit polling | Works if interval < JWT expiry | Medium — must coordinate with proxy refresh | Acceptable fallback; more app code |
| **E. Service-role / custom JWT on client** | N/A | Bypasses user JWT expiry | N/A | **Rejected** — docs forbid exposing `service_role` on client |

## Recommendation

**Suggested direction (not a committed decision): validate Option B first — re-enable default browser auto-refresh — with Option C as the fallback if B re-races.**

> **Provenance:** the clean-room pass (§1–§5, docs-only) recommended **Option C**, the smallest-surface option, because it was deliberately run without the project's refresh-race history. §6's RCA re-weights that call: the original race depended on a *third* refresh authority (RSC reads) that has since been removed, lowering Option B's residual risk to the documented, mitigated two-authority case. Hence B-first.

1. **Validate B before committing.** In a throwaway branch, re-enable browser auto-refresh (remove `stopAutoRefresh()`), keep RSC read paths validate-only, and exercise the flows that historically triggered `Invalid Refresh Token: Already Used` (sign-in → immediate parallel navigation; rapid navigation near expiry; two tabs; idle-then-return past expiry). Confirm the foreground throttle + LockManager + 10 s reuse interval (§1) hold the two-authority model without re-racing.

2. **If B holds → adopt B.** Proxy stays the server-side refresh authority (`getClaims()` on matched requests; RSC validate-only); the browser client auto-refreshes as documented. This restores the built-in `TOKEN_REFRESHED → realtime.setAuth()` pipeline (§2) so long-lived Realtime stays fresh with no bespoke per-page lifecycle — the strongest doc-aligned option and the cleanest inheritance for spinoffs.

3. **If B re-races → fall back to C.** Scope `startAutoRefresh()`/`stopAutoRefresh()` to the Realtime admin surface (mount/unmount), confining client↔proxy overlap to that page. Note C buys a *smaller overlap surface*, not fresher sockets — a foreground-idle tab refreshes identically under B and C.

4. **Rely on built-in Realtime reconnection** (heartbeat + exponential backoff, §3). Surface connection status in the UI; do not implement aggressive manual resubscribe loops.

5. **Postgres Changes setup for `app_logs`:** add table to `supabase_realtime` publication; subscribe `event: 'INSERT'` only; keep existing admin `SELECT` RLS; default replica identity is sufficient (§4).

6. **Keep JWT expiry at 3600 s** (§5). Do not lengthen JWT to compensate for Realtime — fix token propagation instead.

**Trade-offs**

- **Option B (target):** Pros — documented default; zero bespoke lifecycle; standard auth inherited by every spinoff; Realtime freshness for free. Cons — client and proxy both refresh on navigation (mitigated by reuse interval + foreground throttle + LockManager); residual risk retired only once validation confirms it.
- **Option C (fallback):** Pros — confines client-refresh overlap to one page; no behavior change elsewhere. Cons — keeps `stopAutoRefresh` as a non-standard global default spinoffs inherit; adds a per-page mount/unmount contract that's easy to forget and error-prone (unmount misfires, StrictMode double-invoke, multiple Realtime pages); more moving parts than B, not fewer.
- **Rejected — Option E** (service-role/custom JWT on client): docs forbid exposing `service_role` client-side. **Dominated — A** (proxy-only status quo) leaves the freshness gap unsolved; **D** (manual periodic refresh) re-implements by hand what B gets from the SDK.

## Open questions

1. **Official stance on `stopAutoRefresh` + middleware:** Supabase documents reuse interval for SSR concurrency but does not publish a "proxy-only" recipe. Worth a support/docs issue if proxy-only refresh is a deliberate long-term choice.

2. **Cookie sync without `TOKEN_REFRESHED`:** When proxy refreshes during navigation, does the browser auth client's in-memory session always reconcile from cookies before Realtime reconnects? Behavior depends on `@supabase/ssr` cookie adapter — not fully specified in docs; validate in integration testing.

3. **Background tab throttling:** Browser timer throttling on background tabs may delay auto-refresh and heartbeats. Docs suggest Web Workers for long connections — needed only if admins keep the tab backgrounded for >1 hr.

4. **Publication migration:** `app_logs` is not yet in `supabase_realtime` (no migration in repo at research time) — required before subscription works.

5. **RLS policy cost:** Postgres Changes re-checks RLS per subscriber per change. Acceptable for one admin; reassess if fan-out grows (docs suggest Broadcast for high fan-out).

## Sources

### Supabase documentation (primary)

- [Creating a Supabase client for SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Advanced guide (SSR Auth)](https://supabase.com/docs/guides/auth/server-side/advanced-guide)
- [User sessions](https://supabase.com/docs/guides/auth/sessions)
- [auth.startAutoRefresh](https://supabase.com/docs/reference/javascript/auth-startautorefresh)
- [auth.stopAutoRefresh](https://supabase.com/docs/reference/javascript/auth-stopautorefresh)
- [auth.getSession](https://supabase.com/docs/reference/javascript/auth-getsession)
- [Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes)
- [Realtime Authorization](https://supabase.com/docs/guides/realtime/authorization)
- [Realtime Protocol](https://supabase.com/docs/guides/realtime/protocol)
- [Understanding and Monitoring Realtime Heartbeats](https://supabase.com/docs/guides/troubleshooting/realtime-heartbeat-messages)

### Repo facts confirmed (not ADRs)

- `src/supabase/client.ts` — `stopAutoRefresh()` on browser client
- `src/supabase/proxy.ts` — proxy refresh via `getClaims()`
- `supabase/migrations/20260717234520_create_app_logs.sql` — admin-gated RLS, no publication yet

### Git history (RCA, §6)

- Commit `c3276dd` (2026-07-04, "harden auth session handling to stop refresh-token races") — origin of `stopAutoRefresh()`; three fixes bundled
- `supabase/config.toml` — `jwt_expiry = 3600`, `refresh_token_reuse_interval = 10`, rotation enabled

## Related

- Phase 12 PRD: observability / admin logs (`docs/prds/phase-12-observability-app-settings.prd.md`) — upcoming Realtime admin surface
- Potential future ADR if Option C (or B) is adopted for Realtime + refresh ownership
