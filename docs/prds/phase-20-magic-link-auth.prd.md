# PRD — Phase 20: Magic Link Auth

**Status:** Active
**Last updated:** 2026-08-27

---

## Problem

Signing in requires a password. Every account must create one, remember it, and
recover it by email when they don't — so email is already load-bearing in the
auth flow, just only on the failure path. For a template whose premise is that a
product should start with good bones, shipping password-only auth means every
spinoff inherits the weakest common denominator and has to add passwordless
itself.

The obvious fix — email a sign-in link — doesn't survive contact with how people
actually read email. Two failure modes matter:

- **Wrong browser.** Mobile mail clients open links in a sandboxed in-app
  browser. The session lands in a webview the person abandons the moment they
  close the message. They are signed in somewhere they will never return to.
- **Wrong device.** A link requested on a desktop and read on a phone signs in
  the phone. The desktop, where the person is actually working, stays signed out.

A typed code fixes both, because verification happens in whatever browser the
person is already using. A confirm-step landing page — the other common
mitigation — fixes neither; it addresses link prefetching by email scanners,
which is a different problem. They are not substitutes.

The same two failure modes already apply to password recovery, which has always
been link-only. It has never been exercised by real users, so the defect is
latent rather than reported.

---

## Goal

Make passwordless email a full authentication capability — able to create
accounts and sign people in on its own — while leaving password sign-in as the
primary path on screen. Capability parity, not visual parity: existing users see
their familiar form, with passwordless one click away.

The organizing principle is **verify where you asked**. Wherever the product
sends an authentication email, the same screen accepts the code from that email.
No new destination, no second tab, no navigation between requesting and
verifying. Password recovery adopts this in the same phase, because it has the
identical defect and shares the identical solution.

A secondary goal follows from the template constraint: a spinoff must be able to
reproduce this. The settings that make it work live in the Supabase dashboard,
outside the repo, so the setup they require is documented where a spinoff already
looks.

---

## Success

A person can sign in without ever having created a password, using either the
link or the code, from whichever browser they started in — and having done so,
can later set a password from their profile and use that instead. A person
resetting a forgotten password can complete it by code without leaving the screen
they requested it from. Someone cloning the template can reproduce all of it by
following the setup documentation, without reading the source.

---

## Out of scope

Considered and deliberately excluded. Recorded so they aren't re-proposed.

- **Admin console toggle for magic link.** Runtime configuration backed by a
  database row, for a decision made once at setup. Wrong mechanism for a
  build-time choice.
- **Environment variable to disable magic link.** Considered as an exit ramp for
  spinoffs without custom email sending. Rejected because password recovery
  already requires working email unconditionally, so the flag would not achieve
  what it appears to — a project with no email budget is already broken, flag or
  no flag. It would also have been interface gating only; the underlying endpoint
  stays live regardless.
- **Email-first two-step login.** A single email field, then a second step
  offering link, code, or password depending on the account. The better long-term
  shape, and where this should eventually go. Excluded here because it rewrites
  the login surface, requires an account-lookup round trip that does not exist,
  opens an account-enumeration question, and adds cross-browser autofill
  verification — all in the same phase that introduces the authentication method
  itself. Deferred deliberately, not forgotten.
- **Custom email-sending configuration as build work.** Dashboard configuration
  with no repository component. A prerequisite for going live, documented as
  such, and not an epic.
- **Client-side attempt counter on code entry.** Resets on reload, so it stops
  the person who mistyped and nobody else. Security theater.
- **Server-side per-code attempt limiting.** Genuine protection, but requires
  per-code attempt state the product does not have. The platform's existing rate
  limiting covers most of the threat. Recorded as a known limitation rather than
  solved.
- **Origin-bound one-time-code email header.** An emerging standard for binding a
  code to a domain. Excluded because the platform's template system exposes
  subject and body only — there is no way to set custom message headers, so the
  task could not be completed as specified.
- **Direct, unhedged copy on password recovery.** Magic link can name the address
  it sent to, because signup is permitted and the outcome is identical either
  way. Recovery cannot, because doing so would confirm whether an account exists.
  The asymmetry is intentional.

---

## Epics & stories

### Epic 1: Magic link sign-in via link `Complete`

