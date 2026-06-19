import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { UpdatePasswordForm } from './update-password-form'

const mockUpdateUser = vi.fn()
const mockPush = vi.fn()

vi.mock('@/supabase/client', () => ({
  createClient: () => ({
    auth: {
      updateUser: mockUpdateUser,
    },
  }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

describe('UpdatePasswordForm', () => {
  beforeEach(() => {
    mockUpdateUser.mockReset()
    mockPush.mockReset()
  })

  it('should update password and redirect non-admins to /protected', async () => {
    mockUpdateUser.mockResolvedValue({
      error: null,
      data: { user: { app_metadata: {} } },
    })
    const user = userEvent.setup()

    render(<UpdatePasswordForm />)

    await user.type(screen.getByLabelText(/new password/i), 'new-password-123')
    await user.click(screen.getByRole('button', { name: /save new password/i }))

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({
        password: 'new-password-123',
      })
      expect(mockPush).toHaveBeenCalledWith('/protected')
    })
  })

  it('should update password and redirect admins to /users', async () => {
    mockUpdateUser.mockResolvedValue({
      error: null,
      data: { user: { app_metadata: { role: 'admin' } } },
    })
    const user = userEvent.setup()

    render(<UpdatePasswordForm />)

    await user.type(screen.getByLabelText(/new password/i), 'new-password-123')
    await user.click(screen.getByRole('button', { name: /save new password/i }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/users')
    })
  })

  it('should show an error when password update fails', async () => {
    mockUpdateUser.mockResolvedValue({
      error: new Error('Password is too weak'),
    })
    const user = userEvent.setup()

    render(<UpdatePasswordForm />)

    await user.type(screen.getByLabelText(/new password/i), 'weak')
    await user.click(screen.getByRole('button', { name: /save new password/i }))

    expect(await screen.findByText(/password is too weak/i)).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })
})
