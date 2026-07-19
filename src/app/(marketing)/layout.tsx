import { PublicBannerSlot } from '@/components/public-banner-slot'
import { getResolvedAppSettings } from '@/utils/app-settings'

import { LandingFooter } from './_components/landing-footer'
import { LandingHeader } from './_components/landing-header'

type MarketingLayoutProps = {
  children: React.ReactNode
}

export default async function MarketingLayout({
  children,
}: MarketingLayoutProps) {
  const settings = await getResolvedAppSettings()

  return (
    <>
      <PublicBannerSlot config={settings.banner_public} />
      <LandingHeader />
      {children}
      <LandingFooter />
    </>
  )
}
