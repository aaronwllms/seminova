'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import { useRefreshIndicator } from '@/hooks/use-refresh-indicator'

import { referenceShipmentsQueryKeys } from './reference-shipments-query-keys'

export const useReferenceShipmentsRefresh = () => {
  const queryClient = useQueryClient()
  const { isRefreshing, runWithRefreshIndicator } = useRefreshIndicator()

  const refresh = useCallback(async () => {
    await runWithRefreshIndicator(async () => {
      await queryClient.refetchQueries({
        queryKey: referenceShipmentsQueryKeys.all,
      })
    })
  }, [queryClient, runWithRefreshIndicator])

  return { refresh, isRefreshing }
}
