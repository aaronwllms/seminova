'use client'

import { useQuery } from '@tanstack/react-query'

import {
  ADMIN_ACTION_QUERY_RETRY_DELAY,
  adminActionQueryRetry,
} from '@/app/admin/_lib/admin-query-options'
import { unwrapActionResult } from '@/app/admin/_lib/unwrap-action-result'
import { toAppError } from '@/utils/is-app-error'

import { listLogTagsAction } from '../actions'
import { adminLogsQueryKeys } from './admin-logs-query-keys'

export const useAdminLogTags = () => {
  const query = useQuery({
    queryKey: adminLogsQueryKeys.tags(),
    queryFn: async () => unwrapActionResult(await listLogTagsAction()),
    retry: adminActionQueryRetry,
    retryDelay: ADMIN_ACTION_QUERY_RETRY_DELAY,
  })

  return {
    tags: query.data ?? [],
    isLoading: query.isLoading,
    error: query.isError ? toAppError(query.error) : null,
  }
}
