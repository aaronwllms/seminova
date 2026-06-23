import { cache } from 'react'

import { createClient } from '@/supabase/server'

export type CurrentUserProfile = {
  displayName: string | null
  avatarUrl: string | null
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
      return { displayName: null, avatarUrl: null, email: '' }
    }

    const email = user.email ?? ''

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('[app-shell] Failed to load profile', profileError)
      return { displayName: null, avatarUrl: null, email }
    }

    return {
      displayName: profile.display_name,
      avatarUrl: profile.avatar_url,
      email,
    }
  },
)
