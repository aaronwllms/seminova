import { isAuthError } from '@supabase/supabase-js'

interface AuthFormError {
  message: string
  code?: string
}

export const extractAuthFormError = (caught: unknown): AuthFormError => {
  const message = caught instanceof Error ? caught.message : 'An error occurred'

  const code =
    isAuthError(caught) && typeof caught.code === 'string'
      ? caught.code
      : undefined

  return { message, code }
}
