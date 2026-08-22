import { loadPublicBannerSlot } from '@/components/public-banner-slot-entry'

import { LandingHeader } from './landing-header'

export const MarketingTopStack = async () => {
  const { banner, pin } = await loadPublicBannerSlot()

  return <LandingHeader banner={banner} pin={pin} />
}
