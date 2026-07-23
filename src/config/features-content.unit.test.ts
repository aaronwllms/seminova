import { describe, expect, it } from 'vitest'

import { REFERENCE_ANCHOR_LINKS } from '@/app/(marketing)/reference/_lib/reference-anchor-links'

import {
  featuresContent,
  getHomeHighlightCapabilities,
} from '@/config/features-content'

const REFERENCE_ANCHOR_IDS = new Set(
  REFERENCE_ANCHOR_LINKS.map((link) => link.id),
)

describe('features-content', () => {
  it('should reference only valid reference anchor ids', () => {
    const anchors: string[] = []

    for (const category of featuresContent.categories) {
      for (const capability of category.capabilities) {
        if ('referenceAnchor' in capability && capability.referenceAnchor) {
          anchors.push(capability.referenceAnchor)
        }
      }
    }

    expect(anchors.length).toBeGreaterThan(0)
    for (const anchor of anchors) {
      expect(REFERENCE_ANCHOR_IDS.has(anchor)).toBe(true)
    }
  })

  it('should mark exactly six capabilities for the home highlight reel', () => {
    const homeHighlights = featuresContent.categories.flatMap((category) =>
      category.capabilities.filter(
        (capability) =>
          'homeHighlight' in capability && capability.homeHighlight,
      ),
    )

    expect(homeHighlights).toHaveLength(6)
  })

  it('should return home highlight capabilities in category order', () => {
    const highlights = getHomeHighlightCapabilities()

    expect(highlights).toHaveLength(6)
    expect(highlights.map((capability) => capability.name)).toEqual([
      'Admin shell',
      'Semantic token theming',
      'Owned UI primitives',
      'Accessibility checks',
      'Locked rules',
      'Collaboration model',
    ])
  })
})
