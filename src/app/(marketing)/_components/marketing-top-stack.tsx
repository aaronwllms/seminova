import { Suspense } from 'react'

import { PublicBannerSlotEntry } from '@/components/public-banner-slot-entry'

import { LandingHeader } from './landing-header'

export const MarketingTopStack = () => (
  <>
    <Suspense fallback={null}>
      <PublicBannerSlotEntry />
    </Suspense>
    <LandingHeader />
  </>
)
