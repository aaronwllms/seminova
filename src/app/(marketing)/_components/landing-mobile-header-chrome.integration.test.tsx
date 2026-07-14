import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockHasServerAuthSession = vi.fn()
const mockGetCurrentUserProfile = vi.fn()

vi.mock('@/supabase/require-auth', () => ({
  hasServerAuthSession: () => mockHasServerAuthSession(),
}))

vi.mock('@/app/(app)/_lib/get-current-user-profile', () => ({
  getCurrentUserProfile: () => mockGetCurrentUserProfile(),
}))

vi.mock('@/utils/env', () => ({
  hasPublicSupabaseEnv: true,
}))

vi.mock('@/app/(app)/_components/profile/profile-dialog-provider', () => ({
  ProfileDialogProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="profile-dialog-provider">{children}</div>
  ),
  useProfileDialog: () => ({ openProfile: vi.fn() }),
}))

import userEvent from '@testing-library/user-event'

import { render, screen } from '@/test/test-utils'

import { LandingMobileHeaderChrome } from './landing-mobile-header-chrome'

describe('LandingMobileHeaderChrome', () => {
  beforeEach(() => {
    mockHasServerAuthSession.mockReset()
    mockGetCurrentUserProfile.mockReset()
    mockGetCurrentUserProfile.mockResolvedValue({
      userId: 'user-1',
      displayName: 'Alex',
      avatarUrl: null,
      bio: null,
      email: 'alex@example.com',
      isAdmin: false,
      profileLoadFailed: false,
    })
  })

  it('should render hamburger and account menu when signed in', async () => {
    mockHasServerAuthSession.mockResolvedValue(true)

    render(await LandingMobileHeaderChrome())

    expect(
      screen.getByRole('button', { name: /open menu/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /account menu/i }),
    ).toBeInTheDocument()
  })

  it('should render auth CTAs inside the sheet when anonymous', async () => {
    mockHasServerAuthSession.mockResolvedValue(false)
    const user = userEvent.setup()

    render(await LandingMobileHeaderChrome())

    await user.click(screen.getByRole('button', { name: /open menu/i }))

    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute(
      'href',
      '/auth/login',
    )
    expect(
      screen.queryByRole('button', { name: /account menu/i }),
    ).not.toBeInTheDocument()
  })
})
