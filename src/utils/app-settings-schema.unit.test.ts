import { describe, expect, it } from 'vitest'

import type { AppSettingKey } from '@/config/app-settings-registry'
import { DEFAULT_BANNER_SETTING } from '@/types/banner'

import { parseAppSettingValue } from './app-settings-schema'

describe('parseAppSettingValue', () => {
  it('should accept a valid log level', () => {
    const result = parseAppSettingValue('min_log_level', 'warn')

    expect(result).toEqual({ success: true, value: 'warn' })
  })

  it('should reject an invalid log level with fixed copy', () => {
    const result = parseAppSettingValue('min_log_level', 'verbose')

    expect(result).toEqual({
      success: false,
      message: 'Choose a valid log level',
    })
  })

  it('should accept a positive integer setting value', () => {
    const result = parseAppSettingValue('log_retention_days', 14)

    expect(result).toEqual({ success: true, value: 14 })
  })

  it('should reject zero for a positive integer setting', () => {
    const result = parseAppSettingValue('log_retention_days', 0)

    expect(result).toEqual({
      success: false,
      message: 'Must be greater than zero',
    })
  })

  it('should delegate banner settings to the banner schema', () => {
    const result = parseAppSettingValue('banner_public', DEFAULT_BANNER_SETTING)

    expect(result).toEqual({ success: true, value: DEFAULT_BANNER_SETTING })
  })

  it('should reject an unknown setting key', () => {
    const result = parseAppSettingValue(
      'not_a_real_key' as unknown as AppSettingKey,
      'info',
    )

    expect(result).toEqual({ success: false, message: 'Unknown setting' })
  })
})
