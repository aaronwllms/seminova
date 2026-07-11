import { cache } from 'react'

import { createClient } from '@/supabase/server'
import { getDisplayAuthClaims } from '@/supabase/require-auth'
import { isAdmin } from '@/utils/admin'
import {
  profileFieldsToView,
  type ProfileFields,
  type ProfileFieldsView,
} from '@/types/profile'

export type CurrentUserProfile = ProfileFieldsView & {
  userId: string
  email: string
  isAdmin: boolean
  profileLoadFailed: boolean
}

export const getCurrentUserProfile = cache(
  async (): Promise<CurrentUserProfile> => {
    const claims = await getDisplayAuthClaims()
    const supabase = await createClient()

    const email = typeof claims.email === 'string' ? claims.email : ''
    const isAdminUser = isAdmin(claims)

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('display_name, avatar_url, bio')
      .eq('id', claims.sub)
      .single()

    if (profileError) {
      console.error('[app-shell] Failed to load profile', profileError)
      return {
        userId: claims.sub,
        displayName: null,
        avatarUrl: null,
        bio: null,
        email,
        isAdmin: isAdminUser,
        profileLoadFailed: true,
      }
    }

    return {
      userId: claims.sub,
      ...profileFieldsToView(profile as ProfileFields),
      email,
      isAdmin: isAdminUser,
      profileLoadFailed: false,
    }
  },
)
