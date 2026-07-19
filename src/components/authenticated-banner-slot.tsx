'use client'

import { useState } from 'react'

import { AppBanner } from '@/components/app-banner'
import type { BannerSettingValue } from '@/types/banner'
import { isBannerLive } from '@/utils/banner-status'

interface AuthenticatedBannerSlotProps {
  config: BannerSettingValue
}

export const AuthenticatedBannerSlot = ({
  config,
}: AuthenticatedBannerSlotProps) => {
  const [dismissed, setDismissed] = useState(false)

  if (!isBannerLive(config) || dismissed) {
    return null
  }

  return (
    <AppBanner
      config={config}
      dismissible
      onDismiss={() => setDismissed(true)}
    />
  )
}
