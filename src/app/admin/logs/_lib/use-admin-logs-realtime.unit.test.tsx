import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { adminLogsQueryKeys } from './admin-logs-query-keys'
import { useAdminLogsRealtime } from './use-admin-logs-realtime'

type InsertHandler = () => void

const insertHandlerRef: { current: InsertHandler | null } = { current: null }

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

mockSubscribe.mockImplementation(() => channelStub)

mockChannel.mockReturnValue(channelStub)

vi.mock('@/supabase/client', () => ({
  createClient: () => ({
    channel: mockChannel,
    removeChannel: mockRemoveChannel,
  }),
}))

describe('useAdminLogsRealtime', () => {
  let queryClient: QueryClient

  const renderRealtimeHook = (enabled = true) =>
    renderHook(() => useAdminLogsRealtime({ enabled }), {
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
    mockRemoveChannel.mockReset()
    mockOn.mockClear()
    mockSubscribe.mockClear()
    mockChannel.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should subscribe to app_logs INSERT changes when enabled', () => {
    renderRealtimeHook(true)

    expect(mockChannel).toHaveBeenCalledWith('admin-logs-inserts')
    expect(mockOn).toHaveBeenCalledWith(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'app_logs' },
      expect.any(Function),
    )
    expect(mockSubscribe).toHaveBeenCalled()
  })

  it('should not subscribe when disabled', () => {
    renderRealtimeHook(false)

    expect(mockChannel).not.toHaveBeenCalled()
    expect(mockOn).not.toHaveBeenCalled()
    expect(mockSubscribe).not.toHaveBeenCalled()
  })

  it('should subscribe when toggled from disabled to enabled', () => {
    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useAdminLogsRealtime({ enabled }),
      {
        initialProps: { enabled: false },
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      },
    )

    expect(mockChannel).not.toHaveBeenCalled()

    rerender({ enabled: true })

    expect(mockChannel).toHaveBeenCalledWith('admin-logs-inserts')
    expect(mockSubscribe).toHaveBeenCalled()
  })

  it('should remove channel when toggled from enabled to disabled', () => {
    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useAdminLogsRealtime({ enabled }),
      {
        initialProps: { enabled: true },
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      },
    )

    expect(mockChannel).toHaveBeenCalledTimes(1)

    rerender({ enabled: false })

    expect(mockRemoveChannel).toHaveBeenCalledWith(channelStub)
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

  it('should set isRefreshing during debounced realtime invalidation', async () => {
    vi.useFakeTimers()
    const invalidateSpy = vi
      .spyOn(queryClient, 'invalidateQueries')
      .mockResolvedValue(undefined)

    const { result } = renderRealtimeHook()

    insertHandlerRef.current?.()

    await act(async () => {
      vi.advanceTimersByTime(300)
    })

    expect(invalidateSpy).toHaveBeenCalledTimes(1)
    expect(result.current.isRefreshing).toBe(true)

    await act(async () => {
      await Promise.resolve()
      vi.advanceTimersByTime(1000)
    })

    expect(result.current.isRefreshing).toBe(false)
  })

  it('should keep isRefreshing visible for at least one second on fast manual refresh', async () => {
    vi.useFakeTimers()
    vi.spyOn(queryClient, 'refetchQueries').mockResolvedValue(undefined)

    const { result } = renderRealtimeHook()

    act(() => {
      void result.current.refresh()
    })

    expect(result.current.isRefreshing).toBe(true)

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.isRefreshing).toBe(true)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(999)
    })

    expect(result.current.isRefreshing).toBe(true)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })

    expect(result.current.isRefreshing).toBe(false)
  })

  it('should set isRefreshing during manual refresh and clear it after settle', async () => {
    vi.useFakeTimers()
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

    expect(result.current.isRefreshing).toBe(true)

    resolveRefetch?.()

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.isRefreshing).toBe(true)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
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
