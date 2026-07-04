import { redirect } from 'next/navigation'

import { isAuthError, type SupabaseClient } from '@supabase/supabase-js'

import { LOGIN_PATH } from '@/constants/app-paths'
import type { JwtClaims } from '@/utils/admin'

import { readAccessTokenFromCookies } from './read-auth-cookie'

export type AuthenticatedClaims = JwtClaims & { sub: string }

/**
 * Returns true when a Supabase auth error indicates the session is no longer
 * valid (expired, revoked, or refresh-token rotation conflict).
 */
export const isSessionAuthFailure = (error: unknown): boolean => {
  if (!isAuthError(error)) {
    return false
  }

  if (typeof error.code === 'string') {
    return true
  }

  const message = error.message.toLowerCase()
  return (
    message.includes('refresh token') ||
    message.includes('session') ||
    message.includes('jwt')
  )
}

const clearSessionAndRedirect = async (
  supabase: SupabaseClient,
  error?: unknown,
): Promise<never> => {
  if (error) {
    console.error('[require-auth] Session invalid', error)
  } else {
    console.error('[require-auth] No authenticated session')
  }

  try {
    await supabase.auth.signOut()
  } catch (signOutError) {
    console.error('[require-auth] signOut failed', signOutError)
  }

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

    const claims = data?.claims as JwtClaims | undefined
    const sub = claims?.sub
    if (typeof sub !== 'string' || sub.length === 0) {
      return clearSessionAndRedirect(supabase)
    }

    return { ...claims, sub }
  } catch (error) {
    if (isSessionAuthFailure(error)) {
      return clearSessionAndRedirect(supabase, error)
    }

    throw error
  }
}

/**
 * Lightweight session probe for public surfaces (e.g. marketing header). Does
 * not refresh tokens — relies on the proxy to keep cookies current.
 */
export const hasServerAuthSession = async (): Promise<boolean> => {
  const accessToken = await readAccessTokenFromCookies()
  return accessToken !== null
}
