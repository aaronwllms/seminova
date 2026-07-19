'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { unwrapStatsActionResult } from '@/app/admin/_lib/unwrap-stats-action-result'

import { markLogReadAction } from '../actions'
import { adminLogsQueryKeys } from './admin-logs-query-keys'

export const useMarkLogReadMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) =>
      unwrapStatsActionResult(await markLogReadAction({ id })),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminLogsQueryKeys.all })
    },
  })
}
