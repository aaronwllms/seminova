import { siteConfig } from '@/config/site'

interface JsonLdGraphNode {
  '@type': string
  name: string
  url: string
  description?: string
  sameAs?: string[]
}

export interface OrganizationWebSiteJsonLd {
  '@context': 'https://schema.org'
  '@graph': JsonLdGraphNode[]
}

export const getOrganizationWebSiteJsonLd = (
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
