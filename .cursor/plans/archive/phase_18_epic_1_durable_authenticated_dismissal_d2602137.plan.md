---
name: Phase 18 Epic 1 Durable Authenticated Dismissal
overview: Make authenticated banner dismissal durable by reusing the public banner’s content-hash cookie — a second cookie name, the same helpers, no new mechanism.
todos:
  - id: 1.1-wire-authenticated-cookie
    content: Add authenticated dismiss cookie; write it from the slot; honor it in the server entry; replace session-only tests; drop the stale TECH_DEBT_AUDIT note
    status: completed
  - id: 1.1-clear-on-sign-out
    content: Clear the authenticated dismiss cookie on sign-out
    status: completed
  - id: quality-gate
    content: Run pnpm pre-push
    status: completed
  - id: commit-epic
    content: "Conventional commit with Epic: 18.1 trailer"
    status: completed
isProject: false
---

# Phase 18 Epic 1 — Durable Authenticated Dismissal

> **Track progress:** as you complete each step, update the corresponding `todos` entry's `status` to `completed` in this plan's frontmatter.

> **Precondition:** confirm `git branch --show-current` outputs `phase-18/banner-persistence-dismissal`. If it doesn't match, halt and ask the user — do not switch branches.

> **Precondition:** `git status --porcelain` must be empty before the first implementation edit. If dirty, halt and ask the user to commit or stash. The epic must land as a single commit containing only this epic's work — `code-review` derives its range from that commit.

Wire the authenticated banner to the dismissal cookie already proven on the public banner. Do not invent a second hash, a database record, or a shared slot component — the helpers already take a cookie name.

## What exists

The public path is the pattern to copy:

- [src/utils/banner-dismiss-hash.ts](src/utils/banner-dismiss-hash.ts) hashes headline + detail.
- [src/utils/banner-dismiss-cookie.ts](src/utils/banner-dismiss-cookie.ts) writes/reads a named cookie and `resolveLiveBannerSlot` hides a live banner when the cookie matches that hash.
- [src/components/public-banner-slot-entry.tsx](src/components/public-banner-slot-entry.tsx) reads `banner_dismissed_public` on the server and never mounts the slot if dismissed.
- [src/components/public-banner-slot.tsx](src/components/public-banner-slot.tsx) writes that cookie on dismiss.

The authenticated path already calls `resolveLiveBannerSlot` but passes no cookie and never writes one. [src/components/authenticated-banner-slot.tsx](src/components/authenticated-banner-slot.tsx) only flips React state, so a reload remounts the banner. [src/components/authenticated-banner-slot-entry.tsx](src/components/authenticated-banner-slot-entry.tsx) always passes `undefined` as the cookie value.

Public behavior stays untouched. Separate cookies so dismissing one surface does not dismiss the other.

## 1. Add the authenticated cookie name

In [src/constants/banner-cookies.ts](src/constants/banner-cookies.ts), add `BANNER_DISMISSED_AUTHENTICATED_COOKIE = 'banner_dismissed_authenticated'` next to the existing public name. Reuse `BANNER_DISMISS_COOKIE_MAX_AGE` — same ~1 year, `path=/`, `SameSite=Lax`, client-writable. Do not add `HttpOnly` or `Secure`; that would diverge from the public cookie this epic is mirroring.

## 2. Make the authenticated slot write the cookie

Change [src/components/authenticated-banner-slot.tsx](src/components/authenticated-banner-slot.tsx) to match [src/components/public-banner-slot.tsx](src/components/public-banner-slot.tsx):

- Accept `dismissKey` (required) the same way the public slot does.
- On dismiss, call `writeBannerDismissCookie(BANNER_DISMISSED_AUTHENTICATED_COOKIE, dismissKey)` then hide locally.
- Drop `initialDismissed` if the rewritten tests in step 5 do not need it — the server entry now withholds the slot when the cookie matches, so nothing in production passes it. Authenticated slot only; leave the public slot's props alone.

Do not merge the two slot components. They stay surface-specific (different setting key, different cookie). Epics 2 and 3 will still touch both.

## 3. Honor the cookie on the server

Change [src/components/authenticated-banner-slot-entry.tsx](src/components/authenticated-banner-slot-entry.tsx) to match the public entry:

