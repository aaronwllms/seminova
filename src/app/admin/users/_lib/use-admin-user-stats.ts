'use client'

import { useQuery } from '@tanstack/react-query'

import type { AppError } from '@/types/app-error'

import { unwrapStatsActionResult } from '@/app/admin/_lib/unwrap-stats-action-result'

import { getUserStatsAction } from '../actions'
import { adminUsersQueryKeys } from './admin-users-query-keys'

export const useAdminUserStats = () => {
  const query = useQuery({
    queryKey: adminUsersQueryKeys.stats(),
    queryFn: async () => unwrapStatsActionResult(await getUserStatsAction()),
    refetchOnWindowFocus: 'always',
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
