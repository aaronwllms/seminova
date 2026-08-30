import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useActiveAnchor } from './use-active-anchor'

describe('useActiveAnchor', () => {
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
    document.body.replaceChildren()
  })

  const appendSection = (id: string) => {
    const element = document.createElement('h2')
    element.id = id
    document.body.appendChild(element)
    return element
  }

  const emitIntersection = (
    entries: Array<{
      isIntersecting: boolean
      target: Element
      top: number
    }>,
  ) => {
    act(() => {
      observerCallback?.(
        entries.map(
          ({ isIntersecting, target, top }) =>
            ({
              isIntersecting,
              target,
              boundingClientRect: { top },
            }) as IntersectionObserverEntry,
        ),
        {} as IntersectionObserver,
      )
    })
  }

  it('should return the first link id and observe each existing section', () => {
    appendSection('alpha')
    appendSection('beta')

    const links = [{ id: 'alpha' }, { id: 'beta' }] as const
    const { result } = renderHook(() => useActiveAnchor(links))

    act(() => {})

    expect(result.current).toBe('alpha')
    expect(observe).toHaveBeenCalledTimes(2)
  })

  it('should pick the top-most intersecting section', () => {
    const alpha = appendSection('alpha')
    const beta = appendSection('beta')

    const links = [{ id: 'alpha' }, { id: 'beta' }] as const
    const { result } = renderHook(() => useActiveAnchor(links))

    act(() => {})

    emitIntersection([
      { isIntersecting: true, target: beta, top: 40 },
      { isIntersecting: true, target: alpha, top: 10 },
    ])

    expect(result.current).toBe('alpha')
  })

  it('should keep the active id when no entries intersect', () => {
    const alpha = appendSection('alpha')
    const beta = appendSection('beta')

    const links = [{ id: 'alpha' }, { id: 'beta' }] as const
    const { result } = renderHook(() => useActiveAnchor(links))

    act(() => {})

    emitIntersection([{ isIntersecting: true, target: beta, top: 40 }])

    expect(result.current).toBe('beta')

    emitIntersection([
      { isIntersecting: false, target: alpha, top: 200 },
      { isIntersecting: false, target: beta, top: 300 },
    ])

    expect(result.current).toBe('beta')
  })

  it('should disconnect the observer on unmount', () => {
    appendSection('alpha')

    const links = [{ id: 'alpha' }] as const
    const { unmount } = renderHook(() => useActiveAnchor(links))

    act(() => {})

    unmount()

    expect(disconnect).toHaveBeenCalledTimes(1)
  })
})
