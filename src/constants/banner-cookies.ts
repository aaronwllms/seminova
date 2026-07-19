export const BANNER_DISMISSED_PUBLIC_COOKIE = 'banner_dismissed_public' as const

/** ~1 year — long enough to remember dismissal; new banner content uses a new key. */
export const BANNER_DISMISS_COOKIE_MAX_AGE = 60 * 60 * 24 * 365
