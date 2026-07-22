import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { render, screen } from '@/test/test-utils'
import { getRegistryEntry } from '@/config/app-settings-registry'
import { Accordion } from '@/components/ui/accordion'
import { DEFAULT_BANNER_SETTING } from '@/types/banner'

import { BannerSettingRow } from './banner-setting-row'

const saveAppSettingActionMock = vi.fn()
const showSuccessToastMock = vi.fn()
let mockResolvedTheme: 'light' | 'dark' | undefined = 'light'

vi.mock('next-themes', () => ({
  useTheme: () => ({
    resolvedTheme: mockResolvedTheme,
  }),
}))

vi.mock('@/app/admin/settings/_lib/actions', () => ({
  saveAppSettingAction: (...args: unknown[]) =>
    saveAppSettingActionMock(...args),
}))

vi.mock('@/utils/app-toast', () => ({
  showSuccessToast: (...args: unknown[]) => showSuccessToastMock(...args),
}))

describe('BannerSettingRow', () => {
  const onSavedMock = vi.fn()
  const entry = getRegistryEntry('banner_public')

  beforeAll(() => {
    Element.prototype.hasPointerCapture ??= () => false
    Element.prototype.setPointerCapture ??= () => {}
    Element.prototype.releasePointerCapture ??= () => {}
    Element.prototype.scrollIntoView ??= () => {}
  })

  beforeEach(() => {
    mockResolvedTheme = 'light'
    saveAppSettingActionMock.mockReset()
    showSuccessToastMock.mockReset()
    onSavedMock.mockReset()
  })

  const renderRow = (
    savedValue = DEFAULT_BANNER_SETTING,
    options?: { pageTheme?: 'light' | 'dark' },
  ) => {
    const ControlledRow = () => {
      const [openItem, setOpenItem] = useState('')

      return (
        <Accordion
          type="single"
          collapsible
          value={openItem}
          onValueChange={setOpenItem}
        >
          <BannerSettingRow
            entry={entry}
            savedValue={savedValue}
            isExpanded={openItem === 'banner_public'}
            onSaved={onSavedMock}
          />
        </Accordion>
      )
    }

    const row = <ControlledRow />

    return render(
      options?.pageTheme === 'dark' ? <div className="dark">{row}</div> : row,
    )
  }

  it('should show an unsaved changes indicator in the header when the draft differs from saved', async () => {
    const user = userEvent.setup()

    renderRow({
      ...DEFAULT_BANNER_SETTING,
      mode: 'on',
      headline: 'Saved headline',
    })

    expect(screen.queryByText('Unsaved changes')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Public banner/i }))

    const headlineInput = screen.getByLabelText('Headline')
    await user.clear(headlineInput)
    await user.type(headlineInput, 'Draft headline')

    expect(screen.getByText('Unsaved changes')).toBeInTheDocument()
  })

  it('should explain banner copy syntax under headline and detail fields', async () => {
    const user = userEvent.setup()

    renderRow({
      ...DEFAULT_BANNER_SETTING,
      mode: 'on',
      headline: 'Saved headline',
    })

    await user.click(screen.getByRole('button', { name: /Public banner/i }))

    expect(
      screen.getAllByText(
        'Supports bold via **text** and links via [text](url).',
      ),
    ).toHaveLength(2)
  })

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

  it('should show Now inside the Starts field when no start time is set', async () => {
    const user = userEvent.setup()

    renderRow({
      ...DEFAULT_BANNER_SETTING,
      mode: 'scheduled',
      headline: 'Scheduled headline',
      starts_at: null,
      expires_at: '2026-12-31T23:59:00.000Z',
    })

    await user.click(screen.getByRole('button', { name: /Public banner/i }))

    expect(screen.getByLabelText('Starts')).toHaveTextContent('Now')
  })

  it('should reset Starts to Now when the clear control is clicked', async () => {
    const user = userEvent.setup()

    renderRow({
      ...DEFAULT_BANNER_SETTING,
      mode: 'scheduled',
      headline: 'Scheduled headline',
      starts_at: '2026-07-01T12:00:00.000Z',
      expires_at: '2026-12-31T23:59:00.000Z',
    })

    await user.click(screen.getByRole('button', { name: /Public banner/i }))

    await user.click(
      screen.getByRole('button', { name: 'Reset start time to now' }),
    )

    expect(screen.getByLabelText('Starts')).toHaveTextContent('Now')
  })

  it('should hide Save when the accordion is collapsed', () => {
    renderRow({
      ...DEFAULT_BANNER_SETTING,
      mode: 'on',
      headline: 'Saved preview headline',
    })

    expect(
      screen.queryByRole('button', { name: 'Save' }),
    ).not.toBeInTheDocument()
  })

  it('should render Save below the preview bar when expanded', async () => {
    const user = userEvent.setup()

    renderRow({
      ...DEFAULT_BANNER_SETTING,
      mode: 'on',
      headline: 'Saved preview headline',
    })

    await user.click(screen.getByRole('button', { name: /Public banner/i }))

    const preview = screen.getByRole('status')
    const save = screen.getByRole('button', { name: 'Save' })

    expect(
      preview.compareDocumentPosition(save) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
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

  it('should render a single saved preview at the bottom when headline content exists', () => {
    renderRow({
      ...DEFAULT_BANNER_SETTING,
      mode: 'on',
      headline: 'Saved preview headline',
    })

    expect(screen.getAllByRole('status')).toHaveLength(1)
    expect(screen.getByRole('status')).toHaveTextContent(
      'Saved preview headline',
    )
    expect(
      screen.queryByRole('button', { name: 'Preview dark' }),
    ).not.toBeInTheDocument()
  })

  it('should keep a single preview when expanded and update it from draft values', async () => {
    const user = userEvent.setup()

    renderRow({
      ...DEFAULT_BANNER_SETTING,
      mode: 'on',
      headline: 'Saved preview headline',
    })

    await user.click(screen.getByRole('button', { name: /Public banner/i }))

    expect(screen.getAllByRole('status')).toHaveLength(1)
    expect(screen.getByRole('status')).toHaveTextContent(
      'Saved preview headline',
    )

    const headlineInput = screen.getByLabelText('Headline')
    await user.clear(headlineInput)
    await user.type(headlineInput, 'Draft preview headline')

    expect(screen.getAllByRole('status')).toHaveLength(1)
    expect(screen.getByRole('status')).toHaveTextContent(
      'Draft preview headline',
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

  it('should apply a dark theme island to previews when the active theme is dark', async () => {
    const user = userEvent.setup()
    mockResolvedTheme = 'dark'

    renderRow(
      {
        ...DEFAULT_BANNER_SETTING,
        mode: 'on',
        headline: 'Saved preview headline',
      },
      { pageTheme: 'dark' },
    )

    expect(document.querySelector('.dark.bg-background')).toBeInTheDocument()
    expect(
      document.querySelector('.light.bg-background'),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Public banner/i }))

    expect(
      screen.getByRole('button', { name: 'Preview light' }),
    ).toBeInTheDocument()
    expect(document.querySelectorAll('.dark.bg-background')).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: 'Preview light' }))

    expect(document.querySelectorAll('.light.bg-background')).toHaveLength(1)
    expect(
      document.querySelector('.dark.bg-background'),
    ).not.toBeInTheDocument()
  })
})
