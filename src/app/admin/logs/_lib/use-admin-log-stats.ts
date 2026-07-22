'use client'

import { useQuery } from '@tanstack/react-query'

import {
  ADMIN_ACTION_QUERY_RETRY_DELAY,
  adminActionQueryRetry,
} from '@/app/admin/_lib/admin-query-options'
import { unwrapActionResult } from '@/app/admin/_lib/unwrap-action-result'
import { toAppError } from '@/utils/is-app-error'

import { getLogStatsAction } from '../actions'
import { adminLogsQueryKeys } from './admin-logs-query-keys'

export const useAdminLogStats = () => {
  const query = useQuery({
    queryKey: adminLogsQueryKeys.stats(),
    queryFn: async () => unwrapActionResult(await getLogStatsAction()),
    retry: adminActionQueryRetry,
    retryDelay: ADMIN_ACTION_QUERY_RETRY_DELAY,
  })

  return {
    stats: query.data ?? null,
    isLoading: query.isLoading,
    error: query.isError ? toAppError(query.error) : null,
  }
}
