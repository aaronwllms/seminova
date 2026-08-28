export const isSafeRedirect = (url: string, baseUrl: string): boolean => {
  try {
    const parsed = new URL(url, baseUrl)
    return parsed.origin === new URL(baseUrl).origin
  } catch {
    return false
  }
}

/** Same-origin `next` that is not the marketing site root (`/` or origin-only). */
export const isUsableRedirectNext = (url: string, baseUrl: string): boolean => {
  if (!isSafeRedirect(url, baseUrl)) {
    return false
  }

  try {
    const { pathname } = new URL(url, baseUrl)
    return pathname !== '/' && pathname !== ''
  } catch {
    return false
  }
}
