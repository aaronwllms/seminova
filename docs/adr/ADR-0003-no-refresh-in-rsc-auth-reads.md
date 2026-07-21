# ADR-0003: No token refresh in Server Component auth reads

**Status:** Superseded by [ADR-0005](ADR-0005-proxy-session-gate-two-authority-refresh.md)

Server Component auth reads (`requireAuthClaims`, `hasServerAuthSession`)
validate the access token pulled from the request cookie locally and never
call `getSession()` or bare `getClaims()`, even though either could recover
an expired token via refresh. Only `src/proxy.ts` is allowed to refresh a
session. This was nearly reversed during Phase 8 remediation on the
reasonable-looking assumption that aligning RSC reads with the proxy's call
pattern would fix a landing-page/profile-page auth mismatch — investigation
showed bare `getClaims()` triggers `getSession()` internally, which attempts
`_callRefreshToken()` on an expired token, reintroducing exactly the refresh
race this split was built to avoid. The trade-off accepted: an expired
access token forces a redirect-to-login from RSC even when a valid refresh
token exists and a refresh would have succeeded, in exchange for guaranteeing
at most one refresh attempt per request and eliminating races between
concurrent RSC reads (e.g. app-shell + page) or between an RSC read and the
proxy.
