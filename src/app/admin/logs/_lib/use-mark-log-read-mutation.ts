'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { markLogReadAction } from '../actions'
import { adminLogsQueryKeys } from './admin-logs-query-keys'

const unwrapMarkReadResult = (
  result: Awaited<ReturnType<typeof markLogReadAction>>,
) => {
  if (!result.success) {
    throw result.error
  }

  return result.data
}

export const useMarkLogReadMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) =>
      unwrapMarkReadResult(await markLogReadAction({ id })),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminLogsQueryKeys.all })
    },
  })
}
