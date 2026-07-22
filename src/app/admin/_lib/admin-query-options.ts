import { isAppError } from '@/utils/is-app-error'

export const ADMIN_ACTION_QUERY_RETRY_DELAY = 0

export const adminActionQueryRetry = (
  failureCount: number,
  error: unknown,
): boolean => isAppError(error) && error.kind === 'fault' && failureCount < 1
