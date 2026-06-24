import type { NextConfig } from 'next'

import { getSecurityHeaders } from './src/utils/security-headers'

const nextConfig: NextConfig = {
  cacheComponents: true,
  async headers() {
    return [{ source: '/:path*', headers: getSecurityHeaders() }]
  },
}

export default nextConfig
