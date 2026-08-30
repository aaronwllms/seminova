import { act, fireEvent, render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { AuthApiError } from '@supabase/supabase-js'
import { ADMIN_HOME } from '@/constants/admin-paths'
import {
  AUTH_OTP_LIFETIME_MINUTES,
  AUTH_OTP_MIN_SEND_INTERVAL_SECONDS,
} from '@/constants/auth'
import { SignInLinkForm } from './sign-in-link-form'

const mockSignInWithOtp = vi.fn()
const mockVerifyOtp = vi.fn()
const mockPush = vi.fn()
const mockRefresh = vi.fn()

vi.mock('@/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithOtp: mockSignInWithOtp,
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
  await user.click(screen.getByRole('button', { name: /email me a link/i }))
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

describe('SignInLinkForm', () => {
  beforeEach(() => {
    vi.useRealTimers()
    document.elementFromPoint = vi.fn(() => null)
    mockSignInWithOtp.mockReset()
    mockVerifyOtp.mockReset()
    mockPush.mockReset()
    mockRefresh.mockReset()
  })

  it('should expose password-manager autofill attributes', () => {
    render(<SignInLinkForm />)

    expect(screen.getByLabelText(/email/i)).toHaveAttribute(
      'autocomplete',
      'username',
    )
    expect(screen.getByLabelText(/email/i)).toHaveAttribute('name', 'username')
  })

  it('should send a link with the email a password manager wrote to the DOM', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null })
    const user = userEvent.setup({ delay: null })

    render(<SignInLinkForm />)

    const nativeValue = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value',
    )?.set
    nativeValue?.call(screen.getByLabelText(/email/i), 'keeper@example.com')

    await user.click(screen.getByRole('button', { name: /email me a link/i }))

    await waitFor(() => {
      expect(mockSignInWithOtp).toHaveBeenCalledWith({
        email: 'keeper@example.com',
        options: { shouldCreateUser: true },
      })
    })
  })

  it('should offer OS code autofill without password-manager badges', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null })

    render(<SignInLinkForm />)
    await submitEmail()

    const otpInput = document.querySelector('[data-slot="input-otp"]')
    expect(otpInput).toHaveAttribute('autocomplete', 'one-time-code')
    expect(otpInput).toHaveAttribute('data-1p-ignore')
    expect(otpInput).toHaveAttribute('data-lpignore', 'true')
  })

  it('should show confirmation copy naming the submitted address', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null })

    render(<SignInLinkForm />)
    await submitEmail()

    expect(await screen.findByText(/check your email/i)).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
    expect(
      screen.getByText(
        /we sent you an email\. enter the code below, or follow the link instead/i,
      ),
    ).toBeInTheDocument()
  })

  it('should call signInWithOtp with emailRedirectTo when next is safe', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null })

    render(<SignInLinkForm next="/admin/logs?level=error&unread=1" />)
    await submitEmail()

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

    render(<SignInLinkForm />)
    await submitEmail()

    await waitFor(() => {
      expect(mockSignInWithOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        options: { shouldCreateUser: true },
      })
    })
  })

  it('should omit emailRedirectTo when next is unsafe', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null })

    render(<SignInLinkForm next="https://evil.example/phish" />)
    await submitEmail()

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

    render(<SignInLinkForm />)
    await submitEmail()

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

    render(<SignInLinkForm />)
    await submitEmail()

    expect(
      await screen.findByText(
        /something went wrong on our end\. please try again, or contact support if it continues\./i,
      ),
    ).toBeInTheDocument()
  })

  it('should verify code and navigate to safe next when present', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null })
    mockVerifyOtp.mockResolvedValue({
      error: null,
      data: { user: { app_metadata: {} } },
    })

    render(<SignInLinkForm next="/admin/users" />)
    const user = await submitEmail()
    await enterOtpCode(user, '123456')

    await waitFor(() => {
      expect(mockVerifyOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        token: '123456',
        type: 'email',
      })
      expect(mockRefresh).toHaveBeenCalledOnce()
      expect(mockPush).toHaveBeenCalledWith('/admin/users')
    })
  })

  it('should verify code and redirect non-admins to /home', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null })
    mockVerifyOtp.mockResolvedValue({
      error: null,
      data: { user: { app_metadata: {} } },
    })

    render(<SignInLinkForm />)
    const user = await submitEmail()
    await enterOtpCode(user, '123456')

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/home')
    })
  })

  it('should verify code and redirect admins to /admin', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null })
    mockVerifyOtp.mockResolvedValue({
      error: null,
      data: { user: { app_metadata: { role: 'admin' } } },
    })

    render(<SignInLinkForm />)
    const user = await submitEmail()
    await enterOtpCode(user, '123456')

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(ADMIN_HOME)
    })
  })

  it('should show mismatch copy for a wrong code inside the lifetime window', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    mockSignInWithOtp.mockResolvedValue({ error: null })
    mockVerifyOtp.mockResolvedValue({
      error: new AuthApiError('OTP has expired', 403, 'otp_expired'),
    })

    render(<SignInLinkForm />)
    const user = await submitEmail()
    await enterOtpCode(user, '000000')

    expect(
      await screen.findByText(/that code didn't match\. please try again\./i),
    ).toBeInTheDocument()
    expect(document.querySelector('[data-slot="input-otp"]')).toHaveValue('')
  })

  it('should show expired copy for a wrong code past the lifetime window', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null })
    mockVerifyOtp.mockResolvedValue({
      error: new AuthApiError('OTP has expired', 403, 'otp_expired'),
    })

    render(<SignInLinkForm />)
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
    mockSignInWithOtp.mockResolvedValue({ error: null })
    mockVerifyOtp.mockResolvedValue({
      error: new AuthApiError(
        'Request rate limit reached',
        429,
        'over_request_rate_limit',
      ),
    })

    render(<SignInLinkForm />)
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
    mockSignInWithOtp.mockResolvedValue({ error: null })

    render(<SignInLinkForm />)
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
    mockSignInWithOtp.mockResolvedValue({ error: null })

    render(<SignInLinkForm />)
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: /email me a link/i }))

    await waitFor(() => {
      expect(mockSignInWithOtp).toHaveBeenCalledOnce()
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
      expect(mockSignInWithOtp).toHaveBeenCalledTimes(2)
      expect(document.querySelector('[data-slot="input-otp"]')).toHaveValue('')
    })
  })

  it('should show send-rate-limit copy on rejected resend without restarting countdown', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    mockSignInWithOtp
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({
        error: new AuthApiError(
          'Email rate limit exceeded',
          429,
          'over_email_send_rate_limit',
        ),
      })

    render(<SignInLinkForm />)
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: /email me a link/i }))

    await waitFor(() => {
      expect(mockSignInWithOtp).toHaveBeenCalledOnce()
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
    expect(mockSignInWithOtp).toHaveBeenCalledTimes(2)
    expect(
      screen.getByRole('button', { name: /^resend code$/i }),
    ).toBeInTheDocument()
  })

  it('should return to the email field with the submitted address prefilled', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null })

    render(<SignInLinkForm />)
    const user = await submitEmail()

    await user.click(
      screen.getByRole('button', { name: /use a different email/i }),
    )

    expect(screen.getByLabelText(/email/i)).toHaveValue('test@example.com')
    expect(
      screen.getByRole('button', { name: /email me a link/i }),
    ).toBeInTheDocument()
  })
})
