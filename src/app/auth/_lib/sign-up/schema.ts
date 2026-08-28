import { z } from 'zod'

import { MIN_PASSWORD_LENGTH } from '@/constants/auth'

export const signUpWithPasswordInputSchema = z.object({
  email: z.email({ error: 'Please enter a valid email address.' }),
  password: z
    .string()
    .min(
      MIN_PASSWORD_LENGTH,
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    ),
})

export type SignUpWithPasswordInput = z.infer<
  typeof signUpWithPasswordInputSchema
>

export const parseSignUpWithPasswordInput = (
  raw: unknown,
):
  | { success: true; data: SignUpWithPasswordInput }
  | { success: false; message: string } => {
  const result = signUpWithPasswordInputSchema.safeParse(raw)

  if (!result.success) {
    const firstIssue = result.error.issues[0]
    return {
      success: false,
      message: firstIssue?.message ?? 'Invalid sign-up details.',
    }
  }

  return { success: true, data: result.data }
}
