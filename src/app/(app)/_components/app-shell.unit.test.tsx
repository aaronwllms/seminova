import { describe, expect, it, vi } from 'vitest'

const mockGetCurrentUserProfile = vi.fn()

vi.mock('../_lib/get-current-user-profile', () => ({
  getCurrentUserProfile: () => mockGetCurrentUserProfile(),
}))

vi.mock('@/components/site-header', () => ({
  SiteHeader: ({
    rightSlot,
    mobileNav,
  }: {
    rightSlot?: React.ReactNode
    mobileNav?: React.ReactNode
  }) => (
    <header data-testid="site-header">
      {rightSlot}
      {mobileNav}
    </header>
  ),
}))

vi.mock('@/components/site-footer', () => ({
  SiteFooter: ({
    publicSiteLink,
  }: {
    publicSiteLink?: { href: string; label: string }
  }) => (
    <footer data-testid="site-footer">
      {publicSiteLink ? (
        <a href={publicSiteLink.href}>{publicSiteLink.label}</a>
      ) : null}
    </footer>
  ),
}))

vi.mock('./profile/profile-dialog-provider', () => ({
  ProfileDialogProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

vi.mock('./app-nav-user', () => ({
  AppNavUser: ({ email }: { email: string }) => (
    <div data-testid="app-nav-user">{email}</div>
  ),
}))

import { render, screen } from '@/test/test-utils'

import { AppShell } from './app-shell'

describe('AppShell', () => {
  it('should render header, main content, and footer with profile data', async () => {
    mockGetCurrentUserProfile.mockResolvedValue({
      userId: 'user-1',
      displayName: 'Alex',
      avatarUrl: null,
      bio: null,
      email: 'alex@example.com',
      isAdmin: false,
      profileLoadFailed: false,
    })

    render(await AppShell({ children: <p>Profile content</p> }))

    expect(screen.getByTestId('site-header')).toBeInTheDocument()
    expect(screen.getAllByTestId('app-nav-user')).toHaveLength(2)
    expect(screen.getAllByText('alex@example.com')).toHaveLength(2)
    expect(screen.getByRole('main')).toHaveTextContent('Profile content')
    expect(screen.getByTestId('site-footer')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /back to website/i }),
    ).toHaveAttribute('href', '/')
  })
})
