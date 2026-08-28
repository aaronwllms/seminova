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
permanently open.

The trigger always inserts `has_password = false` and ignores client metadata.
Three in-app write paths stamp `true` on the same awaited server path that
wrote the password: password sign-up (`signUpWithPasswordAction`), first
password (`setFirstPasswordAction`), and recovery
(`completeRecoveryPasswordAction`). Confirm-link stamping was rejected:
`confirm-signup.html` uses `type=email`, the same template as the first-time
magic-link path, so `auth.users` cannot distinguish a chosen password from the
platform hash.

Two residual costs remain. A direct-API `signUp` outside the app still leaves
the column `false`. A stamp that fails after a successful in-app `signUp` needs
manual repair — retrying sign-up hits GoTrue's empty-`identities`
anti-enumeration payload and skips stamping by design, so the account
self-heals only through Set Password. Do not add an automatic re-stamp on
sign-in; that is a new write path and belongs to its own decision.
