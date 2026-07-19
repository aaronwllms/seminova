import { connection } from 'next/server'

import { AuthenticatedBannerSlot } from '@/components/authenticated-banner-slot'
import { getResolvedAppSettings } from '@/utils/app-settings'
import { resolveLiveBannerSlot } from '@/utils/banner-dismiss-cookie'

export const AuthenticatedBannerSlotEntry = async () => {
  await connection()
  const settings = await getResolvedAppSettings()
  const authenticatedBanner = resolveLiveBannerSlot(
    settings.banner_authenticated,
    undefined,
  )

  if (!authenticatedBanner) {
    return null
  }

  return (
    <AuthenticatedBannerSlot
      key={authenticatedBanner.dismissKey}
      config={authenticatedBanner.config}
    />
  )
}
