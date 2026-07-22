import { z } from 'zod'

import { LOG_LEVELS } from '@/types/app-settings'

export const referencePerRowDemoSchema = z.object({
  value: z.enum(LOG_LEVELS),
})

export type ReferencePerRowDemoValues = z.infer<
  typeof referencePerRowDemoSchema
>

export const referencePerSectionDemoSchema = z.object({
  headline: z
    .string()
    .trim()
    .min(1, 'Headline is required.')
    .max(80, 'Headline must be 80 characters or fewer.'),
  detail: z.string().trim().max(100, 'Detail must be 100 characters or fewer.'),
})

export type ReferencePerSectionDemoValues = z.infer<
  typeof referencePerSectionDemoSchema
>
