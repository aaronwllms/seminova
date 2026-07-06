import type { UsersActionError } from './assert-admin-caller'

export const mapUsersActionFault = (
  logTag: string,
  userMessage: string,
  caught: unknown,
): UsersActionError => {
  console.error(logTag, caught)

  return {
    success: false,
    error: {
      message: userMessage,
      code: 'INTERNAL_ERROR',
      kind: 'fault',
    },
  }
}
