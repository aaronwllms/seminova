import { Suspense } from 'react'

import { PublicBannerSlotEntry } from '@/components/public-banner-slot-entry'

import { LandingFooter } from './_components/landing-footer'
import { LandingHeader } from './_components/landing-header'

type MarketingLayoutProps = {
  children: React.ReactNode
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <>
      <Suspense fallback={null}>
        <PublicBannerSlotEntry />
      </Suspense>
      <LandingHeader />
      {children}
      <LandingFooter />
    </>
  )
}
