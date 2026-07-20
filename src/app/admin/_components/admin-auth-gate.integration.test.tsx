import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockGetDisplayAuthClaims = vi.fn()
const mockRedirect = vi.fn()

vi.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => {
    mockRedirect(...args)
    throw new Error('NEXT_REDIRECT')
  },
}))

vi.mock('next/server', () => ({
  connection: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/supabase/require-auth', () => ({
  getDisplayAuthClaims: (...args: unknown[]) =>
    mockGetDisplayAuthClaims(...args),
}))

vi.mock('@/app/(app)/_lib/get-current-user-profile', () => ({
  getCurrentUserProfile: vi.fn(),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      get: () => undefined,
    }),
  ),
}))

vi.mock('./admin-sidebar-nav-user-slot', () => ({
  AdminSidebarNavUserSlot: () => (
    <div data-testid="admin-sidebar-nav-user-slot" />
  ),
}))

vi.mock('./admin-shell', () => ({
  AdminShell: ({
    children,
    navUserSlot,
  }: {
    children: React.ReactNode
    navUserSlot: React.ReactNode
  }) => (
    <div data-testid="admin-shell">
      <div data-testid="admin-nav-user-slot">{navUserSlot}</div>
      {children}
    </div>
  ),
}))

import { getCurrentUserProfile } from '@/app/(app)/_lib/get-current-user-profile'
import { ADMIN_ROLE } from '@/constants/admin-role'
import { APP_HOME } from '@/constants/app-paths'
import { render, screen } from '@/test/test-utils'

import { AdminAuthGate } from './admin-auth-gate'

describe('AdminAuthGate', () => {
  beforeEach(() => {
    mockGetDisplayAuthClaims.mockReset()
    mockRedirect.mockReset()
    vi.mocked(getCurrentUserProfile).mockReset()
  })

  it('should redirect non-admin users to app home', async () => {
    mockGetDisplayAuthClaims.mockResolvedValue({
      sub: 'user-1',
      email: 'user@example.com',
      app_metadata: {},
    })

    await expect(
      AdminAuthGate({ children: <p>Admin content</p> }),
    ).rejects.toThrow('NEXT_REDIRECT')

    expect(mockRedirect).toHaveBeenCalledWith(APP_HOME)
    expect(getCurrentUserProfile).not.toHaveBeenCalled()
  })

  it('should render admin shell with nav user slot for admin users', async () => {
    mockGetDisplayAuthClaims.mockResolvedValue({
      sub: 'admin-1',
      email: 'admin@example.com',
      app_metadata: { role: ADMIN_ROLE },
    })

    render(await AdminAuthGate({ children: <p>Admin content</p> }))

    expect(screen.getByTestId('admin-shell')).toBeInTheDocument()
    expect(
      screen.getByTestId('admin-sidebar-nav-user-slot'),
    ).toBeInTheDocument()
    expect(screen.getByText('Admin content')).toBeInTheDocument()
    expect(getCurrentUserProfile).not.toHaveBeenCalled()
  })
})
