'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'

import { createClient } from '@/supabase/client'

import { adminLogsQueryKeys } from './admin-logs-query-keys'

const REALTIME_DEBOUNCE_MS = 300

interface UseAdminLogsRealtimeOptions {
  enabled?: boolean
}

export const useAdminLogsRealtime = ({
  enabled = true,
}: UseAdminLogsRealtimeOptions = {}) => {
  const queryClient = useQueryClient()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
            void queryClient.invalidateQueries({
              queryKey: adminLogsQueryKeys.all,
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
  }, [enabled, queryClient])

  const refresh = useCallback(async () => {
    setIsRefreshing(true)

    try {
      await queryClient.refetchQueries({ queryKey: adminLogsQueryKeys.all })
    } finally {
      setIsRefreshing(false)
    }
  }, [queryClient])

  return { refresh, isRefreshing }
}
