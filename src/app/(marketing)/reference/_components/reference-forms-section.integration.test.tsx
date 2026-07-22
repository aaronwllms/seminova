import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { ReferenceFormsSection } from './reference-forms-section'

const mockReferenceDemoPersist = vi.fn()
const mockReferenceDemoMockPersist = vi.fn()
const mockShowSuccessToast = vi.fn()
const mockRefresh = vi.fn()

vi.mock('../_lib/reference-demo-persist', () => ({
  referenceDemoPersist: (...args: unknown[]) =>
    mockReferenceDemoPersist(...args),
  referenceDemoMockPersist: (...args: unknown[]) =>
    mockReferenceDemoMockPersist(...args),
  REFERENCE_DEMO_PERSIST_DELAY_MS: 0,
}))

vi.mock('@/utils/app-toast', () => ({
  showSuccessToast: (...args: unknown[]) => mockShowSuccessToast(...args),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}))

describe('ReferenceFormsSection', () => {
  beforeAll(() => {
    Element.prototype.hasPointerCapture ??= () => false
    Element.prototype.setPointerCapture ??= () => {}
    Element.prototype.releasePointerCapture ??= () => {}
    Element.prototype.scrollIntoView ??= () => {}
  })

  beforeEach(() => {
    mockReferenceDemoPersist.mockReset()
    mockReferenceDemoMockPersist.mockReset()
    mockShowSuccessToast.mockReset()
    mockReferenceDemoPersist.mockResolvedValue({
      success: true,
      data: { displayName: 'Jordan Lee' },
    })
    mockReferenceDemoMockPersist.mockImplementation(
      async (payload: unknown) => ({
        success: true,
        data: payload,
      }),
    )
  })

  it('should blur-save display name through the mock persist and show saved state', async () => {
    const user = userEvent.setup()

    render(<ReferenceFormsSection />)

    await user.click(
      screen.getByRole('button', { name: /preview profile settings/i }),
    )

    await user.clear(screen.getByLabelText(/display name/i))
    await user.type(screen.getByLabelText(/display name/i), 'Jordan Lee')
    await user.tab()

    await waitFor(() => {
      expect(mockReferenceDemoPersist).toHaveBeenCalledWith({
        displayName: 'Jordan Lee',
      })
      expect(screen.getByText(/^Saved$/)).toBeInTheDocument()
    })
  })

  it('should per-row save through mock persist and toast on success', async () => {
    const user = userEvent.setup()

    render(<ReferenceFormsSection />)

    await user.click(screen.getByRole('tab', { name: 'Per-row' }))

    await user.click(
      screen.getByRole('combobox', { name: 'Minimum log level' }),
    )
    await user.click(screen.getByRole('option', { name: 'warn' }))
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(mockReferenceDemoMockPersist).toHaveBeenCalledWith({
        value: 'warn',
      })
      expect(mockShowSuccessToast).toHaveBeenCalledWith(
        'Minimum log level saved',
      )
    })
  })

  it('should per-section save through mock persist and toast on success', async () => {
    const user = userEvent.setup()

    render(<ReferenceFormsSection />)

    await user.click(screen.getByRole('tab', { name: 'Per-section' }))

    const headline = screen.getByLabelText(/^Headline$/)
    await user.clear(headline)
    await user.type(headline, 'Updated maintenance window')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(mockReferenceDemoMockPersist).toHaveBeenCalledWith({
        headline: 'Updated maintenance window',
        detail: 'Expect brief downtime after 11pm.',
      })
      expect(mockShowSuccessToast).toHaveBeenCalledWith('Public banner saved')
    })
  })
})
