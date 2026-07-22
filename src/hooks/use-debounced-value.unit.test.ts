import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { act, renderHook } from '@/test/test-utils'

import { useDebouncedValue } from './use-debounced-value'

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('alpha', 300))

    expect(result.current).toBe('alpha')
  })

  it('should debounce value updates', () => {
    const { result, rerender } = renderHook(
      ({ value, delayMs }) => useDebouncedValue(value, delayMs),
      {
        initialProps: { value: 'alpha', delayMs: 300 },
      },
    )

    rerender({ value: 'beta', delayMs: 300 })
    expect(result.current).toBe('alpha')

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current).toBe('beta')
  })
})
