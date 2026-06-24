'use server'

import { revalidatePath } from 'next/cache'

import { PROFILE_PATH } from '@/constants/app-paths'
import { createClient } from '@/supabase/server'
import type { ErrorKind } from '@/types/app-error'

import { parseProfilePartialInput } from './_lib/profile-form-schema'

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

type ProfileActionData = {
  displayName: string | null
  avatarUrl: string | null
  bio: string | null
}

type ProfileActionSuccess = {
  success: true
  data: ProfileActionData
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

  const updatePayload: {
    display_name?: string | null
    bio?: string | null
    avatar_url?: string | null
  } = {}

  if (parsed.data.displayName !== undefined) {
    updatePayload.display_name = parsed.data.displayName
  }

  if (parsed.data.bio !== undefined) {
    updatePayload.bio = parsed.data.bio
  }

  if (parsed.data.avatarUrl !== undefined) {
    updatePayload.avatar_url = parsed.data.avatarUrl
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

  revalidatePath(PROFILE_PATH)

  return {
    success: true,
    data: {
      displayName: profile.display_name,
      avatarUrl: profile.avatar_url,
      bio: profile.bio,
    },
  }
}
