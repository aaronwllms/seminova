# Security Audit — seminova

Last full audit: 2026-07-21
Last synced: 2026-07-21
Scope: Full repo (W1–W6)

## Executive summary

- **No Critical, High, or open Medium findings.** Prior remediations (S001–S003, S005) remain verified in code.
- **Low — CSP report-only (S004, W6):** Content-Security-Policy ships as report-only unless `CSP_ENFORCE=true`. Inline script protections are not actively enforced; documented nonce upgrade path in `security-headers.ts`.
- **Accepted transport gaps (W6):** Unauthenticated `POST /api/client-logs` can persist capped log rows via the service client when above the admin minimum log level — intentional per ADR-0007; no template rate limit (deployment/WAF concern). Server actions have no app-level throttle; Supabase Auth covers hosted auth endpoints.
- **Verified sound (W1–W5):** Dual admin gate (proxy + `AdminAuthGate` + `assertAdminCaller`), owner-scoped `profiles` RLS, admin-gated `app_settings` / `app_logs` RLS, owner-folder storage RLS, server-only secret key, open-redirect guard, avatar origin check, sanitized auth confirm errors, fail-closed proxy in production, SECURITY DEFINER RPCs with in-function admin gates, trigger functions revoked from client roles.

## Surface map

| Surface            | Count                                                                 | Key paths                                                                                                                                                                                                 |
| ------------------ | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Routes & layouts   | 16 pages, 5 layouts, 2 route handlers                                 | `src/app/(marketing)/`, `src/app/(app)/`, `src/app/auth/**`, `src/app/admin/**`; `src/proxy.ts` → `src/supabase/proxy.ts`; `src/app/auth/confirm/route.ts`, `src/app/api/client-logs/route.ts`         |
| Server actions     | 6 `'use server'` modules, 13 exported actions                         | Profile: `updateProfileAction`, `probeSessionAction`; Admin users: list/stats/promote/demote/ban/unban; Admin logs: list/stats/tags/mark read/unread/all; Admin settings: `saveAppSettingAction`         |
| API routes         | 1 POST handler                                                        | `src/app/api/client-logs/route.ts` (public relay — ADR-0007)                                                                                                                                            |
| DB / RLS           | 3 tables, 13 migrations, 4 SECURITY DEFINER functions                 | `public.profiles` (owner SELECT/INSERT/UPDATE); `public.app_settings` (admin SELECT/INSERT/UPDATE); `public.app_logs` (admin SELECT/UPDATE; INSERT via service client only); `admin_list_users`, `admin_user_stats`, `purge_expired_app_logs`, `handle_new_user` trigger |
| Storage            | 1 bucket, 4 object policies                                           | `storage.avatars` — public SELECT; owner-scoped INSERT/UPDATE/DELETE via first path segment = `auth.uid()`                                                                                               |
| Admin / privileged | 4 admin pages + 4 CLI entrypoints                                     | `src/app/admin/` (`AdminAuthGate`, `assertAdminCaller`); `scripts/admin/` (`promote-admin`, `demote-admin`, `delete-user`, `list-admins`) + `src/supabase/service.ts`                                   |

## Findings

| ID   | Category | File:Line                                  | Severity | Description                                                                                                                             | Recommendation                                                                                                                                                            | Scenario                                                                                                                                              |
| ---- | -------- | ------------------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| S004 | W6       | `src/utils/security-headers.ts:1`, `51-54` | Low      | CSP is emitted as `Content-Security-Policy-Report-Only` unless `CSP_ENFORCE=true`. Inline script protections are not actively enforced. | Follow the existing `// debt:` plan: nonce-based script-src before flipping to enforcing CSP. Track as accepted template risk until product surfaces warrant enforcement. | Attacker who achieves XSS would not be blocked by CSP today; other layers (React escaping, no user-controlled `dangerouslySetInnerHTML`) are primary mitigations. |

## Verified OK

