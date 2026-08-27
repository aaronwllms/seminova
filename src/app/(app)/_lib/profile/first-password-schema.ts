import { z } from 'zod'

import { MIN_PASSWORD_LENGTH } from '@/constants/auth'

export const setFirstPasswordInputSchema = z.object({
  password: z
    .string()
    .min(
      MIN_PASSWORD_LENGTH,
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    ),
})

export type SetFirstPasswordInput = z.infer<typeof setFirstPasswordInputSchema>

export const parseSetFirstPasswordInput = (
  raw: unknown,
):
  | { success: true; data: SetFirstPasswordInput }
  | { success: false; message: string } => {
  const result = setFirstPasswordInputSchema.safeParse(raw)

  if (!result.success) {
    const firstIssue = result.error.issues[0]
    return {
      success: false,
      message: firstIssue?.message ?? 'Invalid password.',
    }
  }

  return { success: true, data: result.data }
}
