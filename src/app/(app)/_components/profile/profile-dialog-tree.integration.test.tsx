import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockHasServerAuthSession = vi.fn()
const mockGetCurrentUserProfile = vi.fn()

vi.mock('@/supabase/require-auth', () => ({
  hasServerAuthSession: () => mockHasServerAuthSession(),
}))

vi.mock('@/app/(app)/_lib/get-current-user-profile', () => ({
  getCurrentUserProfile: () => mockGetCurrentUserProfile(),
}))

vi.mock('./profile-dialog-provider', () => ({
  ProfileDialogBinder: ({
    userId,
    email,
    hasPassword,
    profileLoadFailed,
    defaultValues,
  }: {
    userId: string
    email: string
    hasPassword: boolean
    profileLoadFailed: boolean
    defaultValues: {
      displayName: string | null
      bio: string | null
      avatarUrl: string | null
    }
  }) => (
    <div
      data-testid="profile-dialog-binder"
      data-user-id={userId}
      data-email={email}
      data-has-password={String(hasPassword)}
      data-profile-load-failed={String(profileLoadFailed)}
      data-display-name={defaultValues.displayName ?? ''}
      data-bio={defaultValues.bio ?? ''}
      data-avatar-url={defaultValues.avatarUrl ?? ''}
    />
  ),
}))

import { render, screen } from '@/test/test-utils'

import { ProfileDialogTree } from './profile-dialog-tree'

describe('ProfileDialogTree', () => {
  beforeEach(() => {
    mockHasServerAuthSession.mockReset()
    mockGetCurrentUserProfile.mockReset()
  })

  it('should render nothing when signed out', async () => {
    mockHasServerAuthSession.mockResolvedValue(false)

    render(await ProfileDialogTree())

    expect(mockGetCurrentUserProfile).not.toHaveBeenCalled()
    expect(
      screen.queryByTestId('profile-dialog-binder'),
    ).not.toBeInTheDocument()
  })

  it('should render the binder with profile props when signed in', async () => {
    mockHasServerAuthSession.mockResolvedValue(true)
    mockGetCurrentUserProfile.mockResolvedValue({
      userId: 'user-1',
      displayName: 'Alex',
      avatarUrl: 'https://example.com/avatar.webp',
      bio: 'Builder',
      email: 'alex@example.com',
      isAdmin: false,
      hasPassword: true,
      profileLoadFailed: false,
    })

    render(await ProfileDialogTree())

    const binder = screen.getByTestId('profile-dialog-binder')
    expect(binder).toHaveAttribute('data-user-id', 'user-1')
    expect(binder).toHaveAttribute('data-email', 'alex@example.com')
    expect(binder).toHaveAttribute('data-has-password', 'true')
    expect(binder).toHaveAttribute('data-profile-load-failed', 'false')
    expect(binder).toHaveAttribute('data-display-name', 'Alex')
    expect(binder).toHaveAttribute('data-bio', 'Builder')
    expect(binder).toHaveAttribute(
      'data-avatar-url',
      'https://example.com/avatar.webp',
    )
  })
})
