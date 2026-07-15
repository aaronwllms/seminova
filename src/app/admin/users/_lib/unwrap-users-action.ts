import type {
  DemoteUserActionResult,
  ListUsersActionResult,
  PromoteUserActionResult,
  BanUserActionResult,
  UnbanUserActionResult,
} from '../actions'
import type { AppError } from '@/types/app-error'

type ListUsersData = Extract<ListUsersActionResult, { success: true }>['data']

type RoleMutationData = Extract<
  PromoteUserActionResult,
  { success: true }
>['data']

type BanMutationData = Extract<BanUserActionResult, { success: true }>['data']

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

export const unwrapRoleMutationResult = (
  result: PromoteUserActionResult | DemoteUserActionResult,
): RoleMutationData => {
  if (!result.success) {
    return throwActionError(result.error)
  }

  return result.data
}

export const unwrapBanMutationResult = (
  result: BanUserActionResult | UnbanUserActionResult,
): BanMutationData => {
  if (!result.success) {
    return throwActionError(result.error)
  }

  return result.data
}
