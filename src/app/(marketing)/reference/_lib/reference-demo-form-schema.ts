import { z } from 'zod'

export const referenceDemoFormInputSchema = z.object({
  displayName: z
    .string()
    .max(80, 'Display name must be 80 characters or fewer.'),
})

export type ReferenceDemoFormInputValues = z.infer<
  typeof referenceDemoFormInputSchema
>

export type ReferenceDemoPartialValues = {
  displayName?: string | null
}
