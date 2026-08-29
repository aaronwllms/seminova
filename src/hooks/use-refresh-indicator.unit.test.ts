import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { act, renderHook } from '@/test/test-utils'

import { useRefreshIndicator } from './use-refresh-indicator'

describe('useRefreshIndicator', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should keep isRefreshing true until the minimum visible hold elapses', async () => {
    const { result } = renderHook(() => useRefreshIndicator())

    await act(async () => {
      void result.current.runWithRefreshIndicator(async () => {})
    })

    expect(result.current.isRefreshing).toBe(true)

    act(() => {
      vi.advanceTimersByTime(999)
    })

    expect(result.current.isRefreshing).toBe(true)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })

    expect(result.current.isRefreshing).toBe(false)
  })

  it('should hold isRefreshing once from the first start when operations overlap', async () => {
    const { result } = renderHook(() => useRefreshIndicator())
    let resolveFirst: (() => void) | undefined
    let resolveSecond: (() => void) | undefined

    const firstOperation = new Promise<void>((resolve) => {
      resolveFirst = resolve
    })
    const secondOperation = new Promise<void>((resolve) => {
      resolveSecond = resolve
    })

    act(() => {
      void result.current.runWithRefreshIndicator(async () => {
        await firstOperation
      })
    })

    expect(result.current.isRefreshing).toBe(true)

    act(() => {
      void result.current.runWithRefreshIndicator(async () => {
        await secondOperation
      })
    })

    await act(async () => {
      resolveFirst?.()
      await Promise.resolve()
    })

    expect(result.current.isRefreshing).toBe(true)

    await act(async () => {
      resolveSecond?.()
      await Promise.resolve()
    })

    expect(result.current.isRefreshing).toBe(true)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })

    expect(result.current.isRefreshing).toBe(false)
  })

  it('should clear the hold timer and resolve on unmount', async () => {
    const { result, unmount } = renderHook(() => useRefreshIndicator())

    await act(async () => {
      void result.current.runWithRefreshIndicator(async () => {})
    })

    expect(result.current.isRefreshing).toBe(true)

    unmount()

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(vi.getTimerCount()).toBe(0)
  })
})
