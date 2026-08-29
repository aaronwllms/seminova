'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import { useRefreshIndicator } from '@/hooks/use-refresh-indicator'

import { adminUsersQueryKeys } from './admin-users-query-keys'

export const useAdminUsersRefresh = () => {
  const queryClient = useQueryClient()
  const { isRefreshing, runWithRefreshIndicator } = useRefreshIndicator()

  const refresh = useCallback(async () => {
    await runWithRefreshIndicator(async () => {
      await queryClient.refetchQueries({ queryKey: adminUsersQueryKeys.all })
    })
  }, [queryClient, runWithRefreshIndicator])

  return { refresh, isRefreshing }
}
