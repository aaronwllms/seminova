import { describe, expect, it, vi } from 'vitest'

const mockGetCurrentUserProfile = vi.fn()

vi.mock('@/app/(app)/_lib/get-current-user-profile', () => ({
  getCurrentUserProfile: () => mockGetCurrentUserProfile(),
}))

vi.mock('./app-nav-user', () => ({
  AppNavUser: ({
    displayName,
    avatarUrl,
    email,
    isAdmin,
    showOpenApp,
  }: {
    displayName: string | null
    avatarUrl: string | null
    email: string
    isAdmin: boolean
    showOpenApp?: boolean
  }) => (
    <div
      data-testid="app-nav-user"
      data-display-name={displayName ?? ''}
      data-avatar-url={avatarUrl ?? ''}
      data-email={email}
      data-is-admin={String(isAdmin)}
      data-show-open-app={String(showOpenApp ?? false)}
    />
  ),
}))

import { render, screen } from '@/test/test-utils'

import { AppHeaderAccountNav } from './app-header-account-nav'

describe('AppHeaderAccountNav', () => {
  it('should load profile data and render AppNavUser with chip props', async () => {
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

    const navUser = screen.getByTestId('app-nav-user')
    expect(navUser).toHaveAttribute('data-display-name', 'Alex')
    expect(navUser).toHaveAttribute(
      'data-avatar-url',
      'https://example.com/avatar.webp',
    )
    expect(navUser).toHaveAttribute('data-email', 'alex@example.com')
    expect(navUser).toHaveAttribute('data-is-admin', 'true')
    expect(navUser).toHaveAttribute('data-show-open-app', 'false')
  })

  it('should pass showOpenApp through to AppNavUser', async () => {
    mockGetCurrentUserProfile.mockResolvedValue({
      userId: 'user-1',
      displayName: 'Alex',
      avatarUrl: null,
      bio: null,
      email: 'alex@example.com',
      isAdmin: false,
      profileLoadFailed: false,
    })

    render(await AppHeaderAccountNav({ showOpenApp: true }))

    expect(screen.getByTestId('app-nav-user')).toHaveAttribute(
      'data-show-open-app',
      'true',
    )
  })
})
