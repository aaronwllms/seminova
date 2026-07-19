import type { BannerSettingValue } from '@/types/banner'
import { computeBannerStatus } from '@/utils/banner-status'

export type BannerStatusBadgeTone = 'muted' | 'accent' | 'success'

export const BANNER_STATUS_BADGE_CLASSES: Record<
  BannerStatusBadgeTone,
  string
> = {
  muted: 'bg-muted text-muted-foreground',
  accent: 'bg-accent text-accent-foreground',
  success: 'bg-success/15 text-success',
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const formatBannerDate = (iso: string): string => {
  const date = new Date(iso)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return dateFormatter.format(date)
}

export const formatBannerStatusBadge = (
  config: BannerSettingValue,
  now: Date = new Date(),
): { label: string; tone: BannerStatusBadgeTone } => {
  const status = computeBannerStatus(config, now)

  if (status === 'off') {
    return { label: 'Off', tone: 'muted' }
  }

  if (status === 'scheduled') {
    return {
      label: `Scheduled — starts ${formatBannerDate(config.starts_at!)}`,
      tone: 'accent',
    }
  }

  if (config.expires_at) {
    return {
      label: `Live until ${formatBannerDate(config.expires_at)}`,
      tone: 'success',
    }
  }

  return { label: 'Live', tone: 'success' }
}
