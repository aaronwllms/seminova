'use client'

import { useCallback, useMemo, useState } from 'react'

export const useToggleFilterSet = <T>() => {
  const [activeValues, setActiveValues] = useState<Set<T>>(() => new Set())

  const toggle = useCallback((value: T) => {
    setActiveValues((current) => {
      const next = new Set(current)

      if (next.has(value)) {
        next.delete(value)
      } else {
        next.add(value)
      }

      return next
    })
  }, [])

  const clearAll = useCallback(() => {
    setActiveValues(new Set())
  }, [])

  const isActive = useCallback(
    (value: T) => activeValues.has(value),
    [activeValues],
  )

  return useMemo(
    () => ({
      activeValues,
      toggle,
      clearAll,
      isActive,
    }),
    [activeValues, clearAll, isActive, toggle],
  )
}
