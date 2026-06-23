import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ProfilePageClient } from './profile-page-client'

const mockUpdateProfileAction = vi.fn()
const mockRefresh = vi.fn()
const mockShowSuccessToast = vi.fn()

vi.mock('../actions', () => ({
  updateProfileAction: (...args: unknown[]) => mockUpdateProfileAction(...args),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}))

vi.mock('@/utils/app-toast', () => ({
  showSuccessToast: (...args: unknown[]) => mockShowSuccessToast(...args),
}))

vi.mock('@/components/theme-switcher', () => ({
  ThemeSwitcher: () => <div>Theme controls</div>,
}))

describe('ProfilePageClient', () => {
  beforeEach(() => {
    mockUpdateProfileAction.mockReset()
    mockRefresh.mockReset()
    mockShowSuccessToast.mockReset()
  })

  it('should save profile changes and show success toast', async () => {
    mockUpdateProfileAction.mockResolvedValue({
      success: true,
      data: {
        displayName: 'Jordan',
        bio: 'Builder',
        avatarUrl: null,
      },
    })

    const user = userEvent.setup()

    render(
      <ProfilePageClient
        userId="user-1"
        email="test@example.com"
        defaultValues={{
          displayName: 'Alex',
          bio: 'Builder',
          avatarUrl: null,
        }}
      />,
    )

    await user.clear(screen.getByLabelText(/display name/i))
    await user.type(screen.getByLabelText(/display name/i), 'Jordan')
    await user.click(screen.getByRole('button', { name: /save profile/i }))

    await waitFor(() => {
      expect(mockUpdateProfileAction).toHaveBeenCalled()
      expect(mockShowSuccessToast).toHaveBeenCalledWith('Profile saved')
      expect(mockRefresh).toHaveBeenCalled()
    })
  })
})
