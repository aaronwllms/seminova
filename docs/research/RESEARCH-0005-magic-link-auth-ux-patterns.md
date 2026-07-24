# RESEARCH-0005: Magic link auth — choice vs single path

**Researched:** 2026-07-23

**Type:** product | competitive | technical

## Question

What are current trends and best practices for magic-link (passwordless email) sign-in? Is it common to let users choose between password and magic link, or is magic link typically a single path with no choice?

## Scope and constraints

**In scope:** Consumer and B2B SaaS login UX patterns (2024–2026 guidance), competitive examples, Supabase Auth capabilities (Seminova’s provider), fit for Phase 17 (Magic Link Auth) as stubbed in ROADMAP.

**Out of scope:** Passkey / WebAuthn implementation detail, SMS OTP as primary factor, SSO/SAML enterprise design (noted only where it affects method choice), full Phase 17 PRD scoping.

**Repo context today:** Email/password auth only (`signInWithPassword` on login; forgot/update password flows). Confirm route already verifies email OTP types for recovery/confirm. Phase 17 stub: magic link toggleable from admin settings; open question is alongside password vs eventual replacement.

## Findings

### Short answer

**Both patterns exist, but “side-by-side equal choice” is not the dominant UX.** Mature products usually pick a **default path**, then offer the other method as a secondary escape hatch — or they go **passwordless-only** for email and never offer passwords at all. Forcing users into a dead-end with no alternate method is widely discouraged; forcing a big “pick password or magic link” decision up front is also uncommon.

### Three common product patterns

| Pattern | How it feels to the user | Who uses it | When it fits |
| ------- | ------------------------ | ----------- | ------------ |
| **A. Passwordless-default + password secondary** | Enter email → get code/link by default; “Sign in with password instead” (or password only if one is set) | Notion, Slack (workspace-dependent) | Product wants low-friction default but keeps passwords for habit, autofill, or admin policy |
| **B. Passwordless-only for email** | Enter email → magic link and/or typed email code; no password field ever | Linear (email + Google + passkeys; no password) | Greenfield or product willing to drop passwords entirely |
| **C. Password-primary + magic link as alternate / recovery-like** | Familiar email + password form; “Email me a link” as secondary CTA | Common migration path for apps that already shipped passwords | Existing password users, password-manager-heavy audiences, gradual adoption |

Industry guidance (LoginRadius, Authgear, CIAM write-ups) converges on: **combine methods and always provide a fallback** — not “pick one forever.” Magic links are strong for low/medium risk and infrequent logins; their failure mode is **email deliverability and inbox context-switching**, not password forgetfulness.

### Competitive snapshot

