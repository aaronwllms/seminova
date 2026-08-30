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
  it('should return true after mount when viewport is below the mobile breakpoint', () => {
    vi.stubGlobal('matchMedia', createMatchMedia(true))

    const { result } = renderHook(() => useIsMobile())

    act(() => {})

    expect(result.current).toBe(true)
  })

  it('should update when the media query changes', () => {
    let changeHandler: (() => void) | null = null
    const mql = {
      matches: false,
      media: '',
      onchange: null,
      addEventListener: vi.fn((event, handler) => {
        if (event === 'change') {
          changeHandler = handler as () => void
        }
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }
    const matchMedia = vi.fn().mockImplementation((query: string) => {
      mql.media = query
      return mql
    })

    vi.stubGlobal('matchMedia', matchMedia)

    const { result } = renderHook(() => useIsMobile())

    act(() => {})

    expect(result.current).toBe(false)

    mql.matches = true

    act(() => {
      changeHandler?.()
    })

    expect(result.current).toBe(true)
  })
})
