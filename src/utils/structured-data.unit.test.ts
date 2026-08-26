import { afterEach, describe, expect, it, vi } from 'vitest'

import { siteConfig } from '@/config/site'

import { getOrganizationWebSiteJsonLdScript } from './structured-data'

describe('getOrganizationWebSiteJsonLdScript', () => {
  const siteUrl = new URL('https://example.com')

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should emit Organization and WebSite nodes from site config', () => {
    const jsonLdScript = getOrganizationWebSiteJsonLdScript(siteUrl)
    const jsonLd = JSON.parse(jsonLdScript) as {
      '@context': string
      '@graph': Array<{
        '@type': string
        name: string
        url: string
        description?: string
        sameAs?: string[]
      }>
    }

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

  it('should escape less-than in serialized output', () => {
    vi.spyOn(siteConfig, 'name', 'get').mockReturnValue('</script>')

    const jsonLdScript = getOrganizationWebSiteJsonLdScript(siteUrl)

    expect(jsonLdScript).not.toContain('</script>')
    expect(JSON.parse(jsonLdScript)['@graph'][0].name).toBe('</script>')
  })
})
