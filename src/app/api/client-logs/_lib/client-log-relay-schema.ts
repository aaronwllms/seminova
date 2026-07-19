import { z } from 'zod'

import { CLIENT_LOG_KEYS } from '@/config/client-log-registry'
import { LOG_LEVELS } from '@/types/app-settings'

const plainObjectContextSchema = z
  .record(z.string(), z.unknown())
  .refine(
    (value) =>
      Object.getPrototypeOf(value) === Object.prototype ||
      Object.getPrototypeOf(value) === null,
    { message: 'Context must be a plain object' },
  )

export const clientLogRelayBodySchema = z.object({
  key: z.enum(CLIENT_LOG_KEYS),
  level: z.enum(LOG_LEVELS),
  message: z.string(),
  context: plainObjectContextSchema.optional(),
})

export type ClientLogRelayBody = z.infer<typeof clientLogRelayBodySchema>
