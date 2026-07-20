# ADR-0009: Client UI preferences default to localStorage; cookies only when they affect server render

**Status:** Accepted

A remembered client UI preference — a non-sensitive view choice like a toggle
or panel state — is persisted in `localStorage` by default. A cookie is used
only when the server must read the preference while rendering, to avoid a flash
of server-rendered content in the wrong state. The two existing
remembered-choice cases are both that cookie exception, not the rule: the admin
sidebar's open/closed state (`sidebar_state`) and the public banner's dismissal
(`banner_dismissed_public`) are both server-rendered, so a cookie lets first
paint match the saved choice. The admin logs live-feed toggle is the first case
on the localStorage side — it gates a client-only Realtime subscription the
server can neither read nor act on, so server-readability buys nothing, and its
preference helper (`logs-live-preference.ts`) establishes the pattern's
reference shape.

When a feature needs to remember a preference, choose the mechanism in this
order:

1. **Is it sensitive?** (session tokens, anything an attacker would want) →
   never localStorage, which any script on the page can read. This concern is
   the proxy's (ADR-0005), not a client-storage choice at all.
2. **Does the server need it to render?** (affects first paint — layout, banner
   visibility) → cookie, so SSR reads it and first paint matches the saved
   choice.
3. **Neither?** → localStorage.

The distinction driving 2 vs. 3: a cookie rides on every request to the domain
and shares a ~4KB per-domain budget, while localStorage is never sent to the
server and has room to spare. So localStorage is the default — it keeps
client-only state off the wire and protects the cookie budget — and a cookie is
spent only where SSR genuinely needs one.

A localStorage helper must survive two failure modes a naive `getItem` ignores:
it runs on the server during SSR (guard on `typeof window`), and the API itself
throws in some contexts (quota exceeded, storage disabled, restricted privacy
modes), so reads and writes are wrapped in try/catch that degrades to the
default rather than crashing the page.

Trade-off accepted: a localStorage-backed preference produces a brief flash —
the surface renders in its default state on first paint, then corrects once a
mount effect reads storage. This is acceptable precisely where the rule routes a
preference to localStorage: the thing it controls is client-side too, so a
one-beat-late correction has no server-rendered content to be wrong about.
Preferences where that flash *would* be visible and jarring are the ones the
rule sends to cookies instead.
