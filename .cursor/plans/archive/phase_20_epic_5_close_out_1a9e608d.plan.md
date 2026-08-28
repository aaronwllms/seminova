---
name: Phase 20 Epic 5 Close Out
overview: Update the public feature inventory so it describes passwordless sign-in, and extract the shared email-request card behind the sign-in-link and password-recovery screens.
todos:
  - id: inventory-copy
    content: Rewrite the two stale auth cards in features-content.ts (exact names and blurbs from the plan)
    status: completed
  - id: extract-email-otp-card
    content: Extract EmailOtpRequestCard and reduce both forms to thin callers; both integration suites pass unchanged
    status: completed
  - id: quality-gate
    content: Run pnpm pre-push
    status: completed
  - id: commit-epic
    content: "Conventional commit with Epic: 20.5 trailer"
    status: completed
isProject: false
---

# Phase 20 Epic 5 — Close-out

> **Track progress:** as you complete each step, update the corresponding `todos` entry's `status` to `completed` in this plan's frontmatter.

> **Precondition:** `git status --porcelain --untracked-files=no` must be empty before the first implementation edit. If dirty, halt and ask the user to commit or stash. (Untracked files, e.g. the active plan file in `.cursor/plans/`, are not a halt.) The epic must land as a single commit containing only this epic's work — `code-review` derives its range from that commit.

Approved decision: **extract** the shared email-request component. The two screens differ only in which send and verify calls fire, where verification lands, and four copy strings — everything else is duplicated verbatim. Do **not** write an ADR — that bar requires a decision that's hard to reverse, and inlining the component back into two files is cheap. Do not add a fifth auth inventory card, a `homeHighlight`, or a `referenceAnchor`. Do not mention first-password on `/features` — it's a profile variant, not a shopping-list capability.

No new test files. Inventory copy is static config ([`testing.mdc`](.cursor/rules/testing.mdc) — TypeScript and visual review only), and the extraction is a behaviour-preserving refactor already covered through both consumers.

## 1. Feature inventory

In [`src/config/features-content.ts`](src/config/features-content.ts), rewrite the two stale auth cards. Leave "Sessions and route protection" and "Role-based admin access" alone. Leave icons as they are (`Mail`, `MailCheck`).

Both blurbs stay one clause, in the register the rest of the file uses — roughly 95 characters, never past 110.

- **Was** "Email and password auth"
  - **Name:** Password and magic-link auth
  - **Blurb:** Password sign-up and sign-in, plus a sign-in link or typed code that can create an account on its own.
- **Was** "Email confirmation flow" (keep the name)
  - **Blurb:** Confirm and recovery routes with safe redirects, mapped error copy, and code entry on the screen that requested the email.

Do not touch [`features-content.unit.test.ts`](src/config/features-content.unit.test.ts), page intro copy, or metadata — those still describe "auth" generically and stay true.

## 2. Extract the shared email-request card

Create `src/components/email-otp-request-card.tsx` — a client component owning everything the two screens duplicate today: the email/OTP state, the resend countdown timer, the unmount reset, the expiry-window check in the verify catch, the `AppErrorSurface` placement, the `InputOTP` group, the resend and "use a different email" buttons, and both card states (request form and confirmation).

Props — keep the surface to these; do not add options nothing calls:

- `send: (email: string) => Promise<void>` — fires the provider call and throws on failure. The card owns `lastSentAt`, the countdown reset, and clearing the OTP input after a successful send.
- `verify: (email: string, token: string) => Promise<string>` — verifies and returns the destination path to push. The card owns `router.refresh()` and `router.push()`.
- `title`, `successTitle`, `description`, `successDescription` — the four `CardHeader` strings.
- `successBody: ReactNode` — the paragraph above the code input.
- `submitLabel: string` — the request button's idle label.
- `footer: ReactNode` — the link row under the request form.
- `className` and the usual `div` passthrough.

Then reduce both callers to thin wrappers around it:

- [`src/components/sign-in-link-form.tsx`](src/components/sign-in-link-form.tsx) keeps the `next` prop, `buildSignInLinkOptions`, `loginHref`, and the `getPostAuthRedirectPath` / `isUsableRedirectNext` destination logic — all of it inside its `send` and `verify` callbacks. `verify` passes `type: 'email'`.
- [`src/components/forgot-password-form.tsx`](src/components/forgot-password-form.tsx) keeps `resetPasswordForEmail` and its fixed `/auth/update-password` destination. `verify` passes `type: 'recovery'`.

Every user-visible string moves across **verbatim**, including the non-committal recovery confirmation copy, which must keep not naming the address. No copy, behaviour, timing, or markup changes anywhere in this step — it is a pure move.

**The existing suites are the oracle.** [`sign-in-link-form.integration.test.tsx`](src/components/sign-in-link-form.integration.test.tsx) and [`forgot-password-form.integration.test.tsx`](src/components/forgot-password-form.integration.test.tsx) must pass **unchanged**. Editing either suite is out of scope: a failing assertion means the extraction is wrong, not the test. If a test cannot be made to pass without changing it, stop and report rather than adjusting it.

## Manual verification

1. Signed-out visit to `/features`: Auth category shows the two rewritten cards; the other two auth cards and every other category are unchanged.
2. `/auth/sign-in-link`: request a link, enter the code from the email, land signed in at the right destination. Check resend (countdown disables the button, previous code stops working) and "Use a different email" (returns to the email field, clears any partial code).
3. `/auth/forgot-password`: same pass — request, enter the code, land on `/auth/update-password`. Confirm the confirmation copy still does not name the address.
4. Both screens: a wrong code and an expired code still produce their distinct messages, and the input clears and refocuses after a failure.

## Verification

Quality bar. Stop on failure:

```bash
pnpm pre-push
```

## Commit epic

Authorized by this approved plan:

1. Review diff; stage only files in scope for this epic.
2. Write a conventional commit message (`feat`/`fix`/`docs`/etc.). It **must** end with an `Epic:` git trailer — this is the only thing `code-review` uses to find the commit:

   ```
   refactor(auth): share the email-request card, correct the auth feature inventory

   Epic: 20.5
   ```

   Format is `Epic: {phase}.{id}` — phase number as written in ROADMAP (decimals OK: `7.5`), epic id as written (`1`, `1A`). Blank line before the trailer, nothing after it. Exactly one commit in the repo may carry a given `Epic:` value.
3. Commit (request `git_write`). Pre-commit hook runs automatically — if it fails, **fix and retry the commit** (a failed pre-commit hook aborts the commit, so there is nothing to amend).
4. Verify `git status --porcelain --untracked-files=no` is empty after commit.

**Do not push** — push remains `ship-phase`.

## Handoff

Report the epic is committed, then list what's left for the user.

1. Work through the plan's manual verification steps.
2. Fix and commit anything broken.

Then ask: *"Mark this epic complete?"*

On confirmation, read `.cursor/skills/mark-epic-complete/SKILL.md` and follow it in full, preconditions included — it is user-invoked, so reading the file is this run's only route to it. Without confirmation, end the run; the user can type `/mark-epic-complete` later.

This is the last epic in the phase. After it is marked complete, the next move is `/ship-phase` — do not run that from this epic.