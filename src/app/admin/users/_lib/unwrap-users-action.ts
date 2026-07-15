import type { ListUsersActionResult } from '../actions'
import type { AppError } from '@/types/app-error'

type ListUsersData = Extract<ListUsersActionResult, { success: true }>['data']

type MutationActionResult<TData> =
  | { success: true; data: TData }
  | { success: false; error: AppError }

const throwActionError = (error: AppError): never => {
  throw error
}

export const unwrapListUsersResult = (
  result: ListUsersActionResult,
): ListUsersData => {
  if (!result.success) {
    return throwActionError(result.error)
  }

  return result.data
}

export const unwrapMutationResult = <TData>(
  result: MutationActionResult<TData>,
): TData => {
  if (!result.success) {
    return throwActionError(result.error)
  }

  return result.data
}
