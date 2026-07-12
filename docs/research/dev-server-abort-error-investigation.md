# Dev-server abort & Supabase noise — investigation

**Researched:** 2026-07-12

**Type:** codebase / technical

## Question

Why does `pnpm dev` (Next.js 16.2.9, Turbopack, `cacheComponents: true`) flood the terminal with two error families on nearly every navigation, while pages still return HTTP 200?

1. **Family A — Supabase unreachable:** `TypeError: fetch failed` / `getaddrinfo ENOTFOUND <project>.supabase.co`, plus `AuthRetryableFetchError: This operation was aborted`.
2. **Family B — generic aborts:** `AbortError: This operation was aborted` (code 20, `ABORT_ERR`, `at ignore-listed frames`).

## Scope and constraints

- Research only — no application fixes applied.
- Temporary isolation edits (auth/github stubs, `.env.local` swap) were reverted; `git status --porcelain` is clean at end.
- Covers **both** Supabase auth paths and GitHub-stats / Cache Components paths (prior pass was GitHub-only).

---

## Summary of prior attempts

| When | What was tried | Outcome |
|------|----------------|---------|
| **2026-07-12 ~09:11** | Chat-only research pass ([agent transcript 55d0a642](agent-transcripts/55d0a642-bde1-4972-b7d6-7c8bfe959e35)) | Identified Cache Components staged dev rendering, GitHub nav prefetch, dual `LandingAuthSlot` Supabase probes. **No file saved to `docs/research/`.** Bisection stubs blocked in that session. |
| **Commit `709375e`** | `prefetch: false` on GitHub nav link; added `github/loading.tsx` skeleton | Reduces background `/github` warming from header prefetch. **Does not eliminate** dev AbortError bursts (still observed in terminal after this commit). |
| **Commit `ec67ea7`** | GitHub release fetch tolerant of 403/404; optional `GITHUB_TOKEN`; release moved out of fatal `Promise.all` | Fixes **build/runtime 403 rate-limit** logging (`[github-stats] Failed…`). Unrelated to AbortError spam; orthogonal hardening. |
| **Commit `85703df`** | `check:supabase-env` loads `.env` via `@next/env` | Validates vars are **present/well-formed**, not host reachability. |
| **Git history / PRDs / plans archive** | `git log --grep=AbortError` etc. | No prior commits targeting dev AbortError. Phase 11 PRD does not mention this issue. |

---

## 1. Supabase reachability

### Current `.env.local` host (this machine, 2026-07-12)

```text
$ host sonsgmxfrdrbhakkimwc.supabase.co
sonsgmxfrdrbhakkimwc.supabase.co has address 172.64.149.246
sonsgmxfrdrbhakkimwc.supabase.co has address 104.18.38.10

$ curl -sS -o /dev/null -w "HTTP %{http_code}\n" --max-time 5 \
  https://sonsgmxfrdrbhakkimwc.supabase.co/auth/v1/health
HTTP 401
```

**Verdict:** Configured host is **resolvable and live** today. `ENOTFOUND` in the user's report is **environmental** (deleted/wrong project id, offline DNS, or typo) — not a code bug that invents a bad hostname.

Placeholder values from `.env.example` are worse than unreachable DNS:

```text
$ host your-project-url
Host your-project-url not found: 3(NXDOMAIN)
```

With `.env.local` set to `your-project-url` / `your-publishable-key`, dev logs show **`TypeError: Invalid URL`** (×2 per page request), not `ENOTFOUND`.

### Does code assume reachability?

**Yes, when public env vars are set and a code path performs a network auth call.** There is no reachability preflight; failures surface as thrown/logged fetch errors.

`scripts/checks/supabase-env.mjs` only rejects missing/placeholder keys — it does **not** DNS-check or HTTP-probe the host.

### Every Supabase touchpoint on PUBLIC marketing routes

| # | Path | Trigger | Network? |
|---|------|---------|------------|
| 1 | `proxy.ts` → `src/supabase/proxy.ts` | **Every** matched request (including `/`, `/reference`, `/workflow`, `/github`) when `hasPublicSupabaseEnv` | `supabase.auth.getClaims()` — reads cookies via `getSession()`; **network only if a session access token needs JWKS / `getUser` validation** |
| 2 | `src/app/(marketing)/_components/landing-auth-slot.tsx` | Marketing layout header (desktop + mobile Suspense slots) | `hasServerAuthSession()` → `getClaims(accessToken, { allowExpired: true })` when cookie present |
| 3 | `src/supabase/require-auth.ts` | Shared by #1 (via `parseAuthenticatedClaims`) and #2 | Same client stack |

**Not on public route bodies:** `/reference`, `/workflow`, `/` page components do **not** import Supabase. `/github` fetches GitHub only (`github-stats.ts`).

