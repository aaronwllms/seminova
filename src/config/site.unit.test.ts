import { describe, expect, it } from 'vitest'

import { getSiteMetadata, siteConfig } from '@/config/site'

describe('getSiteMetadata', () => {
  it('should derive title and description from siteConfig', () => {
    const metadata = getSiteMetadata(new URL('http://localhost:3000'))

    expect(metadata.metadataBase).toEqual(new URL('http://localhost:3000'))
    expect(metadata.title).toEqual({
      default: siteConfig.name,
      template: `%s | ${siteConfig.name}`,
    })
    expect(metadata.description).toBe(siteConfig.description)
  })
})
