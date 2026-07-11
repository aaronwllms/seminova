'use server'

import { revalidatePath } from 'next/cache'

import {
  AVATAR_BUCKET,
  buildAvatarStoragePath,
} from '@/constants/storage-paths'
import { createClient } from '@/supabase/server'
import type { ErrorKind } from '@/types/app-error'
import {
  profileFieldsToView,
  profilePartialToUpdate,
  type ProfileFields,
  type ProfileFieldsView,
  type ProfileUpdate,
} from '@/types/profile'
import {
  extractAvatarCacheBust,
  isOwnedAvatarStorageUrl,
  withAvatarCacheBust,
} from '@/utils/avatar-cache-bust'

import { parseProfilePartialInput } from './profile-form-schema'

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
    console.error('[profile-update] Failed to update profile', updateError)

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
    try {
      const { error: deleteError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .remove([buildAvatarStoragePath(user.id)])

      if (deleteError) {
        console.warn(
          '[profile-update] Avatar storage delete failed',
          deleteError,
        )
      }
    } catch (error) {
      console.warn('[profile-update] Avatar storage delete failed', error)
    }
  }

  revalidatePath('/(app)', 'layout')

  return {
    success: true,
    data: profileFieldsToView(profile as ProfileFields),
  }
}
