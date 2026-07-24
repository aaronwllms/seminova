import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { act, renderHook } from '@/test/test-utils'

import { TABLE_FETCH_DIM_MIN_MS, useTableFetchDim } from './use-table-fetch-dim'

describe('useTableFetchDim', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should stay undimmed when fetching without stale rows', () => {
    const { result } = renderHook(
      ({ isFetching, hasStaleRows }) =>
        useTableFetchDim(isFetching, hasStaleRows),
      {
        initialProps: { isFetching: true, hasStaleRows: false },
      },
    )

    expect(result.current).toBe(false)
  })

  it('should dim immediately when fetching with stale rows', () => {
    const { result } = renderHook(
      ({ isFetching, hasStaleRows }) =>
        useTableFetchDim(isFetching, hasStaleRows),
      {
        initialProps: { isFetching: true, hasStaleRows: true },
      },
    )

    expect(result.current).toBe(true)
  })

  it('should hold dim until the minimum duration after a fast fetch', () => {
    const { result, rerender } = renderHook(
      ({ isFetching, hasStaleRows }) =>
        useTableFetchDim(isFetching, hasStaleRows),
      {
        initialProps: { isFetching: true, hasStaleRows: true },
      },
    )

    expect(result.current).toBe(true)

    act(() => {
      vi.advanceTimersByTime(50)
    })

    rerender({ isFetching: false, hasStaleRows: true })
    expect(result.current).toBe(true)

    act(() => {
      vi.advanceTimersByTime(TABLE_FETCH_DIM_MIN_MS - 50 - 1)
    })
    expect(result.current).toBe(true)

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current).toBe(false)
  })

  it('should clear dim immediately when a slow fetch ends past the minimum hold', () => {
    const { result, rerender } = renderHook(
      ({ isFetching, hasStaleRows }) =>
        useTableFetchDim(isFetching, hasStaleRows),
      {
        initialProps: { isFetching: true, hasStaleRows: true },
      },
    )

    expect(result.current).toBe(true)

    act(() => {
      vi.advanceTimersByTime(200)
    })

    rerender({ isFetching: false, hasStaleRows: true })
    expect(result.current).toBe(false)
  })
})
