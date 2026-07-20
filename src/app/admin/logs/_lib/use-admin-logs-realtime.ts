'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'

import { createClient } from '@/supabase/client'

import { adminLogsQueryKeys } from './admin-logs-query-keys'

const REALTIME_DEBOUNCE_MS = 300
const REFRESH_MIN_VISIBLE_MS = 1000

interface UseAdminLogsRealtimeOptions {
  enabled?: boolean
}

export const useAdminLogsRealtime = ({
  enabled = true,
}: UseAdminLogsRealtimeOptions = {}) => {
  const queryClient = useQueryClient()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const refreshInFlightRef = useRef(0)
  const refreshStartedAtRef = useRef<number | null>(null)

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
              window.setTimeout(resolve, remainingMs)
            })
          }

          refreshStartedAtRef.current = null
          setIsRefreshing(false)
        }
      }
    },
    [],
  )

  useEffect(() => {
    if (!enabled) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }

      return
    }

    const supabase = createClient()
    const channel = supabase
      .channel('admin-logs-inserts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'app_logs' },
        () => {
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
          }

          debounceTimerRef.current = setTimeout(() => {
            void runWithRefreshIndicator(async () => {
              await queryClient.invalidateQueries({
                queryKey: adminLogsQueryKeys.all,
              })
            })
          }, REALTIME_DEBOUNCE_MS)
        },
      )
      .subscribe()

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }

      void supabase.removeChannel(channel)
    }
  }, [enabled, queryClient, runWithRefreshIndicator])

  const refresh = useCallback(async () => {
    await runWithRefreshIndicator(async () => {
      await queryClient.refetchQueries({ queryKey: adminLogsQueryKeys.all })
    })
  }, [queryClient, runWithRefreshIndicator])

  return { refresh, isRefreshing }
}
