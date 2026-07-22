'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { unwrapActionResult } from '@/app/admin/_lib/unwrap-action-result'

import { markLogReadAction } from '../actions'
import { adminLogsQueryKeys } from './admin-logs-query-keys'

export const useMarkLogReadMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) =>
      unwrapActionResult(await markLogReadAction({ id })),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminLogsQueryKeys.all })
    },
  })
}
