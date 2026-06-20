import { describe, expect, it, vi } from 'vitest'

vi.mock('@/utils/env', () => ({
  hasEnvVars: true,
}))

import { siteConfig } from '@/config/site'
import { render, screen } from '@/test/test-utils'

import { LandingHeader } from './landing-header'

describe('LandingHeader', () => {
  it('should render site wordmark, nav links, and auth CTAs', () => {
    render(<LandingHeader />)

    expect(screen.getByText(siteConfig.name)).toBeInTheDocument()

    for (const item of siteConfig.nav) {
      expect(screen.getByRole('link', { name: item.label })).toBeInTheDocument()
    }

    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute(
      'href',
      '/auth/login',
    )
    expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute(
      'href',
      '/auth/sign-up',
    )
  })
})
