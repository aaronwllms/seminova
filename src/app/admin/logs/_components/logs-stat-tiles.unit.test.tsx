import { render, screen } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { LogsStatTiles } from './logs-stat-tiles'

const defaultStats = {
  total: 10,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  unread: 5,
}

describe('LogsStatTiles', () => {
  it('should render skeleton tiles while loading', () => {
    const { container } = render(
      <LogsStatTiles
        stats={null}
        isFullyUnfiltered
        selectedLevels={[]}
        unreadOnly={false}
        isLoading
        onTotalClick={vi.fn()}
        onLevelToggle={vi.fn()}
        onUnreadToggle={vi.fn()}
      />,
    )

    expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(6)
    expect(
      screen.queryByRole('button', { name: /total/i }),
    ).not.toBeInTheDocument()
  })

  it('should clear filters when Total is clicked', async () => {
    const user = userEvent.setup({ delay: null })
    const onTotalClick = vi.fn()

    render(
      <LogsStatTiles
        stats={defaultStats}
        isFullyUnfiltered={false}
        selectedLevels={['error']}
        unreadOnly={false}
        isLoading={false}
        onTotalClick={onTotalClick}
        onLevelToggle={vi.fn()}
        onUnreadToggle={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Total, 10' }))

    expect(onTotalClick).toHaveBeenCalledTimes(1)
  })
})
