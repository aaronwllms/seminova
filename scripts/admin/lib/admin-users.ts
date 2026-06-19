import type { SupabaseClient, User } from '@supabase/supabase-js'

export const ADMIN_ROLE = 'admin'
const USERS_PAGE_SIZE = 1000

export type AppMetadata = Record<string, unknown>

export const isUserAdmin = (appMetadata: AppMetadata | undefined): boolean =>
  appMetadata?.role === ADMIN_ROLE

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

export type PromoteUserResult =
  | { status: 'promoted'; email: string }
  | { status: 'already_admin'; email: string }
  | { status: 'not_found' }

export type DemoteUserResult =
  | { status: 'demoted'; email: string }
  | { status: 'not_admin'; email: string }
  | { status: 'not_found' }

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

  if (isUserAdmin(user.app_metadata)) {
    return { status: 'already_admin', email: user.email! }
  }

  const { error } = await client.auth.admin.updateUserById(user.id, {
    app_metadata: mergePromoteMetadata(user.app_metadata),
  })

  if (error) {
    throw error
  }

  return { status: 'promoted', email: user.email! }
}

export const demoteUser = async (
  client: SupabaseClient,
  email: string,
): Promise<DemoteUserResult> => {
  const user = await findUserByEmail(client, email)

  if (!user) {
    return { status: 'not_found' }
  }

  if (!isUserAdmin(user.app_metadata)) {
    return { status: 'not_admin', email: user.email! }
  }

  const { error } = await client.auth.admin.updateUserById(user.id, {
    app_metadata: mergeDemoteMetadata(user.app_metadata),
  })

  if (error) {
    throw error
  }

  return { status: 'demoted', email: user.email! }
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
