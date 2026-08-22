import { cookies } from 'next/headers'

import { PublicBannerSlot } from '@/components/public-banner-slot'
import { BANNER_DISMISSED_PUBLIC_COOKIE } from '@/constants/banner-cookies'
import { getResolvedAppSettings } from '@/utils/app-settings'
import { resolveLiveBannerSlot } from '@/utils/banner-dismiss-cookie'

export type BannerSlotLoadResult = {
  banner: React.ReactNode | null
  pin: boolean
}

export const loadPublicBannerSlot = async (): Promise<BannerSlotLoadResult> => {
  const settings = await getResolvedAppSettings()
  const cookieStore = await cookies()
  const publicBanner = resolveLiveBannerSlot(
    settings.banner_public,
    cookieStore.get(BANNER_DISMISSED_PUBLIC_COOKIE)?.value,
  )

  if (!publicBanner) {
    return { banner: null, pin: false }
  }

  return {
    banner: (
      <PublicBannerSlot
        key={publicBanner.dismissKey}
        config={publicBanner.config}
        dismissKey={publicBanner.dismissKey}
      />
    ),
    pin: publicBanner.config.persistence === 'persistent',
  }
}
