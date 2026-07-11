import { Suspense } from 'react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/server', () => ({
  connection: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/components/site-copyright', () => ({
  SiteCopyright: () => (
    <span>© {new Date().getFullYear()} Seminova. All rights reserved.</span>
  ),
}))

import { siteConfig } from '@/config/site'
import { SiteFooter } from '@/components/site-footer'
import { render, screen } from '@/test/test-utils'

const renderFooter = (props: React.ComponentProps<typeof SiteFooter>) =>
  render(
    <Suspense fallback={<span>© {siteConfig.name}. All rights reserved.</span>}>
      <SiteFooter {...props} />
    </Suspense>,
  )

describe('SiteFooter', () => {
  it('should render copyright, legal links, and GitHub social link', async () => {
    renderFooter({ logoHref: '/' })

    expect(await screen.findByText(/all rights reserved/i)).toHaveTextContent(
      siteConfig.name,
    )

    for (const item of siteConfig.legal) {
      expect(screen.getByRole('link', { name: item.label })).toHaveAttribute(
        'href',
        item.href,
      )
    }

    const githubLinks = screen.getAllByRole('link', { name: 'GitHub' })
    expect(
      githubLinks.some(
        (link) => link.getAttribute('href') === siteConfig.links.github,
      ),
    ).toBe(true)
  })

  it('should omit section nav when showNav is false', async () => {
    renderFooter({ logoHref: '/profile', showNav: false })

    expect(await screen.findByText(/all rights reserved/i)).toBeInTheDocument()

    for (const item of siteConfig.nav.filter((navItem) => !navItem.external)) {
      expect(
        screen.queryByRole('link', { name: item.label }),
      ).not.toBeInTheDocument()
    }
  })

  it('should render an optional public site link', async () => {
    renderFooter({
      publicSiteLink: { href: '/', label: 'Back to website' },
      showNav: false,
    })

    expect(await screen.findByText(/all rights reserved/i)).toBeInTheDocument()

    expect(
      screen.getByRole('link', { name: /back to website/i }),
    ).toHaveAttribute('href', '/')
  })
})
