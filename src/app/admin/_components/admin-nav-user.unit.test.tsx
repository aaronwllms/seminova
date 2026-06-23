import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSignOut = vi.fn()
const mockPush = vi.fn()

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

import { PROFILE_PATH } from '@/constants/app-paths'
import { render, screen, waitFor } from '@/test/test-utils'

import { AdminNavUser } from './admin-nav-user'

describe('AdminNavUser', () => {
  beforeEach(() => {
    mockSignOut.mockReset()
    mockPush.mockReset()
  })

  it('should open menu with profile link and sign out', async () => {
    mockSignOut.mockResolvedValue({ error: null })
    const user = userEvent.setup()

    render(<AdminNavUser email="admin@example.com" />)

    await user.click(screen.getByRole('button'))

    expect(screen.getByRole('menuitem', { name: /profile/i })).toHaveAttribute(
      'href',
      PROFILE_PATH,
    )

    await user.click(screen.getByRole('menuitem', { name: /sign out/i }))

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/auth/login')
    })
  })
})
