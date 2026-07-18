'use client'

import { useQuery } from '@tanstack/react-query'

import type { AppError } from '@/types/app-error'

import { getLogStatsAction } from '../actions'
import { adminLogsQueryKeys } from './admin-logs-query-keys'

const unwrapStatsResult = (
  result: Awaited<ReturnType<typeof getLogStatsAction>>,
) => {
  if (!result.success) {
    throw result.error
  }

  return result.data
}

export const useAdminLogStats = () => {
  const query = useQuery({
    queryKey: adminLogsQueryKeys.stats(),
    queryFn: async () => unwrapStatsResult(await getLogStatsAction()),
    retry: (failureCount, error) =>
      (error as unknown as AppError)?.kind === 'fault' && failureCount < 1,
    retryDelay: 0,
  })

  return {
    stats: query.data ?? null,
    isLoading: query.isLoading,
    error: query.isError ? (query.error as unknown as AppError) : null,
  }
}
