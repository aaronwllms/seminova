'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'

import type { AppError } from '@/types/app-error'
import type { DataTablePageSize } from '@/constants/data-table'

import { listLogsAction } from '../actions'
import { adminLogsQueryKeys } from './admin-logs-query-keys'
import type { AppLogCursor, LogsSortDirection } from './app-log-row'
import type { LogListFilters } from './log-list-filters'
import { unwrapStatsActionResult } from '@/app/admin/_lib/unwrap-stats-action-result'

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
      return unwrapStatsActionResult(result)
    },
    placeholderData: keepPreviousData,
    retry: (failureCount, error) =>
      (error as unknown as AppError)?.kind === 'fault' && failureCount < 1,
    retryDelay: 0,
  })

  const listError = query.isError ? (query.error as unknown as AppError) : null
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
