'use server'

import type { RoleMutationSuccessStatus } from '@/utils/admin-user-mutations'

import {
  runDemoteUserMutation,
  runPromoteUserMutation,
} from './run-role-mutation'
import type { UsersActionError } from './assert-admin-caller'

type RoleMutationActionSuccess = {
  success: true
  data: {
    status: RoleMutationSuccessStatus
    email: string
  }
}

export type PromoteUserActionResult =
  | RoleMutationActionSuccess
  | UsersActionError
export type DemoteUserActionResult =
  | RoleMutationActionSuccess
  | UsersActionError

export interface RoleMutationActionInput {
  userId: string
}

export const promoteUserAction = async (
  input: RoleMutationActionInput,
): Promise<PromoteUserActionResult> => runPromoteUserMutation(input.userId)

export const demoteUserAction = async (
  input: RoleMutationActionInput,
): Promise<DemoteUserActionResult> => runDemoteUserMutation(input.userId)
