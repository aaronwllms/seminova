import { beforeEach, describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@/test/test-utils'
import { DEFAULT_BANNER_SETTING } from '@/types/banner'
import type { ResolvedAppSettings } from '@/types/app-settings'

import { BannerSettingsSection } from './banner-settings-section'

describe('BannerSettingsSection', () => {
  const onSavedMock = vi.fn()

  const savedSettings = {
    min_log_level: 'info',
    log_retention_days: 30,
    banner_public: {
      ...DEFAULT_BANNER_SETTING,
      mode: 'on' as const,
      headline: 'Public headline',
    },
    banner_authenticated: {
      ...DEFAULT_BANNER_SETTING,
      mode: 'on' as const,
      headline: 'Authenticated headline',
    },
  } satisfies ResolvedAppSettings

  beforeEach(() => {
    onSavedMock.mockReset()
  })

  it('should keep only one banner accordion open at a time', async () => {
    const user = userEvent.setup()

    render(
      <BannerSettingsSection
        savedSettings={savedSettings}
        onSaved={onSavedMock}
      />,
    )

    await user.click(screen.getByRole('button', { name: /Public banner/i }))
    expect(screen.getByLabelText('Headline')).toHaveValue('Public headline')

    await user.click(
      screen.getByRole('button', { name: /Authenticated banner/i }),
    )

    expect(screen.queryByLabelText('Headline')).toHaveValue(
      'Authenticated headline',
    )
    expect(screen.getAllByLabelText('Headline')).toHaveLength(1)
  })
})
