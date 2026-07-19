import { z } from 'zod'

import { BANNER_MODES, BANNER_VARIANTS } from '@/types/banner'

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
