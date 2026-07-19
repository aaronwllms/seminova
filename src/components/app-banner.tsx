'use client'

import {
  AlertCircle,
  AlertTriangle,
  Check,
  Info,
  Megaphone,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { BannerMessage } from '@/components/banner-message'
import { Button } from '@/components/ui/button'
import type { BannerSettingValue, BannerVariant } from '@/types/banner'
import { computeBannerStatus } from '@/utils/banner-status'
import { cn } from '@/utils/tailwind'

interface AppBannerProps {
  config: BannerSettingValue
  dismissible?: boolean
  onDismiss?: () => void
}

const VARIANT_BAR_CLASSES: Record<BannerVariant, string> = {
  primary: 'border-primary/30 bg-primary/15',
  success: 'border-success/30 bg-success/15',
  warning: 'border-warning/30 bg-warning/15',
  destructive: 'border-destructive/30 bg-destructive/15',
  info: 'border-info/30 bg-info/15',
}

const VARIANT_BADGE_CLASSES: Record<BannerVariant, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
  info: 'bg-info',
}

const VARIANT_ICON_CLASSES: Record<BannerVariant, string> = {
  primary: 'text-primary/15',
  success: 'text-success/15',
  warning: 'text-warning/15',
  destructive: 'text-destructive/15',
  info: 'text-info/15',
}

const VARIANT_ICONS: Record<BannerVariant, LucideIcon> = {
  primary: Megaphone,
  success: Check,
  warning: AlertTriangle,
  destructive: AlertCircle,
  info: Info,
}

export const AppBanner = ({
  config,
  dismissible = false,
  onDismiss,
}: AppBannerProps) => {
  if (computeBannerStatus(config) !== 'live') {
    return null
  }

  const Icon = VARIANT_ICONS[config.variant]
  const showDismiss = dismissible && Boolean(onDismiss)

  return (
    <div
      role="status"
      className={cn(
        'flex w-full items-center gap-3 border-b px-4 py-2.5',
        VARIANT_BAR_CLASSES[config.variant],
      )}
    >
      {config.show_icon ? (
        <span
          className={cn(
            'flex size-6 shrink-0 items-center justify-center rounded-md',
            VARIANT_BADGE_CLASSES[config.variant],
          )}
        >
          <Icon
            aria-hidden
            className={cn('size-3.5', VARIANT_ICON_CLASSES[config.variant])}
          />
        </span>
      ) : null}
      <p className="min-w-0 flex-1 text-sm leading-snug">
        <span className="text-foreground">
          <BannerMessage message={config.headline} />
        </span>
        {config.detail ? (
          <>
            <span className="text-muted-foreground"> · </span>
            <span className="text-muted-foreground">
              <BannerMessage
                message={config.detail}
                linkClassName="text-muted-foreground"
              />
            </span>
          </>
        ) : null}
      </p>
      {showDismiss ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="text-muted-foreground shrink-0"
          aria-label="Dismiss banner"
          onClick={onDismiss}
        >
          <X aria-hidden />
        </Button>
      ) : null}
    </div>
  )
}
