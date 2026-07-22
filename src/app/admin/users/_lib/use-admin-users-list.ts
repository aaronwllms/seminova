'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'

import {
  ADMIN_ACTION_QUERY_RETRY_DELAY,
  adminActionQueryRetry,
} from '@/app/admin/_lib/admin-query-options'
import { unwrapActionResult } from '@/app/admin/_lib/unwrap-action-result'
import { type DataTablePageSize } from '@/constants/data-table'
import { toAppError } from '@/utils/is-app-error'

import { listUsersAction } from '../actions'
import { adminUsersQueryKeys } from './admin-users-query-keys'
import type { UsersSortColumn, UsersSortDirection } from './admin-user-row'

type UseAdminUsersListOptions = {
  page: number
  emailFilter?: string
  sortColumn: UsersSortColumn
  sortDirection: UsersSortDirection
  perPage: DataTablePageSize
  filterUnverified?: boolean
  filterBanned?: boolean
  filterNew30d?: boolean
}

export const useAdminUsersList = ({
  page,
  emailFilter,
  sortColumn,
  sortDirection,
  perPage,
  filterUnverified = false,
  filterBanned = false,
  filterNew30d = false,
}: UseAdminUsersListOptions) => {
  const query = useQuery({
    queryKey: adminUsersQueryKeys.list(
      page,
      emailFilter,
      sortColumn,
      sortDirection,
      perPage,
      filterUnverified,
      filterBanned,
      filterNew30d,
    ),
    queryFn: async () => {
      const result = await listUsersAction({
        page,
        emailFilter,
        sortColumn,
        sortDirection,
        perPage,
        filterUnverified,
        filterBanned,
        filterNew30d,
      })
      return unwrapActionResult(result)
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: 'always',
    retry: adminActionQueryRetry,
    retryDelay: ADMIN_ACTION_QUERY_RETRY_DELAY,
  })

  const listError = query.isError ? toAppError(query.error) : null
  const rows = listError ? [] : (query.data?.rows ?? [])
  const hasNextPage = listError ? false : (query.data?.hasNextPage ?? false)

  return {
    rows,
    hasNextPage,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: listError,
  }
}
