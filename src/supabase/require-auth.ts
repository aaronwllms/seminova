import { parseJwtClaims, type JwtClaims } from '@/utils/admin'
import { appLog } from '@/utils/app-logger'
import { withRequestPathnameLogContext } from '@/utils/request-log-context'

import {
  readAccessTokenFromCookies,
  readJwtExpFromAccessToken,
} from './read-auth-cookie'
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

const isAccessTokenExpired = (
  accessToken: string,
): { expired: boolean; exp: number | null } => {
  const exp = readJwtExpFromAccessToken(accessToken)
  const nowSeconds = Math.floor(Date.now() / 1000)

  return {
    expired: exp !== null && exp < nowSeconds,
    exp,
  }
}

/**
 * Display-only auth claims for protected-route server reads. Reads the access
 * token from cookies (no refresh) and validates via
 * `getClaims(accessToken, { allowExpired: true })` — signature verified,
 * exp tolerated. The proxy is the server-side session gate; the browser
 * client refreshes client-side. Missing or invalid tokens here are invariant
 * violations and throw (route error boundary), not redirects.
 *
 * Use `getUser()` only at mutation trust boundaries (server actions) where the
 * Auth server must validate the access token.
 */
export const getDisplayAuthClaims = async (): Promise<AuthenticatedClaims> => {
  const accessToken = await readAccessTokenFromCookies()
  if (!accessToken) {
    appLog.error(
      'require-auth',
      'Missing access token on protected route',
      await withRequestPathnameLogContext(),
    )
    throw new DisplayAuthInvariantError('No authenticated session')
  }

  const supabase = await createClient()

  try {
    const { data, error } = await supabase.auth.getClaims(accessToken, {
      allowExpired: true,
    })

    if (error) {
      appLog.error(
        'require-auth',
        'Invalid access token on protected route',
        await withRequestPathnameLogContext(error),
      )
      throw new DisplayAuthInvariantError('Session claims invalid')
    }

    const claims = parseAuthenticatedClaims(data?.claims)
    if (!claims) {
      appLog.error(
        'require-auth',
        'Malformed claims on protected route',
        await withRequestPathnameLogContext(),
      )
      throw new DisplayAuthInvariantError('Session claims malformed')
    }

    const { expired, exp } = isAccessTokenExpired(accessToken)

    if (expired) {
      appLog.debug(
        'require-auth',
        'Display claims read with expired access token',
        { sub: claims.sub, exp },
      )
    } else {
      appLog.debug('require-auth', 'Display claims read', { sub: claims.sub })
    }

    return claims
  } catch (error) {
    if (error instanceof DisplayAuthInvariantError) {
      throw error
    }

    appLog.error(
      'require-auth',
      'Failed to read display claims',
      await withRequestPathnameLogContext(error),
    )
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

    const claims = parseAuthenticatedClaims(data?.claims)
    if (!claims) {
      return false
    }

    const { expired, exp } = isAccessTokenExpired(accessToken)

    if (expired) {
      appLog.debug(
        'require-auth',
        'Session probe succeeded with expired access token',
        { sub: claims.sub, exp },
      )
    }

    return true
  } catch {
    return false
  }
}
