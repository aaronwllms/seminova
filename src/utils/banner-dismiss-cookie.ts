import { BANNER_DISMISS_COOKIE_MAX_AGE } from '@/constants/banner-cookies'
import type { BannerSettingValue } from '@/types/banner'
import { buildBannerDismissKey } from '@/utils/banner-dismiss-hash'
import { isBannerLive } from '@/utils/banner-status'

export const isBannerDismissedByCookie = (
  cookieValue: string | undefined,
  dismissKey: string,
): boolean => cookieValue === dismissKey

export const writeBannerDismissCookie = (
  cookieName: string,
  dismissKey: string,
): void => {
  document.cookie = `${cookieName}=${encodeURIComponent(dismissKey)}; path=/; max-age=${BANNER_DISMISS_COOKIE_MAX_AGE}; SameSite=Lax`
}

export const readBannerDismissCookieValue = (
  cookieName: string,
): string | undefined => {
  if (typeof document === 'undefined') {
    return undefined
  }

  const prefix = `${cookieName}=`
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(prefix))

  if (!match) {
    return undefined
  }

  return decodeURIComponent(match.slice(prefix.length))
}

export interface LiveBannerSlotProps {
  config: BannerSettingValue
  dismissKey: string
}

export const resolveLiveBannerSlot = (
  config: BannerSettingValue | null | undefined,
  dismissedCookieValue: string | undefined,
): LiveBannerSlotProps | null => {
  if (!config || !isBannerLive(config)) {
    return null
  }

  const dismissKey = buildBannerDismissKey(config.headline, config.detail)

  if (isBannerDismissedByCookie(dismissedCookieValue, dismissKey)) {
    return null
  }

  return { config, dismissKey }
}
