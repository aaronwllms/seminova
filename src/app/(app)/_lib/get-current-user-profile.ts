import { cache } from 'react'

import { createClient } from '@/supabase/server'
import { requireAuthClaims } from '@/supabase/require-auth'
import { isAdmin, type JwtClaims } from '@/utils/admin'

export type CurrentUserProfile = {
  userId: string
  displayName: string | null
  avatarUrl: string | null
  bio: string | null
  email: string
  isAdmin: boolean
}

export const getCurrentUserProfile = cache(
  async (): Promise<CurrentUserProfile> => {
    const supabase = await createClient()
    const claims = await requireAuthClaims(supabase)

    const email = typeof claims.email === 'string' ? claims.email : ''
    const isAdminUser = isAdmin(claims as JwtClaims)

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
      }
    }

    return {
      userId: claims.sub,
      displayName: profile.display_name,
      avatarUrl: profile.avatar_url,
      bio: profile.bio,
      email,
      isAdmin: isAdminUser,
    }
  },
)
