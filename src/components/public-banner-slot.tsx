'use client'

import { useState } from 'react'

import { AppBanner } from '@/components/app-banner'
import { BANNER_DISMISSED_PUBLIC_COOKIE } from '@/constants/banner-cookies'
import type { BannerSettingValue } from '@/types/banner'
import { writeBannerDismissCookie } from '@/utils/banner-dismiss-cookie'

interface PublicBannerSlotProps {
  config: BannerSettingValue
  dismissKey: string
}

export const PublicBannerSlot = ({
  config,
  dismissKey,
}: PublicBannerSlotProps) => {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) {
    return null
  }

  const handleDismiss = () => {
    writeBannerDismissCookie(BANNER_DISMISSED_PUBLIC_COOKIE, dismissKey)
    setDismissed(true)
  }

  return <AppBanner config={config} onDismiss={handleDismiss} />
}
