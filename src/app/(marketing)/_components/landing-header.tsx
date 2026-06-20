import { SeminovaLogo } from '@/components/seminova-logo'

import { LandingAuthButtons } from './landing-auth-buttons'
import { LandingContainer } from './landing-container'
import { LandingMobileNav } from './landing-mobile-nav'
import { LandingNavLinks } from './landing-nav-links'

export const LandingHeader = () => (
  <header className="bg-background/95 sticky top-0 z-50 border-b backdrop-blur">
    <LandingContainer>
      <div className="flex h-16 items-center justify-between gap-4">
        <SeminovaLogo href="/" className="text-foreground" />
        <LandingNavLinks className="hidden flex-1 justify-center md:flex" />
        <div className="hidden md:block">
          <LandingAuthButtons />
        </div>
        <LandingMobileNav className="md:hidden" />
      </div>
    </LandingContainer>
  </header>
)
