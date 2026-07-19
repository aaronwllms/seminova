import { describe, expect, it } from 'vitest'

import { DEFAULT_BANNER_SETTING } from '@/types/banner'

import { parseBannerSettingValue } from './banner-settings-schema'

describe('banner-settings-schema', () => {
  it('should accept the default banner setting', () => {
    const parsed = parseBannerSettingValue(DEFAULT_BANNER_SETTING)

    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data).toEqual(DEFAULT_BANNER_SETTING)
    }
  })

  it('should reject headlines longer than 80 characters', () => {
    const parsed = parseBannerSettingValue({
      ...DEFAULT_BANNER_SETTING,
      headline: 'a'.repeat(81),
    })

    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.message).toBe(
        'Headline must be 80 characters or fewer',
      )
    }
  })

  it('should reject detail longer than 100 characters', () => {
    const parsed = parseBannerSettingValue({
      ...DEFAULT_BANNER_SETTING,
      detail: 'b'.repeat(101),
    })

    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.message).toBe(
        'Detail must be 100 characters or fewer',
      )
    }
  })

  it('should require expires_at when mode is scheduled', () => {
    const parsed = parseBannerSettingValue({
      ...DEFAULT_BANNER_SETTING,
      mode: 'scheduled',
      expires_at: null,
    })

    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.message).toBe(
        'Scheduled banners require an end date',
      )
    }
  })

  it('should accept scheduled mode with an end date', () => {
    const parsed = parseBannerSettingValue({
      ...DEFAULT_BANNER_SETTING,
      mode: 'scheduled',
      starts_at: '2026-07-20T12:00:00.000Z',
      expires_at: '2026-07-21T12:00:00.000Z',
      headline: 'Scheduled maintenance',
    })

    expect(parsed.success).toBe(true)
  })
})
