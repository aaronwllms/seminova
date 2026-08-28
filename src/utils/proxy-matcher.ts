/**
 * Canonical auth-proxy matcher regex (without leading/trailing slashes for RegExp).
 *
 * Next.js requires `src/proxy.ts` `config.matcher` entries to be string literals — this
 * module is the testable source of truth; keep it in sync with the literal in
 * `src/proxy.ts` (enforced by proxy-matcher.unit.test.ts).
 *
 * Metadata images inside route groups get a hash suffix from Next.js:
 * `getMetadataRouteSuffix` → `djb2Hash(parentPathname).toString(36).slice(0, 6)`.
 * `slice(0, 6)` truncates without padding, so suffixes are 5–6 base-36 chars.
 * // debt: ≤4-char suffixes (~0.04% of route groups) stay gated — indistinguishable
 * from words like `evil`; widen to `{4,6}` if Next changes hash width.
 */
export const PROXY_MATCHER_PATTERN =
  '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|opengraph-image(-[0-9a-z]{5,6})?$|.*\\/opengraph-image(-[0-9a-z]{5,6})?$|twitter-image(-[0-9a-z]{5,6})?$|.*\\/twitter-image(-[0-9a-z]{5,6})?$|icon(-[0-9a-z]{5,6})?$|.*\\/icon(-[0-9a-z]{5,6})?$).*)'
