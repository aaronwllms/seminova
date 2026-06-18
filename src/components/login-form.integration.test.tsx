import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { LoginForm } from './login-form'

const mockSignInWithPassword = vi.fn()
const mockPush = vi.fn()

vi.mock('@/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
    },
  }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

describe('LoginForm', () => {
  beforeEach(() => {
    mockSignInWithPassword.mockReset()
    mockPush.mockReset()
  })

  it('should sign in and redirect on success', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null })
    const user = userEvent.setup()

    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.click(screen.getByRole('button', { name: /^login$/i }))

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(mockPush).toHaveBeenCalledWith('/protected')
    })
  })

  it('should show an error when sign in fails', async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: new Error('Invalid login credentials'),
    })
    const user = userEvent.setup()

    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'wrong-password')
    await user.click(screen.getByRole('button', { name: /^login$/i }))

    expect(
      await screen.findByText(/invalid login credentials/i),
    ).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })
})
