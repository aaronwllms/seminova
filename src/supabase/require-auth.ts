import { redirect } from 'next/navigation'

import { isAuthError, type SupabaseClient } from '@supabase/supabase-js'

import { LOGIN_PATH } from '@/constants/app-paths'
import { parseJwtClaims, type JwtClaims } from '@/utils/admin'

import { readAccessTokenFromCookies } from './read-auth-cookie'
import { createClient } from './server'

export type AuthenticatedClaims = JwtClaims & { sub: string }

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

const clearSessionAndRedirect = async (
  _supabase: SupabaseClient,
  error?: unknown,
): Promise<never> => {
  if (error) {
    console.error('[require-auth] Session invalid', error)
  } else {
    console.error('[require-auth] No authenticated session')
  }

  // Cookie clearing runs in the proxy on the login page — signOut from a Server
  // Component cannot set cookies, and a global-scope signOut can hit the Auth
  // API with a dead refresh token and leave stale cookies behind.
  redirect(LOGIN_PATH)
}

/**
 * Server-side auth gate for layouts and read paths. Reads the access token from
 * cookies (no refresh) and validates it with `getClaims(jwt)` so only the
 * proxy can rotate refresh tokens.
 *
 * Use `getUser()` only at mutation trust boundaries (server actions) where the
 * Auth server must validate the access token.
 */
export const requireAuthClaims = async (
  supabase: SupabaseClient,
): Promise<AuthenticatedClaims> => {
  try {
    const accessToken = await readAccessTokenFromCookies()
    if (!accessToken) {
      return clearSessionAndRedirect(supabase)
    }

    const { data, error } = await supabase.auth.getClaims(accessToken)

    if (error) {
      return clearSessionAndRedirect(supabase, error)
    }

    const claims = parseAuthenticatedClaims(data?.claims)
    if (!claims) {
      return clearSessionAndRedirect(supabase)
    }

    return claims
  } catch (error) {
    if (isSessionAuthFailure(error)) {
      return clearSessionAndRedirect(supabase, error)
    }

    throw error
  }
}

/**
 * Lightweight session probe for public surfaces (e.g. marketing header).
 * Validates the cookie-read access token via `getClaims(jwt)` — same path as
 * `requireAuthClaims`, but returns false instead of redirecting. Does not
 * refresh tokens; refresh is proxy-only (see ADR-0003).
 */
export const hasServerAuthSession = async (): Promise<boolean> => {
  const accessToken = await readAccessTokenFromCookies()
  if (!accessToken) {
    return false
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.getClaims(accessToken)
    return error === null
  } catch {
    return false
  }
}
