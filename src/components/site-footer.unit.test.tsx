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
    renderFooter({ variant: 'marketing' })

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

  it('should render every configured footer column and link in the marketing variant', async () => {
    renderFooter({ variant: 'marketing' })

    expect(await screen.findByText(/all rights reserved/i)).toBeInTheDocument()

    for (const column of siteConfig.footer) {
      expect(
        screen.getByRole('heading', { name: column.heading }),
      ).toBeInTheDocument()

      for (const link of column.links) {
        const matches = screen.getAllByRole('link', { name: link.label })
        expect(
          matches.some((match) => match.getAttribute('href') === link.href),
        ).toBe(true)
      }
    }
  })

  it('should omit footer columns in the app variant', async () => {
    renderFooter({ variant: 'app' })

    expect(await screen.findByText(/all rights reserved/i)).toBeInTheDocument()

    for (const column of siteConfig.footer) {
      expect(
        screen.queryByRole('heading', { name: column.heading }),
      ).not.toBeInTheDocument()
    }

    for (const item of siteConfig.legal) {
      expect(screen.getByRole('link', { name: item.label })).toHaveAttribute(
        'href',
        item.href,
      )
    }
  })
})