**Protected-only paths (not public):** `getDisplayAuthClaims`, `getCurrentUserProfile`, profile/admin actions — irrelevant to marketing navigation.

### Proxy behavior when env missing (template dev)

From `src/supabase/proxy.ts`:

- `!hasPublicSupabaseEnv` + `NODE_ENV !== 'production'` + public route → **pass through without creating a Supabase client** (no `getClaims`).
- Protected routes → **503** with a clear message.

---

## 2. Family B vs Family A (bisection)

### Method

Temporary stubs (reverted):

- `hasServerAuthSession` early `return false` (skip Supabase in header).
- `fetchGithubRepoStats` static stub (skip six GitHub fetches).

Live dev server on port 3000; `curl` with `Cache-Control: no-cache` where noted.

### Results

| Scenario | `AbortError` | `AuthRetryableFetchError` | `ENOTFOUND` / `fetch failed` |
|----------|--------------|---------------------------|------------------------------|
| Both stubs active + load `/reference`, `/github` | **None** in new log lines | **None** | **None** |
| Reachable Supabase + normal code (terminal capture) | **Many** around `GET /github`, `/icon` | **Pairs** after navigation bursts | Rare (`TypeError: fetch failed` in `.next/dev/logs/next-development.log` at 00:00:27) |
| Dev + valid-format unreachable host (`definitely-invalid-project-id.supabase.co`), **no session cookie** | **None** | **None** | **None** (no network attempt without token) |
| Dev + `.env.example` placeholders (`your-project-url`) | **None** | **None** | **`TypeError: Invalid URL`** ×2 per request |
| Dev + **no** `.env.local` | **None** | **None** | **None** |
| `pnpm build && pnpm start` (port 3007), all four public routes | **0** | **0** | **0** |

### Independence verdict

- **Family B (`AbortError`) is not solely a symptom of dead Supabase.** It persists with reachable Supabase and disappears when GitHub fetches are stubbed, even while auth stub is active.
- **Family A (`AuthRetryableFetchError` / `fetch failed` / `ENOTFOUND`) is a separate Supabase-network failure family.** It clusters when session cookies force `getClaims(token)` / JWKS / `getUser` against a bad host, or when intermittent DNS/network fails.
- **Shared mechanism:** both often appear as “aborted” because Next.js dev **aborts in-flight `fetch()`** when a render is superseded; Supabase wraps that as `AuthRetryableFetchError`, undici as `AbortError`.

**Partially dependent, partially independent** — same abort machinery, different upstream callers.

---

## 3. Real origin of code-20 `AbortError`

### Why stacks show `ignore-listed frames`

Next.js / Node collapse internal frames (undici, compiled `next/dist`) in dev error formatting. This is not app code hiding errors.

### Confirmed sources (ranked by evidence)

**A. Next.js patched `fetch` — stale background revalidation (dev)**

`node_modules/next/dist/server/lib/patch-fetch.js` (~L759–773):

