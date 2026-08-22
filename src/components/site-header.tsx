import { SeminovaLogo } from '@/components/seminova-logo'
import { SiteContainer } from '@/components/site-container'
import { SiteHeaderChrome } from '@/components/site-header-chrome'
import { SiteNavLinks } from '@/components/site-nav-links'

type SiteHeaderProps = {
  logoHref?: string
  showNav?: boolean
  rightSlot?: React.ReactNode
  mobileNav?: React.ReactNode
  sticky?: boolean
}

export const SiteHeader = ({
  logoHref = '/',
  showNav = true,
  rightSlot,
  mobileNav,
  sticky = true,
}: SiteHeaderProps) => (
  <SiteHeaderChrome sticky={sticky}>
    <SiteContainer>
      <div className="flex h-14 items-center justify-between gap-4 md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center">
        {/* Intentionally shares the same grid class string inline with site-footer.tsx — F060 constant extraction is deferred. */}
        <SeminovaLogo
          href={logoHref}
          className="text-foreground min-w-0 justify-self-start"
        />
        {showNav ? (
          <SiteNavLinks className="hidden justify-self-center md:flex" />
        ) : (
          <div className="hidden md:block" />
        )}
        {rightSlot ? (
          <div className="hidden max-w-full min-w-0 justify-self-end md:col-start-3 md:block">
            {rightSlot}
          </div>
        ) : null}
        {mobileNav ? <div className="md:hidden">{mobileNav}</div> : null}
      </div>
    </SiteContainer>
  </SiteHeaderChrome>
)
