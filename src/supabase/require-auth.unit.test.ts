import { AuthApiError } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockGetClaims = vi.fn()
const mockReadAccessTokenFromCookies = vi.fn()
const mockCreateClient = vi.fn()

vi.mock('./read-auth-cookie', () => ({
  readAccessTokenFromCookies: () => mockReadAccessTokenFromCookies(),
}))

vi.mock('./server', () => ({
  createClient: () => mockCreateClient(),
}))

import {
  DisplayAuthInvariantError,
  getDisplayAuthClaims,
  hasServerAuthSession,
} from './require-auth'

describe('getDisplayAuthClaims', () => {
  beforeEach(() => {
    mockGetClaims.mockReset()
    mockReadAccessTokenFromCookies.mockReset()
    mockCreateClient.mockReset()
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
    mockReadAccessTokenFromCookies.mockResolvedValue('access-token')
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

    expect(mockGetClaims).toHaveBeenCalledWith('access-token', {
      allowExpired: true,
    })
  })

  it('should return claims for an expired-but-signed token', async () => {
    mockReadAccessTokenFromCookies.mockResolvedValue('expired-access-token')
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
    mockCreateClient.mockResolvedValue({
      auth: { getClaims: mockGetClaims },
    })
  })

  it('should return true when the access token is valid', async () => {
    mockReadAccessTokenFromCookies.mockResolvedValue('access-token')
    mockGetClaims.mockResolvedValue({
      data: { claims: { sub: 'user-1' } },
      error: null,
    })

    await expect(hasServerAuthSession()).resolves.toBe(true)

    expect(mockGetClaims).toHaveBeenCalledWith('access-token', {
      allowExpired: true,
    })
  })

  it('should return false when the access token cookie is missing', async () => {
    mockReadAccessTokenFromCookies.mockResolvedValue(null)

    await expect(hasServerAuthSession()).resolves.toBe(false)

    expect(mockGetClaims).not.toHaveBeenCalled()
  })

  it('should return true for an expired-but-signed token with sub', async () => {
    mockReadAccessTokenFromCookies.mockResolvedValue('expired-access-token')
    mockGetClaims.mockResolvedValue({
      data: { claims: { sub: 'user-1', exp: 1 } },
      error: null,
    })

    await expect(hasServerAuthSession()).resolves.toBe(true)
  })

  it('should return false when getClaims returns an auth error', async () => {
    mockReadAccessTokenFromCookies.mockResolvedValue('bad-token')
    mockGetClaims.mockResolvedValue({
      data: { claims: null },
      error: new AuthApiError('invalid JWT', 401, 'invalid_jwt'),
    })

    await expect(hasServerAuthSession()).resolves.toBe(false)
  })
})
