# ADR-0005: Proxy as sole session authority

**Status:** Accepted

`proxy.ts` is the only layer that refreshes sessions and redirects
unauthenticated users on protected routes. Protected-route server reads use
`getDisplayAuthClaims()` — `getClaims(accessToken, { allowExpired: true })`
on the cookie-read token: signature verified, `exp` tolerated, no refresh.
Missing or signature-invalid tokens on a protected route throw (route error
boundary); RSC reads do not redirect. Mutations still call `getUser()` at
the trust boundary.

Trade-offs accepted: (1) client soft-navigation may briefly show stale
authenticated UI until the next server touch — proxy refreshes or redirects on
the next protected request; (2) idle-tab avatar uploads require one server
touch (`router.refresh()` + `probeSessionAction`) before retry because the
browser client has no refresh authority; (3) dev-without-env protected routes
return 503 (proxy gates; RSC no longer redirects).

Supersedes [ADR-0003](ADR-0003-no-refresh-in-rsc-auth-reads.md).
