import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ReferenceFormsSection } from './reference-forms-section'

const mockReferenceDemoPersist = vi.fn()
const mockRefresh = vi.fn()

vi.mock('../_lib/reference-demo-persist', () => ({
  referenceDemoPersist: (...args: unknown[]) =>
    mockReferenceDemoPersist(...args),
  REFERENCE_DEMO_PERSIST_DELAY_MS: 0,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}))

describe('ReferenceFormsSection', () => {
  beforeEach(() => {
    mockReferenceDemoPersist.mockReset()
    mockReferenceDemoPersist.mockResolvedValue({
      success: true,
      data: { displayName: 'Jordan Lee' },
    })
  })

  it('should blur-save display name through the mock persist and show saved state', async () => {
    const user = userEvent.setup()

    render(<ReferenceFormsSection />)

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
})
