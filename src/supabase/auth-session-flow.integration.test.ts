/**
 * @vitest-environment node
 */
import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { REQUEST_PATHNAME_LOG_HEADER } from '@/constants/request-log-context'

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
  headers: vi.fn(async () =>
    Promise.resolve(new Headers({ [REQUEST_PATHNAME_LOG_HEADER]: '/home' })),
  ),
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

const AUTH_COOKIE_NAME = 'sb-example-auth-token'

const encodeSessionCookie = (session: {
  access_token: string
  refresh_token?: string
}) => `base64-${Buffer.from(JSON.stringify(session)).toString('base64url')}`

const createRequest = (pathname: string, cookieValue?: string) => {
  const request = new NextRequest(new URL(`http://localhost:3000${pathname}`))

  if (cookieValue) {
    request.cookies.set(AUTH_COOKIE_NAME, cookieValue)
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

  it('should refresh on proxy then return display claims from post-refresh cookies without redirect', async () => {
    const expiredAccessToken = 'expired-access-token'
    const freshAccessToken = 'fresh-access-token'
    const expiredSessionCookie = encodeSessionCookie({
      access_token: expiredAccessToken,
      refresh_token: 'valid-refresh-token',
    })
    const refreshedSessionCookie = encodeSessionCookie({
      access_token: freshAccessToken,
      refresh_token: 'valid-refresh-token',
    })

    mockProxyGetClaims.mockImplementation(async () => {
      cookieJar.set(AUTH_COOKIE_NAME, refreshedSessionCookie)

      return {
        data: { claims: { sub: 'user-1', email: 'alex@example.com' } },
        error: null,
      }
    })

    mockDisplayGetClaims.mockResolvedValue({
      data: {
        claims: {
          sub: 'user-1',
          email: 'alex@example.com',
          app_metadata: {},
        },
      },
      error: null,
    })

    const { updateSession } = await import('./proxy')
    const response = await updateSession(
      createRequest('/home', expiredSessionCookie),
    )

    expect(response.status).toBe(200)
    expect(mockSignOut).not.toHaveBeenCalled()
    expect(cookieJar.get(AUTH_COOKIE_NAME)).toBe(refreshedSessionCookie)

    const { getDisplayAuthClaims } = await import('./require-auth')
    await expect(getDisplayAuthClaims()).resolves.toEqual({
      sub: 'user-1',
      email: 'alex@example.com',
      app_metadata: {},
    })

    expect(mockDisplayGetClaims).toHaveBeenCalledWith(freshAccessToken, {
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
        encodeSessionCookie({
          access_token: 'expired-access-token',
          refresh_token: 'dead-refresh-token',
        }),
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
      AUTH_COOKIE_NAME,
      encodeSessionCookie({ access_token: 'invalid-signature-token' }),
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
    expect(mockDisplayGetClaims).toHaveBeenCalledWith(
      'invalid-signature-token',
      { allowExpired: true },
    )
  })
})
