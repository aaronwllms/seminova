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

vi.mock('./app-nav-user', () => ({
  AppNavUser: ({
    displayName,
    avatarUrl,
    email,
    isAdmin,
  }: {
    displayName: string | null
    avatarUrl: string | null
    email: string
    isAdmin: boolean
  }) => (
    <div
      data-testid="app-nav-user"
      data-display-name={displayName ?? ''}
      data-avatar-url={avatarUrl ?? ''}
      data-email={email}
      data-is-admin={String(isAdmin)}
    />
  ),
}))

import { render, screen } from '@/test/test-utils'

import { AppHeaderAccountNav } from './app-header-account-nav'

describe('AppHeaderAccountNav', () => {
  it('should load profile data and render AppNavUser inside ProfileDialogProvider', async () => {
    mockGetCurrentUserProfile.mockResolvedValue({
      userId: 'user-1',
      displayName: 'Alex',
      avatarUrl: 'https://example.com/avatar.webp',
      bio: 'Builder',
      email: 'alex@example.com',
      isAdmin: true,
      profileLoadFailed: false,
    })

    render(await AppHeaderAccountNav())

    const provider = screen.getByTestId('profile-dialog-provider')
    expect(provider).toHaveAttribute('data-user-id', 'user-1')
    expect(provider).toHaveAttribute('data-email', 'alex@example.com')
    expect(provider).toHaveAttribute('data-profile-load-failed', 'false')
    expect(provider).toHaveAttribute('data-display-name', 'Alex')
    expect(provider).toHaveAttribute('data-bio', 'Builder')
    expect(provider).toHaveAttribute(
      'data-avatar-url',
      'https://example.com/avatar.webp',
    )

    const navUser = screen.getByTestId('app-nav-user')
    expect(navUser).toHaveAttribute('data-display-name', 'Alex')
    expect(navUser).toHaveAttribute(
      'data-avatar-url',
      'https://example.com/avatar.webp',
    )
    expect(navUser).toHaveAttribute('data-email', 'alex@example.com')
    expect(navUser).toHaveAttribute('data-is-admin', 'true')
  })
})
