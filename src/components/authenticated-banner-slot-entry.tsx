import { cookies } from 'next/headers'
import { connection } from 'next/server'

import { AuthenticatedBannerSlot } from '@/components/authenticated-banner-slot'
import { BANNER_DISMISSED_AUTHENTICATED_COOKIE } from '@/constants/banner-cookies'
import { getResolvedAppSettings } from '@/utils/app-settings'
import { resolveLiveBannerSlot } from '@/utils/banner-dismiss-cookie'

import type { BannerSlotLoadResult } from '@/components/public-banner-slot-entry'

export const loadAuthenticatedBannerSlot =
  async (): Promise<BannerSlotLoadResult> => {
    await connection()
    const settings = await getResolvedAppSettings()
    const cookieStore = await cookies()
    const authenticatedBanner = resolveLiveBannerSlot(
      settings.banner_authenticated,
      cookieStore.get(BANNER_DISMISSED_AUTHENTICATED_COOKIE)?.value,
    )

    if (!authenticatedBanner) {
      return { banner: null, pin: false }
    }

    return {
      banner: (
        <AuthenticatedBannerSlot
          key={authenticatedBanner.dismissKey}
          config={authenticatedBanner.config}
          dismissKey={authenticatedBanner.dismissKey}
        />
      ),
      pin: authenticatedBanner.config.persistence === 'persistent',
    }
  }
