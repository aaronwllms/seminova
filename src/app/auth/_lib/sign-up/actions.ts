'use server'

import { APP_HOME } from '@/constants/app-paths'
import { createClient } from '@/supabase/server'
import { createServiceClient } from '@/supabase/service'
import type { AppError } from '@/types/app-error'
import { appLog } from '@/utils/app-logger'
import { mapAuthError } from '@/utils/map-auth-error'
import { getSiteUrl } from '@/utils/site-url'

import { parseSignUpWithPasswordInput } from './schema'

const SIGN_UP_STAMP_FAILURE_MESSAGE =
  "Your account was created, but we couldn't finish setup. Please contact support rather than signing up again."

type SignUpActionError = {
  success: false
  error: AppError
}

type SignUpActionSuccess = {
  success: true
}

export type SignUpWithPasswordActionResult =
  | SignUpActionSuccess
  | SignUpActionError

export const signUpWithPasswordAction = async (
  input: unknown,
): Promise<SignUpWithPasswordActionResult> => {
  const parsed = parseSignUpWithPasswordInput(input)

  if (!parsed.success) {
    return {
      success: false,
      error: {
        message: parsed.message,
        code: 'VALIDATION_ERROR',
        kind: 'operational',
      },
    }
  }

  const supabase = await createClient()
  const emailRedirectTo = `${getSiteUrl().origin}${APP_HOME}`

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { emailRedirectTo },
  })

  if (error) {
    const { error: mappedError, mapped } = mapAuthError(error)

    if (!mapped) {
      appLog.error('sign-up', 'Supabase auth error', error)
    }

    return { success: false, error: mappedError }
  }

  if (!data.user || (data.user.identities?.length ?? 0) === 0) {
    return { success: true }
  }

  const serviceClient = createServiceClient()
  const { error: stampError } = await serviceClient
    .from('profiles')
    .update({ has_password: true })
    .eq('id', data.user.id)

  if (stampError) {
    appLog.error('sign-up', 'Failed to stamp has_password after signUp', {
      userId: data.user.id,
      stampError,
    })

    return {
      success: false,
      error: {
        message: SIGN_UP_STAMP_FAILURE_MESSAGE,
        code: 'INTERNAL_ERROR',
        kind: 'fault',
      },
    }
  }

  return { success: true }
}
