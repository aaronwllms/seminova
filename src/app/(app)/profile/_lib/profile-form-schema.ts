import { z } from 'zod'

export const profileFormSchema = z.object({
  displayName: z
    .string()
    .trim()
    .max(80, 'Display name must be 80 characters or fewer.')
    .nullable(),
  bio: z
    .string()
    .trim()
    .max(500, 'Bio must be 500 characters or fewer.')
    .nullable(),
  avatarUrl: z.string().url('Avatar URL must be a valid URL.').nullable(),
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>

export const profileFormInputSchema = z.object({
  displayName: z
    .string()
    .max(80, 'Display name must be 80 characters or fewer.'),
  bio: z.string().max(500, 'Bio must be 500 characters or fewer.'),
  avatarUrl: z.union([
    z.string().url('Avatar URL must be a valid URL.'),
    z.literal(''),
  ]),
})

export type ProfileFormInputValues = z.infer<typeof profileFormInputSchema>

export const toProfileFormValues = (
  input: ProfileFormInputValues,
): ProfileFormValues => ({
  displayName: input.displayName.trim() || null,
  bio: input.bio.trim() || null,
  avatarUrl: input.avatarUrl === '' ? null : input.avatarUrl,
})

export const toProfileFormInput = (
  values: ProfileFormValues,
): ProfileFormInputValues => ({
  displayName: values.displayName ?? '',
  bio: values.bio ?? '',
  avatarUrl: values.avatarUrl ?? '',
})

export const parseProfileFormInput = (
  raw: unknown,
):
  | { success: true; data: ProfileFormValues }
  | { success: false; message: string } => {
  const result = profileFormSchema.safeParse(raw)

  if (!result.success) {
    const firstIssue = result.error.issues[0]
    return {
      success: false,
      message: firstIssue?.message ?? 'Invalid profile data.',
    }
  }

  return { success: true, data: result.data }
}
