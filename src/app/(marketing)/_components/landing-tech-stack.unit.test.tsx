import { describe, expect, it } from 'vitest'

import { landingContent } from '@/config/landing-content'
import { render, screen } from '@/test/test-utils'

import { LandingTechStack } from './landing-tech-stack'

describe('LandingTechStack', () => {
  it('should render configured stack names and logo images', () => {
    render(<LandingTechStack />)

    for (const logo of landingContent.techStack.logos) {
      expect(screen.getByText(logo.name)).toBeInTheDocument()
    }

    const images = screen.getAllByRole('presentation')
    expect(images).toHaveLength(landingContent.techStack.logos.length)

    images.forEach((image, index) => {
      const logo = landingContent.techStack.logos[index]
      expect(image).toHaveAttribute('src', expect.stringContaining(logo.src))
      expect(image).toHaveAttribute('width', String(logo.width))
      expect(image).toHaveAttribute('height', String(logo.height))
    })
  })
})
