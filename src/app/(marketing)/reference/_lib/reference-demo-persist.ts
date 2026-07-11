import type { ReferenceDemoPartialValues } from './reference-demo-form-schema'

export const REFERENCE_DEMO_PERSIST_DELAY_MS = 400

export const referenceDemoPersist = async (
  payload: ReferenceDemoPartialValues,
) => {
  await new Promise((resolve) => {
    window.setTimeout(resolve, REFERENCE_DEMO_PERSIST_DELAY_MS)
  })

  return { success: true as const, data: payload }
}
