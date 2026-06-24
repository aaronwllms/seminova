import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { SignUpForm } from './sign-up-form'

const mockSignUp = vi.fn()
const mockPush = vi.fn()

vi.mock('@/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signUp: mockSignUp,
    },
  }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

describe('SignUpForm', () => {
  beforeEach(() => {
    mockSignUp.mockReset()
    mockPush.mockReset()
  })

  it('should expose password-manager autofill attributes', () => {
    render(<SignUpForm />)

    expect(screen.getByLabelText(/email/i)).toHaveAttribute(
      'autocomplete',
      'username',
    )
    expect(screen.getByLabelText(/^password$/i)).toHaveAttribute(
      'autocomplete',
      'new-password',
    )
    expect(screen.getByLabelText(/repeat password/i)).toHaveAttribute(
      'autocomplete',
      'new-password',
    )
  })

  it('should sign up and redirect on success', async () => {
    mockSignUp.mockResolvedValue({ error: null })
    const user = userEvent.setup()

    render(<SignUpForm />)

    await user.type(screen.getByLabelText(/email/i), 'new@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/repeat password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /^sign up$/i }))

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/auth/sign-up-success')
    })
  })

  it('should show an error when passwords do not match', async () => {
    const user = userEvent.setup()

    render(<SignUpForm />)

    await user.type(screen.getByLabelText(/email/i), 'new@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/repeat password/i), 'different')
    await user.click(screen.getByRole('button', { name: /^sign up$/i }))

    expect(
      await screen.findByText(/passwords do not match/i),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /copy error details/i }),
    ).not.toBeInTheDocument()
    expect(mockSignUp).not.toHaveBeenCalled()
  })
})
