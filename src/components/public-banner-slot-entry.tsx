import { cookies } from 'next/headers'

import { PublicBannerSlot } from '@/components/public-banner-slot'
import { BANNER_DISMISSED_PUBLIC_COOKIE } from '@/constants/banner-cookies'
import { getResolvedAppSettings } from '@/utils/app-settings'
import { resolveLiveBannerSlot } from '@/utils/banner-dismiss-cookie'

export const PublicBannerSlotEntry = async () => {
  const settings = await getResolvedAppSettings()
  const cookieStore = await cookies()
  const publicBanner = resolveLiveBannerSlot(
    settings.banner_public,
    cookieStore.get(BANNER_DISMISSED_PUBLIC_COOKIE)?.value,
  )

  if (!publicBanner) {
    return null
  }

  return (
    <PublicBannerSlot
      key={publicBanner.dismissKey}
      config={publicBanner.config}
      dismissKey={publicBanner.dismissKey}
    />
  )
}
