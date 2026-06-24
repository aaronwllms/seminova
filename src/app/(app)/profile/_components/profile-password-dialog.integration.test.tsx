import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ProfilePasswordDialog } from './profile-password-dialog'

const mockUpdateUser = vi.fn()
const mockShowSuccessToast = vi.fn()

vi.mock('@/supabase/client', () => ({
  createClient: () => ({
    auth: {
      updateUser: mockUpdateUser,
    },
  }),
}))

vi.mock('@/utils/app-toast', () => ({
  showSuccessToast: (...args: unknown[]) => mockShowSuccessToast(...args),
}))

describe('ProfilePasswordDialog', () => {
  beforeEach(() => {
    mockUpdateUser.mockReset()
    mockShowSuccessToast.mockReset()
  })

  it('should show validation error when passwords do not match', async () => {
    const user = userEvent.setup()

    render(<ProfilePasswordDialog email="test@example.com" />)

    await user.click(screen.getByRole('button', { name: /change password/i }))
    await user.type(screen.getByLabelText(/current password/i), 'old-password')
    await user.type(screen.getByLabelText(/^new password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm new password/i), 'different')
    await user.click(screen.getByRole('button', { name: /update password/i }))

    expect(
      await screen.findByText(/passwords do not match/i),
    ).toBeInTheDocument()
    expect(mockUpdateUser).not.toHaveBeenCalled()
  })

  it('should show validation error for short passwords', async () => {
    const user = userEvent.setup()

    render(<ProfilePasswordDialog email="test@example.com" />)

    await user.click(screen.getByRole('button', { name: /change password/i }))
    await user.type(screen.getByLabelText(/current password/i), 'old-password')
    await user.type(screen.getByLabelText(/^new password$/i), '123')
    await user.type(screen.getByLabelText(/confirm new password/i), '123')
    await user.click(screen.getByRole('button', { name: /update password/i }))

    expect(
      await screen.findByText(/at least 6 characters/i),
    ).toBeInTheDocument()
    expect(mockUpdateUser).not.toHaveBeenCalled()
  })

  it('should update password with current_password and show toast', async () => {
    mockUpdateUser.mockResolvedValue({ error: null })
    const user = userEvent.setup()

    render(<ProfilePasswordDialog email="test@example.com" />)

    await user.click(screen.getByRole('button', { name: /change password/i }))
    await user.type(screen.getByLabelText(/current password/i), 'old-password')
    await user.type(screen.getByLabelText(/^new password$/i), 'password123')
    await user.type(
      screen.getByLabelText(/confirm new password/i),
      'password123',
    )
    await user.click(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({
        password: 'password123',
        current_password: 'old-password',
      })
      expect(mockShowSuccessToast).toHaveBeenCalledWith('Password updated')
    })
  })
})
