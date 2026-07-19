import { cookies } from 'next/headers'

import { PublicBannerSlot } from '@/components/public-banner-slot'
import { BANNER_DISMISSED_PUBLIC_COOKIE } from '@/constants/banner-cookies'
import { getResolvedAppSettings } from '@/utils/app-settings'
import { resolveLiveBannerSlot } from '@/utils/banner-dismiss-cookie'

import { LandingFooter } from './_components/landing-footer'
import { LandingHeader } from './_components/landing-header'

type MarketingLayoutProps = {
  children: React.ReactNode
}

export default async function MarketingLayout({
  children,
}: MarketingLayoutProps) {
  const settings = await getResolvedAppSettings()
  const cookieStore = await cookies()
  const publicBanner = resolveLiveBannerSlot(
    settings.banner_public,
    cookieStore.get(BANNER_DISMISSED_PUBLIC_COOKIE)?.value,
  )

  return (
    <>
      {publicBanner ? (
        <PublicBannerSlot
          key={publicBanner.dismissKey}
          config={publicBanner.config}
          dismissKey={publicBanner.dismissKey}
        />
      ) : null}
      <LandingHeader />
      {children}
      <LandingFooter />
    </>
  )
}
