export const BANNER_MODES = ['off', 'on', 'scheduled'] as const

export type BannerMode = (typeof BANNER_MODES)[number]

export const BANNER_VARIANTS = [
  'primary',
  'success',
  'warning',
  'destructive',
  'info',
] as const

export type BannerVariant = (typeof BANNER_VARIANTS)[number]

export const BANNER_COMPUTED_STATUSES = ['off', 'scheduled', 'live'] as const

export type BannerComputedStatus = (typeof BANNER_COMPUTED_STATUSES)[number]

export interface BannerSettingValue {
  mode: BannerMode
  starts_at: string | null
  expires_at: string | null
  headline: string
  detail: string | null
  variant: BannerVariant
  show_icon: boolean
}

export const DEFAULT_BANNER_SETTING: BannerSettingValue = {
  mode: 'off',
  starts_at: null,
  expires_at: null,
  headline: '',
  detail: null,
  variant: 'primary',
  show_icon: true,
}
