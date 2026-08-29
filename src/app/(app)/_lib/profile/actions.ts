'use server'

import {
  AVATAR_BUCKET,
  buildAvatarStoragePath,
} from '@/constants/storage-paths'
import { createClient } from '@/supabase/server'
import { createServiceClient } from '@/supabase/service'
import type { AppError, ErrorKind } from '@/types/app-error'
import {
  profileFieldsToView,
  profilePartialToUpdate,
  type ProfileFields,
  type ProfileFieldsView,
  type ProfileUpdate,
} from '@/types/profile'
import { getPostAuthRedirectPath } from '@/utils/admin'
import { appLog } from '@/utils/app-logger'
import {
  extractAvatarCacheBust,
  isOwnedAvatarStorageUrl,
  withAvatarCacheBust,
} from '@/utils/avatar-cache-bust'
import { mapAuthError } from '@/utils/map-auth-error'
import { removeAvatarStorage } from '@/utils/remove-avatar-storage'

import { parseSetFirstPasswordInput } from './first-password-schema'
import { parseProfilePartialInput } from './profile-form-schema'
import { revalidateProfileDialogHosts } from './revalidate-profile-dialog-hosts'

type ProfileActionErrorCode =
  | 'UNAUTHORIZED'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR'

type ProfileActionError = {
  success: false
  error: {
    message: string
    code: ProfileActionErrorCode
    kind: ErrorKind
  }
}

type ProfileActionSuccess = {
  success: true
  data: ProfileFieldsView
}

export type UpdateProfileActionResult =
  | ProfileActionSuccess
  | ProfileActionError

export const updateProfileAction = async (
  input: unknown,
): Promise<UpdateProfileActionResult> => {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      success: false,
      error: {
        message: 'You must be signed in to update your profile.',
        code: 'UNAUTHORIZED',
        kind: 'operational',
      },
    }
  }

  const parsed = parseProfilePartialInput(input)

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

  const updatePayload: Pick<
    ProfileUpdate,
    'display_name' | 'avatar_url' | 'bio'
  > = profilePartialToUpdate({
    displayName: parsed.data.displayName,
    bio: parsed.data.bio,
  })

  if (parsed.data.avatarUrl !== undefined) {
    if (parsed.data.avatarUrl === null) {
      updatePayload.avatar_url = null
    } else if (isOwnedAvatarStorageUrl(parsed.data.avatarUrl, user.id)) {
      const { data } = supabase.storage
        .from(AVATAR_BUCKET)
        .getPublicUrl(buildAvatarStoragePath(user.id))

      const version =
        extractAvatarCacheBust(parsed.data.avatarUrl) ?? Date.now()
      updatePayload.avatar_url = withAvatarCacheBust(data.publicUrl, version)
    } else {
      return {
        success: false,
        error: {
          message: 'Could not save your profile photo. Please try again.',
          code: 'VALIDATION_ERROR',
          kind: 'operational',
        },
      }
    }
  }

  const { data: profile, error: updateError } = await supabase
    .from('profiles')
    .update(updatePayload)
    .eq('id', user.id)
    .select('display_name, avatar_url, bio')
    .single()

  if (updateError) {
    appLog.error('profile-update', 'Failed to update profile', updateError)

    return {
      success: false,
      error: {
        message: 'Could not save your profile. Please try again.',
        code: 'INTERNAL_ERROR',
        kind: 'fault',
      },
    }
  }

  if (parsed.data.avatarUrl === null) {
    const avatarDeleteResult = await removeAvatarStorage(supabase, user.id)

    if (avatarDeleteResult.ok) {
      appLog.debug('profile-update', 'Avatar storage deleted', {
        userId: user.id,
      })
    } else {
      appLog.warn(
        'profile-update',
        'Avatar storage delete failed',
        avatarDeleteResult.error,
      )
      appLog.debug(
        'profile-update',
        'Profile updated; avatar storage delete failed without blocking success',
        { storageDeleteOk: false },
      )
    }
  }

  revalidateProfileDialogHosts()

  return {
    success: true,
    data: profileFieldsToView(profile as ProfileFields),
  }
}

