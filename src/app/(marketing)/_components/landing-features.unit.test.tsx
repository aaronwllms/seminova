import { describe, expect, it } from 'vitest'

import { landingContent } from '@/config/landing-content'
import { render, screen } from '@/test/test-utils'

import { LandingFeatures } from './landing-features'

describe('LandingFeatures', () => {
  it('should render features section anchor and all six cards in order', () => {
    const { container } = render(<LandingFeatures />)

    expect(container.querySelector('#features')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      landingContent.features.heading,
    )

    const titles = landingContent.features.items.map((item) => item.title)
    const renderedTitles = screen
      .getAllByRole('heading', { level: 3 })
      .map((heading) => heading.textContent)

    expect(renderedTitles).toEqual(titles)
  })
})
