import { describe, expect, it, vi } from 'vitest'

vi.mock('@/utils/env', () => ({
  hasEnvVars: true,
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
  })
})
