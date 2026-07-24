import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { act, render, screen } from '@/test/test-utils'

import { TableFetchDimWrapper } from './table-fetch-dim-wrapper'

describe('TableFetchDimWrapper', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should clear aria-busy as soon as fetching ends, before the dim hold completes', () => {
    const { rerender } = render(
      <TableFetchDimWrapper isFetching hasStaleRows>
        <span>Table body</span>
      </TableFetchDimWrapper>,
    )

    const wrapper = screen.getByText('Table body').parentElement

    expect(wrapper).toHaveAttribute('aria-busy', 'true')

    act(() => {
      vi.advanceTimersByTime(50)
    })

    rerender(
      <TableFetchDimWrapper isFetching={false} hasStaleRows>
        <span>Table body</span>
      </TableFetchDimWrapper>,
    )

    expect(wrapper).toHaveAttribute('aria-busy', 'false')
  })
})