- On stale cache hits in **development**, starts `doOriginalFetch(true)` as `pendingRevalidate`.
- Attaches `pendingRevalidate.catch(console.error)` — **prints aborted revalidations directly to the terminal**, bypassing the unhandled-rejection filter.
- Stale revalidates **strip `signal`** from init (fix for [vercel/next.js#54045](https://github.com/vercel/next.js/issues/54045)) — so these aborts are **render/request cancellation**, not stale-signal reuse.

**B. Cache Components staged rendering (dev-only)**

`unhandled-rejection.external.js` documents that aborted prerender work may reject promises intentionally; filter suppresses some `prerender*` cases when `renderSignal.aborted`, but **`request`-type work** and `.catch(console.error)` paths still log.

`patch-fetch.js` gates `stagedRendering.waitForStage(RenderStage.Dynamic)` on `NODE_ENV === 'development'`.

**C. Application fetches that get aborted**

| Caller | File | Notes |
|--------|------|-------|
| GitHub REST ×6 (+1 release) | `src/app/(marketing)/github/_lib/github-stats.ts` | `fetch(..., { next: { revalidate: 3600 } })`; slow parallel work; **stubbing eliminates `AbortError` on curl** |
| Supabase auth | `hasServerAuthSession` ×2 (desktop + mobile Suspense) | Only when session cookie present; manifests as **`AuthRetryableFetchError`**, not bare `AbortError` |
| `/icon` | `src/app/icon.tsx` | No `fetch`; abort noise **correlates** with concurrent page render, not icon code |

`github-page-content.tsx` **re-throws** `AbortError` (does not show fault UI). Winning render still completes with 200.

---

## 4. Cache Components correctness

### Config

`next.config.ts`:

```ts
cacheComponents: true
```

No `reactCompiler` or other experimental cache flags.

### `next.revalidate` vs `'use cache'`

Per [Migrating to Cache Components](https://nextjs.org/docs/app/guides/migrating-to-cache-components) (fetched 2026-07-12):

- **Both coexist:** “Your existing `fetch` and `unstable_cache` caching keeps working as a separate layer.”
- **Idiomatic CC path:** `'use cache'` + `cacheLife()` / `cacheTag()`.
- Route-segment `export const revalidate` is **replaced by** `cacheLife` in CC-first code; per-fetch `next: { revalidate }` remains valid as the **fetch Data Cache** layer.

### `github-stats.ts` under current config

- Uses `fetch(..., { next: { revalidate: 3600 } })` — **supported**, separate from `use cache`.
- Build output: `/github` shows `◐ (Partial Prerender) 1h 1y` — PPR shell + cached dynamic stats; **correct for current pattern**.
- **Not incorrect**, but CC-idiomatic migration (`'use cache'` + `cacheLife('hours')` around the stats function) may integrate cleaner with staged rendering (uncertain impact on dev log noise).

---

## 5. Template first-run experience

Simulated by swapping `.env.local` (restored after each test):

| Clone state | Public pages | Console |
|-------------|--------------|---------|
| **No `.env.local`** | `/`, `/reference`, `/workflow`, `/github` → **200** | **Clean** — proxy skips Supabase on public routes in dev |
| **Placeholder values** (`your-project-url`) | **200** | **`TypeError: Invalid URL`** spam (×2 per navigation) — proxy + server client construct invalid URL |
| **Valid-format unreachable host**, logged out | **200** | **Clean on curl** — no session → no JWKS/`getUser` network |
| **Valid-format unreachable host**, logged in (inferred from user terminal) | **200** | **`fetch failed` / `ENOTFOUND` + `AuthRetryableFetchError`** flood |
| **Reachable Supabase**, normal dev | **200** | **`AbortError` + `AuthRetryableFetchError` bursts** (families A+B) |

**Template-first-run verdict:**

- **Best case (no env file):** degraded-but-clean public browsing; protected routes 503 in dev.
- **Typical mistake (copy `.env.example` without editing):** **Invalid URL spam** — worse UX than “one clear message.”
- **Configured but dead project + past login cookie:** DNS/network error flood — **no single friendly degraded state**; raw abort/DNS noise.

`check:supabase-env` fails on placeholders at build time, but **`pnpm dev` still runs** and logs errors.

---

## 6. Environment scope (dev vs prod)

| Test | Abort / Supabase noise |
|------|------------------------|
| `pnpm dev` (Turbopack, CC on) | **Yes** — terminal + `.next/dev/logs/next-development.log` |
| `pnpm build && pnpm start` (ports 3007, 3012, 3013) | **No** — 0 matches for `AbortError`, `AuthRetryable`, `ENOTFOUND`, `fetch failed` across `/`, `/reference`, `/workflow`, `/github` |

**Verdict:** Both families are **dev-primary artifacts** for normal reachable config. Production verification passed on this machine.

### Next.js issue landscape

| Reference | Relevance |
|-----------|-----------|
| [vercel/next.js#54045](https://github.com/vercel/next.js/issues/54045) | Stale revalidate + `AbortController` reuse — **mitigated** in patch-fetch (signal stripped on stale) |
| [vercel/next.js#86690](https://github.com/vercel/next.js/pull/86690) | CC abandoned render / hanging promises |
| [vercel/next.js#81754](https://github.com/vercel/next.js/commit/2256b6b) | Separate abort signals for prerender vs render |
| [vercel/next.js#84649](https://github.com/vercel/next.js/issues/84649) | Middleware abort crashes — **proxy** present; not observed crashing here |

Dev `pendingRevalidate.catch(console.error)` is an intentional anti-unhandled-rejection path that still **prints** to stderr.

---

## Root causes (by family)

### Family A — Supabase unreachable / `AuthRetryableFetchError`

**Root cause:** Public env forces Supabase client creation. When a **session cookie** exists, `getClaims(token)` may call `fetchJwk` / `getUser` against `NEXT_PUBLIC_SUPABASE_URL`. If the host is invalid, deleted, or offline, fetch fails (`ENOTFOUND`, `fetch failed`) or is **aborted** when the dev render is cancelled → Supabase wraps as `AuthRetryableFetchError` (`status: 0`).

**Additional trigger:** `proxy.ts` calls `getClaims()` on every request when env is set; with cookie + bad URL, same path.

**Evidence:** `AuthRetryableFetchError` pairs in `terminals/1.txt` L356–407; `TypeError: fetch failed` in `.next/dev/logs/next-development.log` L9–10; placeholder env → `TypeError: Invalid URL` in `/tmp/seminova-dev-placeholder.log`; `host` + `curl` probes above.

### Family B — `AbortError` code 20

**Root cause:** Next.js 16 **Cache Components staged dev rendering** aborts in-flight `fetch()` when renders overlap (navigation, hard refresh, slow GitHub stats). Aborted promises surface as `AbortError`. Dev stale-cache **background revalidation** logs via `pendingRevalidate.catch(console.error)` in `patch-fetch.js`.

Primary app contributors: **six parallel GitHub API fetches** on `/github` (and direct navigation thereto). Header auth probes contribute the **AuthRetryable** variant, not bare `AbortError`.

**Evidence:** Terminal bursts after `GET /github` (~1.7s application-code) and `/icon`; stubbing `fetchGithubRepoStats` silences new `AbortError` lines; `patch-fetch.js` L773; prod `pnpm start` silent.

---

## Benign vs harmful / dev vs prod

| Family | Benign? | Dev-only? |
|--------|---------|-----------|
| **A — Supabase** | **Mostly benign** when pages render 200; misleads log monitoring. **Harmful** for template onboarding signal-to-noise. | **Dev-primary** for abort-shaped errors; prod quiet in tests. **ENOTFOUND** is real misconfiguration when host dead. |
| **B — AbortError** | **Benign** — no observed data loss; `/github` serves full stats; aborts are losing sibling renders. | **Dev-primary** — absent in `pnpm start` reproduction. |

---

## Remediation options

### Family A — Supabase

| Option | Tradeoffs |
|--------|-----------|
| **A1. Reachability-aware guard in dev** — e.g. probe or catch DNS/`Invalid URL` once at startup, print **one** actionable banner | Best template UX; adds dev-only code path; must not weaken prod auth |
| **A2. Stricter `check:supabase-env`** — validate URL shape (`https://*.supabase.co`) and optional DNS probe in `pre-push` | Fails fast before dev; DNS in CI can flake; doesn't fix deleted projects |
| **A3. Consolidate header auth to single Suspense probe** | Halves duplicate `getClaims` when logged in; does not fix proxy `getClaims` |
| **A4. Document “delete cookies or fix URL”** for clone setup | Zero code; doesn't stop flood |

### Family B — AbortError

| Option | Tradeoffs |
|--------|-----------|
| **B1. Migrate `github-stats` to `'use cache'` + `cacheLife('hours')`** | CC-idiomatic; may reduce abandon churn; migration cost; **uncertain** log impact |
| **B2. Keep fetch revalidate; swallow/rethrow policy** — catch `AbortError` in `fetchGithubRepoStats` and return cache (already rethrows) | Risk hiding real failures; fights Next abort semantics |
| **B3. Accept as dev-only noise** | Zero cost; document in README/AGENTS; optional `NEXT_UNHANDLED_REJECTION_FILTER=silent` (does **not** silence `pendingRevalidate.catch(console.error)`) |
| **B4. Upstream Next.js** — track CC dev logging; upgrade when fixes ship | No app diff; may wait indefinitely |

**Already shipped (partial):** `prefetch: false` on GitHub nav (`709375e`), `/github` `loading.tsx` — reduces but **does not eliminate** bursts on direct `/github` visits and CC revalidation.

---

## Open questions

1. Does `pnpm start` stay silent under **logged-in browser session** + hard refresh (not just `curl`)?
2. Would `'use cache'` on `fetchGithubRepoStats` measurably reduce dev aborts vs current fetch cache?
3. Should placeholder `.env.example` values be **empty** so `hasPublicSupabaseEnv` is false until configured (cleaner first-run)?

---

## Sources

- `next.config.ts`, `src/supabase/proxy.ts`, `src/supabase/require-auth.ts`, `src/app/(marketing)/_components/landing-header.tsx`, `landing-auth-slot.tsx`, `src/app/(marketing)/github/_lib/github-stats.ts`, `github-page-content.tsx`
- `scripts/checks/supabase-env.mjs`, `.env.example`
- `node_modules/next/dist/server/lib/patch-fetch.js`, `node_modules/next/dist/server/node-environment-extensions/unhandled-rejection.external.js`
- Terminal capture: `.cursor/projects/.../terminals/1.txt`; logs: `.next/dev/logs/next-development.log`
- Commands: `host`, `curl`, `pnpm build`, `pnpm start`, `pnpm exec next dev` with controlled `.env.local`
- Commits: `709375e`, `ec67ea7`, `85703df`
- Prior chat research: agent transcript `55d0a642-bde1-4972-b7d6-7c8bfe959e35`
- Next.js docs: [Migrating to Cache Components](https://nextjs.org/docs/app/guides/migrating-to-cache-components), [Revalidating](https://nextjs.org/docs/app/getting-started/revalidating)

## Related

- Phase 11 Epic 4 — public GitHub page (`docs/prds/phase-11-corrections-hardening.prd.md`)
- ADR-0005 — proxy as sole session authority (explains why proxy always calls `getClaims` when env set)
