export const isSafeRedirect = (url: string, baseUrl: string): boolean => {
  try {
    const parsed = new URL(url, baseUrl)
    return parsed.origin === new URL(baseUrl).origin
  } catch {
    return false
  }
}
