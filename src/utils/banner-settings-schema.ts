import { z } from 'zod'

import {
  BANNER_MODES,
  BANNER_PERSISTENCES,
  BANNER_VARIANTS,
} from '@/types/banner'
import type { BannerSettingValue } from '@/types/banner'
import {
  datetimeLocalToIso,
  isoToDatetimeLocalValue,
} from '@/utils/banner-datetime-local'

const isoDatetimeSchema = z.string().datetime({
  message: 'Must be a valid ISO datetime',
})

export const bannerSettingValueSchema = z
  .object({
    mode: z.enum(BANNER_MODES),
    starts_at: isoDatetimeSchema.nullable(),
    expires_at: isoDatetimeSchema.nullable(),
    headline: z.string().max(80, 'Headline must be 80 characters or fewer'),
    detail: z
      .string()
      .max(100, 'Detail must be 100 characters or fewer')
      .nullable(),
    variant: z.enum(BANNER_VARIANTS),
    show_icon: z.boolean(),
    persistence: z.enum(BANNER_PERSISTENCES).default('dismissible'),
  })
  .superRefine((value, ctx) => {
    if (value.mode === 'scheduled' && !value.expires_at) {
      ctx.addIssue({
        code: 'custom',
        message: 'Scheduled banners require an end date',
        path: ['expires_at'],
      })
    }
  })

export const parseBannerSettingValue = (raw: unknown) =>
  bannerSettingValueSchema.safeParse(raw)

export const bannerSettingFormSchema = z
  .object({
    mode: z.enum(BANNER_MODES),
    starts_at_local: z.string(),
    expires_at_local: z.string(),
    headline: z.string().max(80, 'Headline must be 80 characters or fewer'),
    detail: z.string().max(100, 'Detail must be 100 characters or fewer'),
    variant: z.enum(BANNER_VARIANTS),
    show_icon: z.boolean(),
    persistence: z.enum(BANNER_PERSISTENCES),
  })
  .superRefine((value, ctx) => {
    if (value.mode === 'scheduled' && !value.expires_at_local.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Scheduled banners require an end date',
        path: ['expires_at_local'],
      })
    }
  })

export type BannerSettingFormValues = z.infer<typeof bannerSettingFormSchema>

export const bannerValueToFormValues = (
  value: BannerSettingValue,
): BannerSettingFormValues => ({
  mode: value.mode,
  starts_at_local: isoToDatetimeLocalValue(value.starts_at),
  expires_at_local: isoToDatetimeLocalValue(value.expires_at),
  headline: value.headline,
  detail: value.detail ?? '',
  variant: value.variant,
  show_icon: value.show_icon,
  persistence: value.persistence,
})

export const formValuesToBannerValue = (
  form: BannerSettingFormValues,
): BannerSettingValue => {
  const isScheduled = form.mode === 'scheduled'

  return {
    mode: form.mode,
    starts_at: isScheduled ? datetimeLocalToIso(form.starts_at_local) : null,
    expires_at: isScheduled ? datetimeLocalToIso(form.expires_at_local) : null,
    headline: form.headline,
    detail: form.detail.trim() ? form.detail : null,
    variant: form.variant,
    show_icon: form.show_icon,
    persistence: form.persistence,
  }
}

export const bannerSettingValuesEqual = (
  left: BannerSettingValue,
  right: BannerSettingValue,
): boolean =>
  left.mode === right.mode &&
  left.starts_at === right.starts_at &&
  left.expires_at === right.expires_at &&
  left.headline === right.headline &&
  left.detail === right.detail &&
  left.variant === right.variant &&
  left.show_icon === right.show_icon &&
  left.persistence === right.persistence
