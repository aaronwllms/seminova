import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { adminLogsQueryKeys } from './admin-logs-query-keys'
import { useAdminLogsRealtime } from './use-admin-logs-realtime'

type InsertHandler = () => void
type SubscribeCallback = (status: string) => void

const insertHandlerRef: { current: InsertHandler | null } = { current: null }
const subscribeCallbackRef: { current: SubscribeCallback | null } = {
  current: null,
}

const mockRemoveChannel = vi.fn()
const mockOn = vi.fn()
const mockSubscribe = vi.fn()
const mockChannel = vi.fn()

const channelStub = {
  on: mockOn,
  subscribe: mockSubscribe,
}

mockOn.mockImplementation((_event, _filter, handler: InsertHandler) => {
  insertHandlerRef.current = handler
  return channelStub
})

mockSubscribe.mockImplementation((callback: SubscribeCallback) => {
  subscribeCallbackRef.current = callback
  return channelStub
})

mockChannel.mockReturnValue(channelStub)

vi.mock('@/supabase/client', () => ({
  createClient: () => ({
    channel: mockChannel,
    removeChannel: mockRemoveChannel,
  }),
}))

describe('useAdminLogsRealtime', () => {
  let queryClient: QueryClient

  const renderRealtimeHook = () =>
    renderHook(() => useAdminLogsRealtime(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    })

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    insertHandlerRef.current = null
    subscribeCallbackRef.current = null
    mockRemoveChannel.mockReset()
    mockOn.mockClear()
    mockSubscribe.mockClear()
    mockChannel.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should subscribe to app_logs INSERT changes on mount', () => {
    renderRealtimeHook()

    expect(mockChannel).toHaveBeenCalledWith('admin-logs-inserts')
    expect(mockOn).toHaveBeenCalledWith(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'app_logs' },
      expect.any(Function),
    )
    expect(mockSubscribe).toHaveBeenCalledWith(expect.any(Function))
  })

  it('should coalesce rapid INSERT events into one invalidateQueries call', async () => {
    vi.useFakeTimers()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    renderRealtimeHook()

    insertHandlerRef.current?.()
    insertHandlerRef.current?.()
    insertHandlerRef.current?.()

    expect(invalidateSpy).not.toHaveBeenCalled()

    await act(async () => {
      vi.advanceTimersByTime(300)
    })

    expect(invalidateSpy).toHaveBeenCalledTimes(1)
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: adminLogsQueryKeys.all,
    })
  })

  it('should not set isRefreshing when debounced realtime invalidation runs', async () => {
    vi.useFakeTimers()

    const { result } = renderRealtimeHook()

    insertHandlerRef.current?.()

    await act(async () => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current.isRefreshing).toBe(false)
  })

  it('should map subscription status to connection state', async () => {
    const { result } = renderRealtimeHook()

    act(() => {
      subscribeCallbackRef.current?.('SUBSCRIBED')
    })
    expect(result.current.connectionState).toBe('live')

    act(() => {
      subscribeCallbackRef.current?.('TIMED_OUT')
    })
    expect(result.current.connectionState).toBe('reconnecting')

    act(() => {
      subscribeCallbackRef.current?.('CHANNEL_ERROR')
    })
    expect(result.current.connectionState).toBe('reconnecting')

    act(() => {
      subscribeCallbackRef.current?.('CLOSED')
    })
    expect(result.current.connectionState).toBe('offline')
  })

  it('should set isRefreshing during manual refresh and clear it after settle', async () => {
    let resolveRefetch: (() => void) | undefined
    const refetchPromise = new Promise<void>((resolve) => {
      resolveRefetch = resolve
    })
    const refetchSpy = vi
      .spyOn(queryClient, 'refetchQueries')
      .mockReturnValue(refetchPromise as never)

    const { result } = renderRealtimeHook()

    let refreshPromise: Promise<void> | undefined
    act(() => {
      refreshPromise = result.current.refresh()
    })

    await waitFor(() => {
      expect(result.current.isRefreshing).toBe(true)
    })

    resolveRefetch?.()
    await act(async () => {
      await refreshPromise
    })

    expect(refetchSpy).toHaveBeenCalledWith({
      queryKey: adminLogsQueryKeys.all,
    })
    expect(result.current.isRefreshing).toBe(false)
  })

  it('should clear debounce timer and remove channel on unmount', async () => {
    vi.useFakeTimers()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { unmount } = renderRealtimeHook()

    insertHandlerRef.current?.()
    unmount()

    await act(async () => {
      vi.advanceTimersByTime(300)
    })

    expect(invalidateSpy).not.toHaveBeenCalled()
    expect(mockRemoveChannel).toHaveBeenCalledWith(channelStub)
  })
})
