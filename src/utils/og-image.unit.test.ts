/**
 * @vitest-environment node
 */
import { ImageResponse } from 'next/og'
import { describe, expect, it } from 'vitest'

import { siteConfig } from '@/config/site'

import {
  createOgImageResponse,
  formatOgPageTitle,
  OG_CONTENT_TYPE,
  OG_IMAGE_SIZE,
} from '@/utils/og-image'

describe('formatOgPageTitle', () => {
  it('should apply the site metadata title template', () => {
    expect(formatOgPageTitle('Login')).toBe(`Login | ${siteConfig.name}`)
  })
})

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
})
