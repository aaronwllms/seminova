import type { SupabaseClient, User } from '@supabase/supabase-js'

import {
  ADMIN_UNBAN_DURATION,
  type AdminBanDuration,
} from '@/constants/admin-ban'
import { ADMIN_ROLE } from '@/constants/admin-role'
import { isAdminFromAppMetadata, type AppMetadata } from '@/utils/admin'
import { isUserCurrentlyBanned } from '@/utils/is-user-currently-banned'

export type PromoteUserByIdResult =
  | { status: 'promoted'; email: string | null }
  | { status: 'already_admin'; email: string | null }
  | { status: 'not_found' }

export type DemoteUserByIdResult =
  | { status: 'demoted'; email: string | null }
  | { status: 'not_admin'; email: string | null }
  | { status: 'not_found' }

export type RoleMutationSuccessStatus =
  | 'promoted'
  | 'already_admin'
  | 'demoted'
  | 'not_admin'

export type BanUserByIdResult =
  | { status: 'banned'; email: string | null }
  | { status: 'not_found' }

export type UnbanUserByIdResult =
  | { status: 'unbanned'; email: string | null }
  | { status: 'not_banned'; email: string | null }
  | { status: 'not_found' }

export type BanMutationSuccessStatus = 'banned' | 'unbanned' | 'not_banned'

export type DeleteUserByIdResult =
  | { status: 'deleted'; email: string | null }
  | { status: 'not_found' }

export const mergePromoteMetadata = (
  existing: AppMetadata | undefined,
): AppMetadata => ({
  ...(existing ?? {}),
  role: ADMIN_ROLE,
})

/** Supabase shallow-merges app_metadata; omitting a key leaves it intact. `null` deletes the key from storage (not persisted as null). */
export const mergeDemoteMetadata = (): AppMetadata => ({ role: null })

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

const withResolvedUser = async <T>(
  client: SupabaseClient,
  userId: string,
  handler: (user: Omit<User, 'email'> & { email: string | null }) => Promise<T>,
): Promise<T | { status: 'not_found' }> => {
  const { data, error } = await client.auth.admin.getUserById(userId)

  if (error) {
    throw error
  }

  const user = data.user

  if (!user) {
    return { status: 'not_found' }
  }

  return handler({ ...user, email: user.email ?? null })
}

export const promoteUserById = async (
  client: SupabaseClient,
  userId: string,
): Promise<PromoteUserByIdResult> =>
  withResolvedUser(client, userId, async (user) => {
    if (isAdminFromAppMetadata(user.app_metadata)) {
      return { status: 'already_admin', email: user.email }
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

    return { status: 'promoted', email: user.email }
  })

export const demoteUserById = async (
  client: SupabaseClient,
  userId: string,
): Promise<DemoteUserByIdResult> =>
  withResolvedUser(client, userId, async (user) => {
    if (!isAdminFromAppMetadata(user.app_metadata)) {
      return { status: 'not_admin', email: user.email }
    }

    const { error: updateError } = await client.auth.admin.updateUserById(
      user.id,
      {
        app_metadata: mergeDemoteMetadata(),
      },
    )

    if (updateError) {
      throw updateError
    }

    return { status: 'demoted', email: user.email }
  })

export const banUserById = async (
  client: SupabaseClient,
  userId: string,
  banDuration: AdminBanDuration,
): Promise<BanUserByIdResult> =>
  withResolvedUser(client, userId, async (user) => {
    const { error: updateError } = await client.auth.admin.updateUserById(
      user.id,
      {
        ban_duration: banDuration,
      },
    )

    if (updateError) {
      throw updateError
    }

    return { status: 'banned', email: user.email }
  })

export const unbanUserById = async (
  client: SupabaseClient,
  userId: string,
): Promise<UnbanUserByIdResult> =>
  withResolvedUser(client, userId, async (user) => {
    if (!isUserCurrentlyBanned(user.banned_until)) {
      return { status: 'not_banned', email: user.email }
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

    return { status: 'unbanned', email: user.email }
  })

export const deleteUserById = async (
  client: SupabaseClient,
  userId: string,
): Promise<DeleteUserByIdResult> =>
  withResolvedUser(client, userId, async (user) => {
    const { error: deleteError } = await client.auth.admin.deleteUser(userId)

    if (deleteError) {
      throw deleteError
    }

    return { status: 'deleted', email: user.email }
  })
