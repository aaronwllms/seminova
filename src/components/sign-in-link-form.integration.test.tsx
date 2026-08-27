import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { AuthApiError } from '@supabase/supabase-js'
import { SignInLinkForm } from './sign-in-link-form'

const mockSignInWithOtp = vi.fn()

vi.mock('@/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithOtp: mockSignInWithOtp,
    },
  }),
}))

describe('SignInLinkForm', () => {
  beforeEach(() => {
    mockSignInWithOtp.mockReset()
  })

  it('should expose password-manager autofill attributes', () => {
    render(<SignInLinkForm />)

    expect(screen.getByLabelText(/email/i)).toHaveAttribute(
      'autocomplete',
      'username',
    )
  })

  it('should show success message naming the submitted address', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null })
    const user = userEvent.setup({ delay: null })

    render(<SignInLinkForm />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /send sign-in link/i }))

    expect(await screen.findByText(/check your email/i)).toBeInTheDocument()
    expect(
      screen.getByText(/we sent a sign-in link to test@example.com/i),
    ).toBeInTheDocument()
  })

  it('should call signInWithOtp with emailRedirectTo when next is safe', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null })
    const user = userEvent.setup({ delay: null })

    render(<SignInLinkForm next="/admin/logs?level=error&unread=1" />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /send sign-in link/i }))

    await waitFor(() => {
      expect(mockSignInWithOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        options: {
          shouldCreateUser: true,
          emailRedirectTo: expect.stringContaining(
            '/admin/logs?level=error&unread=1',
          ),
        },
      })
    })
  })

  it('should omit emailRedirectTo when next is missing', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null })
    const user = userEvent.setup({ delay: null })

    render(<SignInLinkForm />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /send sign-in link/i }))

    await waitFor(() => {
      expect(mockSignInWithOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        options: { shouldCreateUser: true },
      })
    })
  })

  it('should omit emailRedirectTo when next is unsafe', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null })
    const user = userEvent.setup({ delay: null })

    render(<SignInLinkForm next="https://evil.example/phish" />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /send sign-in link/i }))

    await waitFor(() => {
      expect(mockSignInWithOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        options: { shouldCreateUser: true },
      })
    })
  })

  it('should show rate-limit copy when send is throttled', async () => {
    mockSignInWithOtp.mockResolvedValue({
      error: new AuthApiError(
        'Email rate limit exceeded',
        429,
        'over_email_send_rate_limit',
      ),
    })
    const user = userEvent.setup({ delay: null })

    render(<SignInLinkForm />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /send sign-in link/i }))

    expect(
      await screen.findByText(
        /too many emails sent\. please wait a few minutes and try again\./i,
      ),
    ).toBeInTheDocument()
  })

  it('should show generic fault copy when send fails unexpectedly', async () => {
    mockSignInWithOtp.mockResolvedValue({
      error: new Error('Unable to send sign-in link'),
    })
    const user = userEvent.setup({ delay: null })

    render(<SignInLinkForm />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /send sign-in link/i }))

    expect(
      await screen.findByText(
        /something went wrong on our end\. please try again, or contact support if it continues\./i,
      ),
    ).toBeInTheDocument()
  })
})
