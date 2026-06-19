import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useIsMobile } from './use-mobile'

const createMatchMedia = (matches: boolean) =>
  vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))

describe('useIsMobile', () => {
  it('should return true when viewport is below the mobile breakpoint', () => {
    vi.stubGlobal('matchMedia', createMatchMedia(true))
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 500,
    })

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(true)
  })

  it('should update when the media query changes', () => {
    let changeHandler: (() => void) | null = null
    const matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn((event, handler) => {
        if (event === 'change') {
          changeHandler = handler as () => void
        }
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    vi.stubGlobal('matchMedia', matchMedia)
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1024,
    })

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)

    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 500,
    })

    act(() => {
      changeHandler?.()
    })

    expect(result.current).toBe(true)
  })
})
