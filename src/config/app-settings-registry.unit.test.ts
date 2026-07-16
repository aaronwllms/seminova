import { describe, expect, it } from 'vitest'

import {
  APP_SETTINGS_REGISTRY,
  isAppSettingKey,
} from '@/config/app-settings-registry'

describe('app-settings-registry', () => {
  it('should include both seed settings with mockup defaults', () => {
    expect(APP_SETTINGS_REGISTRY).toHaveLength(2)

    const minLogLevel = APP_SETTINGS_REGISTRY.find(
      (entry) => entry.key === 'min_log_level',
    )
    const retention = APP_SETTINGS_REGISTRY.find(
      (entry) => entry.key === 'log_retention_days',
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
  })

  it('should reject unknown keys', () => {
    expect(isAppSettingKey('min_log_level')).toBe(true)
    expect(isAppSettingKey('unknown_setting')).toBe(false)
  })
})
