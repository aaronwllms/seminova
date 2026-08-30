import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { TRANSIENT_SUCCESS_MS } from '@/constants/transient-feedback'
import { act, renderHook } from '@/test/test-utils'

import { useCopyToClipboard } from './use-copy-to-clipboard'

describe('useCopyToClipboard', () => {
  const writeText = vi.fn()

  beforeEach(() => {
    vi.useFakeTimers()
    writeText.mockReset()
    writeText.mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should set didCopy true then false after TRANSIENT_SUCCESS_MS', async () => {
    const { result } = renderHook(() => useCopyToClipboard('copy me'))

    await act(async () => {
      await result.current.copy()
    })

    expect(writeText).toHaveBeenCalledWith('copy me')
    expect(result.current.didCopy).toBe(true)

    act(() => {
      vi.advanceTimersByTime(TRANSIENT_SUCCESS_MS)
    })

    expect(result.current.didCopy).toBe(false)
  })

  it('should not clear didCopy early when copy is clicked again before the window ends', async () => {
    const { result } = renderHook(() => useCopyToClipboard('copy me'))

    await act(async () => {
      await result.current.copy()
    })

    act(() => {
      vi.advanceTimersByTime(TRANSIENT_SUCCESS_MS - 500)
    })

    await act(async () => {
      await result.current.copy()
    })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current.didCopy).toBe(true)

    act(() => {
      vi.advanceTimersByTime(TRANSIENT_SUCCESS_MS - 500)
    })

    expect(result.current.didCopy).toBe(false)
  })

  it('should clear the timer on unmount without throwing', async () => {
    const { result, unmount } = renderHook(() => useCopyToClipboard('copy me'))

    await act(async () => {
      await result.current.copy()
    })

    unmount()

    expect(() => {
      act(() => {
        vi.advanceTimersByTime(TRANSIENT_SUCCESS_MS)
      })
    }).not.toThrow()
  })
})
