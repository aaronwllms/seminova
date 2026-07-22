'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { unwrapActionResult } from '@/app/admin/_lib/unwrap-action-result'
import { showSuccessToast } from '@/utils/app-toast'

import { markAllLogsReadAction } from '../actions'
import { adminLogsQueryKeys } from './admin-logs-query-keys'
import type { LogListFilters } from './log-list-filters'

export const useMarkAllLogsReadMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (filters: LogListFilters) =>
      unwrapActionResult(await markAllLogsReadAction({ filters })),
    onSuccess: (data) => {
      if (data.markedCount > 0) {
        showSuccessToast(
          data.markedCount === 1
            ? '1 log marked as read'
            : `${data.markedCount} logs marked as read`,
        )
      }

      void queryClient.invalidateQueries({ queryKey: adminLogsQueryKeys.all })
    },
  })
}
