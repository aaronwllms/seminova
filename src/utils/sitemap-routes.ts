import type { MetadataRoute } from 'next'
import { join } from 'node:path'

import { discoverMarketingRoutes } from '@/utils/discover-app-routes'
import { getSiteUrl } from '@/utils/site-url'

export const buildSitemapEntries = (): MetadataRoute.Sitemap => {
  const baseUrl = getSiteUrl()
  const routes = discoverMarketingRoutes(join(process.cwd(), 'src/app'))

  return routes.map((path) => ({
    url: new URL(path, baseUrl).href,
  }))
}

export default buildSitemapEntries
