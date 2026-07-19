'use client'

import { useQuery } from '@tanstack/react-query'

import type { AppError } from '@/types/app-error'

import { listLogTagsAction } from '../actions'
import { adminLogsQueryKeys } from './admin-logs-query-keys'

const unwrapTagsResult = (
  result: Awaited<ReturnType<typeof listLogTagsAction>>,
) => {
  if (!result.success) {
    throw result.error
  }

  return result.data
}

export const useAdminLogTags = () => {
  const query = useQuery({
    queryKey: adminLogsQueryKeys.tags(),
    queryFn: async () => unwrapTagsResult(await listLogTagsAction()),
    retry: (failureCount, error) =>
      (error as unknown as AppError)?.kind === 'fault' && failureCount < 1,
    retryDelay: 0,
  })

  return {
    tags: query.data ?? [],
    isLoading: query.isLoading,
    error: query.isError ? (query.error as unknown as AppError) : null,
  }
}
