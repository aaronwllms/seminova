'use server'

import type { RoleMutationSuccessStatus } from '@/utils/admin-user-mutations'

import {
  runDemoteUserMutation,
  runPromoteUserMutation,
} from './run-role-mutation'
import type { AdminActionError } from '@/app/admin/_lib/assert-admin-caller'

type RoleMutationActionSuccess = {
  success: true
  data: {
    status: RoleMutationSuccessStatus
    email: string
  }
}

export type PromoteUserActionResult =
  | RoleMutationActionSuccess
  | AdminActionError
export type DemoteUserActionResult =
  | RoleMutationActionSuccess
  | AdminActionError

export interface RoleMutationActionInput {
  userId: string
}

export const promoteUserAction = async (
  input: RoleMutationActionInput,
): Promise<PromoteUserActionResult> => runPromoteUserMutation(input.userId)

export const demoteUserAction = async (
  input: RoleMutationActionInput,
): Promise<DemoteUserActionResult> => runDemoteUserMutation(input.userId)
