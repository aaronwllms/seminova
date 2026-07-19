'use client'

import { useState } from 'react'

import { AppBanner } from '@/components/app-banner'
import type { BannerSettingValue } from '@/types/banner'
import { isBannerLive } from '@/utils/banner-status'

interface AuthenticatedBannerSlotProps {
  config: BannerSettingValue
  initialDismissed?: boolean
}

export const AuthenticatedBannerSlot = ({
  config,
  initialDismissed = false,
}: AuthenticatedBannerSlotProps) => {
  const [dismissed, setDismissed] = useState(initialDismissed)

  if (!isBannerLive(config) || dismissed) {
    return null
  }

  const handleDismiss = () => {
    setDismissed(true)
  }

  return <AppBanner config={config} dismissible onDismiss={handleDismiss} />
}
