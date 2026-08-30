'use client'

import { useState } from 'react'

/**
 * Tracks a value across renders and invokes `onReset` when it changes.
 *
 * `onReset` runs during render — call only state setters there. Side effects
 * (logging, network, meaningful ref writes) may run more than once under
 * StrictMode and on React's render-phase re-run.
 *
 * `value` must be a primitive or referentially stable. Comparison uses `!==`,
 * so a value rebuilt each render never compares equal and the reset loops
 * until React throws.
 */
export const useResetOnChange = <T>(value: T, onReset: () => void): void => {
  const [prev, setPrev] = useState(value)

  if (value !== prev) {
    setPrev(value)
    onReset()
  }
}
