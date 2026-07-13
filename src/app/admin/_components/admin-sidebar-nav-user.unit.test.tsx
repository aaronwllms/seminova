import { describe, expect, it, vi } from 'vitest'

const mockGetCurrentUserProfile = vi.fn()

vi.mock('@/app/(app)/_lib/get-current-user-profile', () => ({
  getCurrentUserProfile: () => mockGetCurrentUserProfile(),
}))

vi.mock('@/app/(app)/_components/profile/profile-dialog-provider', () => ({
  ProfileDialogProvider: ({
    children,
    userId,
    email,
    profileLoadFailed,
    defaultValues,
  }: {
    children: React.ReactNode
    userId: string
    email: string
    profileLoadFailed: boolean
    defaultValues: {
      displayName: string | null
      bio: string | null
      avatarUrl: string | null
    }
  }) => (
    <div
      data-testid="profile-dialog-provider"
      data-user-id={userId}
      data-email={email}
      data-profile-load-failed={String(profileLoadFailed)}
      data-display-name={defaultValues.displayName ?? ''}
      data-bio={defaultValues.bio ?? ''}
      data-avatar-url={defaultValues.avatarUrl ?? ''}
    >
      {children}
    </div>
  ),
}))

vi.mock('./admin-nav-user', () => ({
  AdminNavUser: ({
    displayName,
    avatarUrl,
    email,
  }: {
    displayName: string | null
    avatarUrl: string | null
    email: string
  }) => (
    <div
      data-testid="admin-nav-user"
      data-display-name={displayName ?? ''}
      data-avatar-url={avatarUrl ?? ''}
      data-email={email}
    />
  ),
}))

import { render, screen } from '@/test/test-utils'

import { AdminSidebarNavUser } from './admin-sidebar-nav-user'

describe('AdminSidebarNavUser', () => {
  it('should load profile data and render AdminNavUser inside ProfileDialogProvider', async () => {
    mockGetCurrentUserProfile.mockResolvedValue({
      userId: 'admin-1',
      displayName: 'Admin User',
      avatarUrl: 'https://example.com/avatar.webp',
      bio: 'Admin bio',
      email: 'admin@example.com',
      isAdmin: true,
      profileLoadFailed: false,
    })

    render(await AdminSidebarNavUser())

    const provider = screen.getByTestId('profile-dialog-provider')
    expect(provider).toHaveAttribute('data-user-id', 'admin-1')
    expect(provider).toHaveAttribute('data-email', 'admin@example.com')
    expect(provider).toHaveAttribute('data-profile-load-failed', 'false')
    expect(provider).toHaveAttribute('data-display-name', 'Admin User')
    expect(provider).toHaveAttribute('data-bio', 'Admin bio')
    expect(provider).toHaveAttribute(
      'data-avatar-url',
      'https://example.com/avatar.webp',
    )

    const navUser = screen.getByTestId('admin-nav-user')
    expect(navUser).toHaveAttribute('data-display-name', 'Admin User')
    expect(navUser).toHaveAttribute(
      'data-avatar-url',
      'https://example.com/avatar.webp',
    )
    expect(navUser).toHaveAttribute('data-email', 'admin@example.com')
  })

  it('should fall back to a generic label when email is missing', async () => {
    mockGetCurrentUserProfile.mockResolvedValue({
      userId: 'admin-1',
      displayName: null,
      avatarUrl: null,
      bio: null,
      email: '',
      isAdmin: true,
      profileLoadFailed: false,
    })

    render(await AdminSidebarNavUser())

    expect(screen.getByTestId('profile-dialog-provider')).toHaveAttribute(
      'data-email',
      'Signed-in user',
    )
    expect(screen.getByTestId('admin-nav-user')).toHaveAttribute(
      'data-email',
      'Signed-in user',
    )
  })
})
