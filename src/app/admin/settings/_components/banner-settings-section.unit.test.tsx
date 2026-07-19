import { act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@/test/test-utils'
import { ADMIN_LOGS, ADMIN_SETTINGS } from '@/constants/admin-paths'
import {
  resetAdminSettingsVisitKeyForTests,
  syncAdminSettingsVisitKey,
} from '@/app/admin/settings/_lib/admin-settings-visit-key'
import { DEFAULT_BANNER_SETTING } from '@/types/banner'
import type { ResolvedAppSettings } from '@/types/app-settings'

import { BannerSettingsSection } from './banner-settings-section'

const mockPathname = vi.fn()

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}))

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

  const renderSection = () =>
    render(
      <BannerSettingsSection
        savedSettings={savedSettings}
        onSaved={onSavedMock}
      />,
    )

  beforeEach(() => {
    onSavedMock.mockReset()
    resetAdminSettingsVisitKeyForTests()
    mockPathname.mockReturnValue(ADMIN_SETTINGS)
    syncAdminSettingsVisitKey(ADMIN_SETTINGS)
  })

  it('should keep only one banner accordion open at a time', async () => {
    const user = userEvent.setup()

    renderSection()

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

  it('should collapse banner accordions when returning to settings from logs', async () => {
    const user = userEvent.setup()
    const { rerender } = renderSection()

    await user.click(screen.getByRole('button', { name: /Public banner/i }))
    expect(screen.getByLabelText('Headline')).toBeInTheDocument()

    mockPathname.mockReturnValue(ADMIN_LOGS)
    syncAdminSettingsVisitKey(ADMIN_LOGS)
    rerender(
      <BannerSettingsSection
        savedSettings={savedSettings}
        onSaved={onSavedMock}
      />,
    )

    mockPathname.mockReturnValue(ADMIN_SETTINGS)
    syncAdminSettingsVisitKey(ADMIN_SETTINGS)
    rerender(
      <BannerSettingsSection
        savedSettings={savedSettings}
        onSaved={onSavedMock}
      />,
    )

    expect(screen.queryByLabelText('Headline')).not.toBeInTheDocument()
  })

  it('should stay expanded while remaining on settings', async () => {
    const user = userEvent.setup()
    const { rerender } = renderSection()

    await user.click(screen.getByRole('button', { name: /Public banner/i }))
    expect(screen.getByLabelText('Headline')).toBeInTheDocument()

    rerender(
      <BannerSettingsSection
        savedSettings={savedSettings}
        onSaved={onSavedMock}
      />,
    )

    expect(screen.getByLabelText('Headline')).toBeInTheDocument()
  })

  it('should collapse banner accordions when the page is restored from bfcache', async () => {
    const user = userEvent.setup()

    renderSection()

    await user.click(screen.getByRole('button', { name: /Public banner/i }))
    expect(screen.getByLabelText('Headline')).toBeInTheDocument()

    await act(async () => {
      window.dispatchEvent(
        new PageTransitionEvent('pageshow', { persisted: true }),
      )
    })

    await waitFor(() => {
      expect(screen.queryByLabelText('Headline')).not.toBeInTheDocument()
    })
  })
})
