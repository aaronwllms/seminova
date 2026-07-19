import { describe, expect, it } from 'vitest'

import { DEFAULT_BANNER_SETTING } from '@/types/banner'

import { computeBannerStatus, isBannerLive } from './banner-status'

describe('banner-status', () => {
  const now = new Date('2026-07-19T12:00:00.000Z')

  it('should return off when mode is off', () => {
    expect(computeBannerStatus(DEFAULT_BANNER_SETTING, now)).toBe('off')
    expect(isBannerLive(DEFAULT_BANNER_SETTING, now)).toBe(false)
  })

  it('should return live when mode is on', () => {
    const config = {
      ...DEFAULT_BANNER_SETTING,
      mode: 'on' as const,
      headline: 'Maintenance complete',
    }

    expect(computeBannerStatus(config, now)).toBe('live')
    expect(isBannerLive(config, now)).toBe(true)
  })

  it('should return scheduled when starts_at is in the future', () => {
    const config = {
      ...DEFAULT_BANNER_SETTING,
      mode: 'scheduled' as const,
      starts_at: '2026-07-20T12:00:00.000Z',
      expires_at: '2026-07-21T12:00:00.000Z',
      headline: 'Upcoming work',
    }

    expect(computeBannerStatus(config, now)).toBe('scheduled')
    expect(isBannerLive(config, now)).toBe(false)
  })

  it('should return live for scheduled mode with null starts_at inside the window', () => {
    const config = {
      ...DEFAULT_BANNER_SETTING,
      mode: 'scheduled' as const,
      starts_at: null,
      expires_at: '2026-07-21T12:00:00.000Z',
      headline: 'Active incident',
    }

    expect(computeBannerStatus(config, now)).toBe('live')
  })

  it('should return off when scheduled expires_at is in the past', () => {
    const config = {
      ...DEFAULT_BANNER_SETTING,
      mode: 'scheduled' as const,
      starts_at: '2026-07-17T12:00:00.000Z',
      expires_at: '2026-07-18T12:00:00.000Z',
      headline: 'Expired notice',
    }

    expect(computeBannerStatus(config, now)).toBe('off')
  })
})
