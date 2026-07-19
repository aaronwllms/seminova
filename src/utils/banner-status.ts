import type { BannerComputedStatus, BannerSettingValue } from '@/types/banner'

export const computeBannerStatus = (
  config: BannerSettingValue,
  now: Date = new Date(),
): BannerComputedStatus => {
  if (config.mode === 'off') {
    return 'off'
  }

  if (config.mode === 'on') {
    return 'live'
  }

  if (!config.expires_at) {
    return 'off'
  }

  const expiresAt = new Date(config.expires_at)

  if (expiresAt <= now) {
    return 'off'
  }

  if (config.starts_at) {
    const startsAt = new Date(config.starts_at)

    if (startsAt > now) {
      return 'scheduled'
    }
  }

  return 'live'
}

export const isBannerLive = (config: BannerSettingValue, now?: Date): boolean =>
  computeBannerStatus(config, now) === 'live'
