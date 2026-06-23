import { ADMIN_ROLE } from '@/constants/admin-role'
import { ADMIN_HOME } from '@/constants/admin-paths'

export type AppMetadata = Record<string, unknown>

export type JwtClaims = {
  sub?: string
  email?: string
  app_metadata?: AppMetadata
}

export const isAdminFromAppMetadata = (
  appMetadata: AppMetadata | undefined,
): boolean => appMetadata?.role === ADMIN_ROLE

export const isAdmin = (claims: JwtClaims | null | undefined): boolean =>
  isAdminFromAppMetadata(claims?.app_metadata)

export const getPostAuthRedirectPath = (
  appMetadata: AppMetadata | undefined,
): typeof ADMIN_HOME | '/protected' =>
  isAdminFromAppMetadata(appMetadata) ? ADMIN_HOME : '/protected'
