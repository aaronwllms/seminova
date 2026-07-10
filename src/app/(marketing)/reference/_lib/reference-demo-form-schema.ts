import { z } from 'zod'

export const referenceDemoFormSchema = z.object({
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
})

export type ReferenceDemoFormValues = z.infer<typeof referenceDemoFormSchema>

export const referenceDemoFormInputSchema = z.object({
  displayName: z
    .string()
    .max(80, 'Display name must be 80 characters or fewer.'),
  bio: z.string().max(500, 'Bio must be 500 characters or fewer.'),
})

export type ReferenceDemoFormInputValues = z.infer<
  typeof referenceDemoFormInputSchema
>

export type ReferenceDemoPartialValues = {
  displayName?: string | null
  bio?: string | null
}
