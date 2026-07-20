/**
 * Canonical auth-proxy matcher regex (without leading/trailing slashes for RegExp).
 *
 * Next.js requires `src/proxy.ts` `config.matcher` entries to be string literals — this
 * module is the testable source of truth; keep it in sync with the literal in
 * `src/proxy.ts` (enforced by proxy-matcher.unit.test.ts).
 */
export const PROXY_MATCHER_PATTERN =
  '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|opengraph-image$|.*\\/opengraph-image$|twitter-image$|.*\\/twitter-image$|icon$|.*\\/icon$).*)'
