import { describe, expect, it, vi } from 'vitest'

vi.mock('next/server', () => ({
  connection: vi.fn().mockResolvedValue(undefined),
}))

import { siteConfig } from '@/config/site'
import { SiteFooter } from '@/components/site-footer'
import { render, screen, waitFor } from '@/test/test-utils'

describe('SiteFooter', () => {
  it('should render copyright, legal stubs, and GitHub social link', async () => {
    render(<SiteFooter logoHref="/" />)

    await waitFor(() => {
      expect(screen.getByText(/all rights reserved/i)).toHaveTextContent(
        siteConfig.name,
      )
    })

    for (const item of siteConfig.legal) {
      expect(screen.getByText(item.label)).toBeInTheDocument()
    }

    const githubLinks = screen.getAllByRole('link', { name: 'GitHub' })
    expect(
      githubLinks.some(
        (link) => link.getAttribute('href') === siteConfig.links.github,
      ),
    ).toBe(true)
  })

  it('should omit section nav when showNav is false', () => {
    render(<SiteFooter logoHref="/profile" showNav={false} />)

    for (const item of siteConfig.nav.filter((navItem) => !navItem.external)) {
      expect(
        screen.queryByRole('link', { name: item.label }),
      ).not.toBeInTheDocument()
    }
  })

  it('should render an optional public site link', () => {
    render(
      <SiteFooter
        publicSiteLink={{ href: '/', label: 'Back to website' }}
        showNav={false}
      />,
    )

    expect(
      screen.getByRole('link', { name: /back to website/i }),
    ).toHaveAttribute('href', '/')
  })
})
