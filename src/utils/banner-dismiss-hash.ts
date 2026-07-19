export const BANNER_DISMISS_STORAGE_PREFIX = 'banner-dismiss:' as const

export const buildBannerDismissHash = (
  headline: string,
  detail: string | null,
): string => {
  const input = `${headline}\0${detail ?? ''}`
  let hash = 5381

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 33) ^ input.charCodeAt(index)
  }

  return (hash >>> 0).toString(36)
}

export const buildBannerDismissStorageKey = (
  headline: string,
  detail: string | null,
): string =>
  `${BANNER_DISMISS_STORAGE_PREFIX}${buildBannerDismissHash(headline, detail)}`
