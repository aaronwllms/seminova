import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockGetDisplayAuthClaims = vi.fn()
const mockGetCurrentUserProfile = vi.fn()
const mockRedirect = vi.fn()

vi.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => {
    mockRedirect(...args)
    throw new Error('NEXT_REDIRECT')
  },
}))

vi.mock('@/supabase/require-auth', () => ({
  getDisplayAuthClaims: (...args: unknown[]) =>
    mockGetDisplayAuthClaims(...args),
}))

vi.mock('@/app/(app)/_lib/get-current-user-profile', () => ({
  getCurrentUserProfile: (...args: unknown[]) =>
    mockGetCurrentUserProfile(...args),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      get: () => undefined,
    }),
  ),
}))

vi.mock('./admin-shell', () => ({
  AdminShell: ({
    children,
    email,
    displayName,
    avatarUrl,
  }: {
    children: React.ReactNode
    email: string
    displayName: string | null
    avatarUrl: string | null
  }) => (
    <div
      data-testid="admin-shell"
      data-email={email}
      data-display-name={displayName ?? ''}
      data-avatar-url={avatarUrl ?? ''}
    >
      {children}
    </div>
  ),
}))

import { ADMIN_ROLE } from '@/constants/admin-role'
import { APP_HOME } from '@/constants/app-paths'
import { render, screen } from '@/test/test-utils'

import { AdminAuthGate } from './admin-auth-gate'

describe('AdminAuthGate', () => {
  beforeEach(() => {
    mockGetDisplayAuthClaims.mockReset()
    mockGetCurrentUserProfile.mockReset()
    mockRedirect.mockReset()
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
    expect(mockGetCurrentUserProfile).not.toHaveBeenCalled()
  })

  it('should render admin shell with profile identity for admin users', async () => {
    mockGetDisplayAuthClaims.mockResolvedValue({
      sub: 'admin-1',
      email: 'admin@example.com',
      app_metadata: { role: ADMIN_ROLE },
    })
    mockGetCurrentUserProfile.mockResolvedValue({
      userId: 'admin-1',
      email: 'admin@example.com',
      displayName: 'Admin User',
      avatarUrl: 'https://example.com/avatar.webp',
      bio: null,
      isAdmin: true,
      profileLoadFailed: false,
    })

    render(await AdminAuthGate({ children: <p>Admin content</p> }))

    const shell = screen.getByTestId('admin-shell')
    expect(shell).toHaveAttribute('data-email', 'admin@example.com')
    expect(shell).toHaveAttribute('data-display-name', 'Admin User')
    expect(shell).toHaveAttribute(
      'data-avatar-url',
      'https://example.com/avatar.webp',
    )
    expect(screen.getByText('Admin content')).toBeInTheDocument()
  })

  it('should fall back to a generic label when email is missing', async () => {
    mockGetDisplayAuthClaims.mockResolvedValue({
      sub: 'admin-1',
      app_metadata: { role: ADMIN_ROLE },
    })
    mockGetCurrentUserProfile.mockResolvedValue({
      userId: 'admin-1',
      email: '',
      displayName: null,
      avatarUrl: null,
      bio: null,
      isAdmin: true,
      profileLoadFailed: false,
    })

    render(await AdminAuthGate({ children: <p>Admin content</p> }))

    expect(screen.getByTestId('admin-shell')).toHaveAttribute(
      'data-email',
      'Signed-in user',
    )
  })
})
