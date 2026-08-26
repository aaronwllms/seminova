# RESEARCH-0006: CSP enforcement vs. Cache Components in Next.js 16

**Researched:** 2026-08-26

**Type:** technical

## Question

Can Seminova ship an **enforced** Content Security Policy, and if not fully, how
much can be enforced without cost? Setting `CSP_ENFORCE=true` on the first
production deploy broke the site. What is the actual constraint, what is the
right default posture for a template, and what should spinoffs inherit?

## Scope and constraints

**In scope:** Next.js 16 CSP/nonce mechanics, the `cacheComponents` interaction,
Vercel platform protections, and a codebase XSS-sink audit to size the exposure.

**Given facts (not evaluated as decisions):**

- Deployed to Vercel at `seminova.dev`; `NEXT_PUBLIC_SITE_URL` and Vercel URL
  values set.
- `next@16.2.9`, React 19.2.3, `cacheComponents: true` in `next.config.ts`.
- CSP is built in `src/utils/security-headers.ts` and attached via
  `next.config.ts` `headers()`. Header key flips between
  `Content-Security-Policy` and `Content-Security-Policy-Report-Only` on
  `CSP_ENFORCE`.
- `src/proxy.ts` already exists (Next 16 naming for middleware), running Supabase
  session refresh with a matcher.

**Out of scope:** Implementing the nonce strategy; violation-report collection
(see Open questions); the OG/canonical URL check noted at the end.

## Findings

### 1. The reported bug — one cause, three symptoms

With `CSP_ENFORCE=true`, three symptoms appeared: sign-in/sign-out buttons
absent, the workflow page's interactive diagram unresponsive to hover and click,
and the site header rendering fully transparent.

All three are the same failure. `script-src 'self'` authorizes scripts that have
a URL; it does not authorize **inline** scripts, and Next's App Router emits
inline scripts in the streamed HTML (hydration bootstrap, RSC payload). Those
are refused, React never hydrates, and every client-driven behavior goes inert —
auth buttons are client-rendered, diagram handlers never attach, the header's
scroll-state class is never applied.

**Confirmed by local reproduction**, so it is not Vercel-specific and the policy
can be iterated locally.

`security-headers.ts` already carried a `// debt:` comment predicting exactly
this. The comment was correct and was overridden by flipping the env var.

### 2. Nonces force dynamic rendering

The documented fix for inline scripts is a per-request nonce. Next's CSP guide
is explicit that nonce use **requires dynamic rendering**: nonces are applied
during server-side rendering from the CSP header on the request, and static
pages are generated at build time when no request headers exist.

The guide lists the consequences directly: static optimization and ISR are
disabled, pages cannot be cached by CDNs without additional configuration, and
**Partial Prerendering is incompatible** with nonce-based CSP because static
shell scripts have no access to the nonce.

**This cost is attached to the nonce, not to `cacheComponents`.** Disabling
`cacheComponents` removes the build error but does not restore static pages.

### 3. `cacheComponents` + nonce is a confirmed open Next.js bug

