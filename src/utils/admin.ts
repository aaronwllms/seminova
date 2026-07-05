import { APP_HOME } from '@/constants/app-paths'
import { ADMIN_ROLE } from '@/constants/admin-role'
import { ADMIN_HOME } from '@/constants/admin-paths'

export type AppMetadata = {
  role?: string | null
  [key: string]: unknown
}

export type JwtClaims = {
  sub?: string
  email?: string
  app_metadata?: AppMetadata
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const parseAppMetadata = (raw: unknown): AppMetadata | undefined => {
  if (raw === null || raw === undefined) {
    return undefined
  }

  if (!isRecord(raw)) {
    return undefined
  }

  const metadata: AppMetadata = {}

  for (const [key, value] of Object.entries(raw)) {
    if (key === 'role') {
      if (value === null) {
        metadata.role = null
      } else if (value === undefined) {
        continue
      } else if (typeof value === 'string') {
        metadata.role = value
      } else {
        return undefined
      }
    } else {
      metadata[key] = value
    }
  }

  return metadata
}

export const parseJwtClaims = (raw: unknown): JwtClaims | null => {
  if (!isRecord(raw)) {
    return null
  }

  if ('sub' in raw && raw.sub !== undefined && typeof raw.sub !== 'string') {
    return null
  }

  if (
    'email' in raw &&
    raw.email !== undefined &&
    typeof raw.email !== 'string'
  ) {
    return null
  }

  if (
    'app_metadata' in raw &&
    raw.app_metadata !== undefined &&
    raw.app_metadata !== null
  ) {
    if (parseAppMetadata(raw.app_metadata) === undefined) {
      return null
    }
  }

  const claims: JwtClaims = {}

  if (typeof raw.sub === 'string') {
    claims.sub = raw.sub
  }

  if (typeof raw.email === 'string') {
    claims.email = raw.email
  }

  if (raw.app_metadata !== undefined && raw.app_metadata !== null) {
    claims.app_metadata = parseAppMetadata(raw.app_metadata)
  }

  return claims
}

export const isAdminFromAppMetadata = (
  appMetadata: AppMetadata | undefined,
): boolean => appMetadata?.role === ADMIN_ROLE

export const isAdmin = (claims: JwtClaims | null | undefined): boolean =>
  isAdminFromAppMetadata(claims?.app_metadata)

export const getPostAuthRedirectPath = (
  appMetadata: unknown,
): typeof ADMIN_HOME | typeof APP_HOME =>
  isAdminFromAppMetadata(parseAppMetadata(appMetadata)) ? ADMIN_HOME : APP_HOME
