'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { unwrapActionResult } from '@/app/admin/_lib/unwrap-action-result'

import { markLogUnreadAction } from '../actions'
import { adminLogsQueryKeys } from './admin-logs-query-keys'

export const useMarkLogUnreadMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) =>
      unwrapActionResult(await markLogUnreadAction({ id })),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminLogsQueryKeys.lists(),
      })
      void queryClient.invalidateQueries({
        queryKey: adminLogsQueryKeys.stats(),
      })
    },
  })
}
