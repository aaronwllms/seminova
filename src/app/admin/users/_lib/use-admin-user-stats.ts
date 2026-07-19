'use client'

import { useQuery } from '@tanstack/react-query'

import type { AppError } from '@/types/app-error'

import { getUserStatsAction } from '../actions'
import { adminUsersQueryKeys } from './admin-users-query-keys'

const unwrapStatsResult = (
  result: Awaited<ReturnType<typeof getUserStatsAction>>,
) => {
  if (!result.success) {
    throw result.error
  }

  return result.data
}

export const useAdminUserStats = () => {
  const query = useQuery({
    queryKey: adminUsersQueryKeys.stats(),
    queryFn: async () => unwrapStatsResult(await getUserStatsAction()),
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
