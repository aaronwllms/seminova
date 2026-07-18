import { AuthApiError } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockGetClaims = vi.fn()
const mockReadAccessTokenFromCookies = vi.fn()
const mockCreateClient = vi.fn()
const mockAppLogDebug = vi.fn()

vi.mock('@/utils/app-logger', () => ({
  appLog: {
    debug: (...args: unknown[]) => mockAppLogDebug(...args),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('./read-auth-cookie', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./read-auth-cookie')>()

  return {
    ...actual,
    readAccessTokenFromCookies: () => mockReadAccessTokenFromCookies(),
  }
})

vi.mock('./server', () => ({
  createClient: () => mockCreateClient(),
}))

import {
  DisplayAuthInvariantError,
  getDisplayAuthClaims,
  hasServerAuthSession,
} from './require-auth'

const makeAccessToken = (payload: { sub?: string; exp?: number }) => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256' })).toString(
    'base64url',
  )
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')

  return `${header}.${body}.signature`
}

describe('getDisplayAuthClaims', () => {
  beforeEach(() => {
    mockGetClaims.mockReset()
    mockReadAccessTokenFromCookies.mockReset()
    mockCreateClient.mockReset()
    mockAppLogDebug.mockReset()
    mockCreateClient.mockResolvedValue({
      auth: { getClaims: mockGetClaims },
    })
  })

  it('should throw when the access token cookie is missing', async () => {
    mockReadAccessTokenFromCookies.mockResolvedValue(null)

    await expect(getDisplayAuthClaims()).rejects.toBeInstanceOf(
      DisplayAuthInvariantError,
    )

    expect(mockGetClaims).not.toHaveBeenCalled()
  })

  it('should call getClaims with allowExpired true', async () => {
    const accessToken = makeAccessToken({
      sub: 'user-1',
      exp: Math.floor(Date.now() / 1000) + 3600,
    })
    mockReadAccessTokenFromCookies.mockResolvedValue(accessToken)
    mockGetClaims.mockResolvedValue({
      data: {
        claims: {
          sub: 'user-1',
          email: 'alex@example.com',
          app_metadata: {},
        },
      },
      error: null,
    })

    await expect(getDisplayAuthClaims()).resolves.toEqual({
      sub: 'user-1',
      email: 'alex@example.com',
      app_metadata: {},
    })

    expect(mockGetClaims).toHaveBeenCalledWith(accessToken, {
      allowExpired: true,
    })
    expect(mockAppLogDebug).toHaveBeenCalledWith(
      'require-auth',
      'Display claims read',
      { sub: 'user-1' },
    )
  })

  it('should return claims for an expired-but-signed token', async () => {
    mockReadAccessTokenFromCookies.mockResolvedValue(
      makeAccessToken({ sub: 'user-1', exp: 1 }),
    )
    mockGetClaims.mockResolvedValue({
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

    await expect(getDisplayAuthClaims()).resolves.toEqual({
      sub: 'user-1',
      email: 'alex@example.com',
      app_metadata: {},
    })
    expect(mockAppLogDebug).toHaveBeenCalledWith(
      'require-auth',
      'Display claims read with expired access token',
      { sub: 'user-1', exp: 1 },
    )
  })

  it('should not emit debug when the access token cookie is missing', async () => {
    mockReadAccessTokenFromCookies.mockResolvedValue(null)

    await expect(getDisplayAuthClaims()).rejects.toBeInstanceOf(
      DisplayAuthInvariantError,
    )

    expect(mockAppLogDebug).not.toHaveBeenCalled()
  })

  it('should throw when getClaims returns a signature-invalid error', async () => {
    const authError = new AuthApiError('invalid JWT', 401, 'invalid_jwt')
    mockReadAccessTokenFromCookies.mockResolvedValue('bad-token')
    mockGetClaims.mockResolvedValue({
      data: { claims: null },
      error: authError,
    })

    await expect(getDisplayAuthClaims()).rejects.toBeInstanceOf(
      DisplayAuthInvariantError,
    )
  })

  it('should throw when claims are malformed', async () => {
    mockReadAccessTokenFromCookies.mockResolvedValue('access-token')
    mockGetClaims.mockResolvedValue({
      data: { claims: { email: 'alex@example.com' } },
      error: null,
    })

    await expect(getDisplayAuthClaims()).rejects.toBeInstanceOf(
      DisplayAuthInvariantError,
    )
  })

  it('should throw when getClaims throws unexpectedly', async () => {
    mockReadAccessTokenFromCookies.mockResolvedValue('access-token')
    mockGetClaims.mockRejectedValue(new Error('network down'))

    await expect(getDisplayAuthClaims()).rejects.toBeInstanceOf(
      DisplayAuthInvariantError,
    )
  })
})

describe('hasServerAuthSession', () => {
  beforeEach(() => {
    mockReadAccessTokenFromCookies.mockReset()
    mockGetClaims.mockReset()
    mockCreateClient.mockReset()
    mockAppLogDebug.mockReset()
    mockCreateClient.mockResolvedValue({
      auth: { getClaims: mockGetClaims },
    })
  })

  it('should return true when the access token is valid', async () => {
    const accessToken = makeAccessToken({
      sub: 'user-1',
      exp: Math.floor(Date.now() / 1000) + 3600,
    })
    mockReadAccessTokenFromCookies.mockResolvedValue(accessToken)
    mockGetClaims.mockResolvedValue({
      data: { claims: { sub: 'user-1' } },
      error: null,
    })

    await expect(hasServerAuthSession()).resolves.toBe(true)

    expect(mockGetClaims).toHaveBeenCalledWith(accessToken, {
      allowExpired: true,
    })
    expect(mockAppLogDebug).not.toHaveBeenCalled()
  })

  it('should return false when the access token cookie is missing', async () => {
    mockReadAccessTokenFromCookies.mockResolvedValue(null)

    await expect(hasServerAuthSession()).resolves.toBe(false)

    expect(mockGetClaims).not.toHaveBeenCalled()
  })

  it('should return true for an expired-but-signed token with sub', async () => {
    mockReadAccessTokenFromCookies.mockResolvedValue(
      makeAccessToken({ sub: 'user-1', exp: 1 }),
    )
    mockGetClaims.mockResolvedValue({
      data: { claims: { sub: 'user-1', exp: 1 } },
      error: null,
    })

    await expect(hasServerAuthSession()).resolves.toBe(true)
    expect(mockAppLogDebug).toHaveBeenCalledWith(
      'require-auth',
      'Session probe succeeded with expired access token',
      { sub: 'user-1', exp: 1 },
    )
  })

  it('should return false when getClaims returns an auth error', async () => {
    mockReadAccessTokenFromCookies.mockResolvedValue(
      makeAccessToken({ sub: 'user-1', exp: 1 }),
    )
    mockGetClaims.mockResolvedValue({
      data: { claims: null },
      error: new AuthApiError('invalid JWT', 401, 'invalid_jwt'),
    })

    await expect(hasServerAuthSession()).resolves.toBe(false)
    expect(mockAppLogDebug).not.toHaveBeenCalled()
  })
})
