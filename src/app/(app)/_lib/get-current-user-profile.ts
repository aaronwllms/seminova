import { cache } from 'react'

import { createClient } from '@/supabase/server'

export type CurrentUserProfile = {
  userId: string
  displayName: string | null
  avatarUrl: string | null
  bio: string | null
  email: string
}

export const getCurrentUserProfile = cache(
  async (): Promise<CurrentUserProfile> => {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error(
        '[app-shell] No authenticated user in app layout',
        userError,
      )
      return {
        userId: '',
        displayName: null,
        avatarUrl: null,
        bio: null,
        email: '',
      }
    }

    const email = user.email ?? ''

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('display_name, avatar_url, bio')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('[app-shell] Failed to load profile', profileError)
      return {
        userId: user.id,
        displayName: null,
        avatarUrl: null,
        bio: null,
        email,
      }
    }

    return {
      userId: user.id,
      displayName: profile.display_name,
      avatarUrl: profile.avatar_url,
      bio: profile.bio,
      email,
    }
  },
)
