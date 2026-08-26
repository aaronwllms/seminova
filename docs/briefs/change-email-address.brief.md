# Brief — Change email address

**Status:** Exploring
**Anchor:** [BACKLOG.md § Change email address](../../BACKLOG.md#change-email-address)
**Last updated:** 2026-08-25

## Problem

Account email is set once at signup and can't be changed from inside the app. When a
user's address stops being the right one — they signed up with a personal address and
want the account on their business one, or they're shutting down the domain their address
lives on — there's no path to fix it. The account is stranded on the wrong identity, and
the only workaround is abandoning it and creating a new one, losing whatever's
accumulated in the old. Apps that omit this treat a routine, expected life event as
unrecoverable.

## Who it's for

**End users of products built on this template** — anyone whose email address changes
after signup, or who realizes they signed up with the wrong one. Not a niche: a
personal-vs-work mix-up is common in the first minutes of an account's life, and domain
changes are routine over its lifetime.

**Developers spinning up products from the template** — who inherit account-email
management as solved rather than discovering the gap after launch, when their users are
already stranded.

## Why now

Nothing has been spun off this template yet. Once products start inheriting it, this
becomes a gap to retrofit into every one of them separately — and by then each will have
real users already stranded on the wrong address. Fixing it here means every future
product gets it by default and nobody pays for it twice.

The profile modal was reworked in Phase 10 and already displays account email as a
disabled field, so the surface to hold this exists. The work is the confirm-by-link flow,
not the form.

## Decided

- **Sequenced after magic-link auth ships.** The feature has to behave correctly for
  both password and passwordless accounts. Build the second account type first, then
  design this once against reality rather than guessing at it.
- **Reauthentication at initiation.** Before a change request is created and before any
  mail goes out, the user re-proves identity: current password for password accounts, a
  one-time code sent to the current address for passwordless ones. This is the primary
  control — an attacker holding a stolen session is stopped at the gate rather than
  cleaned up after.
- **Single-confirm, to the new address only.** *Rejected: double-confirm.* Requiring the
  old address to confirm as well breaks the feature's main use case — someone changing
  their address precisely because they are losing access to the old one cannot click a
  link sent there. The session-hijack risk double-confirm guarded against is closed by
  reauthentication instead.
- **Security notification to the old address on completion**, naming both addresses and
  directing the user to support if the change was unexpected. With reauthentication in
  front, the residual threat is a compromised password rather than a hijacked session,
  and this notification is the last control standing in that case.
- **Pending state lives in the profile modal.** The current address stays displayed as
  current, with the pending one shown beneath it and both resend and cancel available.
  *Rejected: a toast alone* — a user who missed the confirmation email would have no path
  forward from inside the app.
- **Always on — no gate, no toggle.** Changing an account's email is baseline account
  management, like changing a password; no spinoff wants it switched off. *Rejected:
  gating the feature on a configured support address.* Without one, the owner still
  receives the notification and still learns their address moved — all that's lost is the
  line saying where to report it. Disabling the whole feature over a missing sentence
  would strand that project's users on the wrong address permanently, which is the
  problem this brief opens with.
- ***Rejected: self-service revert link.*** An earlier shape sent the old address a
  notification carrying a link that would restore the previous address, revoke all
  sessions, and clear the password. Dropped on three platform findings, recorded so it
  isn't re-proposed:
  - **Link prefetchers execute it.** Mail-security scanners prefetch URLs in incoming
    mail, so a destructive link would fire unattended in every tenant running one — on
    legitimate email changes.
  - **The built-in sender can't send it.** It emits only its fixed template set; there is
    no arbitrary-send API, and the one injection point on the email-changed template is
    user metadata, which a session holder can read. Sending a revert token requires the
    send-email hook plus a mail provider, so the feature could not ship working by
    default.
  - **Clearing a password is unsupported surface.** No admin or client API nulls it;
    direct SQL against the auth schema is the only route.

## Sketch

The account email field in the profile modal becomes editable. Submitting a new address
does not change it — the platform's email update is confirm-by-link, and the address only
moves once the new one is confirmed. The profile row keeps showing the old address until
confirmation lands, which is what makes this more than a fourth text field.

**The old-address notification is a platform template, not a custom send.** The platform
ships a dedicated "Email address changed" security notification, separate from the
change-email confirmation template and toggled on per project, exposing both the old and
current addresses as template variables. Its default copy already names both addresses
and directs the reader to support. So the notification is a copy edit on an existing
template, not new sending infrastructure — which was the earlier assumption and was
wrong.

**The support address lives in the template, not the app.** Platform templates are
rendered platform-side, with no access to the application's environment — the available
variables are a fixed set. So the support address cannot be injected at send time; it is
literal copy in the template body.

That rules out an application-side environment variable as the source, and with it the
startup check that variable was there to power. The address is instead collected once, as
an identity fact, and propagated into the template by the same mechanism that already
carries project name and description:

- `project-kickoff` adds a required-floor item — support email, or explicit confirmation
  to keep the placeholder — and writes it to the site config alongside the other identity
  facts. The placeholder-or-real choice matches how the same skill already handles name
  and logo.
- `initialize-project` gains one item under what it writes: read the support address from
  the site config and substitute it into the templates. This is the deterministic
  propagation of an already-decided fact, which is exactly that skill's stated job — and
  it must be kickoff that asks, since `initialize-project` is contractually barred from
  prompting.

Being asked out loud during kickoff is the whole enforcement mechanism. A CI check on the
placeholder was considered and rejected: once the developer has been asked directly, the
only case left to catch is someone who was asked, chose the placeholder, and later forgot
— too thin to justify the machinery.

The placeholder is a reserved-domain address that can never resolve to a real inbox, so a
project that skips the question sends users to a guaranteed dead end rather than to
someone else's domain. It is also the correct permanent value for this template's own
demo deployment, which has no support inbox to point at.

**Customized templates live in the repo.** Both templates this feature touches — the
change-email confirmation and the email-changed notification — get customized copies in
a templates directory alongside the rest of the project's Supabase config. The repo
copies are the source of truth and the discovery surface: greppable, diffable,
reviewable, and visible in a clone's file tree where a developer will find them. Today
that copy exists nowhere in the repo.

They are not a deployment mechanism. Templates are pasted into the dashboard by hand.
Pushing template config from the repo is a separate, already-parked question — see
*Supabase auth config as code* in `BACKLOG.md` — and this brief does not reopen it. The
accepted ceiling: repo and dashboard can drift, and nothing detects it.

> [!NOTE]
> The templates directory and the kickoff → site config → `initialize-project`
> propagation are template infrastructure, not parts of this feature. They outlive it,
> and other config with the same shape (site URL, redirect allowlist, mail credentials)
> will want the same treatment. Both may warrant an ADR, and possibly their own phase or
> backlog entry rather than riding along with this one. That call belongs to phase
> planning, not to this brief.

**Platform facts established during exploration** (as of 2026-08-25):

- The old address is overwritten in place on confirmation with no previous-email column,
  so any design needing it must persist it first.
- Server-side session revocation kills refresh tokens only — access tokens stay valid
  until they expire.
- Passwordless accounts carry an empty-string password rather than NULL, so any "does
  this account have a password" check must test for empty string, not null.
- The client library accepts the current password on the email-update call (v2.102.0+),
  and a reauthentication OTP template exists for passwordless accounts.

## What success looks like

- A user who signed up with the wrong address can move the account to the right one
  without losing it, entirely self-service.
- A user losing access to their old address can complete the change while they still hold
  the account, without needing to receive mail at the address they are leaving.
- A stolen session alone is not enough to move an account's identity.
- An owner whose password was compromised learns their address was changed, and has
  somewhere to report it.
- A developer cloning the template is asked for their support address during kickoff and
  never has to discover the setting on their own, and gets a clear account of what the
  platform's default mail sending does and doesn't support before they rely on it in
  production.

## Open questions

- **Which address the built-in email-changed notification is delivered to.** The template
  exists and exposes both addresses, but its delivery target is undocumented — old, new,
  or both is unverified, and the design needs old. The likelihood is that it goes to the
  account's current address, which by the time it fires is the new one; that would make it
  useless for this purpose. Inference, not fact.

  Resolvable by a short manual test that needs none of this feature built: create a
  throwaway account, enable the notification, drive the change directly against the auth
  API, and read the `To:` header. Sub-addressing on a single inbox (`you+old@`,
  `you+new@`) makes the answer unambiguous without needing two mailboxes.
- **Whether custom mail delivery is a hard requirement or a documented recommendation.**
  Depends on the above. The fallback is confirmed to exist: the send-email hook's payload
  carries a dedicated email-changed-notification action type and an old-address field, so
  a hook can address the notification wherever the design needs. The built-in sender is
  also capped at a low project-wide hourly limit across all auth mail, which makes it
  unsuitable for production regardless. What's undecided is whether the feature refuses to
  run without a custom sender or documents the ceiling and lets the developer choose.

  Note that custom SMTP and the send-email hook are different layers and only one of them
  answers this. Custom SMTP swaps transport only — the platform still owns and renders the
  templates, so it does not change delivery targets. Only the hook moves rendering and
  addressing into the project's control.
