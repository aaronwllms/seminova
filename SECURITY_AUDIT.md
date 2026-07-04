# Security Audit — seminova

Last full audit: 2026-07-04
Last synced: 2026-07-04
Scope: full repo

## Executive summary

- **No Critical, High, or open Medium/Low findings.** S001, S002, S003, and S005 were remediated on 2026-07-04.
- **Low / accepted — CSP report-only (S004):** Content-Security-Policy ships as report-only with a documented `// debt:` upgrade path; not enforcing until nonce-based script handling exists.
- **Verified sound:** Dual admin gate (proxy + layout), owner-scoped `profiles` RLS, owner-folder storage RLS, server-only `SUPABASE_SECRET_KEY`, open-redirect guard on `/auth/confirm`, admin server actions gated before service client use, profile mutations scoped to authenticated user + RLS, avatar URLs restricted to Supabase project origin, sanitized auth confirm errors, fail-closed proxy in production without env, generic fault copy for non-auth errors.

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

| ID   | Category | File:Line                                  | Severity | Description                                                                                                                             | Recommendation                                                                                                                                                            | Scenario                                                                                                                                              |
| ---- | -------- | ------------------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| S004 | W5       | `src/utils/security-headers.ts:1`, `51-54` | Low      | CSP is emitted as `Content-Security-Policy-Report-Only` unless `CSP_ENFORCE=true`. Inline script protections are not actively enforced. | Follow the existing `// debt:` plan: nonce-based script-src before flipping to enforcing CSP. Track as accepted template risk until product surfaces warrant enforcement. | Attacker who achieves XSS would not be blocked by CSP today; other layers (React escaping, no `dangerouslySetInnerHTML`) are the primary mitigations. |

## Verified OK

- **W1 — Auth & routing:** Public routes are `/` and `/auth/**` only per `src/supabase/proxy.ts`. Unauthenticated users redirect to `/auth/login`. Admin paths redirect non-admins to `/profile` at proxy and again in `AdminAuthGate`. `/auth/confirm` uses `isSafeRedirect` for optional `next` param. Production proxy fails closed when Supabase env is missing (`proxy.ts` + `scripts/checks/supabase-env.mjs` on build).
- **W2 — RLS:** `public.profiles` has RLS enabled with separate owner-scoped SELECT, INSERT, and UPDATE policies (`20260622120000_create_profiles.sql`). No table relies on client-side filtering for isolation. Signup trigger uses `security definer` with empty `search_path`.
- **W3 — Server surface:** Both server-action modules authenticate before mutation. Profile update uses `getUser()` + zod + `.eq('id', user.id)` with RLS. Admin actions use `assertAdminCaller()` before `createServiceClient()`; self-demotion is blocked. No API routes exist yet. Auth confirm errors use whitelisted `source` params and fixed copy (`auth-error-messages.ts`). Non-auth faults return generic copy via `extractAuthFormError`.
- **W4 — Storage:** `avatars` bucket is intentionally public-read. Write policies scope to owner folder via `(storage.foldername(name))[1] = auth.uid()`. Bucket `file_size_limit` and `allowed_mime_types` mirror client constants. Client upload verifies session user matches `userId` before upload. `isOwnedAvatarStorageUrl` requires Supabase project origin + owned path suffix.
- **W5 — Secrets & exposure:** `SUPABASE_SECRET_KEY` is referenced only in `src/supabase/service.ts` and `scripts/admin/` — never in client bundles or `NEXT_PUBLIC_*`. Admin user list DTO exposes id, email, verification/sign-in labels, and admin flag — appropriate for admin-only surface behind dual gate. Auth forms use fallback-first error mapping. Security headers include HSTS and `X-Frame-Options: DENY`.

## Deferred / accepted risk

- **S004 — CSP report-only:** Documented intentional template default with upgrade path in `security-headers.ts`. Accept until nonce strategy is implemented for Next.js inline scripts.
- **Client-side avatar resize/validation:** Upload path validates MIME and size in the browser before Supabase upload; bucket-level limits and RLS provide server-side enforcement. Direct Storage API calls by authenticated users are limited to their own folder — acceptable for current scope.

## Human / tooling follow-ups

- Run `pnpm audit` for dependency CVEs (not evaluated in this pass).
- Manual IDOR test: two accounts — confirm neither can read or update the other's `profiles` row via client or server action.
- Manual admin bypass test: non-admin session — hit `/admin/users` and invoke `promoteUserAction` / `listUsersAction` directly; expect 403-style operational errors.
- Manual RLS test in Supabase SQL editor or local stack: verify anon role cannot SELECT `profiles`; verify user B cannot UPDATE user A's row.
- Regression: avatar URL with matching path suffix on external host should not persist; stale confirm link shows generic copy only.

## Open questions

- _(none — S005 and S001 product decisions resolved by remediation)_

## Resolved

| ID   | Resolved   | Fix summary                                                                                                                                                                                                  |
| ---- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| S005 | 2026-07-04 | `isOwnedAvatarStorageUrl` now requires origin match against `NEXT_PUBLIC_SUPABASE_URL` in addition to owned path suffix.                                                                                     |
| S001 | 2026-07-04 | `/auth/confirm` redirects to `/auth/error?source=confirm` or `invalid_link`; error page renders whitelisted fixed copy only (`auth-error-messages.ts`). Supabase codes logged server-side, never in the URL. |
| S003 | 2026-07-04 | Proxy fails closed in production when env missing; `scripts/checks/supabase-env.mjs` blocks `pnpm build` without real Supabase public vars.                                                                  |
| S002 | 2026-07-04 | `extractAuthFormError` returns generic `INTERNAL_ERROR` fault copy for non-`AuthError` paths; original message logged server-side only.                                                                      |
