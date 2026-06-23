import { SeminovaLogo } from '@/components/seminova-logo'
import { SiteContainer } from '@/components/site-container'
import { SiteNavLinks } from '@/components/site-nav-links'

type SiteHeaderProps = {
  logoHref?: string
  showNav?: boolean
  rightSlot?: React.ReactNode
  mobileNav?: React.ReactNode
}

export const SiteHeader = ({
  logoHref = '/',
  showNav = true,
  rightSlot,
  mobileNav,
}: SiteHeaderProps) => (
  <header className="bg-background/95 sticky top-0 z-50 border-b backdrop-blur">
    <SiteContainer>
      <div className="flex h-16 items-center justify-between gap-4">
        <SeminovaLogo href={logoHref} className="text-foreground" />
        {showNav ? (
          <SiteNavLinks className="hidden flex-1 justify-center md:flex" />
        ) : null}
        {rightSlot ? <div className="hidden md:block">{rightSlot}</div> : null}
        {mobileNav ? <div className="md:hidden">{mobileNav}</div> : null}
      </div>
    </SiteContainer>
  </header>
)
