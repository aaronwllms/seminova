import { ADMIN_ROLE } from '@/constants/admin-role'

export type AppMetadata = Record<string, unknown>

export type JwtClaims = {
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
): '/users' | '/protected' =>
  isAdminFromAppMetadata(appMetadata) ? '/users' : '/protected'
