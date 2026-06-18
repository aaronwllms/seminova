import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { LogoutButton } from './logout-button'

const mockSignOut = vi.fn()
const mockPush = vi.fn()

vi.mock('@/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signOut: mockSignOut,
    },
  }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

describe('LogoutButton', () => {
  beforeEach(() => {
    mockSignOut.mockReset()
    mockPush.mockReset()
  })

  it('should sign out and redirect to login', async () => {
    mockSignOut.mockResolvedValue({ error: null })
    const user = userEvent.setup()

    render(<LogoutButton />)

    await user.click(screen.getByRole('button', { name: /logout/i }))

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/auth/login')
    })
  })
})
