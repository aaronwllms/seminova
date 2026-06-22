import type { SupabaseClient, User } from '@supabase/supabase-js'

import { ADMIN_ROLE } from '@/constants/admin-role'
import {
  demoteUserById,
  promoteUserById,
  type DemoteUserByIdResult,
  type PromoteUserByIdResult,
} from '@/utils/admin-role-mutations'
import { isAdminFromAppMetadata } from '@/utils/admin'

export { ADMIN_ROLE } from '@/constants/admin-role'
export {
  demoteUserById,
  mergeDemoteMetadata,
  mergePromoteMetadata,
  promoteUserById,
} from '@/utils/admin-role-mutations'

const USERS_PAGE_SIZE = 1000

export type PromoteUserResult = PromoteUserByIdResult
export type DemoteUserResult = DemoteUserByIdResult

export const isUserAdmin = isAdminFromAppMetadata

const listAllUsers = async (client: SupabaseClient): Promise<User[]> => {
  const users: User[] = []
  let page = 1
  let hasMore = true

  while (hasMore) {
    const { data, error } = await client.auth.admin.listUsers({
      page,
      perPage: USERS_PAGE_SIZE,
    })

    if (error) {
      throw error
    }

    users.push(...data.users)

    if (data.users.length < USERS_PAGE_SIZE) {
      hasMore = false
    } else {
      page += 1
    }
  }

  return users
}

export const findUserByEmail = async (
  client: SupabaseClient,
  email: string,
): Promise<User | null> => {
  const normalizedEmail = email.toLowerCase()
  const users = await listAllUsers(client)

  return (
    users.find((user) => user.email?.toLowerCase() === normalizedEmail) ?? null
  )
}

export const promoteUser = async (
  client: SupabaseClient,
  email: string,
): Promise<PromoteUserResult> => {
  const user = await findUserByEmail(client, email)

  if (!user) {
    return { status: 'not_found' }
  }

  return promoteUserById(client, user.id)
}

export const demoteUser = async (
  client: SupabaseClient,
  email: string,
): Promise<DemoteUserResult> => {
  const user = await findUserByEmail(client, email)

  if (!user) {
    return { status: 'not_found' }
  }

  return demoteUserById(client, user.id)
}

export const listAdminUsers = async (
  client: SupabaseClient,
): Promise<string[]> => {
  const users = await listAllUsers(client)

  return users
    .filter((user) => isUserAdmin(user.app_metadata) && user.email)
    .map((user) => user.email!)
    .sort((a, b) => a.localeCompare(b))
}
