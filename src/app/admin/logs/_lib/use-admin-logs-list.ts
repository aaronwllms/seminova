'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'

import type { AppError } from '@/types/app-error'
import type { DataTablePageSize } from '@/constants/data-table'

import { listLogsAction } from '../actions'
import { adminLogsQueryKeys } from './admin-logs-query-keys'
import type { AppLogCursor, LogsSortDirection } from './app-log-row'
import { unwrapListLogsResult } from './unwrap-logs-action'

type UseAdminLogsListOptions = {
  cursor: AppLogCursor | null
  sortDirection: LogsSortDirection
  perPage: DataTablePageSize
}

export const useAdminLogsList = ({
  cursor,
  sortDirection,
  perPage,
}: UseAdminLogsListOptions) => {
  const query = useQuery({
    queryKey: adminLogsQueryKeys.list(cursor, sortDirection, perPage),
    queryFn: async () => {
      const result = await listLogsAction({
        cursor: cursor ?? undefined,
        sortDirection,
        perPage,
      })
      return unwrapListLogsResult(result)
    },
    placeholderData: keepPreviousData,
    retry: (failureCount, error) =>
      (error as unknown as AppError)?.kind === 'fault' && failureCount < 1,
    retryDelay: 0,
  })

  const listError = query.isError ? (query.error as unknown as AppError) : null
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
