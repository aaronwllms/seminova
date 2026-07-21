import { Suspense } from 'react'

import { PublicBannerSlotEntry } from '@/components/public-banner-slot-entry'

import { LandingHeader } from './landing-header'

export const MarketingStickyChrome = () => (
  <div className="bg-background/95 sticky top-0 z-50">
    <Suspense fallback={null}>
      <PublicBannerSlotEntry />
    </Suspense>
    <LandingHeader />
  </div>
)
