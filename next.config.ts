import type { NextConfig } from 'next'

import { getSecurityHeaders } from './src/utils/security-headers'

const nextConfig: NextConfig = {
  cacheComponents: true,
  outputFileTracingIncludes: {
    '/opengraph-image': ['./src/assets/fonts/**'],
    '/**/opengraph-image': ['./src/assets/fonts/**'],
  },
  async headers() {
    return [{ source: '/:path*', headers: getSecurityHeaders() }]
  },
}

export default nextConfig
