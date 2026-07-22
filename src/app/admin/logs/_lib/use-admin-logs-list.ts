'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'

import {
  ADMIN_ACTION_QUERY_RETRY_DELAY,
  adminActionQueryRetry,
} from '@/app/admin/_lib/admin-query-options'
import { unwrapActionResult } from '@/app/admin/_lib/unwrap-action-result'
import type { DataTablePageSize } from '@/constants/data-table'
import { toAppError } from '@/utils/is-app-error'

import { listLogsAction } from '../actions'
import { adminLogsQueryKeys } from './admin-logs-query-keys'
import type { AppLogCursor, LogsSortDirection } from './app-log-row'
import type { LogListFilters } from './log-list-filters'

type UseAdminLogsListOptions = {
  cursor: AppLogCursor | null
  sortDirection: LogsSortDirection
  perPage: DataTablePageSize
  filters: LogListFilters
}

export const useAdminLogsList = ({
  cursor,
  sortDirection,
  perPage,
  filters,
}: UseAdminLogsListOptions) => {
  const query = useQuery({
    queryKey: adminLogsQueryKeys.list(cursor, sortDirection, perPage, filters),
    queryFn: async () => {
      const result = await listLogsAction({
        cursor: cursor ?? undefined,
        sortDirection,
        perPage,
        filters,
      })
      return unwrapActionResult(result)
    },
    placeholderData: keepPreviousData,
    retry: adminActionQueryRetry,
    retryDelay: ADMIN_ACTION_QUERY_RETRY_DELAY,
  })

  const listError = query.isError ? toAppError(query.error) : null
  const rows = listError ? [] : (query.data?.rows ?? [])
  const hasNextPage = listError ? false : (query.data?.hasNextPage ?? false)
  const filteredUnreadCount = listError
    ? 0
    : (query.data?.filteredUnreadCount ?? 0)

  return {
    rows,
    hasNextPage,
    filteredUnreadCount,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: listError,
  }
}
