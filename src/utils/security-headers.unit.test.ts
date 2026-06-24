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
    const csp = buildCspDirectives()

    expect(csp).toContain("default-src 'self'")
    expect(csp).toContain("script-src 'self' https://va.vercel-scripts.com")
    expect(csp).toContain("style-src 'self' 'unsafe-inline'")
    expect(csp).toContain("frame-ancestors 'none'")
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
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('should emit report-only CSP by default with frame and HSTS headers', () => {
    const headers = getSecurityHeaders()
    const cspHeader = headers.find(
      (header) =>
        header.key === 'Content-Security-Policy-Report-Only' ||
        header.key === 'Content-Security-Policy',
    )

    expect(cspHeader?.key).toBe('Content-Security-Policy-Report-Only')
    expect(cspHeader?.value).toContain("default-src 'self'")
    expect(headers).toContainEqual({ key: 'X-Frame-Options', value: 'DENY' })
    expect(headers).toContainEqual({
      key: 'Strict-Transport-Security',
      value: 'max-age=31536000; includeSubDomains',
    })
  })

  it('should switch to enforcing CSP header when CSP_ENFORCE is true', () => {
    vi.stubEnv('CSP_ENFORCE', 'true')

    const headers = getSecurityHeaders()
    const cspHeader = headers.find((header) =>
      header.key.startsWith('Content-Security-Policy'),
    )

    expect(cspHeader?.key).toBe('Content-Security-Policy')
  })
})
