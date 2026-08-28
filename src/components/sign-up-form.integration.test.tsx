import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { SignUpForm } from './sign-up-form'

const mockSignUpWithPasswordAction = vi.fn()
const mockPush = vi.fn()

vi.mock('@/app/auth/_lib/sign-up/actions', () => ({
  signUpWithPasswordAction: (...args: unknown[]) =>
    mockSignUpWithPasswordAction(...args),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

describe('SignUpForm', () => {
  beforeEach(() => {
    mockSignUpWithPasswordAction.mockReset()
    mockPush.mockReset()
  })

  it('should expose password-manager autofill attributes', () => {
    render(<SignUpForm />)

    expect(screen.getByLabelText(/email/i)).toHaveAttribute(
      'autocomplete',
      'username',
    )
    expect(screen.getByLabelText(/email/i)).toHaveAttribute('name', 'username')
    expect(screen.getByLabelText(/^password$/i)).toHaveAttribute(
      'autocomplete',
      'new-password',
    )
    expect(screen.getByLabelText(/^password$/i)).toHaveAttribute(
      'name',
      'password',
    )
    expect(screen.getByLabelText(/repeat password/i)).toHaveAttribute(
      'autocomplete',
      'new-password',
    )
    expect(screen.getByLabelText(/repeat password/i)).toHaveAttribute(
      'name',
      'repeat-password',
    )
  })

  it('should call the sign-up action and redirect on success', async () => {
    mockSignUpWithPasswordAction.mockResolvedValue({ success: true })
    const user = userEvent.setup({ delay: null })

    render(<SignUpForm />)

    await user.type(screen.getByLabelText(/email/i), 'new@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/repeat password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /^sign up$/i }))

    await waitFor(() => {
      expect(mockSignUpWithPasswordAction).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
      })
      expect(mockPush).toHaveBeenCalledWith('/auth/sign-up-success')
    })
  })

  it('should link to the passwordless email request screen', () => {
    render(<SignUpForm />)

    expect(
      screen.getByRole('link', { name: /email me a link/i }),
    ).toHaveAttribute('href', '/auth/sign-in-link')
  })

  it('should show a length error when passwords are too short', async () => {
    const user = userEvent.setup({ delay: null })

    render(<SignUpForm />)

    await user.type(screen.getByLabelText(/email/i), 'new@example.com')
    await user.type(screen.getByLabelText(/^password$/i), '1234567')
    await user.type(screen.getByLabelText(/repeat password/i), '1234567')
    await user.click(screen.getByRole('button', { name: /^sign up$/i }))

    expect(
      await screen.findByText(/password must be at least 8 characters/i),
    ).toBeInTheDocument()
    expect(mockSignUpWithPasswordAction).not.toHaveBeenCalled()
  })

  it('should submit password manager values read from FormData', async () => {
    mockSignUpWithPasswordAction.mockResolvedValue({ success: true })

    render(<SignUpForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const repeatInput = screen.getByLabelText(/repeat password/i)

    emailInput.focus()
    ;(emailInput as HTMLInputElement).value = 'manager@example.com'
    ;(passwordInput as HTMLInputElement).value = 'generated-password-123'
    ;(repeatInput as HTMLInputElement).value = 'generated-password-123'

    screen.getByRole('button', { name: /^sign up$/i }).click()

    await waitFor(() => {
      expect(mockSignUpWithPasswordAction).toHaveBeenCalledWith({
        email: 'manager@example.com',
        password: 'generated-password-123',
      })
    })
  })

  it('should show an error when passwords do not match', async () => {
    const user = userEvent.setup({ delay: null })

    render(<SignUpForm />)

    await user.type(screen.getByLabelText(/email/i), 'new@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/repeat password/i), 'different')
    await user.click(screen.getByRole('button', { name: /^sign up$/i }))

    expect(
      await screen.findByText(/passwords do not match/i),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /^copy$/i }),
    ).not.toBeInTheDocument()
    expect(mockSignUpWithPasswordAction).not.toHaveBeenCalled()
  })

  it('should render the action envelope and not navigate on failure', async () => {
    mockSignUpWithPasswordAction.mockResolvedValue({
      success: false,
      error: {
        message: 'Could not create your account.',
        code: 'INTERNAL_ERROR',
        kind: 'fault',
      },
    })
    const user = userEvent.setup({ delay: null })

    render(<SignUpForm />)

    await user.type(screen.getByLabelText(/email/i), 'new@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/repeat password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /^sign up$/i }))

    expect(
      await screen.findByText(/could not create your account/i),
    ).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })
})
