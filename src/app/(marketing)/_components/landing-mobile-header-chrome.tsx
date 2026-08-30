import { Suspense } from 'react'

import { AppHeaderAccountNav } from '@/app/(app)/_components/app-header-account-nav'
import { AppNavUserSkeleton } from '@/app/(app)/_components/app-nav-user-skeleton'
import { LandingAuthButtons } from '@/app/(marketing)/_components/landing-auth-buttons'
import { hasServerAuthSession } from '@/supabase/require-auth'

import { LandingMobileNav } from './landing-mobile-nav'

export const LandingMobileHeaderChrome = async () => {
  const isAuthenticated = await hasServerAuthSession()

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <LandingMobileNav />
        <Suspense fallback={<AppNavUserSkeleton />}>
          <AppHeaderAccountNav showOpenApp />
        </Suspense>
      </div>
    )
  }

  return <LandingMobileNav authSlot={<LandingAuthButtons layout="stack" />} />
}
