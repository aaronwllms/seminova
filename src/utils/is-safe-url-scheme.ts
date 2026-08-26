// Render-time scheme check for DB-sourced URLs (any http/https host or same-origin path).
// For login `next` redirects, use is-safe-redirect.ts (same-origin against a base URL).
export const isSafeUrlScheme = (href: string): boolean => {
  if (href.startsWith('/') && !href.startsWith('//')) {
    return true
  }

  try {
    const url = new URL(href)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}
