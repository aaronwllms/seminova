'use client'

import { useRouter } from 'next/navigation'

import { BANNER_DISMISSED_AUTHENTICATED_COOKIE } from '@/constants/banner-cookies'
import { createClient } from '@/supabase/client'
import { clearBannerDismissCookie } from '@/utils/banner-dismiss-cookie'

export const useSignOut = () => {
  const router = useRouter()

  return async () => {
    const supabase = createClient()
    await supabase.auth.signOut({ scope: 'local' })
    clearBannerDismissCookie(BANNER_DISMISSED_AUTHENTICATED_COOKIE)
    router.push('/auth/login')
  }
}
