import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { render, screen } from '@/test/test-utils'

import { ActiveFilterChips, type ActiveFilterChip } from './active-filter-chips'

describe('ActiveFilterChips', () => {
  const chips: ActiveFilterChip[] = [
    { id: 'banned', label: 'Banned' },
    { id: 'search', label: 'Search: admin' },
  ]

  it('should render nothing when there are no chips', () => {
    render(
      <ActiveFilterChips chips={[]} onRemove={vi.fn()} onClearAll={vi.fn()} />,
    )

    expect(screen.queryByText('Active filters:')).not.toBeInTheDocument()
  })

  it('should show chips and wire remove and clear-all actions', async () => {
    const user = userEvent.setup({ delay: null })
    const onRemove = vi.fn()
    const onClearAll = vi.fn()

    render(
      <ActiveFilterChips
        chips={chips}
        onRemove={onRemove}
        onClearAll={onClearAll}
      />,
    )

    expect(screen.getByText('Active filters:')).toBeInTheDocument()
    expect(screen.getByText('Banned')).toBeInTheDocument()
    expect(screen.getByText('Search: admin')).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: /remove banned filter/i }),
    )
    expect(onRemove).toHaveBeenCalledWith('banned')

    await user.click(screen.getByRole('button', { name: /^clear all$/i }))
    expect(onClearAll).toHaveBeenCalledTimes(1)
  })
})
