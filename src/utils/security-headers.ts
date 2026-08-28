// debt: script-src cannot be enforced strictly — nonce-based CSP requires dynamic rendering and is incompatible with cacheComponents (https://github.com/vercel/next.js/issues/89754); the enforced script-src is deliberately permissive. Revisit when that issue closes. See docs/research/archive/RESEARCH-0006-csp-enforcement-nextjs-cache-components.md

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

  const scriptSrc = ["'self'", "'unsafe-inline'"]
  // debt: 'unsafe-eval' is development-only so React/Turbopack can reconstruct callstacks; React never uses eval() in production. Drop this branch if React stops requiring eval() in next dev.
  if (process.env.NODE_ENV === 'development') {
    scriptSrc.push("'unsafe-eval'")
  }

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSrc.join(' ')} ${VERCEL_ANALYTICS_ORIGIN}`,
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
    // Unconditional in dev: browsers ignore HSTS on HTTP (RFC 6797 §8.1); localhost is unaffected.
    value: 'max-age=31536000; includeSubDomains',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  {
    key: 'Permissions-Policy',
    // clipboard-write omitted — use-copy-to-clipboard.ts needs navigator.clipboard.writeText.
    // payment=() closed; fullscreen and publickey-credentials-get left open for spinoff passkeys / fullscreen.
    value:
      'camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=(), usb=(), bluetooth=(), display-capture=()',
  },
]
