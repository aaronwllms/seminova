/**
 * Next.js requires matcher entries to be statically analyzable — no runtime helpers.
 *
 * Metadata image paths (/opengraph-image, nested segment opengraph-image, same for
 * twitter-image) bypass session refresh like static assets so cookieless crawlers
 * receive PNG responses instead of auth redirects.
 */
export const PROXY_MATCHER_PATTERN =
  '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|opengraph-image$|.*\\/opengraph-image$|twitter-image$|.*\\/twitter-image$).*)'