[vercel/next.js#89754](https://github.com/vercel/next.js/issues/89754) — opened
2026-02-10, still open and labeled as tracked by the Next.js team as of
2026-08-26, with no linked branches or PRs.

With `cacheComponents: true`, reading the nonce via `headers()` in the root
layout is uncached dynamic access, leaving two dead ends:

| Approach | Build | Script timing |
| --- | --- | --- |
| `headers()` outside `<Suspense>` | Fails — `Uncached data was accessed outside of <Suspense>` on `/_not-found` | Would be correct (blocking) |
| `headers()` inside `<Suspense>` | Succeeds | Wrong — streamed after the HTML shell |

**Seminova hits this specifically.** `src/app/layout.tsx` uses `next-themes`
`ThemeProvider` with `suppressHydrationWarning` on `<html>` — the pre-paint
inline theme script. Next only stamps nonces on its own framework scripts and on
`<Script>` components; `next-themes` exposes a `nonce` prop precisely because it
must be supplied, which requires `headers()` in the layout.

### 4. Neither documented workaround suits a template

- **sha256 hash of the inline script** (suggested in #89754): requires hardcoding
  a hash of `next-themes`' generated script. Any version bump changes the script,
  the hash silently stops matching, and theme flash returns with no error. Poor
  inheritance property for a template.
- **Subresource Integrity** (experimental, per Next docs): hashes external script
  *files*, so it cannot cover an inline script at all. Also webpack-only while
  Turbopack is the Next 16 default, and build-time only.

### 5. Vercel's platform protections do not close this gap

Vercel provides a platform-wide firewall with DDoS mitigation free on all plans
with no configuration, plus automatic HTTPS/TLS and Attack Mode. The WAF's
managed rulesets advertise OWASP Top 10 coverage including XSS, but that feature
is plan-gated.

**Structurally, a WAF is not a CSP substitute.** A WAF inspects inbound requests
at the edge; CSP constrains what the browser executes in the response. Stored XSS
— a payload arriving from your own database, in your own HTML, from your own
origin — presents as an ordinary `GET`. Nothing about the request looks hostile.
Likewise a WAF filters traffic in, not a script exfiltrating data out; that is
`connect-src`.

Deployment Protection was checked: **Vercel Authentication is already enabled**
(preview deployments behind login), and Protected Source Maps is on.

### 6. XSS audit — no vulnerability found

Full `src/` sink audit run in Cursor. Results:

- `dangerouslySetInnerHTML` — **1 hit**. `innerHTML`, `outerHTML`,
  `document.write`, `eval(`, `new Function`, `insertAdjacentHTML` — **zero**.
- Every Supabase-sourced string rendered as text passes through React escaping.
  No DB value reaches an HTML-injection sink.

**Verdict: no stored HTML-injection XSS.** Two residuals were found, and **both
are now closed** (see §8):

1. **JSON-LD** (`src/app/(marketing)/page.tsx`) — `JSON.stringify` does not
   escape `<`, so a string containing `</script>` would break out. Inputs at
   audit time were hardcoded config plus deploy env, so not exploitable. Would
   have become real if site name, description, or site URL ever became editable.
2. **Avatar `src`** (`src/components/user-avatar.tsx`) — `profiles.avatar_url`
   went to `AvatarImage` without scheme re-validation at render. The write path
   validated; RLS still permits the owner to write any string directly. Display
   is owner-only, so self-XSS, and `javascript:` in `<img src>` is inert in
   current browsers.

Banner links were admin-authored and already scheme-validated at render.

### 7. Report-only was collecting nothing — and could not

The report-only policy carried no `report-uri` or `report-to`, so violations only
reached the browser console. Separately, **`frame-ancestors` is ignored in
report-only mode by spec** — clickjacking protection rested entirely on the
`X-Frame-Options: DENY` header, which is enforced.

A later finding closed this rather than fixing it: a strict report-only
`script-src` would be violated by Next's hydration bootstrap on **every page
load**, permanently. Expected noise on every request buries any real violation
instead of surfacing it, which is the opposite of what report-only is for. The
adopted policy therefore emits **no** report-only header at all.

Note that dropping it does not remove the need for a collector. Enforced
directives emit violation reports too — `report-to` is not a report-only feature
— and those reports would be genuinely useful precisely because an enforced
violation means something actually broke. See Open questions.

### 8. Residual fixes — shipped 2026-08-26

Both follow-on stories were implemented and verified in the repo.

**JSON-LD escaping.** `src/utils/structured-data.ts` now serializes through a
`serializeJsonLd` helper that replaces `<` with `\u003c`, applied inside the
builder rather than at the call site, so any future consumer inherits it. The
file carries a comment naming why this is Unicode escaping and not HTML
sanitization — closing the DOMPurify mismatch in the project security rule.

**Shared URL-scheme validator.** `src/utils/is-safe-url-scheme.ts` holds a single
`isSafeUrlScheme` accepting `http:`/`https:` and same-origin paths beginning with
a single `/`, rejecting protocol-relative `//`. Consumed by both
`src/components/user-avatar.tsx` (falls back to initials on failure; `blob:`
preview still allowed via a separate `previewSrc` prop) and
`src/utils/parse-banner-message.ts`, whose local `isValidBannerLinkHref` was
removed.

**The consolidation criterion was met** — the banner check collapsed into the
shared helper rather than a second validator shipping alongside it. The file also
carries a comment distinguishing it from `is-safe-redirect.ts`, which does
same-origin checking against a base URL for login `next` redirects — a related
but genuinely different job.

## Options compared

| Option | `script-src` XSS defense | Rendering cost | Template fit |
| --- | --- | --- | --- |
| **A. Report-only everything** (pre-deploy status quo) | None | None | Weak — a wrong policy decays silently |
| **B. Full enforcement, no nonce** (what broke) | N/A — site is inert | N/A | Broken |
| **C. Nonce + drop `cacheComponents`** | Full | Every page dynamic, forever | Poor — Next has signalled `cacheComponents` becomes default in a future major |
| **D. Partial enforcement** — enforce all directives, with a deliberately permissive `script-src` | Blocks external scripts from unlisted origins; cannot stop inline injection | **None** | **Strongest** — violations surface loudly in spinoffs |
| **E. Dual header** — D plus a strict report-only `script-src` | Same as D | None | Rejected — fires on every page load with no collector; permanent noise buries real signal |

## Recommendation

**Adopt Option D — partial enforcement — and keep `cacheComponents`.**

1. **Enforce every directive, in a single `Content-Security-Policy` header.**
   `connect-src` (caps exfiltration destinations), `form-action 'self'`,
   `base-uri 'self'`, `object-src 'none'`, `img-src`, `font-src`, `default-src`
   all enforce with no rendering cost. `frame-ancestors` starts working once
   enforced.
2. **Make `script-src` deliberately permissive** — `'self' 'unsafe-inline'` plus
   the analytics origin — until #89754 resolves. It must be named explicitly:
   omitting it would fall back to `default-src 'self'` and block Next's inline
   hydration bootstrap. This is not theater — it still blocks external scripts
   from unlisted origins. Justified by §6: the audit found no inline-injection
   sink for a strict policy to catch.
3. **No report-only header.** See §7.
4. **Enforcement is the better template default.** A spinoff adding Stripe or
   PostHog hits a violation immediately and knowingly. Report-only means a policy
   can be silently wrong for a year.
5. **Do not adopt Option C.** Paying per-request rendering on marketing pages —
   the pages most worth caching, and the template's shop window — to close a hole
   with no known sink is a bad trade, and it runs against where the framework is
   heading.

**No ADR.** Assessed against `docs/adr/README.md`: the decision fails the
"hard to reverse" test (enforcing `script-src` later is one file plus proxy
work), and its revisit trigger makes it mutable state rather than history, which
an immutable ADR cannot hold. It lives here and in a `// debt:` marker — the
correct instrument for a consciously accepted ceiling.

### Follow-on fixes — shipped

Stories A and B are **complete**; implementation detail in §8.

**Rationale for building B despite low local impact** (recorded because the
reasoning generalizes). A template's threat model is the union of every project
spun off from it. Impact was scored as self-XSS because display is owner-only
*here*; the first spinoff rendering avatars in a user directory or admin table
inherits an unvalidated DB-sourced URL in `src`, and inherited code does not get
re-audited. "Inert in current browsers" is also a weak guarantee to encode as a
template default.

## Open questions

1. **Whether to collect enforced violation reports.** Not "where does report-only
   noise go" — that channel is gone (§7). The live question is whether to learn
   when enforcement blocks something for a *real user* in production, which is
   otherwise invisible. `report-uri` is deprecated in favor of
   `report-to`/Reporting API; Vercel provides no collector; a self-hosted route
   handler on a public template is an unauthenticated write endpoint needing rate
   limiting, payload validation, storage, and retention — all inherited by every
   spinoff. **Current lean: do not build it.** `app_logs` and the admin logs
   surface already exist, so routing violations there later is a small addition
   rather than a new subsystem. Recorded, not scheduled.
2. **Policy not yet tested.** The single enforced policy has not been run. Test
   against a **production build locally** (dev mode uses `eval`, producing
   refusals production would not): `pnpm build && pnpm start`. `headers()` in
   `next.config.ts` is evaluated at build time and baked into the routes
   manifest, so a running dev server will not pick it up. Walk: a marketing page
   (fonts/styles), login (Supabase `connect-src`), admin logs with live toggle on
   (websockets), a profile with an avatar (`img-src` against Supabase storage).
   With no report-only header, **every** refusal is a real break.
3. **Revisit trigger.** #89754 closing, or a Next release adding nonce access that
   does not require `headers()` in the layout. `next@16.3` shipped as a minor with
   no breaking changes (Instant Navigations, Partial Prefetching, dev-server
   performance) and did **not** touch this.

4. **OG/canonical URLs unverified.** `NEXT_PUBLIC_SITE_URL` feeds `getSiteUrl()`
   → metadata and the `check:seo-base-url` gate. Confirm production emits
   `https://seminova.dev` and not a `.vercel.app` URL. Deferred by PM.

5. **Installed Next version — confirmed `16.2.9`** (`pnpm list next`, 2026-08-26).
   The dependency update applied that day did not bump Next. Resolved.

## Sources

### Documentation (primary)

- [Next.js — Content Security Policy](https://nextjs.org/docs/app/guides/content-security-policy) (docs v16.3.3, last updated 2026-03-20)
- [vercel/next.js#89754 — Nonce-based CSP with inline `<head>` scripts is incompatible with cacheComponents](https://github.com/vercel/next.js/issues/89754)
- [Next.js 16 release notes](https://nextjs.org/blog/next-16) — `proxy.ts` replaces `middleware.ts`
- [Vercel security overview](https://vercel.com/docs/security)
- [Vercel Firewall](https://vercel.com/docs/vercel-firewall) · [Vercel WAF](https://vercel.com/docs/vercel-firewall/vercel-waf) · [Attack Mode](https://vercel.com/docs/vercel-firewall/attack-mode)

### Repo facts confirmed (not ADRs)

- `src/utils/security-headers.ts` — CSP construction; stale `// debt:` comment
- `next.config.ts` — `cacheComponents: true`; `headers()` attaches CSP
- `src/app/layout.tsx` — `next-themes` `ThemeProvider`, `suppressHydrationWarning`
- `src/proxy.ts` — exists already, Supabase session refresh + matcher
- `src/utils/parse-banner-message.ts` — `isValidBannerLinkHref`
- `package.json` — `next@^16.2.9`, `react@19.2.3`

### Audit

- Cursor XSS sink audit of `src/`, 2026-08-26 — see §6

## Related

- `SECURITY_AUDIT.md` S004 — to be updated by the implementing change; the
  remaining gap is a permissive `script-src`, not "CSP is report-only"
- `.cursor/plans/enforce_single_csp_header_3fcd572d.plan.md` — the implementing plan
- **No ADR.** Rationale in Recommendation. If #89754 closes and the decision
  becomes "enforce `script-src` with a nonce and give up `cacheComponents`,"
  *that* would clear the ADR bar — hard to reverse, surprising, and a real
  trade-off.
- The `// debt:` marker in `src/utils/security-headers.ts` points at this brief.
  **If this brief is archived, that pointer must be updated to the archive path.**