- **W1 — Auth & routing:** Public routes are `/`, `/auth/**`, `/terms`, `/privacy`, `/reference`, `/workflow`, and `/api/client-logs` per `src/supabase/proxy.ts`. Unauthenticated users on protected routes redirect to `/auth/login` with safe `next` preservation; stray auth `code` redirects to `/auth/error?source=stray_code`. Non-admins on `/admin/**` redirect to `/home` at proxy and again in `AdminAuthGate`. `/auth/confirm` uses `isSafeRedirect` for optional `next`. Production proxy fails closed when Supabase env is missing; `scripts/checks/supabase-env.mjs` blocks build without public vars.
- **W2 — RLS:** RLS enabled on all three custom tables. `profiles` — owner-scoped SELECT/INSERT/UPDATE (`20260622120000_create_profiles.sql`). `app_settings` — admin JWT role gate on SELECT/INSERT/UPDATE (`20260716041928_create_app_settings.sql`). `app_logs` — admin SELECT/UPDATE; no client INSERT/DELETE policies — writes only via service client (`20260717234520_create_app_logs.sql`, `20260718191656_app_logs_read_state_and_context_text.sql`). `handle_new_user` and `rls_auto_enable` revoked from `anon`/`authenticated` (`20260720151459_revoke_client_execute_trigger_functions.sql`). Admin RPCs use SECURITY DEFINER with in-function admin gate and static sort allowlists; EXECUTE granted to `authenticated` only.
- **W3 — Server surface:** All server actions authenticate before mutation — profile via `getUser()` + zod + `.eq('id', user.id)`; admin via `assertAdminCaller()` before session or service client use. Admin role/ban mutations block self-demotion and self-ban. `POST /api/client-logs` validates same-origin (`isSameOriginRelayRequest`), closed key registry, zod schema, and payload caps before forwarding to `appLog`. Auth confirm errors use whitelisted `source` params and fixed copy; auth forms use fallback-first `extractAuthFormError`. No IDOR on profile rows (user id from session, not client-supplied owner id).
- **W4 — Storage:** `avatars` bucket intentionally public-read. Write policies scope to owner folder via `(storage.foldername(name))[1] = auth.uid()`. Bucket `file_size_limit` and `allowed_mime_types` mirror client constants. Client upload verifies session user matches `userId`; `isOwnedAvatarStorageUrl` requires Supabase project origin plus owned path suffix before profile persist.
- **W5 — Secrets & exposure:** `SUPABASE_SECRET_KEY` referenced only in `src/supabase/service.ts`, `src/utils/env.ts`, and `scripts/admin/` — never in client bundles or `NEXT_PUBLIC_*`. Service client used for admin auth mutations, log persistence, and uncached settings reads — all server/CLI contexts. Admin user list DTO maps RPC rows to id, email, verification/sign-in labels, admin flag, and ban status — not raw `app_metadata`. Admin log rows return explicit column list including `context` jsonb (admin-only surface behind dual gate).
- **W6 — Transport & abuse hardening:** Security headers applied globally via `next.config.ts` → `getSecurityHeaders()` on `/:path*`. CSP includes `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`; companion `X-Frame-Options: DENY` and HSTS. `script-src` is `'self'` plus Vercel Analytics — no `'unsafe-inline'` or `'unsafe-eval'`. Mutations primarily use `'use server'` actions (Next.js origin verification). `POST /api/client-logs` re-implements origin verification explicitly (ADR-0007). GET `/auth/confirm` is token-bound OTP verification from email links. Unit tests cover CSP header mode and core directives (`security-headers.unit.test.ts`); client-log relay covered by integration tests.

## Deferred / accepted risk

- **S004 — CSP report-only:** Documented intentional template default with upgrade path in `security-headers.ts`. Accept until nonce strategy is implemented for Next.js inline scripts.
- **Client log relay abuse (ADR-0007):** Unauthenticated, same-origin `POST /api/client-logs` can persist rows at/above `min_log_level` via service client. Bounded by closed key registry, tag namespace, payload caps, retention purge, and threshold — not by request count. Accept at template scope; rate-limit at WAF/CDN in production.
- **App-level rate limiting:** Supabase Auth enforces rate limits on sign-in, OTP, and email-send endpoints. Server actions and the client-log relay have no app-level throttle. Accept for current scope; revisit if abuse is observed or custom API routes expand.
- **`style-src 'unsafe-inline'`:** Required for Tailwind inline styles. Accept as standard Next.js compatibility; revisit when CSP moves to enforcing mode.
- **Client-side avatar resize/validation:** Upload path validates MIME and size in the browser before Supabase upload; bucket-level limits and RLS provide server-side enforcement. Direct Storage API calls by authenticated users are limited to their own folder — acceptable for current scope.
- **Admin-configured banner links:** `parseBannerMessage` / `BannerMessage` render admin-set headline/detail with React text nodes and validated http/https or relative hrefs — no raw HTML. Compromised admin account could still point users to a malicious external URL (expected admin trust model).

## Human / tooling follow-ups

- Run `pnpm audit` for dependency CVEs (not evaluated in this pass).
- Manual IDOR test — two accounts: confirm neither can read or update the other's `profiles` row via client or `updateProfileAction`.
- Manual admin bypass test — non-admin session: hit `/admin/users`, `/admin/logs`, `/admin/settings` and invoke admin server actions directly; expect operational 403-style errors.
- Manual RLS test in Supabase SQL editor or local stack: anon cannot SELECT `profiles`, `app_settings`, or `app_logs`; user B cannot UPDATE user A's profile; non-admin authenticated user cannot SELECT `app_settings` or `app_logs`.
- Manual client-log relay test: cross-origin POST without matching Origin/Referer returns 403; forged tag key outside registry returns 400; verify rows appear only at/above configured `min_log_level`.
- Regression: avatar URL with matching path suffix on external host should not persist; stale confirm link shows generic copy only; self-demotion and self-ban blocked.
- W6: Verify response headers in browser DevTools (CSP-Report-Only, X-Frame-Options, HSTS) on a deployed preview.

## Open questions

- _(none)_

## Resolved

| ID   | Resolved   | Fix summary                                                                                                                                                                                                  |
| ---- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| S005 | 2026-07-04 | `isOwnedAvatarStorageUrl` now requires origin match against `NEXT_PUBLIC_SUPABASE_URL` in addition to owned path suffix.                                                                                     |
| S001 | 2026-07-04 | `/auth/confirm` redirects to `/auth/error?source=confirm` or `invalid_link`; error page renders whitelisted fixed copy only (`auth-error-messages.ts`). Supabase codes logged server-side, never in the URL. |
| S003 | 2026-07-04 | Proxy fails closed in production when env missing; `scripts/checks/supabase-env.mjs` blocks `pnpm build` without real Supabase public vars.                                                                  |
| S002 | 2026-07-04 | `extractAuthFormError` returns generic `INTERNAL_ERROR` fault copy for non-`AuthError` paths; original message logged server-side only.                                                                      |
