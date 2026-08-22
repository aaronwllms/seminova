import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useScrolled } from './use-scrolled'

const setScrollY = (y: number) => {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: y })
  window.dispatchEvent(new Event('scroll'))
}

describe('useScrolled', () => {
  afterEach(() => {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 })
  })

  it('should return false at rest', () => {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 })

    const { result } = renderHook(() => useScrolled())

    act(() => {})

    expect(result.current).toBe(false)
  })

  it('should return true past the on threshold', () => {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 })

    const { result } = renderHook(() => useScrolled())

    act(() => {
      setScrollY(11)
    })

    expect(result.current).toBe(true)
  })

  it('should stay true between off and on thresholds when scrolling back up', () => {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 })

    const { result } = renderHook(() => useScrolled())

    act(() => {
      setScrollY(11)
    })

    expect(result.current).toBe(true)

    act(() => {
      setScrollY(7)
    })

    expect(result.current).toBe(true)
  })

  it('should return false at or below the off threshold', () => {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 })

    const { result } = renderHook(() => useScrolled())

    act(() => {
      setScrollY(11)
    })

    expect(result.current).toBe(true)

    act(() => {
      setScrollY(4)
    })

    expect(result.current).toBe(false)
  })
})
