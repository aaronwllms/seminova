import { Suspense } from 'react'

import { SiteHeader } from '@/components/site-header'

import { LandingAuthButtons } from './landing-auth-buttons'
import { LandingAuthSlot } from './landing-auth-slot'
import { LandingMobileNav } from './landing-mobile-nav'

const desktopAuthSlot = (
  <Suspense fallback={<LandingAuthButtons />}>
    <LandingAuthSlot />
  </Suspense>
)

const mobileAuthSlot = (
  <Suspense fallback={<LandingAuthButtons layout="stack" />}>
    <LandingAuthSlot layout="stack" />
  </Suspense>
)

export const LandingHeader = () => (
  <SiteHeader
    logoHref="/"
    rightSlot={desktopAuthSlot}
    mobileNav={<LandingMobileNav authSlot={mobileAuthSlot} />}
  />
)
