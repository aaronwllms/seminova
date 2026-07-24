'use client'

import { useEffect, useRef, useState } from 'react'

/** Minimum dim hold — matches `--duration-swept` in globals.css by name. */
export const TABLE_FETCH_DIM_MIN_MS = 150

export const useTableFetchDim = (
  isFetching: boolean,
  hasStaleRows: boolean,
): boolean => {
  const wantsDim = isFetching && hasStaleRows
  const [isHolding, setIsHolding] = useState(false)
  const dimStartedAtRef = useRef<number | null>(null)

  useEffect(() => {
    if (wantsDim) {
      dimStartedAtRef.current = Date.now()
      // eslint-disable-next-line react-hooks/set-state-in-effect -- arm hold so opacity survives fetch end for the min duration
      setIsHolding(true)
      return
    }

    if (!isHolding) {
      return
    }

    if (!hasStaleRows || dimStartedAtRef.current === null) {
      dimStartedAtRef.current = null
      setIsHolding(false)
      return
    }

    const elapsed = Date.now() - dimStartedAtRef.current
    const remaining = Math.max(0, TABLE_FETCH_DIM_MIN_MS - elapsed)

    if (remaining === 0) {
      dimStartedAtRef.current = null
      setIsHolding(false)
      return
    }

    const timer = setTimeout(() => {
      dimStartedAtRef.current = null
      setIsHolding(false)
    }, remaining)

    return () => clearTimeout(timer)
  }, [wantsDim, hasStaleRows, isHolding])

  return wantsDim || isHolding
}
