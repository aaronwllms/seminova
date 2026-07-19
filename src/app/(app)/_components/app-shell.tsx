import { AuthenticatedBannerSlot } from '@/components/authenticated-banner-slot'
import { SiteContainer } from '@/components/site-container'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import type { BannerSettingValue } from '@/types/banner'

import { AppHeaderAccountNavSlot } from './app-header-account-nav-slot'

type AppShellProps = {
  children: React.ReactNode
  bannerConfig: BannerSettingValue
}

export const AppShell = ({ children, bannerConfig }: AppShellProps) => (
  <>
    <AuthenticatedBannerSlot config={bannerConfig} />
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
