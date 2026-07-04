import { AuthApiError } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockGetClaims = vi.fn()
const mockSignOut = vi.fn()
const mockRedirect = vi.fn()
const mockReadAccessTokenFromCookies = vi.fn()

vi.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => {
    mockRedirect(...args)
    throw new Error('NEXT_REDIRECT')
  },
}))

vi.mock('./read-auth-cookie', () => ({
  readAccessTokenFromCookies: () => mockReadAccessTokenFromCookies(),
}))

import {
  isSessionAuthFailure,
  requireAuthClaims,
  hasServerAuthSession,
} from './require-auth'

describe('isSessionAuthFailure', () => {
  it('should return true for Supabase auth errors', () => {
    const error = new AuthApiError(
      'Invalid Refresh Token: Already Used',
      400,
      'refresh_token_already_used',
    )

    expect(isSessionAuthFailure(error)).toBe(true)
  })

  it('should return false for non-auth errors', () => {
    expect(isSessionAuthFailure(new Error('network'))).toBe(false)
  })

  it('should return true for auth errors identified by message', () => {
    const error = new AuthApiError('jwt expired', 401, undefined)
    Object.defineProperty(error, 'code', { value: undefined })

    expect(isSessionAuthFailure(error)).toBe(true)
  })
})

describe('requireAuthClaims', () => {
  beforeEach(() => {
    mockGetClaims.mockReset()
    mockSignOut.mockReset()
    mockRedirect.mockReset()
    mockReadAccessTokenFromCookies.mockReset()
    mockSignOut.mockResolvedValue({ error: null })
  })

  it('should redirect and sign out when the access token cookie is missing', async () => {
    mockReadAccessTokenFromCookies.mockResolvedValue(null)

    const supabase = {
      auth: { getClaims: mockGetClaims, signOut: mockSignOut },
    }

    await expect(requireAuthClaims(supabase as never)).rejects.toThrow(
      'NEXT_REDIRECT',
    )

    expect(mockGetClaims).not.toHaveBeenCalled()
    expect(mockSignOut).toHaveBeenCalledOnce()
    expect(mockRedirect).toHaveBeenCalledWith('/auth/login')
  })

  it('should redirect and sign out on auth errors', async () => {
    const authError = new AuthApiError(
      'Invalid Refresh Token: Already Used',
      400,
      'refresh_token_already_used',
    )
    mockReadAccessTokenFromCookies.mockResolvedValue('access-token')
    mockGetClaims.mockResolvedValue({
      data: { claims: null },
      error: authError,
    })

    const supabase = {
      auth: { getClaims: mockGetClaims, signOut: mockSignOut },
    }

    await expect(requireAuthClaims(supabase as never)).rejects.toThrow(
      'NEXT_REDIRECT',
    )

    expect(mockGetClaims).toHaveBeenCalledWith('access-token')
    expect(mockSignOut).toHaveBeenCalledOnce()
    expect(mockRedirect).toHaveBeenCalledWith('/auth/login')
  })

  it('should return claims when the session is valid', async () => {
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

    const supabase = {
      auth: { getClaims: mockGetClaims, signOut: mockSignOut },
    }

    await expect(requireAuthClaims(supabase as never)).resolves.toEqual({
      sub: 'user-1',
      email: 'alex@example.com',
      app_metadata: {},
    })

    expect(mockGetClaims).toHaveBeenCalledWith('access-token')
  })

  it('should redirect when getClaims throws an auth error', async () => {
    const authError = new AuthApiError('jwt expired', 401, 'session_expired')
    mockReadAccessTokenFromCookies.mockResolvedValue('access-token')
    mockGetClaims.mockRejectedValue(authError)

    const supabase = {
      auth: { getClaims: mockGetClaims, signOut: mockSignOut },
    }

    await expect(requireAuthClaims(supabase as never)).rejects.toThrow(
      'NEXT_REDIRECT',
    )

    expect(mockSignOut).toHaveBeenCalledOnce()
  })
})

describe('hasServerAuthSession', () => {
  beforeEach(() => {
    mockReadAccessTokenFromCookies.mockReset()
  })

  it('should return true when an access token cookie exists', async () => {
    mockReadAccessTokenFromCookies.mockResolvedValue('access-token')

    await expect(hasServerAuthSession()).resolves.toBe(true)
  })

  it('should return false when the access token cookie is missing', async () => {
    mockReadAccessTokenFromCookies.mockResolvedValue(null)

    await expect(hasServerAuthSession()).resolves.toBe(false)
  })
})
