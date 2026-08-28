import { act, fireEvent, render, screen, waitFor } from '@/test/test-utils'
import { Activity } from 'react'
import userEvent from '@testing-library/user-event'
import { AuthApiError } from '@supabase/supabase-js'
import {
  AUTH_OTP_LIFETIME_MINUTES,
  AUTH_OTP_MIN_SEND_INTERVAL_SECONDS,
} from '@/constants/auth'
import { ForgotPasswordForm } from './forgot-password-form'

const mockResetPasswordForEmail = vi.fn()
const mockVerifyOtp = vi.fn()
const mockPush = vi.fn()
const mockRefresh = vi.fn()

vi.mock('@/supabase/client', () => ({
  createClient: () => ({
    auth: {
      resetPasswordForEmail: mockResetPasswordForEmail,
      verifyOtp: mockVerifyOtp,
    },
  }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}))

const submitEmail = async (address = 'test@example.com') => {
  const user = userEvent.setup({ delay: null })
  await user.type(screen.getByLabelText(/email/i), address)
  await user.click(screen.getByRole('button', { name: /send reset email/i }))
  return user
}

const enterOtpCode = async (
  user: ReturnType<typeof userEvent.setup>,
  code: string,
) => {
  const otpInput = document.querySelector('[data-slot="input-otp"]')
  if (!otpInput) throw new Error('OTP input not found')
  await user.click(otpInput)
  await user.paste(code)
}

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    vi.useRealTimers()
    document.elementFromPoint = vi.fn(() => null)
    mockResetPasswordForEmail.mockReset()
    mockVerifyOtp.mockReset()
    mockPush.mockReset()
    mockRefresh.mockReset()
  })

  it('should expose password-manager autofill attributes', () => {
    render(<ForgotPasswordForm />)

    expect(screen.getByLabelText(/email/i)).toHaveAttribute(
      'autocomplete',
      'username',
    )
    expect(screen.getByLabelText(/email/i)).toHaveAttribute('name', 'username')
  })

  it('should show hedged dual-route confirmation copy without naming the address', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null })

    render(<ForgotPasswordForm />)
    await submitEmail()

    expect(
      await screen.findByText(/complete password reset/i),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/use the link or code from your email/i),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        /if you registered using your email and password, you will receive a password reset email/i,
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        /if you received an email, enter the code below, or follow the link instead/i,
      ),
    ).toBeInTheDocument()
    expect(screen.queryByText(/test@example.com/i)).not.toBeInTheDocument()
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
    const user = userEvent.setup({ delay: null })

    render(<ForgotPasswordForm />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /send reset email/i }))

    expect(
      await screen.findByText(
        /something went wrong on our end\. please try again, or contact support if it continues\./i,
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^copy$/i })).toBeInTheDocument()
  })

  it('should verify a recovery code and navigate to update-password', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null })
    mockVerifyOtp.mockResolvedValue({ error: null, data: { user: {} } })

    render(<ForgotPasswordForm />)
    const user = await submitEmail()
    await enterOtpCode(user, '123456')

    await waitFor(() => {
      expect(mockVerifyOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        token: '123456',
        type: 'recovery',
      })
      expect(mockRefresh).toHaveBeenCalledOnce()
      expect(mockPush).toHaveBeenCalledWith('/auth/update-password')
    })
    expect(mockPush).toHaveBeenCalledTimes(1)
  })

  it('should show mismatch copy for a wrong code inside the lifetime window', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    mockResetPasswordForEmail.mockResolvedValue({ error: null })
    mockVerifyOtp.mockResolvedValue({
      error: new AuthApiError('OTP has expired', 403, 'otp_expired'),
    })

    render(<ForgotPasswordForm />)
    const user = await submitEmail()
    await enterOtpCode(user, '000000')

    expect(
      await screen.findByText(/that code didn't match\. please try again\./i),
    ).toBeInTheDocument()
    expect(document.querySelector('[data-slot="input-otp"]')).toHaveValue('')
  })

  it('should show expired copy for a wrong code past the lifetime window', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null })
    mockVerifyOtp.mockResolvedValue({
      error: new AuthApiError('OTP has expired', 403, 'otp_expired'),
    })

    render(<ForgotPasswordForm />)
    const user = await submitEmail()

    const expiredAt = Date.now() + AUTH_OTP_LIFETIME_MINUTES * 60 * 1000 + 1
    vi.spyOn(Date, 'now').mockReturnValue(expiredAt)
    await enterOtpCode(user, '000000')
    vi.mocked(Date.now).mockRestore()

    expect(
      await screen.findByText(
        /that code has expired\. please request a new one\./i,
      ),
    ).toBeInTheDocument()
    expect(document.querySelector('[data-slot="input-otp"]')).toHaveValue('')
  })

  it('should show too-many-attempts copy when verify is rate limited', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null })
    mockVerifyOtp.mockResolvedValue({
      error: new AuthApiError(
        'Request rate limit reached',
        429,
        'over_request_rate_limit',
      ),
    })

    render(<ForgotPasswordForm />)
    const user = await submitEmail()
    await enterOtpCode(user, '123456')

    expect(
      await screen.findByText(
        /too many attempts\. please wait a few minutes before trying again\./i,
      ),
    ).toBeInTheDocument()
  })

  it('should disable resend with a countdown after send', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    mockResetPasswordForEmail.mockResolvedValue({ error: null })

    render(<ForgotPasswordForm />)
    await submitEmail()

    const resendButton = screen.getByRole('button', {
      name: new RegExp(
        `resend code \\(${AUTH_OTP_MIN_SEND_INTERVAL_SECONDS}s\\)`,
        'i',
      ),
    })
    expect(resendButton).toBeDisabled()
  })

  it('should clear partial code and resend on successful resend', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    mockResetPasswordForEmail.mockResolvedValue({ error: null })

    render(<ForgotPasswordForm />)
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: /send reset email/i }))

    await waitFor(() => {
      expect(mockResetPasswordForEmail).toHaveBeenCalledOnce()
    })

    const otpInput = document.querySelector('[data-slot="input-otp"]')
    if (!otpInput) throw new Error('OTP input not found')
    fireEvent.input(otpInput, { target: { value: '12' } })

    await act(async () => {
      vi.advanceTimersByTime(AUTH_OTP_MIN_SEND_INTERVAL_SECONDS * 1000)
    })

    fireEvent.click(screen.getByRole('button', { name: /^resend code$/i }))
    vi.useRealTimers()

    await waitFor(() => {
      expect(mockResetPasswordForEmail).toHaveBeenCalledTimes(2)
      expect(document.querySelector('[data-slot="input-otp"]')).toHaveValue('')
    })
  })

  it('should show send-rate-limit copy on rejected resend without restarting countdown', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    mockResetPasswordForEmail
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({
        error: new AuthApiError(
          'Email rate limit exceeded',
          429,
          'over_email_send_rate_limit',
        ),
      })

    render(<ForgotPasswordForm />)
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: /send reset email/i }))

    await waitFor(() => {
      expect(mockResetPasswordForEmail).toHaveBeenCalledOnce()
    })

    await act(async () => {
      vi.advanceTimersByTime(AUTH_OTP_MIN_SEND_INTERVAL_SECONDS * 1000)
    })

    fireEvent.click(screen.getByRole('button', { name: /^resend code$/i }))
    vi.useRealTimers()

    expect(
      await screen.findByText(
        /too many emails sent\. please wait a few minutes and try again\./i,
      ),
    ).toBeInTheDocument()
    expect(mockResetPasswordForEmail).toHaveBeenCalledTimes(2)
    expect(
      screen.getByRole('button', { name: /^resend code$/i }),
    ).toBeInTheDocument()
  })

  it('should return to the email field with the submitted address prefilled', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null })

    render(<ForgotPasswordForm />)
    const user = await submitEmail()

    await user.click(
      screen.getByRole('button', { name: /use a different email/i }),
    )

    expect(screen.getByLabelText(/email/i)).toHaveValue('test@example.com')
    expect(
      screen.getByRole('button', { name: /send reset email/i }),
    ).toBeInTheDocument()
  })

  it('should reset to an empty email field after the screen is hidden and shown again', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null })
    mockVerifyOtp.mockResolvedValue({ error: null, data: { user: {} } })

    const VisibilityHarness = ({ visible }: { visible: boolean }) => (
      <Activity mode={visible ? 'visible' : 'hidden'}>
        <ForgotPasswordForm />
      </Activity>
    )

    const { rerender } = render(<VisibilityHarness visible />)
    const user = await submitEmail()
    await enterOtpCode(user, '123456')

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/update-password')
    })
    expect(screen.getByText(/complete password reset/i)).toBeInTheDocument()

    rerender(<VisibilityHarness visible={false} />)
    rerender(<VisibilityHarness visible />)

    expect(
      screen.getByRole('heading', { name: /reset your password/i }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toHaveValue('')
    expect(
      screen.queryByText(/complete password reset/i),
    ).not.toBeInTheDocument()
  })

  it('should show the same verify-failure message for unknown and known addresses', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null })
    mockVerifyOtp.mockResolvedValue({
      error: new AuthApiError(
        'Token has expired or is invalid',
        403,
        'otp_expired',
      ),
    })

    const { unmount } = render(<ForgotPasswordForm />)
    const knownUser = await submitEmail('known@example.com')
    await enterOtpCode(knownUser, '000000')
    const knownMessage = (await screen.findByRole('alert')).textContent
    unmount()

    render(<ForgotPasswordForm />)
    const unknownUser = await submitEmail('unknown@example.com')
    await enterOtpCode(unknownUser, '000000')
    const unknownMessage = (await screen.findByRole('alert')).textContent

    expect(unknownMessage).toBe(knownMessage)
  })
})
