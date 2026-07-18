'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { showSuccessToast } from '@/utils/app-toast'

import { markAllLogsReadAction } from '../actions'
import { adminLogsQueryKeys } from './admin-logs-query-keys'
import type { LogListFilters } from './log-list-filters'

const unwrapMarkAllReadResult = (
  result: Awaited<ReturnType<typeof markAllLogsReadAction>>,
) => {
  if (!result.success) {
    throw result.error
  }

  return result.data
}

export const useMarkAllLogsReadMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (filters: LogListFilters) =>
      unwrapMarkAllReadResult(await markAllLogsReadAction({ filters })),
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
