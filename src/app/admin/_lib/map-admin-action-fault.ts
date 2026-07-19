import type { UsersActionError } from '@/app/admin/users/_lib/assert-admin-caller'
import { appLog } from '@/utils/app-logger'

export const mapAdminActionFault = (
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
