import { describe, expect, it } from 'vitest'

import { siteConfig } from '@/config/site'

import { getOrganizationWebSiteJsonLd } from './structured-data'

describe('getOrganizationWebSiteJsonLd', () => {
  const siteUrl = new URL('https://example.com')

  it('should emit Organization and WebSite nodes from site config', () => {
    const jsonLd = getOrganizationWebSiteJsonLd(siteUrl)

    expect(jsonLd['@context']).toBe('https://schema.org')
    expect(jsonLd['@graph']).toHaveLength(2)

    const organization = jsonLd['@graph'].find(
      (node) => node['@type'] === 'Organization',
    )
    const website = jsonLd['@graph'].find((node) => node['@type'] === 'WebSite')

    expect(organization).toMatchObject({
      name: siteConfig.name,
      url: 'https://example.com',
      sameAs: [siteConfig.links.github],
    })
    expect(website).toMatchObject({
      name: siteConfig.name,
      url: 'https://example.com',
      description: siteConfig.description,
    })
  })
})
