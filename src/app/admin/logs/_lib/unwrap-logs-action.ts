import type { AppError } from '@/types/app-error'

import type { ListLogsActionResult } from '../actions'

type ListLogsData = Extract<ListLogsActionResult, { success: true }>['data']

const throwActionError = (error: AppError): never => {
  throw error
}

export const unwrapListLogsResult = (
  result: ListLogsActionResult,
): ListLogsData => {
  if (!result.success) {
    return throwActionError(result.error)
  }

  return result.data
}
