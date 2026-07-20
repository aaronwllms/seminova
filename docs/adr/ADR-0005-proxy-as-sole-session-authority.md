# ADR-0005: Proxy as session gate with two refresh authorities

**Status:** Accepted

`proxy.ts` is the server-side session gate: it refreshes sessions on matched
HTTP requests and redirects unauthenticated users on protected routes. The
browser client (`src/supabase/client.ts`) uses default foreground
auto-refresh for Client Components (auth forms, avatar upload, Realtime).
Protected-route server reads use `getDisplayAuthClaims()` —
`getClaims(accessToken, { allowExpired: true })` on the cookie-read token:
signature verified, `exp` tolerated, no refresh. Missing or signature-invalid
tokens on a protected route throw (route error boundary); RSC reads do not
redirect. Mutations still call `getUser()` at the trust boundary.

The original three-authority refresh race (browser + proxy + RSC reads) is
resolved: RSC refresh was removed; the app now uses Supabase's documented
two-authority model (browser + proxy), mitigated by refresh-token reuse
interval and LockManager. See [RESEARCH-0004 §6](../research/RESEARCH-0004-supabase-realtime-session-refresh-nextjs.md).

Trade-offs accepted: (1) client soft-navigation may briefly show stale
authenticated UI until the next server touch — proxy refreshes or redirects on
the next protected request; (2) avatar uploads may still use
`router.refresh()` + `probeSessionAction` before retry as defense-in-depth for
cookie/memory reconciliation edge cases; (3) dev-without-env protected routes
return 503 (proxy gates; RSC no longer redirects).

If refresh races reappear, that is out of Phase 13 scope — separate work, not
a scoped per-page refresh fallback in this phase.

Supersedes [ADR-0003](ADR-0003-no-refresh-in-rsc-auth-reads.md).
