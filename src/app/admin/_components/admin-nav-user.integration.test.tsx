import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSignOut = vi.fn()
const mockPush = vi.fn()
const mockOpenProfile = vi.fn()

vi.mock('@/app/(app)/_components/profile/profile-dialog-provider', () => ({
  useProfileDialog: () => ({ openProfile: mockOpenProfile }),
}))

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

const mockSetTheme = vi.fn()

vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: mockSetTheme,
  }),
}))

vi.mock('@/components/ui/sidebar', () => ({
  SidebarMenu: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarMenuButton: ({
    children,
    ...props
  }: React.ComponentProps<'button'>) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
  useSidebar: () => ({ isMobile: false }),
}))

import { APP_HOME } from '@/constants/app-paths'
import { render, screen, waitFor } from '@/test/test-utils'

import { AdminNavUser } from './admin-nav-user'

describe('AdminNavUser', () => {
  beforeEach(() => {
    mockSignOut.mockReset()
    mockPush.mockReset()
    mockOpenProfile.mockReset()
    mockSetTheme.mockReset()
  })

  it('should show display name when present', () => {
    render(
      <AdminNavUser
        displayName="Admin User"
        avatarUrl={null}
        email="admin@example.com"
      />,
    )

    expect(screen.getAllByText('Admin User').length).toBeGreaterThan(0)
    expect(screen.queryByText('admin@example.com')).not.toBeInTheDocument()
  })

  it('should fall back to email when display name is missing', () => {
    render(
      <AdminNavUser
        displayName={null}
        avatarUrl={null}
        email="admin@example.com"
      />,
    )

    expect(screen.getAllByText('admin@example.com').length).toBeGreaterThan(0)
  })

  it('should open menu with open app link and sign out', async () => {
    mockSignOut.mockResolvedValue({ error: null })
    const user = userEvent.setup({ delay: null })

    render(
      <AdminNavUser
        displayName="Admin User"
        avatarUrl={null}
        email="admin@example.com"
      />,
    )

    await user.click(screen.getByRole('button'))

    expect(screen.getByRole('menuitem', { name: /open app/i })).toHaveAttribute(
      'href',
      APP_HOME,
    )
    expect(
      screen.getByRole('menuitem', { name: /profile/i }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('menuitem', { name: /sign out/i }))

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/auth/login')
    })
  })

  it('should open profile settings when profile is selected', async () => {
    const user = userEvent.setup({ delay: null })

    render(
      <AdminNavUser
        displayName="Admin User"
        avatarUrl={null}
        email="admin@example.com"
      />,
    )

    await user.click(screen.getByRole('button'))
    await user.click(screen.getByRole('menuitem', { name: /profile/i }))

    expect(mockOpenProfile).toHaveBeenCalledOnce()
  })

  it('should show theme options and apply selection from the account menu', async () => {
    const user = userEvent.setup({ delay: null })

    render(
      <AdminNavUser
        displayName="Admin User"
        avatarUrl={null}
        email="admin@example.com"
      />,
    )

    await user.click(screen.getByRole('button'))

    const lightItem = screen.getByRole('menuitem', { name: /light/i })
    expect(lightItem.querySelector('svg.lucide-check')).toBeInTheDocument()

    await user.click(screen.getByRole('menuitem', { name: /system/i }))

    expect(mockSetTheme).toHaveBeenCalledWith('system')
  })
})
