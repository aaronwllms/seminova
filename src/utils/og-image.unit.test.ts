/**
 * @vitest-environment node
 */
import { ImageResponse } from 'next/og'
import { describe, expect, it } from 'vitest'

import { siteConfig } from '@/config/site'

import {
  createOgImageResponse,
  OG_CONTENT_TYPE,
  OG_IMAGE_SIZE,
} from '@/utils/og-image'

describe('og-image constants', () => {
  it('should export the standard OG image dimensions and content type', () => {
    expect(OG_IMAGE_SIZE).toEqual({ width: 1200, height: 630 })
    expect(OG_CONTENT_TYPE).toBe('image/png')
  })
})

describe('createOgImageResponse', () => {
  it('should return an ImageResponse instance', async () => {
    const response = await createOgImageResponse({
      title: siteConfig.name,
      description: siteConfig.description,
    })

    expect(response).toBeInstanceOf(ImageResponse)
  })

  it('should render a non-blank PNG with the brand mark glyph', async () => {
    const PNG_MAGIC = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ])

    const response = await createOgImageResponse({
      title: siteConfig.name,
      description: siteConfig.description,
    })
    const buffer = new Uint8Array(await response.arrayBuffer())

    expect(buffer.subarray(0, PNG_MAGIC.length)).toEqual(PNG_MAGIC)
    // A blank single-color 32×32 PNG is ~140 bytes; a rendered glyph is ~600+.
    expect(buffer.byteLength).toBeGreaterThan(10_000)
  })
})
