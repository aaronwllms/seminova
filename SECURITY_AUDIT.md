# Security Audit — seminova

Last full audit: 2026-07-04
Last synced: —
Scope: full repo

## Executive summary

- **No Critical or High findings.** Auth boundary, admin gate, RLS, and secret-key handling match AGENTS.md hard constraints for a starter template at this scope.
- **Medium — external avatar URLs (S005):** Profile save accepts any HTTPS URL whose path _ends with_ the owned storage suffix; origin is not verified against Supabase. A user can persist a third-party image URL that renders wherever their avatar appears (tracking pixel, swapped image if the remote host changes content).
- **Medium — auth error disclosure (S001):** `/auth/confirm` forwards raw Supabase error text into the `/auth/error` query string, which is rendered to the user. Leaks internal auth failure detail; React escaping prevents XSS.
- **Low — proxy auth bypass without env (S003):** When Supabase public env vars are unset, the proxy skips session checks entirely — all routes become reachable without auth until env is configured.
- **Low — fault-path error leakage (S002):** Non-`AuthError` throws in `extractAuthFormError` surface the raw `Error.message` to the client.
- **Low / accepted — CSP report-only (S004):** Content-Security-Policy ships as report-only with a documented `// debt:` upgrade path; not enforcing until nonce-based script handling exists.
- **Verified sound:** Dual admin gate (proxy + layout), owner-scoped `profiles` RLS, owner-folder storage RLS, server-only `SUPABASE_SECRET_KEY`, open-redirect guard on `/auth/confirm`, admin server actions gated before service client use, profile mutations scoped to authenticated user + RLS.

## Surface map

| Surface            | Count                                | Key paths                                                                                                                                                 |
| ------------------ | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Routes & layouts   | 10 pages, 5 layouts, 1 route handler | `src/app/(marketing)/`, `src/app/(app)/profile/`, `src/app/auth/**`, `src/app/admin/**`; `proxy.ts` → `src/supabase/proxy.ts`                             |
| Server actions     | 2 files, 4 exported actions          | `src/app/(app)/profile/actions.ts` (`updateProfileAction`), `src/app/admin/users/actions.ts` (`listUsersAction`, `promoteUserAction`, `demoteUserAction`) |
| API routes         | 0                                    | No `src/app/api/` routes                                                                                                                                  |
| DB / RLS           | 1 table, 3 migrations                | `public.profiles` — owner-scoped SELECT/INSERT/UPDATE; `handle_new_user` trigger (`security definer`, `search_path = ''`)                                 |
| Storage            | 1 bucket, 4 object policies          | `storage.avatars` — public SELECT; owner-scoped INSERT/UPDATE/DELETE via first path segment = `auth.uid()`                                                |
| Admin / privileged | 2 admin pages + CLI                  | `src/app/admin/` (`AdminAuthGate`, `assertAdminCaller`); `scripts/admin/` + `src/supabase/service.ts`                                                     |

## Findings

| ID   | Category | File:Line                                                                         | Severity | Description                                                                                                                                                                                                                                                                                                                       | Recommendation                                                                                                                                                                                       | Scenario                                                                                                                                                                                                                                             |
| ---- | -------- | --------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S005 | W4 / W3  | `src/utils/avatar-cache-bust.ts:25-34`, `src/app/(app)/profile/actions.ts:96-107` | Medium   | `isOwnedAvatarStorageUrl` checks only that the URL pathname _ends with_ `/avatars/{userId}/avatar.webp`. It does not verify the URL origin is the linked Supabase project. A crafted external URL (e.g. `https://attacker.example/avatars/{own-user-id}/avatar.webp`) passes the check and is persisted to `profiles.avatar_url`. | Require origin match against `NEXT_PUBLIC_SUPABASE_URL` (or the storage public URL prefix) in addition to path suffix; reject all other origins.                                                     | Signed-in user submits profile update with an external HTTPS URL matching the path suffix. Avatar renders from attacker-controlled host wherever the profile avatar is shown — enabling tracking pixels or content swap if the remote image changes. |
| S001 | W1 / W3  | `src/app/auth/confirm/route.ts:33`, `src/app/auth/error/page.tsx:13-16`           | Medium   | On OTP verify failure, `/auth/confirm` redirects to `/auth/error?error=${error?.message}`. The error page renders the query param verbatim (`Code error: …`). Supabase internal failure text reaches the browser. React text escaping mitigates XSS; information disclosure remains.                                              | Map known Supabase OTP errors to user-safe copy (same pattern as `extractAuthFormError`); use a generic message for unmapped codes. Do not pass raw `error.message` in the URL.                      | User clicks a stale or tampered confirm link. Page shows Supabase-specific error detail that aids enumeration or debugging of auth flows. Attacker can also craft `/auth/error?error=…` links for social-engineering copy (self-targeting).          |
| S003 | W1       | `src/supabase/proxy.ts:14-16`, `src/utils/env.ts:1-3`                             | Low      | When `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is unset, `updateSession` returns immediately without auth checks. All non-static routes are reachable without a session.                                                                                                                               | Document as deploy blocker; add a startup/build guard or fail-closed proxy behavior in production (e.g. redirect all protected routes to login when env is missing and `NODE_ENV === 'production'`). | Misconfigured production deploy (missing env) leaves `/profile` and `/admin` reachable without authentication until env is fixed.                                                                                                                    |
| S002 | W3       | `src/utils/extract-auth-form-error.ts:78-83`                                      | Low      | For caught values that are not Supabase `AuthError`, the helper returns `caught.message` with `kind: 'fault'`. Unexpected throw messages (network, library internals) can reach the UI via `ErrorPanel`.                                                                                                                          | Return a fixed generic fault message for non-`AuthError` paths; log the original message server-side only.                                                                                           | A transient network or SDK failure during password change surfaces an internal error string in the profile password dialog.                                                                                                                          |
| S004 | W5       | `src/utils/security-headers.ts:1`, `src/utils/security-headers.ts:51-54`          | Low      | CSP is emitted as `Content-Security-Policy-Report-Only` unless `CSP_ENFORCE=true`. Inline script protections are not actively enforced.                                                                                                                                                                                           | Follow the existing `// debt:` plan: nonce-based script-src before flipping to enforcing CSP. Track as accepted template risk until product surfaces warrant enforcement.                            | Attacker who achieves XSS would not be blocked by CSP today; other layers (React escaping, no `dangerouslySetInnerHTML`) are the primary mitigations.                                                                                                |

