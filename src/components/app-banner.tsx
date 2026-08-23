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
import { SiteContainer } from '@/components/site-container'
import { Button } from '@/components/ui/button'
import type { BannerSettingValue, BannerVariant } from '@/types/banner'
import { cn } from '@/utils/tailwind'

interface AppBannerProps {
  config: BannerSettingValue
  onDismiss?: () => void
  preview?: boolean
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

const VARIANT_DISMISS_BUTTON_CLASSES: Record<BannerVariant, string> = {
  primary: 'hover:bg-primary/25 hover:text-primary dark:hover:bg-primary/25',
  success: 'hover:bg-success/25 hover:text-success dark:hover:bg-success/25',
  warning: 'hover:bg-warning/25 hover:text-warning dark:hover:bg-warning/25',
  destructive:
    'hover:bg-destructive/25 hover:text-destructive dark:hover:bg-destructive/25',
  info: 'hover:bg-info/25 hover:text-info dark:hover:bg-info/25',
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
  onDismiss,
  preview = false,
}: AppBannerProps) => {
  if (!preview && config.mode === 'off') {
    return null
  }

  const Icon = VARIANT_ICONS[config.variant]
  const showDismiss =
    config.persistence === 'dismissible' && (preview || Boolean(onDismiss))

  return (
    <div
      role="status"
      className={cn('w-full border-b', VARIANT_BAR_CLASSES[config.variant])}
    >
      <SiteContainer className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-3 py-2.5">
        <div aria-hidden className="min-w-0" />
        <div className="col-start-2 flex min-w-0 items-center gap-3">
          {config.show_icon ? (
            <span
              className={cn(
                'flex size-6 shrink-0 items-center justify-center rounded-md',
                VARIANT_BADGE_CLASSES[config.variant],
              )}
            >
              <Icon aria-hidden className="text-background size-3.5" />
            </span>
          ) : null}
          <p className="min-w-0 text-sm leading-snug">
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
        </div>
        <div className="col-start-3 flex justify-end">
          {showDismiss ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className={cn(
                'text-muted-foreground shrink-0',
                VARIANT_DISMISS_BUTTON_CLASSES[config.variant],
                preview && 'pointer-events-none',
              )}
              aria-label="Dismiss banner"
              aria-hidden={preview || undefined}
              tabIndex={preview ? -1 : undefined}
              onClick={preview ? undefined : onDismiss}
            >
              <X aria-hidden />
            </Button>
          ) : null}
        </div>
      </SiteContainer>
    </div>
  )
}
