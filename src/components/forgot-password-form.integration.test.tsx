import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { ForgotPasswordForm } from './forgot-password-form'

const mockResetPasswordForEmail = vi.fn()

vi.mock('@/supabase/client', () => ({
  createClient: () => ({
    auth: {
      resetPasswordForEmail: mockResetPasswordForEmail,
    },
  }),
}))

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    mockResetPasswordForEmail.mockReset()
  })

  it('should expose password-manager autofill attributes', () => {
    render(<ForgotPasswordForm />)

    expect(screen.getByLabelText(/email/i)).toHaveAttribute(
      'autocomplete',
      'username',
    )
  })

  it('should show success message after sending reset email', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null })
    const user = userEvent.setup()

    render(<ForgotPasswordForm />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /send reset email/i }))

    expect(await screen.findByText(/check your email/i)).toBeInTheDocument()
    expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
      'test@example.com',
      expect.objectContaining({
        redirectTo: expect.stringContaining('/auth/update-password'),
      }),
    )
  })

  it('should show an error when reset email fails', async () => {
    mockResetPasswordForEmail.mockResolvedValue({
      error: new Error('Unable to send reset email'),
    })
    const user = userEvent.setup()

    render(<ForgotPasswordForm />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /send reset email/i }))

    expect(
      await screen.findByText(/unable to send reset email/i),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /copy error details/i }),
    ).toBeInTheDocument()
  })
})
