import type { SupabaseClient } from '@supabase/supabase-js'

import {
  ADMIN_UNBAN_DURATION,
  type AdminBanDuration,
} from '@/constants/admin-ban'
import { ADMIN_ROLE } from '@/constants/admin-role'
import { isAdminFromAppMetadata, type AppMetadata } from '@/utils/admin'
import { isUserCurrentlyBanned } from '@/utils/is-user-currently-banned'

export type PromoteUserByIdResult =
  | { status: 'promoted'; email: string }
  | { status: 'already_admin'; email: string }
  | { status: 'not_found' }

export type DemoteUserByIdResult =
  | { status: 'demoted'; email: string }
  | { status: 'not_admin'; email: string }
  | { status: 'not_found' }

export type RoleMutationSuccessStatus =
  | 'promoted'
  | 'already_admin'
  | 'demoted'
  | 'not_admin'

export type BanUserByIdResult =
  | { status: 'banned'; email: string }
  | { status: 'not_found' }

export type UnbanUserByIdResult =
  | { status: 'unbanned'; email: string }
  | { status: 'not_banned'; email: string }
  | { status: 'not_found' }

export type BanMutationSuccessStatus = 'banned' | 'unbanned' | 'not_banned'

export const mergePromoteMetadata = (
  existing: AppMetadata | undefined,
): AppMetadata => ({
  ...(existing ?? {}),
  role: ADMIN_ROLE,
})

/** Supabase shallow-merges app_metadata; omitting a key leaves it intact. `null` deletes the key from storage (not persisted as null). */
export const mergeDemoteMetadata = (
  _existing: AppMetadata | undefined,
): AppMetadata => ({ role: null })

export const getBanMutationToastMessage = (
  status: BanMutationSuccessStatus,
): string => {
  switch (status) {
    case 'banned':
      return 'User banned'
    case 'unbanned':
      return 'User unbanned'
    case 'not_banned':
      return 'User is not banned'
  }
}

export const getRoleMutationToastMessage = (
  status: RoleMutationSuccessStatus,
): string => {
  switch (status) {
    case 'promoted':
      return 'User promoted to admin'
    case 'already_admin':
      return 'User is already an admin'
    case 'demoted':
      return 'User demoted from admin'
    case 'not_admin':
      return 'User is not an admin'
  }
}

export const promoteUserById = async (
  client: SupabaseClient,
  userId: string,
): Promise<PromoteUserByIdResult> => {
  const { data, error } = await client.auth.admin.getUserById(userId)

  if (error) {
    throw error
  }

  const user = data.user

  if (!user) {
    return { status: 'not_found' }
  }

  if (isAdminFromAppMetadata(user.app_metadata)) {
    return { status: 'already_admin', email: user.email! }
  }

  const { error: updateError } = await client.auth.admin.updateUserById(
    user.id,
    {
      app_metadata: mergePromoteMetadata(user.app_metadata),
    },
  )

  if (updateError) {
    throw updateError
  }

  return { status: 'promoted', email: user.email! }
}

export const demoteUserById = async (
  client: SupabaseClient,
  userId: string,
): Promise<DemoteUserByIdResult> => {
  const { data, error } = await client.auth.admin.getUserById(userId)

  if (error) {
    throw error
  }

  const user = data.user

  if (!user) {
    return { status: 'not_found' }
  }

  if (!isAdminFromAppMetadata(user.app_metadata)) {
    return { status: 'not_admin', email: user.email! }
  }

  const { error: updateError } = await client.auth.admin.updateUserById(
    user.id,
    {
      app_metadata: mergeDemoteMetadata(user.app_metadata),
    },
  )

  if (updateError) {
    throw updateError
  }

  return { status: 'demoted', email: user.email! }
}

export const banUserById = async (
  client: SupabaseClient,
  userId: string,
  banDuration: AdminBanDuration,
): Promise<BanUserByIdResult> => {
  const { data, error } = await client.auth.admin.getUserById(userId)

  if (error) {
    throw error
  }

  const user = data.user

  if (!user) {
    return { status: 'not_found' }
  }

  const { error: updateError } = await client.auth.admin.updateUserById(
    user.id,
    {
      ban_duration: banDuration,
    },
  )

  if (updateError) {
    throw updateError
  }

  return { status: 'banned', email: user.email! }
}

export const unbanUserById = async (
  client: SupabaseClient,
  userId: string,
): Promise<UnbanUserByIdResult> => {
  const { data, error } = await client.auth.admin.getUserById(userId)

  if (error) {
    throw error
  }

  const user = data.user

  if (!user) {
    return { status: 'not_found' }
  }

  if (!isUserCurrentlyBanned(user.banned_until)) {
    return { status: 'not_banned', email: user.email! }
  }

  const { error: updateError } = await client.auth.admin.updateUserById(
    user.id,
    {
      ban_duration: ADMIN_UNBAN_DURATION,
    },
  )

  if (updateError) {
    throw updateError
  }

  return { status: 'unbanned', email: user.email! }
}
