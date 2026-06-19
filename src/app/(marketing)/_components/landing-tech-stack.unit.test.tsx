import { describe, expect, it, vi, beforeEach } from 'vitest'

import { landingContent } from '@/config/landing-content'
import { render, screen } from '@/test/test-utils'

import { LandingTechStack } from './landing-tech-stack'

describe('LandingTechStack', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    )
    vi.stubGlobal(
      'ResizeObserver',
      vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      })),
    )
  })

  it('should render configured stack names and logo images', () => {
    render(<LandingTechStack />)

    for (const logo of landingContent.techStack.logos) {
      expect(screen.getAllByText(logo.name).length).toBeGreaterThanOrEqual(1)
    }

    for (const logo of landingContent.techStack.logos) {
      const images = screen
        .getAllByRole('presentation')
        .filter((image) => image.getAttribute('src')?.includes(logo.src))

      expect(images.length).toBeGreaterThanOrEqual(1)
      expect(images[0]).toHaveAttribute('width', String(logo.width))
      expect(images[0]).toHaveAttribute('height', String(logo.height))
    }
  })
})
