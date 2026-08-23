import { describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

vi.mock('@/utils/env', () => ({
  hasPublicSupabaseEnv: true,
}))

import { siteConfig } from '@/config/site'
import { SiteHeader } from '@/components/site-header'
import { render, screen } from '@/test/test-utils'

describe('SiteHeader', () => {
  it('should render site wordmark, nav links, and right slot', () => {
    render(
      <SiteHeader logoHref="/" rightSlot={<a href="/auth/login">Sign in</a>} />,
    )

    expect(screen.getByText(siteConfig.name)).toBeInTheDocument()

    for (const item of siteConfig.nav) {
      expect(screen.getByRole('link', { name: item.label })).toBeInTheDocument()
    }

    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute(
      'href',
      '/auth/login',
    )

    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('should render a passed banner node ahead of the header landmark', () => {
    render(
      <SiteHeader
        logoHref="/"
        banner={<p>Maintenance notice</p>}
        rightSlot={<a href="/auth/login">Sign in</a>}
      />,
    )

    expect(screen.getByText('Maintenance notice')).toBeInTheDocument()
    expect(screen.getByRole('banner')).toBeInTheDocument()

    const bannerCopy = screen.getByText('Maintenance notice')
    const header = screen.getByRole('banner')

    expect(
      bannerCopy.compareDocumentPosition(header) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('should compose a persistent banner and header as one unit when pin is true', () => {
    render(
      <SiteHeader
        logoHref="/"
        pin
        banner={<p>Persistent notice</p>}
        rightSlot={<a href="/auth/login">Sign in</a>}
      />,
    )

    expect(screen.getByText('Persistent notice')).toBeInTheDocument()
    expect(screen.getByRole('banner')).toBeInTheDocument()

    const bannerCopy = screen.getByText('Persistent notice')
    const header = screen.getByRole('banner')

    expect(
      bannerCopy.compareDocumentPosition(header) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })
})
