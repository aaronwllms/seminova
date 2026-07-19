import { describe, expect, it } from 'vitest'

import {
  APP_SETTINGS_REGISTRY,
  isAppSettingKey,
} from '@/config/app-settings-registry'
import { DEFAULT_BANNER_SETTING } from '@/types/banner'

describe('app-settings-registry', () => {
  it('should include logging and banner settings with mockup defaults', () => {
    expect(APP_SETTINGS_REGISTRY).toHaveLength(4)

    const minLogLevel = APP_SETTINGS_REGISTRY.find(
      (entry) => entry.key === 'min_log_level',
    )
    const retention = APP_SETTINGS_REGISTRY.find(
      (entry) => entry.key === 'log_retention_days',
    )
    const bannerPublic = APP_SETTINGS_REGISTRY.find(
      (entry) => entry.key === 'banner_public',
    )
    const bannerAuthenticated = APP_SETTINGS_REGISTRY.find(
      (entry) => entry.key === 'banner_authenticated',
    )

    expect(minLogLevel).toMatchObject({
      label: 'Minimum log level',
      valueType: 'log_level',
      default: 'info',
      group: 'Logging',
    })
    expect(retention).toMatchObject({
      label: 'Log retention window',
      valueType: 'positive_int',
      default: 30,
      group: 'Logging',
    })
    expect(bannerPublic).toMatchObject({
      label: 'Public banner',
      valueType: 'banner',
      default: DEFAULT_BANNER_SETTING,
      group: 'Banners',
    })
    expect(bannerAuthenticated).toMatchObject({
      label: 'Authenticated banner',
      valueType: 'banner',
      default: DEFAULT_BANNER_SETTING,
      group: 'Banners',
    })
  })

  it('should reject unknown keys', () => {
    expect(isAppSettingKey('min_log_level')).toBe(true)
    expect(isAppSettingKey('banner_public')).toBe(true)
    expect(isAppSettingKey('unknown_setting')).toBe(false)
  })
})
