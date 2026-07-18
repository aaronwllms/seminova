# ADR-0007: Client logs relayed through an unauthenticated route handler

**Status:** Accepted

Browser call sites log through a client wrapper that posts to a route handler
at a stable path, which validates the payload and forwards it to `appLog`. The
relay requires no session, and the template ships no rate limit on it.

A route handler rather than a `'use server'` action because a stable path is
the only portable rate-limiting seam. Every firewall, proxy, and CDN rate-limits
by path; none durably rate-limits a Server Action, whose only discriminator is
a build-rotating action ID or the presence of a `Next-Action` header shared by
every other action in the app. The cost is giving up the framework's built-in
Origin/Host check and accepting a public, discoverable endpoint — the handler
re-implements the origin check explicitly, and the rotating action ID was never
a real control anyway, being one devtools panel away from anyone who wants it.

No session requirement because the highest-value call sites are unauthenticated
by construction: the `/auth` route error boundary, and the auth-form error
extractor whose subject *is* a failed login. Gating on a session would delete
exactly the sites that justified building the relay, and would buy no integrity
— level, message, and context are browser claims whether or not someone is
signed in. What bounds a relayed row instead: the client call sites are a closed
set declared in code, and the server constructs the tag from the declared key
under a `client-` namespace, so a browser cannot forge a tag belonging to a
server seam; context is size-capped, and truncated rather than dropped, so a
careless payload still yields a usable row; the minimum-level threshold discards
below-threshold rows server-side; and retention purges the table on a schedule.
Where a session happens to be present the relay reads it server-side and
attaches the user id — the one field in a relayed row that is not a browser
claim.

Trade-off accepted: anyone can insert rows into `app_logs`, an otherwise
admin-only table, at any rate. Nothing above bounds *count*. A rate limit at
template scope means either a paid dependency every spun-off product inherits,
or a per-instance counter that is theatre on serverless — N concurrent instances
mean N times the configured limit, and it would pass its own test while doing
nothing. Rate limiting is therefore a deployment concern rather than a template
default: README documents the exposure and shows how to rate-limit the path
behind a WAF, using Vercel's as the worked example. A spinoff that wants a hard
limit adds a firewall rule against a path that exists precisely so it can.
