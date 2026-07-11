/**
 * @vitest-environment node
 */
import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockProxyGetClaims = vi.fn()
const mockDisplayGetClaims = vi.fn()
const mockSignOut = vi.fn()
let cookieJar = new Map<string, string>()

vi.mock('@/utils/env', () => ({
  hasPublicSupabaseEnv: true,
  getPublicSupabaseEnv: () => ({
    supabaseUrl: 'https://example.supabase.co',
    publishableKey: 'test-publishable-key',
  }),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    getAll: () =>
      [...cookieJar.entries()].map(([name, value]) => ({ name, value })),
    get: (name: string) => {
      const value = cookieJar.get(name)
      return value === undefined ? undefined : { name, value }
    },
    set: () => undefined,
  })),
}))

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getClaims: (...args: unknown[]) => {
        if (args.length === 0) {
          return mockProxyGetClaims()
        }

        return mockDisplayGetClaims(...args)
      },
      signOut: mockSignOut,
    },
  })),
}))

const createRequest = (pathname: string, cookieValue?: string) => {
  const request = new NextRequest(new URL(`http://localhost:3000${pathname}`))

  if (cookieValue) {
    request.cookies.set('sb-example-auth-token', cookieValue)
  }

  return request
}

describe('auth session flow (proxy refresh + display reads)', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
    mockProxyGetClaims.mockReset()
    mockDisplayGetClaims.mockReset()
    mockSignOut.mockReset()
    cookieJar = new Map()
    mockSignOut.mockResolvedValue({ error: null })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('should return 200 for protected route when proxy refreshes an expired access token', async () => {
    const expiredSession = JSON.stringify({
      access_token: 'expired-access-token',
      refresh_token: 'valid-refresh-token',
    })

    mockProxyGetClaims.mockImplementation(async () => {
      cookieJar.set(
        'sb-example-auth-token',
        `base64-${Buffer.from(
          JSON.stringify({
            access_token: 'fresh-access-token',
            refresh_token: 'valid-refresh-token',
          }),
        ).toString('base64url')}`,
      )

      return {
        data: { claims: { sub: 'user-1', email: 'alex@example.com' } },
        error: null,
      }
    })

    const { updateSession } = await import('./proxy')
    const response = await updateSession(
      createRequest(
        '/home',
        `base64-${Buffer.from(expiredSession).toString('base64url')}`,
      ),
    )

    expect(response.status).toBe(200)
    expect(mockSignOut).not.toHaveBeenCalled()
  })

  it('should return display claims for expired-but-signed token after proxy refresh', async () => {
    const expiredToken = 'expired-access-token'
    cookieJar.set(
      'sb-example-auth-token',
      `base64-${Buffer.from(
        JSON.stringify({ access_token: expiredToken }),
      ).toString('base64url')}`,
    )

    mockDisplayGetClaims.mockResolvedValue({
      data: {
        claims: {
          sub: 'user-1',
          email: 'alex@example.com',
          exp: 1,
          app_metadata: {},
        },
      },
      error: null,
    })

    const { getDisplayAuthClaims } = await import('./require-auth')

    await expect(getDisplayAuthClaims()).resolves.toEqual({
      sub: 'user-1',
      email: 'alex@example.com',
      app_metadata: {},
    })

    expect(mockDisplayGetClaims).toHaveBeenCalledWith(expiredToken, {
      allowExpired: true,
    })
  })

  it('should redirect to login with next when session cannot be recovered', async () => {
    mockProxyGetClaims.mockResolvedValue({
      data: { claims: null },
      error: { message: 'Invalid Refresh Token: Refresh Token Not Found' },
    })

    const { updateSession } = await import('./proxy')
    const response = await updateSession(
      createRequest(
        '/home',
        `base64-${Buffer.from(
          JSON.stringify({
            access_token: 'expired-access-token',
            refresh_token: 'dead-refresh-token',
          }),
        ).toString('base64url')}`,
      ),
    )

    expect(response.status).toBe(307)
    const location = response.headers.get('location')
    expect(location).toContain('/auth/login')
    expect(location).toContain('next=%2Fhome')
    expect(mockSignOut).toHaveBeenCalledWith({ scope: 'local' })
  })

  it('should throw when display read sees a signature-invalid token', async () => {
    cookieJar.set(
      'sb-example-auth-token',
      `base64-${Buffer.from(
        JSON.stringify({ access_token: 'invalid-signature-token' }),
      ).toString('base64url')}`,
    )

    mockDisplayGetClaims.mockResolvedValue({
      data: { claims: null },
      error: { message: 'invalid JWT', code: 'invalid_jwt' },
    })

    const { getDisplayAuthClaims, DisplayAuthInvariantError } =
      await import('./require-auth')

    await expect(getDisplayAuthClaims()).rejects.toBeInstanceOf(
      DisplayAuthInvariantError,
    )
  })
})
