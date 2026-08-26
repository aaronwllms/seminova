import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { buildCspDirectives, getSecurityHeaders } from './security-headers'

describe('buildCspDirectives', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('should include core directives with self as default-src', () => {
    vi.stubEnv('NODE_ENV', 'production')

    const csp = buildCspDirectives()

    expect(csp).toContain("default-src 'self'")
    expect(csp).toContain(
      "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
    )
    expect(csp).not.toContain("'unsafe-eval'")
    expect(csp).toContain("style-src 'self' 'unsafe-inline'")
    expect(csp).toContain("frame-ancestors 'none'")
  })

  it('should allow unsafe-eval in script-src in development only', () => {
    vi.stubEnv('NODE_ENV', 'development')

    const csp = buildCspDirectives()

    expect(csp).toContain(
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
    )
  })

  it('should include Supabase origin in img-src and connect-src when env is set', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://abcdef.supabase.co')

    const csp = buildCspDirectives()

    expect(csp).toContain('img-src')
    expect(csp).toContain('https://abcdef.supabase.co')
    expect(csp).toContain('connect-src')
    expect(csp).toContain('wss://*.supabase.co')
  })
})

describe('getSecurityHeaders', () => {
  it('should emit a single enforced CSP header with frame and HSTS headers', () => {
    const headers = getSecurityHeaders()
    const cspHeaders = headers.filter((header) =>
      header.key.startsWith('Content-Security-Policy'),
    )

    expect(cspHeaders).toHaveLength(1)
    expect(cspHeaders[0]?.key).toBe('Content-Security-Policy')
    expect(cspHeaders[0]?.value).toContain('script-src')
    expect(cspHeaders[0]?.value).toContain("frame-ancestors 'none'")
    expect(headers).toContainEqual({ key: 'X-Frame-Options', value: 'DENY' })
    expect(headers).toContainEqual({
      key: 'Strict-Transport-Security',
      value: 'max-age=31536000; includeSubDomains',
    })
  })
})
