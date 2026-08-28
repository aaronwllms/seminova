import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { ADMIN_HOME } from '@/constants/admin-paths'
import { UpdatePasswordForm } from './update-password-form'

const mockGetUser = vi.fn()
const mockPush = vi.fn()
const mockRefresh = vi.fn()
const mockCompleteRecoveryPasswordAction = vi.fn()
const mockUpdateUser = vi.fn()

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

    await user.type(screen.getByLabelText(/new password/i), 'weak')
    await user.click(screen.getByRole('button', { name: /save new password/i }))

    expect(
      await screen.findByText(
        /your password doesn't meet the strength requirements/i,
      ),
    ).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
    expect(mockRefresh).not.toHaveBeenCalled()
  })
})
