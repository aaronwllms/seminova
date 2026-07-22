import type { ReferenceDemoPartialValues } from './reference-demo-form-schema'

export const REFERENCE_DEMO_PERSIST_DELAY_MS = 400

const delay = (): Promise<void> =>
  new Promise((resolve) => {
    window.setTimeout(resolve, REFERENCE_DEMO_PERSIST_DELAY_MS)
  })

/** Generic mock persist for public Reference demos — simulated delay, no DB write. */
export const referenceDemoMockPersist = async <T>(payload: T) => {
  await delay()

  return { success: true as const, data: payload }
}

export const referenceDemoPersist = (
  payload: ReferenceDemoPartialValues,
): Promise<{ success: true; data: ReferenceDemoPartialValues }> =>
  referenceDemoMockPersist(payload)
