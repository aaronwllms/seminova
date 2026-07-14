import { SiteContainer } from '@/components/site-container'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

import { AppHeaderAccountNavSlot } from './app-header-account-nav-slot'

type AppShellProps = {
  children: React.ReactNode
}

export const AppShell = ({ children }: AppShellProps) => (
  <>
    <SiteHeader
      showNav={false}
      rightSlot={<AppHeaderAccountNavSlot />}
      mobileNav={<AppHeaderAccountNavSlot />}
    />
    <main id="main-content" className="flex-1 py-8">
      <SiteContainer>{children}</SiteContainer>
    </main>
    <SiteFooter showNav={false} />
  </>
)
