import { isAuthError } from '@supabase/supabase-js'

import type { AppError } from '@/types/app-error'
import { clientLog } from '@/utils/client-logger'
import { mapAuthError, type MapAuthErrorOptions } from '@/utils/map-auth-error'

export { AUTH_ERROR_FALLBACK_MESSAGE } from '@/utils/map-auth-error'

export interface ExtractAuthFormErrorOptions extends MapAuthErrorOptions {
  email?: string
}

export const extractAuthFormError = (
  caught: unknown,
  options?: ExtractAuthFormErrorOptions,
): AppError => {
  const { error, mapped } = mapAuthError(caught, {
    otpExpired: options?.otpExpired,
  })

  if (mapped) {
    return error
  }

  const logContext = options?.email ? { email: options.email } : undefined

  if (isAuthError(caught) && typeof caught.code === 'string') {
    clientLog.error(
      'auth-form-error',
      'Supabase auth error',
      logContext
        ? { ...logContext, supabaseCode: caught.code }
        : { supabaseCode: caught.code },
    )
  } else {
    const message =
      caught instanceof Error ? caught.message : 'An error occurred'

    clientLog.error(
      'auth-form-error',
      'Non-auth error',
      logContext ? { ...logContext, message } : { message },
    )
  }

  return error
}