**Success criteria:** A person can request a sign-in link from the login screen,
receive it, follow it, and arrive signed in at the correct destination — the
application home, the admin console if they are an administrator, or the
protected page they were originally bounced from. An address with no existing
account creates one this way and arrives signed in, and an account created with a
password can use this path too — the two methods are interchangeable on the same
account.

- Establish shared authentication constants in one place — a six-character code,
  a fifteen-minute lifetime, a thirty-second minimum between sends — noting that
  the dashboard is authoritative and the constants mirror it
- Add a screen for requesting a sign-in link, matching the shape of the existing
  password-recovery request screen
- Add a secondary call to action on the login screen, carrying any pending
  destination through to the request screen
- Request the sign-in link such that an unrecognized address creates an account,
  and name the address directly in the confirmation copy
- Handle both arrival paths a passwordless request can produce — a known address
  receives a sign-in email and verifies as a sign-in, an unknown one receives a
  signup-confirmation email and verifies as a signup — so both land signed in at
  the right destination
- Configure both the sign-in and signup-confirmation email templates in the
  dashboard, pointing them at the same verification route the shipped templates
  already use, commit reference copies to the repository, and document the setup
  step
- Cover the shared verification route with tests for this path, which has never
  been exercised

### Epic 2: Code entry for magic link sign-in `Complete`

**Success criteria:** A person who requested a sign-in link can type or paste the
code from that email into the same screen and sign in without ever following the
link — whether the address was already known or is signing up for the first time.
Incorrect, expired, and rate-limited codes each produce distinct and actionable
messaging. Requesting a new code works, respects the platform's minimum interval
between sends, and invalidates the previous code.

- Adopt a code-entry primitive that presents as separate character slots while
  remaining a single field, and own it alongside the other interface primitives
- Build the code-entry experience: verification against whichever of the two
  arrival paths applies, failure messaging distinguishing wrong from expired from
  rate-limited, cleared and refocused input after a failure, and focus on arrival
  so the operating system can offer the code
- Add resend with a visible countdown, clearing any partially entered code, and
  surfacing server rejection as a real message rather than a silent no-op
- Place code entry directly in the sign-in request screen's confirmation state
- Reset the request screen to its email field on arrival, so returning to it by
  client-side navigation never shows a previous request's confirmation state —
  including the address that request was sent to
- Offer a way back to the email field from the confirmation state, so a mistyped
  address is not a dead end
- Add the code to both the sign-in and signup-confirmation email templates,
  formatted for automatic detection — code in the subject line, unbroken digits,
  no competing numbers nearby
- Document the code length, lifetime, and resend-interval settings as setup steps
  a spinoff must perform

### Epic 3: Code entry for password recovery `Complete`

**Success criteria:** A person resetting a forgotten password can complete
verification by code without following the link, arriving at the screen where
they set the new password. An address with no account behaves identically to one
with an account — same screen, same messages, nothing disclosed.

- Place the same code-entry experience in the password-recovery confirmation
  state, verifying as a recovery attempt and continuing to the password-setting
  screen
- Preserve the existing non-committal confirmation copy, and confirm the screen
  behaves identically for an address with no account
- Apply the same arrival reset and way-back-to-the-email-field behaviour to the
  password-recovery request screen, which has the identical confirmation-state
  defect today
- Add the code to the password-recovery email template, matching the sign-in
  template's formatting, and commit the reference copy

### Epic 4: Setting a first password `Complete`

**Success criteria:** A person who signed up without a password can set one from
their profile and afterwards sign in with it. A person who already has a password
still gets the flow requiring their current one.

- Record on the profile whether the account has a password, set when the app sets
  one and backfilled true for every account existing before this phase, so the
  profile screen can tell the two cases apart
- Present a first-password variant of the profile password controls — new and
  confirmation only, no current-password field, and a heading matching what the
  person is actually doing
- Cover both variants with tests

### Epic 5: Close-out

**Success criteria:** The template's feature inventory reflects passwordless
sign-in, and a decision is on record about whether the two email-request screens
share a common component.

- Update the feature inventory content so the template describes the
  authentication it now ships
- Compare the two email-request screens directly and either extract the shared
  component or record why the overlap did not hold

---

## Notes

