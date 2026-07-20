'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'

import { createClient } from '@/supabase/client'

import { adminLogsQueryKeys } from './admin-logs-query-keys'

export type AdminLogsConnectionState = 'live' | 'reconnecting' | 'offline'

const REALTIME_DEBOUNCE_MS = 300

export const useAdminLogsRealtime = () => {
  const queryClient = useQueryClient()
  const [connectionState, setConnectionState] =
    useState<AdminLogsConnectionState>('offline')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
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
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionState('live')
        } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
          setConnectionState('reconnecting')
        } else if (status === 'CLOSED') {
          setConnectionState('offline')
        }
      })

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      void supabase.removeChannel(channel)
    }
  }, [queryClient])

  const refresh = useCallback(async () => {
    setIsRefreshing(true)

    try {
      await queryClient.refetchQueries({ queryKey: adminLogsQueryKeys.all })
    } finally {
      setIsRefreshing(false)
    }
  }, [queryClient])

  return { connectionState, refresh, isRefreshing }
}
