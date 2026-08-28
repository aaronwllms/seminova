# ADR-0012: First password set by an elevated server action gated on a profile flag

**Status:** Accepted

Accounts created without a password (magic link) set their first one through a
server action that uses the Supabase secret key (`auth.admin.updateUserById`),
gated on a server-read `profiles.has_password` boolean. Password *change* is
unchanged — client `updateUser` with `current_password`.

The client path isn't available for a first password. Phase 6 turned on
Supabase's Secure password change, so `updateUser` requires the current
password, and a magic-link account's holder cannot supply one: the stored hash
is platform-generated and never known to anyone. A magic-link session is also
not a recovery session, so the recovery exemption doesn't apply. The only
alternative was disabling Secure password change, which would re-open password
change without reauth for every account in the app to serve the one case that
needs it. The flag lives on `profiles` rather than being derived from auth
state because that generated hash is indistinguishable from a real one —
`auth.users` carries no signal to read.

The trade-off accepted: a denormalized boolean becomes a security control, and
the elevated-write surface widens from admin-only to a user-triggered path
(`security.mdc` § Secret key scopes updated to match). Three guards exist
solely to defend that bit — table `UPDATE` is revoked from `authenticated` in
favour of column grants on the three blur-save fields, so a client cannot flip
the flag to false and skip reauth; a failed profile load fail-closes to `true`
rather than exposing the no-current-password form; and the flag is written
*before* the password, so a partial failure leaves the account showing Change
Password with recovery-by-email intact rather than leaving the reauth-free path
permanently open. The standing cost is drift: the flag is app-maintained truth
about auth state, so any password-write path added later that forgets to stamp
it leaves that account reachable without reauth. The service-client import
allowlist in [`eslint.config.mjs`](../../eslint.config.mjs) makes a *new*
elevated write path visible, but nothing catches a client-side
`updateUser({ password })` — precisely the shape the recovery flow takes, which
is why it carries an explicit `markHasPasswordAction` call.
