import { appLog } from '@/utils/app-logger'

import type { UsersActionError } from './assert-admin-caller'

export const mapUsersActionFault = (
  logTag: string,
  logMessage: string,
  userMessage: string,
  caught: unknown,
): UsersActionError => {
  appLog.error(logTag, logMessage, caught)

  return {
    success: false,
    error: {
      message: userMessage,
      code: 'INTERNAL_ERROR',
      kind: 'fault',
    },
  }
}
