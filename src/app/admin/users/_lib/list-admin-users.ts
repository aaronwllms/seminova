import type { SupabaseClient } from '@supabase/supabase-js'

import { DATA_TABLE_DEFAULT_PAGE_SIZE } from '@/constants/data-table'

import {
  mapUserToAdminRow,
  USERS_SEARCH_MIN_LENGTH,
  type AdminUserRow,
  type UsersSortColumn,
  type UsersSortDirection,
} from './admin-user-row'

export interface ListAdminUsersPageParams {
  page: number
  perPage?: number
  emailFilter?: string
  sortColumn?: UsersSortColumn
  sortDirection?: UsersSortDirection
}

export interface ListAdminUsersPageResult {
  rows: AdminUserRow[]
  hasNextPage: boolean
  page: number
}

export const listAdminUsersPage = async (
  client: SupabaseClient,
  params: ListAdminUsersPageParams,
): Promise<ListAdminUsersPageResult> => {
  const page = Math.max(1, params.page)
  const perPage = params.perPage ?? DATA_TABLE_DEFAULT_PAGE_SIZE
  const trimmedFilter = params.emailFilter?.trim() ?? ''
  const sortColumn = params.sortColumn ?? 'created_at'
  const sortDirection = params.sortDirection ?? 'desc'

  const { data, error } = await client.rpc('admin_list_users', {
    p_sort_column: sortColumn,
    p_sort_direction: sortDirection,
    p_page: page,
    p_per_page: perPage,
    p_search:
      trimmedFilter.length >= USERS_SEARCH_MIN_LENGTH ? trimmedFilter : '',
  })

  if (error) {
    throw error
  }

  const rows = (data ?? []).map(mapUserToAdminRow)

  return {
    rows,
    hasNextPage: rows.length === perPage,
    page,
  }
}
