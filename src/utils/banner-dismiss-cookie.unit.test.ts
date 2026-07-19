import { describe, expect, it } from 'vitest'

import { DEFAULT_BANNER_SETTING } from '@/types/banner'
import {
  isBannerDismissedByCookie,
  resolveLiveBannerSlot,
} from '@/utils/banner-dismiss-cookie'
import { buildBannerDismissKey } from '@/utils/banner-dismiss-hash'

describe('banner dismiss cookie helpers', () => {
  const liveConfig = {
    ...DEFAULT_BANNER_SETTING,
    mode: 'on' as const,
    headline: 'Maintenance tonight',
    detail: 'Expect downtime',
  }

  it('should treat matching cookie values as dismissed', () => {
    const dismissKey = buildBannerDismissKey(
      liveConfig.headline,
      liveConfig.detail,
    )

    expect(isBannerDismissedByCookie(dismissKey, dismissKey)).toBe(true)
    expect(isBannerDismissedByCookie('other-key', dismissKey)).toBe(false)
  })

  it('should resolve a live banner slot when the cookie does not match', () => {
    const dismissKey = buildBannerDismissKey(
      liveConfig.headline,
      liveConfig.detail,
    )

    expect(resolveLiveBannerSlot(liveConfig, undefined)).toEqual({
      config: liveConfig,
      dismissKey,
    })
  })

  it('should return null when the cookie matches the current dismiss key', () => {
    const dismissKey = buildBannerDismissKey(
      liveConfig.headline,
      liveConfig.detail,
    )

    expect(resolveLiveBannerSlot(liveConfig, dismissKey)).toBeNull()
  })

  it('should return null when config is missing or not live', () => {
    expect(resolveLiveBannerSlot(undefined, undefined)).toBeNull()
    expect(
      resolveLiveBannerSlot(
        { ...DEFAULT_BANNER_SETTING, mode: 'off' },
        undefined,
      ),
    ).toBeNull()
  })

  it('should show a new banner when headline or detail changes', () => {
    const dismissedKey = buildBannerDismissKey(
      liveConfig.headline,
      liveConfig.detail,
    )
    const nextConfig = {
      ...liveConfig,
      headline: 'All clear',
    }

    expect(resolveLiveBannerSlot(nextConfig, dismissedKey)).toEqual({
      config: nextConfig,
      dismissKey: buildBannerDismissKey(nextConfig.headline, nextConfig.detail),
    })
  })
})
