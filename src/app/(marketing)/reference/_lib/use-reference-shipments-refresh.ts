'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useRef, useState } from 'react'

import { referenceShipmentsQueryKeys } from './reference-shipments-query-keys'

const REFRESH_MIN_VISIBLE_MS = 1000

export const useReferenceShipmentsRefresh = () => {
  const queryClient = useQueryClient()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const refreshInFlightRef = useRef(0)
  const refreshStartedAtRef = useRef<number | null>(null)

  const refresh = useCallback(async () => {
    refreshInFlightRef.current += 1

    if (refreshStartedAtRef.current === null) {
      refreshStartedAtRef.current = Date.now()
      setIsRefreshing(true)
    }

    try {
      await queryClient.refetchQueries({
        queryKey: referenceShipmentsQueryKeys.all,
      })
    } finally {
      refreshInFlightRef.current -= 1

      if (refreshInFlightRef.current === 0) {
        const startedAt = refreshStartedAtRef.current ?? Date.now()
        const remainingMs = REFRESH_MIN_VISIBLE_MS - (Date.now() - startedAt)

        if (remainingMs > 0) {
          await new Promise<void>((resolve) => {
            window.setTimeout(resolve, remainingMs)
          })
        }

        refreshStartedAtRef.current = null
        setIsRefreshing(false)
      }
    }
  }, [queryClient])

  return { refresh, isRefreshing }
}
