'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { markLogUnreadAction } from '../actions'
import { adminLogsQueryKeys } from './admin-logs-query-keys'

const unwrapMarkUnreadResult = (
  result: Awaited<ReturnType<typeof markLogUnreadAction>>,
) => {
  if (!result.success) {
    throw result.error
  }

  return result.data
}

export const useMarkLogUnreadMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) =>
      unwrapMarkUnreadResult(await markLogUnreadAction({ id })),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminLogsQueryKeys.all })
    },
  })
}