- **Notion** — Multiple methods: email verification code, password, Google/Apple/Microsoft, passkeys, SAML. Users are not locked to one; email passwordless is first-class alongside password ([Notion Help](https://www.notion.com/help/log-in-and-out)).
- **Slack** — Workspace email magic link / code is the default for many workspaces; password appears only when enabled (“Sign in with a password instead”). Org policy can remove passwords entirely.
- **Linear** — Email login is magic link **plus** a typed code in the same email (no password). Also Google and passkeys. Classic Pattern B.
- **Auth product vendors** (Clerk, Supabase docs, LoginRadius) — Treat password and passwordless as **coexisting capabilities** on one account; UX is product-owned.

### UX best practices that keep recurring

1. **Email-first, then method** — Collect the identifier first; then show passkey / magic link / password / OTP based on what applies. Reduces decision fatigue vs two equal primary buttons.
2. **Never leave a dead end** — If the email is slow or missing: resend, try again later, and an alternate method (password, social, typed OTP). Magic-link-only without OTP-in-email or another fallback is fragile on mobile (app switching).
3. **Prefer link + code in one email** — Desktop users click the link; mobile users often prefer pasting a short code (Linear’s model; also recommended in CIAM guidance). Supabase uses the same `signInWithOtp` API for both; email template chooses link vs OTP content.
4. **Short-lived, one-time tokens** — Typical guidance: minutes-scale expiry, single use; consider a confirm step on the landing page so email security scanners don’t consume the link.
5. **Passwords are not “dead” yet** — Browser autofill makes password login very fast for returning users on established apps. Passwordless shines for signup, recovery, and users who refuse to remember another password — not always for every returning login.
6. **Passkeys are the long-term primary** in 2025–2026 guidance; magic links / email OTP sit as **fallback**, not the forever endgame for high-trust apps. For a template/SaaS starter, magic link is still a high-value near-term feature.

### Supabase / Seminova technical notes

- Magic link and email OTP share `signInWithOtp`; password uses `signInWithPassword`. **Same user can use both** once a password exists (or is later set).
- `shouldCreateUser: false` prevents magic-link from auto-creating accounts if signup should stay gated to the password sign-up path.
- Magic-link-only users who later want a password may need an explicit “set password” path (admin/`updateUser` patterns exist in community guides) — plan for that if Pattern B or passwordless-first signup is chosen.
- Seminova already has `/auth/confirm` OTP verification for email link flows (confirm/recovery). Magic-link sign-in reuses that family of redirects; it is additive UX, not a new auth provider.

### Conversion / friction evidence (directional)

Vendor and ecommerce reports claim large lifts when replacing password walls with passwordless (often cited ~25–40% login success improvements). Treat magnitudes as **biased toward passwordless vendors**, but the directional story matches product consensus: forgotten passwords and reset loops are a major drop-off; email delay is the magic-link tax. Hybrid/orchestrated flows beat “force one method with no escape.”

## Options compared

| Option | Pros | Cons | Fit for Seminova Phase 17 |
| ------ | ---- | ---- | ------------------------- |
| **1. Alongside password (user can use either)** — Pattern A or C | No migration cliff; matches existing users + password managers; admin toggle can enable/disable magic link without deleting passwords | Two paths to maintain; need clear secondary CTA copy | **Best default for a template with shipped password auth** |
| **2. Magic link replaces password** — Pattern B | Simplest mental model; fewer reset tickets | Breaks autofill habits; cross-device email lag; recovery/admin edge cases; spinoffs may still want passwords | Only if product deliberately goes passwordless (bigger decision than Phase 17 stub) |
| **3. Equal “tabs” choice every login** | Explicit control | Decision friction; looks dated vs email-first orchestration | Avoid as primary UX |
| **4. Magic link as recovery only** (keep password login; magic link ≈ forgot-password) | Minimal surface | Under-delivers on “passwordless sign-in” expectation | Too narrow for Phase 17 intent |

**Recommended framing for Phase 17 planning:** ship **alongside** (Option 1), with UX closer to Pattern C or A — password remains available; magic link is a prominent alternate (“Email me a sign-in link”), not a forced sole path. Defer “eventual replacement” to a later product decision (passkeys / passwordless-first), not the first magic-link epic.

## Recommendation

For Seminova (and spinoffs inheriting password auth):

1. **Do not make magic link the only option** in the first ship — existing accounts and autofill make that a regression for many users.
2. **Do not present a peer “Password vs Magic link” chooser as the hero** — use email + password as today, plus a clear secondary path to request a link (or email-first with “Continue” that offers password if set).
3. **Include resend + preferably OTP code in the email** so mobile and delayed-delivery cases aren’t stuck.
4. Keep the **admin toggle** idea: spinoffs can turn magic link off; passwords stay the reliable baseline.
5. Treat **passkeys** as a separate later phase, not a blocker for magic link.

This resolves ROADMAP Phase 17’s open question toward **alongside password auth**, with room to revisit replacement only if a future phase commits to passwordless-first.

## Open questions

- Signup: can new users create accounts via magic link alone, or only via existing password sign-up?
- Should the login page stay password-primary (C) or move to email-first with password secondary (A)?
- Admin toggle: disable magic link only, or also force passwordless (disable password) for a workspace/product?
- Email template: link-only vs link + 6-digit code (Supabase template change)?
- Profile: allow magic-link-only users to set a password later?

## Sources

- [Passwordless email logins — Supabase Docs](https://supabase.com/docs/guides/auth/auth-email-passwordless)
- [Password-based Auth — Supabase Docs](https://supabase.com/docs/guides/auth/passwords)
- [Login & Signup UX: The 2025 Guide — Authgear](https://www.authgear.com/post/login-signup-ux-guide/)
- [Passwordless Authentication Methods Compared — LoginRadius](https://www.loginradius.com/blog/identity/passwordless-authentication-methods-compared)
- [Magic Links vs OTP — CIAM Compass](https://guptadeepak.com/ciam-compass/guides/magic-links-vs-otp/)
- [Notion — Log in & out](https://www.notion.com/help/log-in-and-out)
- [Linear — Login methods](https://linear.app/docs/login-methods)
- Competitive flow notes: Slack/Notion magic-link-default patterns (agent-knowledge auth flows summary)
- Repo: [`ROADMAP.md`](../../ROADMAP.md) Phase 17 stub; current login via password in app auth forms; OTP confirm at `src/app/auth/confirm/`

## Related

- [ROADMAP.md › Phase 17 — Magic Link Auth](../../ROADMAP.md) — open question this brief informs
- Downstream (suggest only): resolve alongside-vs-replace in Phase 17 PRD when that phase is planned; ADR only if choosing passwordless-only as a hard product constraint
