import { z } from 'zod'

export const emailOtpTypeSchema = z.enum([
  'magiclink',
  'recovery',
  'email',
  'signup',
])

export type AppEmailOtpType = z.infer<typeof emailOtpTypeSchema>
