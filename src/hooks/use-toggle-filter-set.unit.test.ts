import { describe, expect, it } from 'vitest'

import { useToggleFilterSet } from './use-toggle-filter-set'
import { act, renderHook } from '@/test/test-utils'

describe('useToggleFilterSet', () => {
  it('should toggle values on and off', () => {
    const { result } = renderHook(() => useToggleFilterSet<string>())

    act(() => {
      result.current.toggle('info')
    })

    expect(result.current.isActive('info')).toBe(true)
    expect(result.current.activeValues.has('info')).toBe(true)

    act(() => {
      result.current.toggle('info')
    })

    expect(result.current.isActive('info')).toBe(false)
    expect(result.current.activeValues.size).toBe(0)
  })

  it('should support multi-select', () => {
    const { result } = renderHook(() => useToggleFilterSet<string>())

    act(() => {
      result.current.toggle('info')
      result.current.toggle('warn')
    })

    expect(result.current.activeValues).toEqual(new Set(['info', 'warn']))
  })

  it('should clear all active values', () => {
    const { result } = renderHook(() => useToggleFilterSet<string>())

    act(() => {
      result.current.toggle('debug')
      result.current.toggle('error')
      result.current.clearAll()
    })

    expect(result.current.activeValues.size).toBe(0)
  })
})
