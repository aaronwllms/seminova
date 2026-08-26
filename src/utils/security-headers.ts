// debt: script-src cannot be enforced strictly — nonce-based CSP requires dynamic rendering and is incompatible with cacheComponents (https://github.com/vercel/next.js/issues/89754); the enforced script-src is deliberately permissive. Revisit when that issue closes. See docs/research/RESEARCH-0006-csp-enforcement-nextjs-cache-components.md

import { getSupabaseOrigin } from './env'

const VERCEL_ANALYTICS_ORIGIN = 'https://va.vercel-scripts.com'

export interface SecurityHeader {
  key: string
  value: string
}

export const buildCspDirectives = (): string => {
  const supabaseOrigin = getSupabaseOrigin()

  const imgSrc = ["'self'", 'data:', 'blob:']
  const connectSrc = ["'self'", VERCEL_ANALYTICS_ORIGIN]

  if (supabaseOrigin) {
    imgSrc.push(supabaseOrigin)
    connectSrc.push(supabaseOrigin, 'wss://*.supabase.co')
  }

  const directives = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' ${VERCEL_ANALYTICS_ORIGIN}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src ${imgSrc.join(' ')}`,
    "font-src 'self'",
    `connect-src ${connectSrc.join(' ')}`,
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ]

  return directives.join('; ')
}

export const getSecurityHeaders = (): SecurityHeader[] => [
  { key: 'Content-Security-Policy', value: buildCspDirectives() },
  { key: 'X-Frame-Options', value: 'DENY' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
]
