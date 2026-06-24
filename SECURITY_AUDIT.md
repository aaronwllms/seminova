# Security Audit — Seminova

<!-- Live file: SECURITY_AUDIT.md at repo root -->

**Live file:** `SECURITY_AUDIT.md` (repo root) — archive snapshots → `archive/security-audits/` via `/archive-security-audit`

**Generated:** 2026-06-23

**Scope:** Full repo static review (read-only)  
**Produced by:** `/security-audit`  
**Surfaces inventoried:** 10 pages, 6 layouts, 1 route handler, 0 API routes, 2 server-action modules, 1 custom table with RLS, 1 storage bucket, 2 admin pages, 3 migrations

## Surface map

| Surface            | Count                                | Key paths                                                                                                                                                    |
| ------------------ | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Routes & layouts   | 10 pages, 6 layouts, 1 route handler | `src/app/(marketing)/`, `src/app/(app)/profile/`, `src/app/admin/`, `src/app/auth/**`, `src/app/auth/confirm/route.ts`, `proxy.ts` → `src/supabase/proxy.ts` |
| Server actions     | 2 modules (4 exports)                | `src/app/(app)/profile/actions.ts`, `src/app/admin/users/actions.ts`                                                                                         |
| API routes         | 0                                    | `src/app/api/` (empty)                                                                                                                                       |
| DB / RLS           | 1 table, 3 migrations                | `supabase/migrations/20260622120000_create_profiles.sql`, `20260623120000_create_avatars_bucket.sql`, `20260623130000_add_avatars_select_policy.sql`         |
| Storage            | 1 bucket                             | `avatars` — policies in migrations; client upload in `src/utils/avatar-storage.ts`; constants in `src/constants/storage-paths.ts`                            |
| Admin / privileged | 2 pages + CLI                        | `src/app/admin/`, `src/app/admin/users/`, `src/app/admin/_components/admin-auth-gate.tsx`, `src/utils/admin-role-mutations.ts`, `scripts/admin/`             |
| Env & secrets      | 3 vars documented                    | `.env.example` — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`                                                   |

**Review hotspots (inventory only):** auth confirm `next` redirect param; proxy env-var bypass path; profile `avatar_url` server validation; service client usage in admin actions; public-read `avatars` bucket; `handle_new_user` `SECURITY DEFINER` trigger.

---

## Workstreams reviewed

Read-only review across the five workstreams. No application code edits.

### W1 — Auth & routing

**Status:** done

**Files reviewed:**

- `proxy.ts`, `src/supabase/proxy.ts`, `src/supabase/proxy.unit.test.ts`, `src/supabase/proxy.no-env.unit.test.ts`
- `src/app/admin/_components/admin-auth-gate.tsx`, `src/app/admin/layout.tsx`
- `src/app/(app)/layout.tsx`, `src/app/auth/confirm/route.ts`
- `src/components/login-form.tsx`, `src/components/update-password-form.tsx`
- `src/utils/admin.ts`

**Checklist:**

- [x] Non-public routes require session — proxy redirects unauthenticated users to `/auth/login` (except `/` and `/auth/**`)
- [x] Proxy boundary matches AGENTS.md — public: `/`, `/auth/**`; protected: all else; admin: `/admin`, `/admin/**`
- [ ] No open redirects — **finding:** unvalidated `next` on `/auth/confirm` (see Medium)
- [x] Admin segments gated server-side — proxy + `AdminAuthGate` both check `app_metadata.role === 'admin'`
- [x] Post-login redirects safe — `getPostAuthRedirectPath` returns fixed `/admin` or `/profile` only

### W2 — Data layer / RLS

**Status:** done

**Files reviewed:**

- `supabase/migrations/20260622120000_create_profiles.sql`
- `supabase/migrations/20260623120000_create_avatars_bucket.sql`
- `supabase/migrations/20260623130000_add_avatars_select_policy.sql`
- `src/types/database.types.ts`

**Checklist:**

- [x] RLS enabled on `public.profiles`
- [x] Policy scope matches AGENTS.md — owner-scoped `auth.uid() = id` for SELECT, INSERT, UPDATE; no `role` column on profiles
- [x] Separate policies per operation — SELECT, INSERT, UPDATE on profiles; SELECT/INSERT/UPDATE/DELETE on `storage.objects` for `avatars`
- [x] No table relying on client-side filtering — isolation enforced in SQL policies
- [x] `handle_new_user` trigger uses `security definer` with `set search_path = ''` (standard signup backfill pattern)

### W3 — Server surface

**Status:** done

**Files reviewed:**

- `src/app/(app)/profile/actions.ts`, `src/app/(app)/profile/_lib/profile-form-schema.ts`
- `src/app/admin/users/actions.ts`, `src/app/admin/users/_lib/list-admin-users.ts`, `src/app/admin/users/_lib/admin-user-row.ts`
- `src/app/auth/confirm/route.ts`
- `src/utils/extract-auth-form-error.ts`

**Checklist:**

- [x] Server actions authenticate caller — `getUser()` / `getClaims()` + admin gate
- [x] No IDOR on profile update — `.eq('id', user.id)` with RLS backup
- [x] Admin mutations gated — `assertAdminCaller()` before service client; self-demote blocked
- [x] Inputs validated with Zod at boundary — profile partial schema; admin page/userId trimmed
- [ ] Avatar URL not scoped to owner storage path — **finding** (see Low)
- [x] Errors use safe envelopes — generic user messages; auth forms map Supabase errors without user-enumeration copy

### W4 — Storage

**Status:** done

**Files reviewed:**

- `src/utils/avatar-storage.ts`, `src/constants/storage-paths.ts`
- `supabase/migrations/20260623120000_create_avatars_bucket.sql`
- `src/app/(app)/profile/_components/profile-settings-form.tsx`

**Checklist:**

- [x] Bucket write policies scope to owner — first path segment = `auth.uid()` for INSERT/UPDATE/DELETE
- [x] Public-read bucket intentional — `public: true` on `avatars` per AGENTS.md / `supabase.mdc`
- [x] Upload path fixed — `buildAvatarStoragePath(userId)` → `{userId}/avatar.webp`
- [x] Client upload checks session user matches `userId` before upload
- [x] Server-side bucket limits — `file_size_limit` (2 MB) and `allowed_mime_types` in migration mirror client validation
- [x] Stored object always WebP after client resize — reduces MIME spoofing impact; bucket allowlist is a second layer

### W5 — Exposure & secrets

**Status:** done

**Files reviewed:**

- `src/supabase/service.ts`, `src/supabase/client.ts`, `src/supabase/server.ts`
- `.env.example`, `.gitignore`, `next.config.ts`
- `scripts/admin/lib/env.ts`, `scripts/admin/lib/service-client.ts`
- `src/app/admin/users/_lib/admin-user-row.ts` (DTO mapping)

**Checklist:**

- [x] No secrets in client code — `createServiceClient` / `SUPABASE_SECRET_KEY` only in server actions and CLI
- [x] `SUPABASE_SECRET_KEY` not prefixed `NEXT_PUBLIC_*`
- [x] `.env*.local` gitignored
- [x] Admin list returns DTO (`AdminUserRow`) — id, email, labels, `isAdmin`; no password hashes or tokens
- [x] Privileged mutations server-enforced — promote/demote via service client behind admin gate
- [x] No `dangerouslySetInnerHTML` in `src/`

---

## Findings

### Critical

_(none — no unauthenticated privileged data access, missing RLS on user tables, or secret key exposure found in static review.)_

### High

_(none — admin gates and RLS align with AGENTS.md locked rules.)_

### Medium

- [ ] **Open redirect after email OTP confirmation** — `src/app/auth/confirm/route.ts`
  - **Issue:** The `next` query parameter is passed directly to `redirect(next)` after successful `verifyOtp`, with no same-origin validation.
  - **Scenario:** An attacker crafts a confirmation link such as `/auth/confirm?token_hash=…&type=email&next=https://attacker.example/phish`. After the victim completes email verification, they are redirected off-site while authenticated, enabling phishing or token/session confusion attacks.
  - **Remediation hint:** Validate `next` with a same-origin helper (see `.cursor/rules/security.mdc` `isSafeRedirect` pattern); allow only relative paths or an explicit allowlist; default to `getPostAuthRedirectPath` or `/profile`.

### Low

- [ ] **Profile `avatar_url` accepts arbitrary URLs server-side** — `src/app/(app)/profile/actions.ts`, `src/app/(app)/profile/_lib/profile-form-schema.ts`
  - **Issue:** `updateProfileAction` validates `avatarUrl` as any HTTP(S) URL via Zod but does not require the URL to point at the user's own `avatars` storage object.
  - **Scenario:** A signed-in user bypasses the upload UI and calls the server action with an external image URL, another user's public avatar URL, or a tracking pixel URL. The value is stored in `profiles.avatar_url` and rendered in the app header avatar.
  - **Remediation hint:** Restrict server-side to URLs matching the project's public avatar path pattern (`…/avatars/{userId}/avatar.webp`) or reject `avatarUrl` updates that do not originate from `uploadUserAvatar` (e.g. server-side URL builder only).

### Deferred / accepted risk

- [ ] **Proxy skips auth when Supabase public env vars are unset** — `src/supabase/proxy.ts` (`hasEnvVars` early return). Intentional dev bootstrap (`proxy.no-env.unit.test.ts`). Production deployments must set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; misconfiguration leaves routes ungated.
- [ ] **Public-read `avatars` bucket** — by design per AGENTS.md and `supabase.mdc`; all avatar images are world-readable at known paths.
- [ ] **Admin users table exposes email addresses** — intentional for `/admin/users`; gated behind admin role server-side.
- [ ] **Client-side avatar validation only before upload** — acceptable with bucket `allowed_mime_types`, `file_size_limit`, and owner-scoped write RLS as server enforcement.
- [ ] **No security headers in `next.config.ts`** — no CSP, `X-Frame-Options`, or HSTS at app config layer; defer to Vercel/platform hardening or a dedicated headers pass before launch.

---

## Verified OK

- Auth proxy enforces session on non-public routes and redirects non-admins from `/admin/**` to `/profile` (`src/supabase/proxy.ts`).
- Defense in depth on admin: proxy redirect + `AdminAuthGate` server layout gate (`src/app/admin/_components/admin-auth-gate.tsx`).
- Post-login redirects use fixed internal paths via `getPostAuthRedirectPath` (`src/utils/admin.ts`) — no user-controlled redirect in login/password flows.
- `public.profiles` has RLS enabled with owner-scoped SELECT, INSERT, and UPDATE policies; no `role` column (admin stays on `app_metadata.role`).
- Profile server action scopes updates to `user.id` with Zod validation and safe error envelopes.
- Admin server actions (`listUsersAction`, `promoteUserAction`, `demoteUserAction`) require admin claims before `createServiceClient()`; self-demote blocked.
- `SUPABASE_SECRET_KEY` confined to `src/supabase/service.ts` and `scripts/admin/` — not imported from client bundles.
- `AdminUserRow` DTO limits fields returned to the admin UI.
- Storage RLS: owner-folder writes; public SELECT on `avatars` for upsert + public display.
- Avatar upload enforces session `user.id === userId` and fixed storage path (`src/utils/avatar-storage.ts`).
- Auth form errors use generic messaging via `extractAuthFormError`; no bespoke user-enumeration strings.
- `.env.example` documents secrets correctly; `.env*.local` gitignored.
- No `src/app/api/` routes — no unreviewed REST surface.
- No `dangerouslySetInnerHTML` usage in application code.

---

## Human / tooling follow-ups

- [ ] Run `pnpm audit` for dependency CVEs (not executed in this static review).
- [ ] Manual IDOR testing with two user accounts — confirm profile rows and avatar storage paths cannot be read or written cross-user.
- [ ] Manual admin bypass attempt — call `listUsersAction` / `promoteUserAction` as a non-admin session (browser devtools or scripted); expect `FORBIDDEN`.
- [ ] Verify production env — confirm `NEXT_PUBLIC_SUPABASE_*` and `SUPABASE_SECRET_KEY` are set in deploy environment; proxy must not hit the `hasEnvVars` bypass.
- [ ] Open-redirect regression test — attempt `/auth/confirm?…&next=https://example.com` after fix; expect same-origin-only redirect.
- [ ] RLS policy verification on linked Supabase project — run advisors / test policies with two JWTs after `pnpm db:push` (static SQL review only here).
- [ ] Consider security headers pass (CSP, frame ancestors) in `next.config.ts` or Vercel config before public launch.
