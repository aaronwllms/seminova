import { describe, expect, it } from 'vitest'

import { DEFAULT_BANNER_SETTING } from '@/types/banner'

import { formatBannerStatusBadge } from './format-banner-status-badge'

describe('formatBannerStatusBadge', () => {
  const now = new Date('2026-07-19T16:00:00.000Z')

  it('should return Off with muted tone when mode is off', () => {
    expect(formatBannerStatusBadge(DEFAULT_BANNER_SETTING, now)).toEqual({
      label: 'Off',
      tone: 'muted',
    })
  })

  it('should return scheduled label with accent tone when start is in the future', () => {
    const badge = formatBannerStatusBadge(
      {
        ...DEFAULT_BANNER_SETTING,
        mode: 'scheduled',
        starts_at: '2026-07-20T12:00:00.000Z',
        expires_at: '2026-07-26T23:59:00.000Z',
        headline: 'Coming soon',
      },
      now,
    )

    expect(badge.tone).toBe('accent')
    expect(badge.label).toMatch(/^Scheduled — starts /)
  })

  it('should return Live until label with success tone when live with expiry', () => {
    const badge = formatBannerStatusBadge(
      {
        ...DEFAULT_BANNER_SETTING,
        mode: 'scheduled',
        starts_at: '2026-07-18T12:00:00.000Z',
        expires_at: '2026-07-26T23:59:00.000Z',
        headline: 'Sale live',
      },
      now,
    )

    expect(badge).toEqual({
      label: expect.stringMatching(/^Live until /),
      tone: 'success',
    })
  })

  it('should return Live with success tone when mode is on', () => {
    expect(
      formatBannerStatusBadge(
        {
          ...DEFAULT_BANNER_SETTING,
          mode: 'on',
          headline: 'Always on',
        },
        now,
      ),
    ).toEqual({
      label: 'Live',
      tone: 'success',
    })
  })
})
