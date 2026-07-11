import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSignOut = vi.fn()
const mockPush = vi.fn()
const mockOpenProfile = vi.fn()

vi.mock('@/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signOut: mockSignOut,
    },
  }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('@/app/(app)/_components/profile/profile-dialog-provider', () => ({
  useProfileDialog: () => ({ openProfile: mockOpenProfile }),
}))

import { ADMIN_HOME } from '@/constants/admin-paths'
import { render, screen, waitFor } from '@/test/test-utils'

import { AppNavUser } from './app-nav-user'

describe('AppNavUser', () => {
  beforeEach(() => {
    mockSignOut.mockReset()
    mockPush.mockReset()
    mockOpenProfile.mockReset()
  })

  it('should open profile dialog from menu and sign out', async () => {
    mockSignOut.mockResolvedValue({ error: null })
    const user = userEvent.setup()

    render(
      <AppNavUser
        displayName="Alice Smith"
        avatarUrl={null}
        email="alice@example.com"
        isAdmin={false}
      />,
    )

    await user.click(screen.getByRole('button', { name: /account menu/i }))

    const profileItem = screen.getByRole('menuitem', { name: /profile/i })
    expect(profileItem).not.toHaveAttribute('href')
    await user.click(profileItem)
    expect(mockOpenProfile).toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: /account menu/i }))
    await user.click(screen.getByRole('menuitem', { name: /sign out/i }))

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/auth/login')
    })
  })

  it('should show admin console link for admins', async () => {
    const user = userEvent.setup()

    render(
      <AppNavUser
        displayName="Admin User"
        avatarUrl={null}
        email="admin@example.com"
        isAdmin={true}
      />,
    )

    await user.click(screen.getByRole('button', { name: /account menu/i }))

    expect(
      screen.getByRole('menuitem', { name: /admin console/i }),
    ).toHaveAttribute('href', ADMIN_HOME)
  })
})
