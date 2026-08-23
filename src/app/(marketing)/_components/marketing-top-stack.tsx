import { Suspense } from 'react'

import { loadPublicBannerSlot } from '@/components/public-banner-slot-entry'

import { LandingHeader } from './landing-header'

const ResolvedMarketingTopStack = async () => {
  const { banner, pin } = await loadPublicBannerSlot()

  return <LandingHeader banner={banner} pin={pin} />
}

export const MarketingTopStack = () => (
  <Suspense fallback={<LandingHeader banner={null} pin={false} />}>
    <ResolvedMarketingTopStack />
  </Suspense>
)
