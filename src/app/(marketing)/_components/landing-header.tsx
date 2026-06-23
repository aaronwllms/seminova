import { SiteHeader } from '@/components/site-header'

import { LandingAuthButtons } from './landing-auth-buttons'
import { LandingMobileNav } from './landing-mobile-nav'

export const LandingHeader = () => (
  <SiteHeader
    logoHref="/"
    rightSlot={<LandingAuthButtons />}
    mobileNav={<LandingMobileNav />}
  />
)
