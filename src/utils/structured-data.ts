import { siteConfig } from '@/config/site'

interface JsonLdGraphNode {
  '@type': string
  name: string
  url: string
  description?: string
  sameAs?: string[]
}

interface OrganizationWebSiteJsonLd {
  '@context': 'https://schema.org'
  '@graph': JsonLdGraphNode[]
}

// Unicode-escape `<` so JSON-LD cannot break out of a script tag — not HTML sanitization.
const serializeJsonLd = (value: OrganizationWebSiteJsonLd): string =>
  JSON.stringify(value).replace(/</g, '\\u003c')

const buildOrganizationWebSiteJsonLd = (
  siteUrl: URL,
): OrganizationWebSiteJsonLd => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteUrl.origin,
      sameAs: [siteConfig.links.github],
    },
    {
      '@type': 'WebSite',
      name: siteConfig.name,
      url: siteUrl.origin,
      description: siteConfig.description,
    },
  ],
})

export const getOrganizationWebSiteJsonLdScript = (siteUrl: URL): string =>
  serializeJsonLd(buildOrganizationWebSiteJsonLd(siteUrl))