type PasswordActionErrorCode =
  | 'UNAUTHORIZED'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR'

type PasswordActionError = {
  success: false
  error: {
    message: string
    code: PasswordActionErrorCode
    kind: ErrorKind
  }
}

type PasswordActionSuccess = {
  success: true
}

export type SetFirstPasswordActionResult =
  | PasswordActionSuccess
  | PasswordActionError

export const setFirstPasswordAction = async (
  input: unknown,
): Promise<SetFirstPasswordActionResult> => {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      success: false,
      error: {
        message: 'You must be signed in to set your password.',
        code: 'UNAUTHORIZED',
        kind: 'operational',
      },
    }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('has_password')
    .eq('id', user.id)
    .single()

  if (profileError) {
    appLog.error(
      'set-first-password',
      'Failed to read has_password',
      profileError,
    )
    return {
      success: false,
      error: {
        message: 'Could not set your password. Please try again.',
        code: 'INTERNAL_ERROR',
        kind: 'fault',
      },
    }
  }

  if (profile.has_password) {
    return {
      success: false,
      error: {
        message:
          'Your account already has a password. Use Change Password to update it.',
        code: 'VALIDATION_ERROR',
        kind: 'operational',
      },
    }
  }

  const parsed = parseSetFirstPasswordInput(input)

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

  const serviceClient = createServiceClient()

  const { error: flagError } = await serviceClient
    .from('profiles')
    .update({ has_password: true })
    .eq('id', user.id)

  if (flagError) {
    appLog.error(
      'set-first-password',
      'Failed to set has_password flag',
      flagError,
    )
    return {
      success: false,
      error: {
        message: 'Could not set your password. Please try again.',
        code: 'INTERNAL_ERROR',
        kind: 'fault',
      },
    }
  }

  const { error: passwordError } =
    await serviceClient.auth.admin.updateUserById(user.id, {
      password: parsed.data.password,
    })

  if (passwordError) {
    appLog.error(
      'set-first-password',
      'Failed to update password after flag write',
      passwordError,
    )
    return {
      success: false,
      error: {
        message: 'Could not set your password. Please try again.',
        code: 'INTERNAL_ERROR',
        kind: 'fault',
      },
    }
  }

  revalidateProfileDialogHosts()

  return { success: true }
}

type RecoveryPasswordActionError = {
  success: false
  error: AppError
}

type RecoveryPasswordActionSuccess = {
  success: true
  data: {
    redirectTo: ReturnType<typeof getPostAuthRedirectPath>
  }
}

export type CompleteRecoveryPasswordActionResult =
  | RecoveryPasswordActionSuccess
  | RecoveryPasswordActionError

export const completeRecoveryPasswordAction = async (
  input: unknown,
): Promise<CompleteRecoveryPasswordActionResult> => {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      success: false,
      error: {
        message: 'You must be signed in to reset your password.',
        code: 'UNAUTHORIZED',
        kind: 'operational',
      },
    }
  }

  const parsed = parseSetFirstPasswordInput(input)

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

  const serviceClient = createServiceClient()

  const { error: flagError } = await serviceClient
    .from('profiles')
    .update({ has_password: true })
    .eq('id', user.id)

  if (flagError) {
    appLog.error(
      'complete-recovery-password',
      'Failed to set has_password flag',
      flagError,
    )
    return {
      success: false,
      error: {
        message: 'Could not update your password. Please try again.',
        code: 'INTERNAL_ERROR',
        kind: 'fault',
      },
    }
  }

  const { error: passwordError } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })

  if (passwordError) {
    const { error: mappedError, mapped } = mapAuthError(passwordError)

    if (!mapped || mappedError.kind === 'fault') {
      appLog.error(
        'complete-recovery-password',
        'Failed to update password after flag write',
        passwordError,
      )
    }

    return { success: false, error: mappedError }
  }

  revalidateProfileDialogHosts()

  return {
    success: true,
    data: { redirectTo: getPostAuthRedirectPath(user.app_metadata) },
  }
}
