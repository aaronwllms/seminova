import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { ADMIN_HOME } from '@/constants/admin-paths'
import { UpdatePasswordForm } from './update-password-form'

const mockGetUser = vi.fn()
const mockPush = vi.fn()
const mockRefresh = vi.fn()
const mockCompleteRecoveryPasswordAction = vi.fn()
const mockUpdateUser = vi.fn()
const mockClientLogError = vi.fn()

vi.mock('@/utils/client-logger', () => ({
  clientLog: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: (...args: unknown[]) => mockClientLogError(...args),
  },
}))

vi.mock('@/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
      updateUser: mockUpdateUser,
    },
  }),
}))

vi.mock('@/app/(app)/_lib/profile/actions', () => ({
  completeRecoveryPasswordAction: (...args: unknown[]) =>
    mockCompleteRecoveryPasswordAction(...args),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}))

describe('UpdatePasswordForm', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockPush.mockReset()
    mockRefresh.mockReset()
    mockCompleteRecoveryPasswordAction.mockReset()
    mockUpdateUser.mockReset()
    mockClientLogError.mockReset()
    mockGetUser.mockResolvedValue({
      data: { user: { email: 'recover@example.com' } },
      error: null,
    })
  })

  it('should expose password-manager autofill attributes', async () => {
    render(<UpdatePasswordForm />)

    await waitFor(() => {
      const usernameInput = document.querySelector(
        'input[name="username"]',
      ) as HTMLInputElement
      expect(usernameInput).toHaveAttribute('autocomplete', 'username')
      expect(usernameInput).toHaveValue('recover@example.com')
    })
    expect(screen.getByLabelText(/new password/i)).toHaveAttribute(
      'autocomplete',
      'new-password',
    )
    expect(screen.getByLabelText(/new password/i)).toHaveAttribute(
      'name',
      'password',
    )
  })

  it('should await the recovery action and redirect from redirectTo', async () => {
    mockCompleteRecoveryPasswordAction.mockResolvedValue({
      success: true,
      data: { redirectTo: '/home' },
    })
    const user = userEvent.setup({ delay: null })

    render(<UpdatePasswordForm />)

    await user.type(screen.getByLabelText(/new password/i), 'new-password-123')
    await user.click(screen.getByRole('button', { name: /save new password/i }))

    await waitFor(() => {
      expect(mockCompleteRecoveryPasswordAction).toHaveBeenCalledWith({
        password: 'new-password-123',
      })
      expect(mockUpdateUser).not.toHaveBeenCalled()
      expect(mockRefresh).toHaveBeenCalledOnce()
      expect(mockPush).toHaveBeenCalledWith('/home')
    })
  })

  it('should redirect admins using the action redirectTo', async () => {
    mockCompleteRecoveryPasswordAction.mockResolvedValue({
      success: true,
      data: { redirectTo: ADMIN_HOME },
    })
    const user = userEvent.setup({ delay: null })

    render(<UpdatePasswordForm />)

    await user.type(screen.getByLabelText(/new password/i), 'new-password-123')
    await user.click(screen.getByRole('button', { name: /save new password/i }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(ADMIN_HOME)
    })
  })

  it('should show AppErrorSurface and not push when the action fails', async () => {
    mockCompleteRecoveryPasswordAction.mockResolvedValue({
      success: false,
      error: {
        message:
          "Your password doesn't meet the strength requirements. Please choose a stronger one.",
        code: 'VALIDATION_ERROR',
        kind: 'operational',
      },
    })
    const user = userEvent.setup({ delay: null })

    render(<UpdatePasswordForm />)

    await user.type(screen.getByLabelText(/new password/i), 'weak-password')
    await user.click(screen.getByRole('button', { name: /save new password/i }))

    expect(
      await screen.findByText(
        /your password doesn't meet the strength requirements/i,
      ),
    ).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
    expect(mockRefresh).not.toHaveBeenCalled()
  })

  it('should show a length error when the password is too short', async () => {
    const user = userEvent.setup({ delay: null })

    render(<UpdatePasswordForm />)

    await user.type(screen.getByLabelText(/new password/i), '1234567')
    await user.click(screen.getByRole('button', { name: /save new password/i }))

    expect(
      await screen.findByText(/password must be at least 8 characters/i),
    ).toBeInTheDocument()
    expect(mockCompleteRecoveryPasswordAction).not.toHaveBeenCalled()
  })

  it('should submit password manager values read from FormData', async () => {
    mockCompleteRecoveryPasswordAction.mockResolvedValue({
      success: true,
      data: { redirectTo: '/home' },
    })

    render(<UpdatePasswordForm />)

    const passwordInput = screen.getByLabelText(/new password/i)
    ;(passwordInput as HTMLInputElement).value = 'manager-set-password-123'

    screen.getByRole('button', { name: /save new password/i }).click()

    await waitFor(() => {
      expect(mockCompleteRecoveryPasswordAction).toHaveBeenCalledWith({
        password: 'manager-set-password-123',
      })
    })
  })

  it('should omit the hidden username field and show a note when email lookup fails', async () => {
    mockGetUser.mockRejectedValue(new Error('network failure'))

    render(<UpdatePasswordForm />)

    await waitFor(() => {
      expect(document.querySelector('input[name="username"]')).toBeNull()
    })
    expect(
      await screen.findByText(/couldn't confirm your email/i),
    ).toBeInTheDocument()
    expect(mockClientLogError).toHaveBeenCalledWith(
      'auth-form-error',
      'Could not resolve account email',
      expect.any(Error),
    )
  })
})
