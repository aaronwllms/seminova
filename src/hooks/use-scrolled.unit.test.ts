import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useScrolled } from './use-scrolled'

describe('useScrolled', () => {
  let observerCallback: IntersectionObserverCallback | null = null
  const disconnect = vi.fn()
  const observe = vi.fn()

  beforeEach(() => {
    observerCallback = null
    disconnect.mockClear()
    observe.mockClear()

    class MockIntersectionObserver {
      constructor(callback: IntersectionObserverCallback) {
        observerCallback = callback
      }

      observe = observe
      disconnect = disconnect
      unobserve = vi.fn()
    }

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  const emitIntersection = (isIntersecting: boolean, target: Element) => {
    act(() => {
      observerCallback?.(
        [{ isIntersecting, target } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })
  }

  it('should return false while the sentinel intersects the viewport', () => {
    const sentinel = document.createElement('div')
    document.body.appendChild(sentinel)
    vi.spyOn(sentinel, 'getBoundingClientRect').mockReturnValue({
      top: 0,
      bottom: 1,
      left: 0,
      right: 1,
      width: 1,
      height: 1,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })

    const ref = { current: sentinel }
    const { result } = renderHook(() => useScrolled(ref))

    act(() => {})

    expect(result.current).toBe(false)
    expect(observe).toHaveBeenCalledWith(sentinel)

    sentinel.remove()
  })

  it('should return true once the sentinel leaves the viewport', () => {
    const sentinel = document.createElement('div')
    document.body.appendChild(sentinel)
    vi.spyOn(sentinel, 'getBoundingClientRect').mockReturnValue({
      top: 0,
      bottom: 1,
      left: 0,
      right: 1,
      width: 1,
      height: 1,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })

    const ref = { current: sentinel }
    const { result } = renderHook(() => useScrolled(ref))

    act(() => {})

    expect(result.current).toBe(false)

    emitIntersection(false, sentinel)

    expect(result.current).toBe(true)

    sentinel.remove()
  })

  it('should return false again when the sentinel re-enters the viewport', () => {
    const sentinel = document.createElement('div')
    document.body.appendChild(sentinel)
    vi.spyOn(sentinel, 'getBoundingClientRect').mockReturnValue({
      top: -10,
      bottom: -9,
      left: 0,
      right: 1,
      width: 1,
      height: 1,
      x: 0,
      y: -10,
      toJSON: () => ({}),
    })

    const ref = { current: sentinel }
    const { result } = renderHook(() => useScrolled(ref))

    act(() => {})

    expect(result.current).toBe(true)

    emitIntersection(true, sentinel)

    expect(result.current).toBe(false)

    sentinel.remove()
  })
})
