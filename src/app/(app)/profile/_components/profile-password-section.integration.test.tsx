import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ProfilePasswordSection } from './profile-password-section'

const mockUpdateUser = vi.fn()

vi.mock('@/supabase/client', () => ({
  createClient: () => ({
    auth: {
      updateUser: mockUpdateUser,
    },
  }),
}))

describe('ProfilePasswordSection', () => {
  beforeEach(() => {
    mockUpdateUser.mockReset()
  })

  it('should show validation error when passwords do not match', async () => {
    const user = userEvent.setup()

    render(<ProfilePasswordSection />)

    await user.type(screen.getByLabelText(/new password/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'different')
    await user.click(screen.getByRole('button', { name: /change password/i }))

    expect(
      await screen.findByText(/passwords do not match/i),
    ).toBeInTheDocument()
    expect(mockUpdateUser).not.toHaveBeenCalled()
  })

  it('should show validation error for short passwords', async () => {
    const user = userEvent.setup()

    render(<ProfilePasswordSection />)

    await user.type(screen.getByLabelText(/new password/i), '123')
    await user.type(screen.getByLabelText(/confirm password/i), '123')
    await user.click(screen.getByRole('button', { name: /change password/i }))

    expect(
      await screen.findByText(/at least 6 characters/i),
    ).toBeInTheDocument()
  })

  it('should update password on valid submit', async () => {
    mockUpdateUser.mockResolvedValue({ error: null })
    const user = userEvent.setup()

    render(<ProfilePasswordSection />)

    await user.type(screen.getByLabelText(/new password/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /change password/i }))

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'password123' })
      expect(screen.getByText(/password updated/i)).toBeInTheDocument()
    })
  })
})
