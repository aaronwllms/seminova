import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@/test/test-utils'

import { getRegistryEntry } from '@/config/app-settings-registry'

import { AppSettingRow } from './app-setting-row'

const saveAppSettingActionMock = vi.fn()
const showSuccessToastMock = vi.fn()

vi.mock('@/app/admin/settings/_lib/actions', () => ({
  saveAppSettingAction: (...args: unknown[]) =>
    saveAppSettingActionMock(...args),
}))

vi.mock('@/utils/app-toast', () => ({
  showSuccessToast: (...args: unknown[]) => showSuccessToastMock(...args),
}))

describe('AppSettingRow', () => {
  const onSavedMock = vi.fn()

  beforeAll(() => {
    Element.prototype.hasPointerCapture ??= () => false
    Element.prototype.setPointerCapture ??= () => {}
    Element.prototype.releasePointerCapture ??= () => {}
    Element.prototype.scrollIntoView ??= () => {}
  })

  beforeEach(() => {
    saveAppSettingActionMock.mockReset()
    showSuccessToastMock.mockReset()
    onSavedMock.mockReset()
  })

  it('should call saveAppSettingAction and show a toast on success for positive_int', async () => {
    const user = userEvent.setup()
    const entry = getRegistryEntry('log_retention_days')

    saveAppSettingActionMock.mockResolvedValue({
      success: true,
      data: { key: 'log_retention_days', value: 45 },
    })

    render(
      <AppSettingRow entry={entry} savedValue={30} onSaved={onSavedMock} />,
    )

    const input = screen.getByRole('spinbutton', {
      name: 'Log retention window',
    })
    await user.clear(input)
    await user.type(input, '45')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(saveAppSettingActionMock).toHaveBeenCalledWith({
      key: 'log_retention_days',
      value: 45,
    })
    expect(onSavedMock).toHaveBeenCalledWith('log_retention_days', 45)
    expect(showSuccessToastMock).toHaveBeenCalledWith(
      'Log retention window saved',
    )
  })

  it('should call saveAppSettingAction and show a toast on success for log_level', async () => {
    const user = userEvent.setup()
    const entry = getRegistryEntry('min_log_level')

    saveAppSettingActionMock.mockResolvedValue({
      success: true,
      data: { key: 'min_log_level', value: 'warn' },
    })

    render(
      <AppSettingRow entry={entry} savedValue="info" onSaved={onSavedMock} />,
    )

    await user.click(
      screen.getByRole('combobox', { name: 'Minimum log level' }),
    )
    await user.click(screen.getByRole('option', { name: 'warn' }))
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(saveAppSettingActionMock).toHaveBeenCalledWith({
      key: 'min_log_level',
      value: 'warn',
    })
    expect(onSavedMock).toHaveBeenCalledWith('min_log_level', 'warn')
    expect(showSuccessToastMock).toHaveBeenCalledWith('Minimum log level saved')
  })

  it('should disable Save when the draft is unchanged', () => {
    const entry = getRegistryEntry('min_log_level')

    render(
      <AppSettingRow entry={entry} savedValue="info" onSaved={onSavedMock} />,
    )

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })

  it('should render AppErrorSurface when save fails', async () => {
    const user = userEvent.setup()
    const entry = getRegistryEntry('log_retention_days')

    saveAppSettingActionMock.mockResolvedValue({
      success: false,
      error: {
        message: 'Could not save setting. Please try again.',
        code: 'INTERNAL_ERROR',
        kind: 'fault',
      },
    })

    render(
      <AppSettingRow entry={entry} savedValue={30} onSaved={onSavedMock} />,
    )

    const input = screen.getByRole('spinbutton', {
      name: 'Log retention window',
    })
    await user.clear(input)
    await user.type(input, '45')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(
      screen.getByText('Could not save setting. Please try again.'),
    ).toBeInTheDocument()
    expect(showSuccessToastMock).not.toHaveBeenCalled()
  })

  it('should disable Save and mark the field invalid when positive_int input is cleared or non-numeric', async () => {
    const user = userEvent.setup()
    const entry = getRegistryEntry('log_retention_days')

    render(
      <AppSettingRow entry={entry} savedValue={30} onSaved={onSavedMock} />,
    )

    const saveButton = screen.getByRole('button', { name: 'Save' })
    const input = screen.getByRole('spinbutton', {
      name: 'Log retention window',
    })

    expect(saveButton).toBeDisabled()

    await user.clear(input)
    expect(saveButton).toBeDisabled()
    expect(input).toHaveAttribute('aria-invalid', 'true')

    await user.type(input, 'abc')
    expect(saveButton).toBeDisabled()
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(saveAppSettingActionMock).not.toHaveBeenCalled()
  })
})