**Sequencing.** Epic 1 delivers a working capability on its own; if the phase
stopped there, passwordless sign-in would exist. Epic 2 builds the code-entry
experience complete, including resend, which makes Epic 3 nearly free. Epic 4
depends on Epic 1 only in that passwordless accounts must be creatable before the
gap it closes can be observed — it can move earlier to retire its unknown sooner.
Epic 5 is deliberately last, because both of its stories describe the shipped
state.

**Configuration confirmed before build.** Verified directly against the dashboard
and a live test account on 2026-08-26. These are facts, not assumptions, and the
stories below are built on them:

- **Code length is six characters; lifetime is fifteen minutes.** Both were
  changed from what the project was running (eight characters, one hour), neither
  of which had been chosen deliberately. Lifetime is a single project-wide
  setting shared across sign-in, recovery, and signup confirmation.
- **Minimum interval between sends is thirty seconds**, changed from the platform
  default of sixty. It governs every auth email the project sends, not only
  passwordless.
- **Signup requires email confirmation**, so the signup-confirmation template is
  a live flow and worth version-controlling.
- **A passwordless signup stores a password hash indistinguishable from a real
  one.** Confirmed by creating an account through the sign-in endpoint and
  reading the column directly — the platform generates one internally. There is
  therefore no readable ground truth for "has a password," which is why Epic 4
  records it on the profile instead.

Pasting the templates into the dashboard is still outstanding, but belongs to
Epics 1–3 rather than here — the repository copies have to exist first.

**Configuration is authoritative outside the repository.** Code length, code
lifetime, email templates, and redirect permissions all live in the dashboard.
The repository mirrors them — as constants, as reference template copies, as
setup documentation — but nothing enforces the match, and nothing detects drift.
This trade is accepted deliberately in three places in this phase. A build-time
check against the platform's management interface was considered and rejected as
credential-management overhead defending against a change nobody is expected to
make. If a fourth instance of this pattern appears in a later phase, that is the
point to reconsider.

**A passwordless request produces one of two flows, not one.** An address the
project already knows receives the sign-in email and verifies as a sign-in. An
address it does not receives the signup-confirmation email instead, and verifies
as a signup. The requesting screen cannot know which in advance, so it has to
handle both — and the signup-confirmation template needs the typed code just as
much as the sign-in one, since first contact is the flow where being stranded
with a link that opens in the wrong browser costs the most. This was discovered
late in planning by inspecting a real send; it is the third time this phase
grew.

**Operating-system code autofill is a bonus, not a requirement.** On some
platforms the code can be offered automatically from the email. It is
undocumented, version-dependent, restricted by mail client, and has no equivalent
on other platforms. Build the markup and email formatting so it can work; do not
treat it as a done bar. Manual paste is the path that must work everywhere.

**A known limitation ships with this phase.** Short codes are brute-forceable in
principle, and the platform's rate limiting is per-origin rather than per-code,
so a determined distributed attempt has meaningful tries inside the code's
lifetime. The mitigation is platform-side, not product-side. Recorded, not
solved.

**Verifying the rate-limit path is expensive.** Observing the too-many-requests
message requires deliberately exhausting the hourly sending allowance. Treat it
as verified once by hand rather than something exercised repeatedly.

**This phase grew twice during planning.** It began as adding a sign-in method.
Adding typed codes roughly doubled it; extending those codes to password recovery
grew it again. Both were the right calls, but the phase is substantially larger
than its original stub implied and should be scheduled accordingly.

**Password strength settings break passwordless signup.** The platform generates
a password internally when a passwordless signup creates an account, and that
generated value is validated against the project's password requirements — so a
project with strict character requirements rejects passwordless account creation
outright, complaining about a password the person never typed. This project has
no character requirements set, so it is unaffected. A spinoff that tightens them
will silently lose passwordless signup, which is worth saying in the setup
documentation.

**One planning-time correction worth carrying forward.** The stub describes the
shared verification route as unreachable. It is not — the setup documentation
already directs the signup and recovery templates through it, so it has been the
live path all along for any correctly configured project. The error came from
inferring configuration from repository contents when configuration lives in the
dashboard. It remains true that the route has never been exercised by real
traffic, which is why Epic 1 covers it with tests.
