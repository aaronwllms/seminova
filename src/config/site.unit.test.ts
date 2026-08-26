import { describe, expect, it } from 'vitest'

import { FEATURES_PATH } from '@/constants/app-paths'

import { features } from '@/app/(marketing)/_lib/page-meta'

import { getPageMetadata, getSiteMetadata, siteConfig } from '@/config/site'

describe('getSiteMetadata', () => {
  it('should derive title and description from siteConfig', () => {
    const metadata = getSiteMetadata(new URL('http://localhost:3000'))

    expect(metadata.metadataBase).toEqual(new URL('http://localhost:3000'))
    expect(metadata.title).toEqual({
      default: siteConfig.name,
      template: `%s | ${siteConfig.name}`,
    })
    expect(metadata.description).toBe(siteConfig.description)
    expect(metadata.openGraph).toEqual({
      title: siteConfig.name,
      description: siteConfig.description,
      siteName: siteConfig.name,
    })
    expect(metadata.openGraph?.url).toBeUndefined()
  })
})

describe('getPageMetadata', () => {
  it('should pair title, description, canonical, openGraph.url, and siteName from one input', () => {
    const metadata = getPageMetadata(features)

    expect(metadata.title).toBe(features.title)
    expect(metadata.description).toBe(features.description)
    expect(metadata.alternates?.canonical).toBe(FEATURES_PATH)
    expect(metadata.openGraph).toEqual({
      title: features.title,
      description: features.description,
      url: FEATURES_PATH,
      siteName: siteConfig.name,
    })
  })
})
