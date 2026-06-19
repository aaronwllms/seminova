import { describe, expect, it } from 'vitest'

import { landingContent } from '@/config/landing-content'
import { render, screen } from '@/test/test-utils'

import { LandingHero } from './landing-hero'

describe('LandingHero', () => {
  it('should render hero copy and CTA linking to sign-up', () => {
    render(<LandingHero />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      landingContent.hero.title,
    )
    expect(
      screen.getByText(landingContent.hero.description),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /get started/i })).toHaveAttribute(
      'href',
      '/auth/sign-up',
    )
  })
})
