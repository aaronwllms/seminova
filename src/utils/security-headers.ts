// debt: template-default CSP ships report-only. Enforcing it (CSP_ENFORCE=true) requires nonce-based script handling — a per-request nonce generated in middleware and threaded into both the CSP script-src and Next.js's inline scripts. `script-src 'self'` alone will block Next.js inline bootstrap/streaming scripts under enforcement. Tighten directives AND add the nonce strategy per product surface before setting CSP_ENFORCE=true.

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
    `script-src 'self' ${VERCEL_ANALYTICS_ORIGIN}`,
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

const getCspHeaderKey = (): string =>
  process.env.CSP_ENFORCE === 'true'
    ? 'Content-Security-Policy'
    : 'Content-Security-Policy-Report-Only'

export const getSecurityHeaders = (): SecurityHeader[] => [
  { key: getCspHeaderKey(), value: buildCspDirectives() },
  { key: 'X-Frame-Options', value: 'DENY' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
]
