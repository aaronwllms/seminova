'use client'

import { useRouter } from 'next/navigation'

import { createClient } from '@/supabase/client'

export const useSignOut = () => {
  const router = useRouter()

  return async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }
}
