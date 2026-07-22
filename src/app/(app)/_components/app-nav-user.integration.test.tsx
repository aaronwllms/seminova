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

const mockSetTheme = vi.fn()

vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: mockSetTheme,
  }),
}))

import { APP_HOME } from '@/constants/app-paths'
import { ADMIN_HOME } from '@/constants/admin-paths'
import { render, screen, waitFor } from '@/test/test-utils'

import { AppNavUser } from './app-nav-user'

describe('AppNavUser', () => {
  beforeEach(() => {
    mockSignOut.mockReset()
    mockPush.mockReset()
    mockOpenProfile.mockReset()
    mockSetTheme.mockReset()
  })

  it('should open profile dialog from menu and sign out', async () => {
    mockSignOut.mockResolvedValue({ error: null })
    const user = userEvent.setup({ delay: null })

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

  it('should not show account label text beside the avatar trigger', async () => {
    const user = userEvent.setup({ delay: null })

    render(
      <AppNavUser
        displayName="Alice Smith"
        avatarUrl={null}
        email="alice@example.com"
        isAdmin={false}
      />,
    )

    await user.click(screen.getByRole('button', { name: /account menu/i }))

    expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument()
    expect(screen.queryByText('alice@example.com')).not.toBeInTheDocument()
  })

  it('should show admin console link for admins', async () => {
    const user = userEvent.setup({ delay: null })

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

  it('should show Open app link when showOpenApp is true', async () => {
    const user = userEvent.setup({ delay: null })

    render(
      <AppNavUser
        displayName="Alex"
        avatarUrl={null}
        email="alex@example.com"
        isAdmin={false}
        showOpenApp
      />,
    )

    await user.click(screen.getByRole('button', { name: /account menu/i }))

    expect(screen.getByRole('menuitem', { name: /open app/i })).toHaveAttribute(
      'href',
      APP_HOME,
    )
  })

  it('should not show Open app link when showOpenApp is omitted', async () => {
    const user = userEvent.setup({ delay: null })

    render(
      <AppNavUser
        displayName="Alex"
        avatarUrl={null}
        email="alex@example.com"
        isAdmin={false}
      />,
    )

    await user.click(screen.getByRole('button', { name: /account menu/i }))

    expect(
      screen.queryByRole('menuitem', { name: /open app/i }),
    ).not.toBeInTheDocument()
  })

  it('should show theme options and apply selection from the account menu', async () => {
    const user = userEvent.setup({ delay: null })

    render(
      <AppNavUser
        displayName="Alex"
        avatarUrl={null}
        email="alex@example.com"
        isAdmin={false}
      />,
    )

    await user.click(screen.getByRole('button', { name: /account menu/i }))

    const lightItem = screen.getByRole('menuitem', { name: /light/i })
    expect(lightItem.querySelector('svg.lucide-check')).toBeInTheDocument()

    await user.click(screen.getByRole('menuitem', { name: /dark/i }))

    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })
})
