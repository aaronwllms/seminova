'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  getRoleMutationToastMessage,
  type RoleMutationSuccessStatus,
} from '@/utils/admin-role-mutations'
import { showSuccessToast } from '@/utils/app-toast'

import { demoteUserAction, promoteUserAction } from '../actions'
import { adminUsersQueryKeys } from './admin-users-query-keys'
import { unwrapRoleMutationResult } from './unwrap-users-action'

export type RoleMutationInput = {
  type: 'promote' | 'demote'
  userId: string
}

export const useAdminUserRoleMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ type, userId }: RoleMutationInput) => {
      const result =
        type === 'promote'
          ? await promoteUserAction({ userId })
          : await demoteUserAction({ userId })

      return unwrapRoleMutationResult(result)
    },
    onSuccess: (data) => {
      showSuccessToast(
        getRoleMutationToastMessage(data.status as RoleMutationSuccessStatus),
      )
      void queryClient.invalidateQueries({ queryKey: adminUsersQueryKeys.all })
    },
  })
}
