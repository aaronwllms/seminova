import { describe, expect, it, vi } from 'vitest'

import { useResetOnChange } from './use-reset-on-change'
import { renderHook } from '@/test/test-utils'

describe('useResetOnChange', () => {
  it('should not fire on first render or same-value rerender', () => {
    const onReset = vi.fn()

    const { rerender } = renderHook(
      ({ value }) => useResetOnChange(value, onReset),
      { initialProps: { value: 'a' } },
    )

    expect(onReset).not.toHaveBeenCalled()

    rerender({ value: 'a' })

    expect(onReset).not.toHaveBeenCalled()
  })

  it('should fire on change and again when value changes back', () => {
    const onReset = vi.fn()

    const { rerender } = renderHook(
      ({ value }) => useResetOnChange(value, onReset),
      { initialProps: { value: 'a' } },
    )

    rerender({ value: 'b' })

    expect(onReset).toHaveBeenCalledTimes(1)

    rerender({ value: 'a' })

    expect(onReset).toHaveBeenCalledTimes(2)
  })
})
