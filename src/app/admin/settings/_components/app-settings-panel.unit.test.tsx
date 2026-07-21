import { beforeEach, describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@/test/test-utils'
import { DEFAULT_BANNER_SETTING } from '@/types/banner'

import { AppSettingsPanel } from './app-settings-panel'

const saveAppSettingActionMock = vi.fn()

vi.mock('@/app/admin/settings/_lib/actions', () => ({
  saveAppSettingAction: (...args: unknown[]) =>
    saveAppSettingActionMock(...args),
}))

vi.mock('@/utils/app-toast', () => ({
  showSuccessToast: vi.fn(),
}))

describe('AppSettingsPanel', () => {
  beforeEach(() => {
    saveAppSettingActionMock.mockReset()
  })

  it('should group registry entries under their feature-area heading and update saved state after a row save', async () => {
    const user = userEvent.setup()

    saveAppSettingActionMock.mockResolvedValue({
      success: true,
      data: { key: 'log_retention_days', value: 45 },
    })

    render(
      <AppSettingsPanel
        initialSettings={{
          min_log_level: 'info',
          log_retention_days: 30,
          banner_public: DEFAULT_BANNER_SETTING,
          banner_authenticated: DEFAULT_BANNER_SETTING,
        }}
      />,
    )

    expect(
      screen.getByRole('heading', { name: 'Logging', level: 2 }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Banners', level: 2 }),
    ).toBeInTheDocument()
    expect(
      screen.getAllByRole('heading', { name: 'Banners', level: 2 }),
    ).toHaveLength(1)
    expect(screen.getByText('Public banner')).toBeInTheDocument()
    expect(screen.getByText('Authenticated banner')).toBeInTheDocument()

    const retentionInput = screen.getByRole('spinbutton', {
      name: 'Log retention window',
    })
    await user.clear(retentionInput)
    await user.type(retentionInput, '45')

    const saveButtons = screen.getAllByRole('button', { name: 'Save' })
    await user.click(saveButtons[1]!)

    expect(saveAppSettingActionMock).toHaveBeenCalledWith({
      key: 'log_retention_days',
      value: 45,
    })
    expect(retentionInput).toHaveValue(45)
    expect(saveButtons[1]).toBeDisabled()
  })
})
