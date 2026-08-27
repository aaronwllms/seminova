import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ProfilePasswordSection } from './profile-password-section'

const mockUpdateUser = vi.fn()
const mockSetFirstPasswordAction = vi.fn()
const mockShowSuccessToast = vi.fn()

vi.mock('@/supabase/client', () => ({
  createClient: () => ({
    auth: {
      updateUser: mockUpdateUser,
    },
  }),
}))

vi.mock('@/app/(app)/_lib/profile/actions', () => ({
  setFirstPasswordAction: (...args: unknown[]) =>
    mockSetFirstPasswordAction(...args),
}))

vi.mock('@/utils/app-toast', () => ({
  showSuccessToast: (...args: unknown[]) => mockShowSuccessToast(...args),
}))

describe('ProfilePasswordSection', () => {
  beforeEach(() => {
    mockUpdateUser.mockReset()
    mockSetFirstPasswordAction.mockReset()
    mockShowSuccessToast.mockReset()
  })

  it('should show validation errors for mismatched and short passwords', async () => {
    const user = userEvent.setup({ delay: null })

    render(
      <ProfilePasswordSection email="test@example.com" hasPassword={true} />,
    )

    await user.type(screen.getByLabelText(/current password/i), 'old-password')
    await user.type(screen.getByLabelText(/^new password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm new password/i), 'different')
    await user.click(screen.getByRole('button', { name: /update password/i }))

    expect(
      await screen.findByText(/passwords do not match/i),
    ).toBeInTheDocument()
    expect(mockUpdateUser).not.toHaveBeenCalled()

    await user.clear(screen.getByLabelText(/^new password$/i))
    await user.clear(screen.getByLabelText(/confirm new password/i))
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
    const user = userEvent.setup({ delay: null })

    render(
      <ProfilePasswordSection email="test@example.com" hasPassword={true} />,
    )

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

  it('should set first password without current field and show toast', async () => {
    mockSetFirstPasswordAction.mockResolvedValue({ success: true })
    const user = userEvent.setup({ delay: null })

    render(
      <ProfilePasswordSection email="test@example.com" hasPassword={false} />,
    )

    expect(screen.queryByLabelText(/current password/i)).not.toBeInTheDocument()

    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/^confirm password$/i), 'password123')
    await user.click(screen.getByRole('button', { name: /set password/i }))

    await waitFor(() => {
      expect(mockSetFirstPasswordAction).toHaveBeenCalledWith({
        password: 'password123',
      })
      expect(mockUpdateUser).not.toHaveBeenCalled()
      expect(mockShowSuccessToast).toHaveBeenCalledWith('Password set')
    })
  })
})
