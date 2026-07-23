import { describe, expect, it } from 'vitest'

import { REFERENCE_ANCHOR_LINKS } from '@/app/(marketing)/reference/_lib/reference-anchor-links'

import { featuresContent } from '@/config/features-content'

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
})
