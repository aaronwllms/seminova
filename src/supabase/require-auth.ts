import { isAuthError, type SupabaseClient } from '@supabase/supabase-js'

import { parseJwtClaims, type JwtClaims } from '@/utils/admin'

import { readAccessTokenFromCookies } from './read-auth-cookie'
import { createClient } from './server'

export type AuthenticatedClaims = JwtClaims & { sub: string }

export class DisplayAuthInvariantError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DisplayAuthInvariantError'
  }
}

export const parseAuthenticatedClaims = (
  raw: unknown,
): AuthenticatedClaims | null => {
  const claims = parseJwtClaims(raw)
  const sub = claims?.sub?.trim()

  if (!sub) {
    return null
  }

  return { ...claims, sub }
}

const isSessionFailureMessage = (message: string): boolean => {
  const normalized = message.toLowerCase()
  return (
    normalized.includes('refresh token') ||
    normalized.includes('session') ||
    normalized.includes('jwt') ||
    normalized.includes('missing exp claim')
  )
}

/**
 * Returns true when a Supabase auth error indicates the session is no longer
 * valid (expired, revoked, or refresh-token rotation conflict).
 */
export const isSessionAuthFailure = (error: unknown): boolean => {
  if (isAuthError(error)) {
    if (typeof error.code === 'string') {
      return true
    }

    return isSessionFailureMessage(error.message)
  }

  if (error instanceof Error) {
    return isSessionFailureMessage(error.message)
  }

  return false
}

/**
 * Display-only auth claims for protected-route server reads. Reads the access
 * token from cookies (no refresh) and validates via
 * `getClaims(accessToken, { allowExpired: true })` — signature verified,
 * exp tolerated. The proxy is the sole session gate; missing or invalid tokens
 * here are invariant violations and throw (route error boundary), not redirects.
 *
 * Use `getUser()` only at mutation trust boundaries (server actions) where the
 * Auth server must validate the access token.
 */
export const getDisplayAuthClaims = async (): Promise<AuthenticatedClaims> => {
  const accessToken = await readAccessTokenFromCookies()
  if (!accessToken) {
    console.error('[require-auth] Missing access token on protected route')
    throw new DisplayAuthInvariantError('No authenticated session')
  }

  const supabase = await createClient()

  try {
    const { data, error } = await supabase.auth.getClaims(accessToken, {
      allowExpired: true,
    })

    if (error) {
      console.error(
        '[require-auth] Invalid access token on protected route',
        error,
      )
      throw new DisplayAuthInvariantError('Session claims invalid')
    }

    const claims = parseAuthenticatedClaims(data?.claims)
    if (!claims) {
      console.error('[require-auth] Malformed claims on protected route')
      throw new DisplayAuthInvariantError('Session claims malformed')
    }

    return claims
  } catch (error) {
    if (error instanceof DisplayAuthInvariantError) {
      throw error
    }

    console.error('[require-auth] Failed to read display claims', error)
    throw new DisplayAuthInvariantError('Session claims invalid')
  }
}

/**
 * Lightweight session probe for public surfaces (e.g. marketing header).
 * Validates the cookie-read access token via
 * `getClaims(accessToken, { allowExpired: true })` — same path as
 * `getDisplayAuthClaims`, but returns false instead of throwing. Does not
 * refresh tokens; refresh is proxy-only (see ADR-0005).
 */
export const hasServerAuthSession = async (): Promise<boolean> => {
  const accessToken = await readAccessTokenFromCookies()
  if (!accessToken) {
    return false
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getClaims(accessToken, {
      allowExpired: true,
    })

    if (error) {
      return false
    }

    return parseAuthenticatedClaims(data?.claims) !== null
  } catch {
    return false
  }
}
