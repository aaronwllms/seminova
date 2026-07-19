import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@/test/test-utils'
import { getRegistryEntry } from '@/config/app-settings-registry'
import { Accordion } from '@/components/ui/accordion'
import type { AppSettingRegistryEntry } from '@/types/app-settings'
import { DEFAULT_BANNER_SETTING } from '@/types/banner'

import { BannerSettingRow } from './banner-setting-row'

const saveAppSettingActionMock = vi.fn()
const showSuccessToastMock = vi.fn()

vi.mock('@/app/admin/settings/_lib/actions', () => ({
  saveAppSettingAction: (...args: unknown[]) =>
    saveAppSettingActionMock(...args),
}))

vi.mock('@/utils/app-toast', () => ({
  showSuccessToast: (...args: unknown[]) => showSuccessToastMock(...args),
}))

describe('BannerSettingRow', () => {
  const onSavedMock = vi.fn()
  const entry = getRegistryEntry(
    'banner_public',
  ) as AppSettingRegistryEntry<'banner_public'>

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

  const renderRow = (savedValue = DEFAULT_BANNER_SETTING) =>
    render(
      <Accordion type="multiple">
        <BannerSettingRow
          entry={entry}
          savedValue={savedValue}
          onSaved={onSavedMock}
        />
      </Accordion>,
    )

  it('should expand the form when the accordion trigger is clicked', async () => {
    const user = userEvent.setup()

    renderRow()

    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Public banner/i }))

    expect(screen.getByRole('radiogroup')).toBeInTheDocument()
    expect(screen.getByLabelText('Headline')).toBeInTheDocument()
  })

  it('should show schedule fields only when mode is scheduled', async () => {
    const user = userEvent.setup()

    renderRow()

    await user.click(screen.getByRole('button', { name: /Public banner/i }))

    expect(screen.queryByLabelText('Starts')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Expires')).not.toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'Scheduled' }))

    expect(screen.getByLabelText('Starts')).toBeInTheDocument()
    expect(screen.getByLabelText('Expires')).toBeInTheDocument()
  })

  it('should disable Save when headline exceeds the character cap', async () => {
    const user = userEvent.setup()

    renderRow({
      ...DEFAULT_BANNER_SETTING,
      mode: 'on',
      headline: 'Valid headline',
    })

    await user.click(screen.getByRole('button', { name: /Public banner/i }))

    const headlineInput = screen.getByLabelText('Headline')
    await user.clear(headlineInput)
    await user.type(headlineInput, 'x'.repeat(81))

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(
      screen.getByText('Headline must be 80 characters or fewer'),
    ).toBeInTheDocument()
  })

  it('should call saveAppSettingAction and show a toast on success', async () => {
    const user = userEvent.setup()
    const savedValue = {
      ...DEFAULT_BANNER_SETTING,
      mode: 'on' as const,
      headline: 'Original headline',
    }

    saveAppSettingActionMock.mockResolvedValue({
      success: true,
      data: {
        key: 'banner_public',
        value: { ...savedValue, headline: 'Updated headline' },
      },
    })

    renderRow(savedValue)

    await user.click(screen.getByRole('button', { name: /Public banner/i }))

    const headlineInput = screen.getByLabelText('Headline')
    await user.clear(headlineInput)
    await user.type(headlineInput, 'Updated headline')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(saveAppSettingActionMock).toHaveBeenCalledWith({
      key: 'banner_public',
      value: expect.objectContaining({ headline: 'Updated headline' }),
    })
    expect(onSavedMock).toHaveBeenCalledWith(
      'banner_public',
      expect.objectContaining({ headline: 'Updated headline' }),
    )
    expect(showSuccessToastMock).toHaveBeenCalledWith('Public banner saved')
  })

  it('should render a collapsed saved preview when headline content exists', () => {
    renderRow({
      ...DEFAULT_BANNER_SETTING,
      mode: 'on',
      headline: 'Saved preview headline',
    })

    expect(screen.getAllByRole('status')).toHaveLength(1)
    expect(screen.getByRole('status')).toHaveTextContent(
      'Saved preview headline',
    )
  })

  it('should wrap the draft preview in dark mode with a background surface', async () => {
    const user = userEvent.setup()

    renderRow({
      ...DEFAULT_BANNER_SETTING,
      mode: 'on',
      headline: 'Draft preview headline',
    })

    await user.click(screen.getByRole('button', { name: /Public banner/i }))
    await user.click(screen.getByRole('button', { name: 'Preview dark' }))

    expect(
      screen.getByRole('button', { name: 'Preview light' }),
    ).toBeInTheDocument()
    expect(document.querySelector('.dark.bg-background')).toBeInTheDocument()
  })
})
