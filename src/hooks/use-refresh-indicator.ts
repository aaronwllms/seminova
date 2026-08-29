'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export const REFRESH_MIN_VISIBLE_MS = 1000

interface UseRefreshIndicatorResult {
  isRefreshing: boolean
  runWithRefreshIndicator: (operation: () => Promise<void>) => Promise<void>
}

export const useRefreshIndicator = (): UseRefreshIndicatorResult => {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const refreshInFlightRef = useRef(0)
  const refreshStartedAtRef = useRef<number | null>(null)
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const holdResolveRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    return () => {
      if (holdTimerRef.current !== null) {
        clearTimeout(holdTimerRef.current)
        holdTimerRef.current = null
      }

      if (holdResolveRef.current !== null) {
        holdResolveRef.current()
      }
    }
  }, [])

  const runWithRefreshIndicator = useCallback(
    async (operation: () => Promise<void>) => {
      refreshInFlightRef.current += 1

      if (refreshStartedAtRef.current === null) {
        refreshStartedAtRef.current = Date.now()
        setIsRefreshing(true)
      }

      try {
        await operation()
      } finally {
        refreshInFlightRef.current -= 1

        if (refreshInFlightRef.current === 0) {
          const startedAt = refreshStartedAtRef.current ?? Date.now()
          const remainingMs = REFRESH_MIN_VISIBLE_MS - (Date.now() - startedAt)

          if (remainingMs > 0) {
            await new Promise<void>((resolve) => {
              holdResolveRef.current = () => {
                holdTimerRef.current = null
                holdResolveRef.current = null
                resolve()
              }

              holdTimerRef.current = setTimeout(() => {
                holdResolveRef.current?.()
              }, remainingMs)
            })
          }

          refreshStartedAtRef.current = null
          setIsRefreshing(false)
        }
      }
    },
    [],
  )

  return { isRefreshing, runWithRefreshIndicator }
}
