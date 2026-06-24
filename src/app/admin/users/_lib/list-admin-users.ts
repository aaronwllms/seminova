import type { SupabaseClient, User } from '@supabase/supabase-js'

import { getServiceEnvForFetch } from '@/supabase/service'

import {
  mapUserToAdminRow,
  USERS_PAGE_SIZE,
  USERS_SEARCH_MIN_LENGTH,
  type AdminUserRow,
} from './admin-user-row'

export interface ListAdminUsersPageParams {
  page: number
  perPage?: number
  emailFilter?: string
}

export interface ListAdminUsersPageResult {
  rows: AdminUserRow[]
  hasNextPage: boolean
  page: number
}

type ListUsersResponse = {
  users: User[]
}

const listUsersViaApi = async ({
  page,
  perPage,
  emailFilter,
}: {
  page: number
  perPage: number
  emailFilter?: string
}): Promise<User[]> => {
  const { supabaseUrl, secretKey } = getServiceEnvForFetch()
  const query = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  })

  if (emailFilter) {
    query.set('filter', emailFilter)
  }

  const response = await fetch(
    `${supabaseUrl}/auth/v1/admin/users?${query.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        apikey: secretKey,
      },
      cache: 'no-store',
    },
  )

  if (!response.ok) {
    const message = await response.text()
    throw new Error(
      `[users-list] Admin listUsers failed (${response.status}): ${message}`,
    )
  }

  const data = (await response.json()) as ListUsersResponse
  return data.users ?? []
}

export const listAdminUsersPage = async (
  client: SupabaseClient,
  params: ListAdminUsersPageParams,
): Promise<ListAdminUsersPageResult> => {
  const page = Math.max(1, params.page)
  const perPage = params.perPage ?? USERS_PAGE_SIZE
  const trimmedFilter = params.emailFilter?.trim() ?? ''

  let users: User[]

  if (trimmedFilter.length >= USERS_SEARCH_MIN_LENGTH) {
    users = await listUsersViaApi({
      page,
      perPage,
      emailFilter: trimmedFilter,
    })
  } else {
    const { data, error } = await client.auth.admin.listUsers({
      page,
      perPage,
    })

    if (error) {
      throw error
    }

    users = data.users
  }

  return {
    rows: users.map(mapUserToAdminRow),
    hasNextPage: users.length === perPage,
    page,
  }
}
