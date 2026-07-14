import { describe, expect, it, vi } from 'vitest'

vi.mock('./app-header-account-nav-slot', () => ({
  AppHeaderAccountNavSlot: () => (
    <div data-testid="app-header-account-nav-slot" />
  ),
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
  SiteFooter: () => <footer data-testid="site-footer" />,
}))

import { render, screen } from '@/test/test-utils'

import { AppShell } from './app-shell'

describe('AppShell', () => {
  it('should render header, main content, and footer without a shell-level profile provider', () => {
    render(<AppShell>{<p>Profile content</p>}</AppShell>)

    expect(screen.getByTestId('site-header')).toBeInTheDocument()
    expect(screen.getAllByTestId('app-header-account-nav-slot')).toHaveLength(2)
    expect(screen.getByRole('main')).toHaveTextContent('Profile content')
    expect(screen.getByTestId('site-footer')).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: /back to website/i }),
    ).not.toBeInTheDocument()
  })
})
