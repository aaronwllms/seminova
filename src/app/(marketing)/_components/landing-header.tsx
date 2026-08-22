import { Suspense } from 'react'

import { AppNavUserSkeleton } from '@/app/(app)/_components/app-nav-user-skeleton'
import { SiteHeader } from '@/components/site-header'

import { LandingAuthSlot } from './landing-auth-slot'
import { LandingMobileHeaderChrome } from './landing-mobile-header-chrome'
import { LandingMobileHeaderChromeFallback } from './landing-mobile-header-chrome-fallback'

const desktopAuthSlot = (
  <Suspense fallback={<AppNavUserSkeleton />}>
    <LandingAuthSlot />
  </Suspense>
)

const mobileNav = (
  <Suspense fallback={<LandingMobileHeaderChromeFallback />}>
    <LandingMobileHeaderChrome />
  </Suspense>
)

type LandingHeaderProps = {
  banner: React.ReactNode | null
  pin: boolean
}

export const LandingHeader = ({ banner, pin }: LandingHeaderProps) => (
  <SiteHeader
    logoHref="/"
    rightSlot={desktopAuthSlot}
    mobileNav={mobileNav}
    banner={banner ?? undefined}
    {...(pin ? { pin: true as const } : {})}
  />
)
