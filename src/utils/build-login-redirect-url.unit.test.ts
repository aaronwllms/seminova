import { describe, expect, it } from 'vitest'

import { buildLoginRedirectUrl } from './build-login-redirect-url'

describe('buildLoginRedirectUrl', () => {
  it('should attach a safe next query param', () => {
    const url = buildLoginRedirectUrl('/home', 'http://localhost:3000')

    expect(url.pathname).toBe('/auth/login')
    expect(url.searchParams.get('next')).toBe('/home')
  })

  it('should preserve search params in next', () => {
    const url = buildLoginRedirectUrl(
      '/admin/users?email=foo',
      'http://localhost:3000',
    )

    expect(url.searchParams.get('next')).toBe('/admin/users?email=foo')
  })

  it('should omit next for unsafe external URLs', () => {
    const url = buildLoginRedirectUrl(
      'https://evil.example/phish',
      'http://localhost:3000',
    )

    expect(url.searchParams.has('next')).toBe(false)
  })
})
