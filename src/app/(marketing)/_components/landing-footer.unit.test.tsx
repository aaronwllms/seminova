import { describe, expect, it, vi } from 'vitest'

vi.mock('next/server', () => ({
  connection: vi.fn().mockResolvedValue(undefined),
}))

import { siteConfig } from '@/config/site'
import { render, screen, waitFor } from '@/test/test-utils'

import { LandingFooter } from './landing-footer'

describe('LandingFooter', () => {
  it('should render copyright, legal stubs, and GitHub social link', async () => {
    render(<LandingFooter />)

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
})
