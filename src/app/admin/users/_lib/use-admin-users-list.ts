'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'

import type { AppError } from '@/types/app-error'

import { listUsersAction } from '../actions'
import { adminUsersQueryKeys } from './admin-users-query-keys'
import { unwrapListUsersResult } from './unwrap-users-action'

type UseAdminUsersListOptions = {
  page: number
  emailFilter?: string
}

export const useAdminUsersList = ({
  page,
  emailFilter,
}: UseAdminUsersListOptions) => {
  const query = useQuery({
    queryKey: adminUsersQueryKeys.list(page, emailFilter),
    queryFn: async () => {
      const result = await listUsersAction({ page, emailFilter })
      return unwrapListUsersResult(result)
    },
    placeholderData: keepPreviousData,
    retry: (failureCount, error) =>
      (error as unknown as AppError)?.kind === 'fault' && failureCount < 1,
    retryDelay: 0,
  })

  const listError = query.isError ? (query.error as unknown as AppError) : null
  const rows = listError ? [] : (query.data?.rows ?? [])
  const hasNextPage = listError ? false : (query.data?.hasNextPage ?? false)

  return {
    rows,
    hasNextPage,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: listError,
  }
}
