import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { AuthApiError } from '@supabase/supabase-js'
import { ADMIN_HOME } from '@/constants/admin-paths'
import { LoginForm } from './login-form'

const mockSignInWithPassword = vi.fn()
const mockSignOut = vi.fn()
const mockPush = vi.fn()
const mockRefresh = vi.fn()

vi.mock('@/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signOut: mockSignOut,
      signInWithPassword: mockSignInWithPassword,
    },
  }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}))

describe('LoginForm', () => {
  beforeEach(() => {
    mockSignInWithPassword.mockReset()
    mockSignOut.mockReset()
    mockPush.mockReset()
    mockRefresh.mockReset()
    mockSignOut.mockResolvedValue({ error: null })
  })

  it('should expose password-manager autofill attributes', () => {
    render(<LoginForm />)

    expect(screen.getByLabelText(/email/i)).toHaveAttribute(
      'autocomplete',
      'username',
    )
    expect(screen.getByLabelText(/^password$/i)).toHaveAttribute(
      'autocomplete',
      'current-password',
    )
  })

  it('should link to the sign-in-link request screen', () => {
    render(<LoginForm />)

    expect(
      screen.getByRole('link', { name: /email me a sign-in link/i }),
    ).toHaveAttribute('href', '/auth/sign-in-link')
  })

  it('should carry next on the sign-in-link CTA when provided', () => {
    render(<LoginForm next="/admin/users" />)

    expect(
      screen.getByRole('link', { name: /email me a sign-in link/i }),
    ).toHaveAttribute('href', '/auth/sign-in-link?next=%2Fadmin%2Fusers')
  })

  it('should sign in and navigate to safe next when provided', async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: null,
      data: { user: { app_metadata: {} } },
    })
    const user = userEvent.setup({ delay: null })

    render(<LoginForm next="/admin/users" />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.click(screen.getByRole('button', { name: /^login$/i }))

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalledOnce()
      expect(mockPush).toHaveBeenCalledWith('/admin/users')
    })
  })

  it('should fall back to role-based redirect when next is unsafe', async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: null,
      data: { user: { app_metadata: {} } },
    })
    const user = userEvent.setup({ delay: null })

    render(<LoginForm next="https://evil.example/phish" />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.click(screen.getByRole('button', { name: /^login$/i }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/home')
    })
  })

  it('should sign in and redirect non-admins to /home', async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: null,
      data: { user: { app_metadata: {} } },
    })
    const user = userEvent.setup({ delay: null })

    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.click(screen.getByRole('button', { name: /^login$/i }))

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledWith({ scope: 'local' })
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(mockRefresh).toHaveBeenCalledOnce()
      expect(mockPush).toHaveBeenCalledWith('/home')
    })
  })

  it('should sign in and redirect admins to /admin', async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: null,
      data: { user: { app_metadata: { role: 'admin' } } },
    })
    const user = userEvent.setup({ delay: null })

    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'admin@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.click(screen.getByRole('button', { name: /^login$/i }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(ADMIN_HOME)
    })
  })

  it('should show suspension copy when sign in is blocked for a banned user', async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: new AuthApiError('User is banned', 403, 'user_banned'),
    })
    const user = userEvent.setup({ delay: null })

    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'banned@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.click(screen.getByRole('button', { name: /^login$/i }))

    expect(
      await screen.findByText(/your account has been suspended/i),
    ).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('should show an error when sign in fails', async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: new AuthApiError(
        'Invalid login credentials',
        400,
        'invalid_credentials',
      ),
    })
    const user = userEvent.setup({ delay: null })

    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'wrong-password')
    await user.click(screen.getByRole('button', { name: /^login$/i }))

    expect(
      await screen.findByText(/invalid email or password/i),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /^copy$/i }),
    ).not.toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })
})
