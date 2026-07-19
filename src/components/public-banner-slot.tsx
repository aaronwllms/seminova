'use client'

import { useState } from 'react'

import { AppBanner } from '@/components/app-banner'
import type { BannerSettingValue } from '@/types/banner'
import { buildBannerDismissStorageKey } from '@/utils/banner-dismiss-hash'
import { isBannerLive } from '@/utils/banner-status'

interface PublicBannerSlotProps {
  config: BannerSettingValue
}

const PublicBannerSlotInner = ({
  config,
  dismissKey,
}: {
  config: BannerSettingValue
  dismissKey: string
}) => {
  const [dismissed, setDismissed] = useState(
    () => window.localStorage.getItem(dismissKey) === '1',
  )

  if (!isBannerLive(config) || dismissed) {
    return null
  }

  const handleDismiss = () => {
    window.localStorage.setItem(dismissKey, '1')
    setDismissed(true)
  }

  return <AppBanner config={config} dismissible onDismiss={handleDismiss} />
}

export const PublicBannerSlot = ({ config }: PublicBannerSlotProps) => {
  const dismissKey = buildBannerDismissStorageKey(
    config.headline,
    config.detail,
  )

  return (
    <PublicBannerSlotInner
      key={dismissKey}
      config={config}
      dismissKey={dismissKey}
    />
  )
}
