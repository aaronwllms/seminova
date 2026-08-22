'use client'

import { useState } from 'react'

import { AppBanner } from '@/components/app-banner'
import { BANNER_DISMISSED_AUTHENTICATED_COOKIE } from '@/constants/banner-cookies'
import type { BannerSettingValue } from '@/types/banner'
import { writeBannerDismissCookie } from '@/utils/banner-dismiss-cookie'
import { isBannerLive } from '@/utils/banner-status'

interface AuthenticatedBannerSlotProps {
  config: BannerSettingValue
  dismissKey: string
}

export const AuthenticatedBannerSlot = ({
  config,
  dismissKey,
}: AuthenticatedBannerSlotProps) => {
  const [dismissed, setDismissed] = useState(false)

  if (!isBannerLive(config) || dismissed) {
    return null
  }

  const handleDismiss = () => {
    writeBannerDismissCookie(BANNER_DISMISSED_AUTHENTICATED_COOKIE, dismissKey)
    setDismissed(true)
  }

  return <AppBanner config={config} onDismiss={handleDismiss} />
}
