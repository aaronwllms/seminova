import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockCookies = vi.fn()

vi.mock('next/headers', () => ({
  cookies: () => mockCookies(),
}))

import { readAccessTokenFromCookies } from './read-auth-cookie'

describe('readAccessTokenFromCookies', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://exampleref.supabase.co')
    mockCookies.mockReset()
  })

  it('should return null when auth cookies are absent', async () => {
    mockCookies.mockResolvedValue({
      getAll: () => [],
    })

    await expect(readAccessTokenFromCookies()).resolves.toBeNull()
  })

  it('should read an access token from a single auth cookie', async () => {
    mockCookies.mockResolvedValue({
      getAll: () => [
        {
          name: 'sb-exampleref-auth-token',
          value: JSON.stringify({ access_token: 'jwt-token' }),
        },
      ],
    })

    await expect(readAccessTokenFromCookies()).resolves.toBe('jwt-token')
  })

  it('should combine chunked auth cookies', async () => {
    const session = JSON.stringify({ access_token: 'chunked-jwt' })
    mockCookies.mockResolvedValue({
      getAll: () => [
        { name: 'sb-exampleref-auth-token.0', value: session.slice(0, 8) },
        { name: 'sb-exampleref-auth-token.1', value: session.slice(8) },
      ],
    })

    await expect(readAccessTokenFromCookies()).resolves.toBe('chunked-jwt')
  })

  it('should decode base64url-encoded auth cookies', async () => {
    const session = JSON.stringify({ access_token: 'encoded-jwt' })
    const encoded = `base64-${Buffer.from(session, 'utf-8').toString('base64url')}`
    mockCookies.mockResolvedValue({
      getAll: () => [{ name: 'sb-exampleref-auth-token', value: encoded }],
    })

    await expect(readAccessTokenFromCookies()).resolves.toBe('encoded-jwt')
  })

  it('should return null for malformed auth cookie payloads', async () => {
    mockCookies.mockResolvedValue({
      getAll: () => [{ name: 'sb-exampleref-auth-token', value: 'not-json' }],
    })

    await expect(readAccessTokenFromCookies()).resolves.toBeNull()
  })
})
