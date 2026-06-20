import { isAuthError } from '@supabase/supabase-js'

import type { AppError } from '@/types/app-error'

export const extractAuthFormError = (caught: unknown): AppError => {
  const message = caught instanceof Error ? caught.message : 'An error occurred'

  if (isAuthError(caught) && typeof caught.code === 'string') {
    return {
      message,
      code: caught.code,
      kind: 'operational',
    }
  }

  return {
    message,
    kind: 'fault',
  }
}