## Verified OK

- **W1 — Auth & routing:** Public routes are `/` and `/auth/**` only per `src/supabase/proxy.ts:52-54`. Unauthenticated users redirect to `/auth/login`. Admin paths redirect non-admins to `/profile` at proxy (`proxy.ts:74-81`) and again in `AdminAuthGate` (`admin-auth-gate.tsx:17-19`). `/auth/confirm` uses `isSafeRedirect` for optional `next` param (`confirm/route.ts:28-29`).
- **W2 — RLS:** `public.profiles` has RLS enabled with separate owner-scoped SELECT, INSERT, and UPDATE policies (`20260622120000_create_profiles.sql`). No table relies on client-side filtering for isolation. Signup trigger uses `security definer` with empty `search_path`.
- **W3 — Server surface:** Both server-action modules authenticate before mutation. Profile update uses `getUser()` + zod + `.eq('id', user.id)` with RLS. Admin actions use `assertAdminCaller()` before `createServiceClient()`; self-demotion is blocked (`actions.ts:252-260`). No API routes exist yet.
- **W4 — Storage:** `avatars` bucket is intentionally public-read. Write policies scope to owner folder via `(storage.foldername(name))[1] = auth.uid()`. Bucket `file_size_limit` and `allowed_mime_types` mirror client constants. Client upload verifies session user matches `userId` before upload (`avatar-storage.ts:141-148`).
- **W5 — Secrets & exposure:** `SUPABASE_SECRET_KEY` is referenced only in `src/supabase/service.ts` and `scripts/admin/` — never in client bundles or `NEXT_PUBLIC_*`. Admin user list DTO (`admin-user-row.ts`) exposes id, email, verification/sign-in labels, and admin flag — appropriate for admin-only surface behind dual gate. Auth forms use fallback-first error mapping (`extract-auth-form-error.ts`). Security headers include HSTS and `X-Frame-Options: DENY` (`security-headers.ts:56-63`).

## Deferred / accepted risk

- **S004 — CSP report-only:** Documented intentional template default with upgrade path in `security-headers.ts`. Accept until nonce strategy is implemented for Next.js inline scripts.
- **Client-side avatar resize/validation:** Upload path validates MIME and size in the browser before Supabase upload; bucket-level limits and RLS provide server-side enforcement. Direct Storage API calls by authenticated users are limited to their own folder — acceptable for current scope.

## Human / tooling follow-ups

- Run `pnpm audit` for dependency CVEs (not evaluated in this pass).
- Manual IDOR test: two accounts — confirm neither can read or update the other's `profiles` row via client or server action.
- Manual admin bypass test: non-admin session — hit `/admin/users` and invoke `promoteUserAction` / `listUsersAction` directly; expect 403-style operational errors.
- Manual RLS test in Supabase SQL editor or local stack: verify anon role cannot SELECT `profiles`; verify user B cannot UPDATE user A's row.
- Manual avatar URL test (S005): attempt to save an external URL matching the path suffix; confirm whether it persists and renders.
- Before production: confirm Supabase env vars are set so proxy auth is active (S003).

## Open questions

- Should profile avatar URLs be restricted to Supabase storage origin only (recommended fix for S005), or is arbitrary HTTPS avatar URL an intentional future feature?
- Is displaying raw auth errors on `/auth/error` temporary scaffolding, or should it adopt the same sanitized mapping as auth forms?

## Resolved

- _(none — first full audit)_
