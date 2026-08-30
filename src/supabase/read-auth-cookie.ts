import { cookies } from 'next/headers'

import { getSupabaseProjectRef } from '@/utils/env'

const BASE64_PREFIX = 'base64-'

type SessionCookie = {
  access_token?: string
}

const getAuthStorageKey = (): string => {
  const ref = getSupabaseProjectRef()
  if (!ref) {
    return 'sb-auth-token'
  }

  return `sb-${ref}-auth-token`
}

const combineCookieChunks = (
  key: string,
  cookieMap: Map<string, string>,
): string | null => {
  const direct = cookieMap.get(key)
  if (direct) {
    return direct
  }

  const chunks: string[] = []
  for (let index = 0; ; index += 1) {
    const chunk = cookieMap.get(`${key}.${index}`)
    if (!chunk) {
      break
    }
    chunks.push(chunk)
  }

  return chunks.length > 0 ? chunks.join('') : null
}

const decodeCookieValue = (value: string): string => {
  if (value.startsWith(BASE64_PREFIX)) {
    return Buffer.from(value.slice(BASE64_PREFIX.length), 'base64url').toString(
      'utf-8',
    )
  }

  return value
}

/**
 * Reads `exp` from the JWT payload segment only — no signature verification
 * (callers must already have validated via `getClaims`).
 */
export const readJwtExpFromAccessToken = (
  accessToken: string,
): number | null => {
  const segments = accessToken.split('.')
  if (segments.length !== 3) {
    return null
  }

  const payloadSegment = segments[1]
  if (!payloadSegment) {
    return null
  }

  try {
    const payload = JSON.parse(
      Buffer.from(payloadSegment, 'base64url').toString('utf-8'),
    ) as { exp?: unknown }

    return typeof payload.exp === 'number' ? payload.exp : null
  } catch {
    return null
  }
}

/**
 * Reads the access token from Supabase auth cookies without calling
 * `getSession()` / `getClaims()` (which can trigger a refresh). Server-side
 * refresh stays on the proxy; the browser client refreshes client-side.
 */
export const readAccessTokenFromCookies = async (): Promise<string | null> => {
  const cookieStore = await cookies()
  const cookieMap = new Map(
    cookieStore.getAll().map((cookie) => [cookie.name, cookie.value]),
  )

  const raw = combineCookieChunks(getAuthStorageKey(), cookieMap)
  if (!raw) {
    return null
  }

  try {
    const session = JSON.parse(decodeCookieValue(raw)) as SessionCookie
    return typeof session.access_token === 'string'
      ? session.access_token
      : null
  } catch {
    return null
  }
}
