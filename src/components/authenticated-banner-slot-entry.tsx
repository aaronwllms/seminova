import { cookies } from 'next/headers'
import { connection } from 'next/server'

import { AuthenticatedBannerSlot } from '@/components/authenticated-banner-slot'
import { BANNER_DISMISSED_AUTHENTICATED_COOKIE } from '@/constants/banner-cookies'
import { getResolvedAppSettings } from '@/utils/app-settings'
import { resolveLiveBannerSlot } from '@/utils/banner-dismiss-cookie'

export const AuthenticatedBannerSlotEntry = async () => {
  await connection()
  const settings = await getResolvedAppSettings()
  const cookieStore = await cookies()
  const authenticatedBanner = resolveLiveBannerSlot(
    settings.banner_authenticated,
    cookieStore.get(BANNER_DISMISSED_AUTHENTICATED_COOKIE)?.value,
  )

  if (!authenticatedBanner) {
    return null
  }

  return (
    <AuthenticatedBannerSlot
      key={authenticatedBanner.dismissKey}
      config={authenticatedBanner.config}
      dismissKey={authenticatedBanner.dismissKey}
    />
  )
}