- Read `cookies()` from `next/headers`.
- Pass `cookieStore.get(BANNER_DISMISSED_AUTHENTICATED_COOKIE)?.value` into `resolveLiveBannerSlot` instead of `undefined`.
- Pass `dismissKey` through to the slot and keep `key={dismissKey}` so new copy remounts a visible banner.

`connection()` stays — the entry is already dynamic. Adding `cookies()` is the same dynamic signal the public entry uses.

## 4. Clear the cookie on sign-out

Add `clearBannerDismissCookie(name)` to [src/utils/banner-dismiss-cookie.ts](src/utils/banner-dismiss-cookie.ts) alongside the existing write/read helpers, and call it for `BANNER_DISMISSED_AUTHENTICATED_COOKIE` in the sign-out path ([src/hooks/use-sign-out.ts](src/hooks/use-sign-out.ts)). The cookie is `path=/` and long-lived; without this, the next user to sign in on the same browser inherits the previous user's dismissal.

Add a case to that hook's existing unit test asserting the authenticated cookie is cleared on sign-out. Leave the public cookie untouched — it is not user-scoped.

## 5. Replace the session-only tests

Rewrite [src/components/authenticated-banner-slot.unit.test.tsx](src/components/authenticated-banner-slot.unit.test.tsx) to follow [src/components/public-banner-slot.unit.test.tsx](src/components/public-banner-slot.unit.test.tsx):

- Clear the authenticated cookie in `beforeEach`.
- Dismiss writes `banner_dismissed_authenticated` (the content hash), not the public cookie, and hides the banner.
- After dismiss, remounting with a new headline/detail `dismissKey` shows the banner again.

Delete the two tests that lock in the old behavior: “hide without writing a cookie” and “reappear after remount.” A remount of the client slot alone is not how durability works — the server entry is what withholds the slot when the cookie matches, and `resolveLiveBannerSlot` already covers that in [src/utils/banner-dismiss-cookie.unit.test.ts](src/utils/banner-dismiss-cookie.unit.test.ts). Do not add an entry-component test; the public entry has none.

Leave [src/components/public-banner-slot.unit.test.tsx](src/components/public-banner-slot.unit.test.tsx) and the cookie helper tests unchanged.

## 6. Drop the stale audit note

[TECH_DEBT_AUDIT.md](TECH_DEBT_AUDIT.md) lists “Authenticated banner in-memory dismissal” under Verified OK as intentional product spec. That sentence is false after this epic — delete the bullet. Also remove any `// debt:` marker in the touched source files describing session-only or in-memory authenticated dismissal; the audit file is harvested from those markers, so deleting the bullet alone lets the next `audit-tech-debt` run re-add it. Do not edit [ADR-0009](docs/adr/ADR-0009-client-ui-preferences-localstorage-default.md): accepted ADRs are immutable, and this epic applies the existing cookie-when-SSR-needs-it rule rather than changing it.

## Verification

Manual check first — no automated test covers the server entry reading the cookie:

1. Dismiss the authenticated banner, reload — it stays hidden.
2. Change the authenticated banner's headline in `/admin/settings`, reload — it reappears.
3. Sign out and back in — it reappears.

Then the quality bar — [AGENTS.md § Agent workflow](AGENTS.md#agent-workflow) step 3. Stop on failure:

```bash
pnpm pre-push
```

## Commit epic

Authorized by this approved plan:

1. Review diff; stage only files in scope for this epic.
2. Write a conventional commit message. It **must** end with an `Epic:` git trailer — this is the only thing `code-review` uses to find the commit:

   ```
   feat(phase-18): durable authenticated banner dismissal

   Epic: 18.1
   ```

   Format is `Epic: {phase}.{id}` — phase number as written in ROADMAP, epic id as written. Blank line before the trailer, nothing after it. Exactly one commit in the repo may carry a given `Epic:` value.
3. Commit (request `git_write`). Pre-commit hook runs automatically — if it fails, **fix and retry the commit** (a failed pre-commit hook aborts the commit, so there is nothing to amend).
4. Verify `git status --porcelain` is empty after commit.

**Do not push** — push remains `ship-phase`.

## Handoff

End the run by telling the user:

*"Epic committed. Next: open a new agent window and run `/code-review`."*

Pass nothing else. `code-review` resolves the epic, its commit, and the baseline from the PRD and git.
