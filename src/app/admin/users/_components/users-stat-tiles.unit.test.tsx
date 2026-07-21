import { render, screen } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { UsersStatTiles } from './users-stat-tiles'

const defaultStats = {
  total: 5,
  unverified: 1,
  banned: 2,
  new30d: 3,
}

describe('UsersStatTiles', () => {
  it('should clear filters when Total is clicked', async () => {
    const user = userEvent.setup()
    const onTotalClick = vi.fn()

    render(
      <UsersStatTiles
        stats={defaultStats}
        isFullyUnfiltered={false}
        filterUnverified
        filterBanned
        filterNew30d={false}
        isLoading={false}
        onTotalClick={onTotalClick}
        onUnverifiedToggle={vi.fn()}
        onBannedToggle={vi.fn()}
        onNew30dToggle={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: /total/i }))

    expect(onTotalClick).toHaveBeenCalledTimes(1)
  })

  it('should mark Total as pressed only when fully unfiltered', () => {
    const { rerender } = render(
      <UsersStatTiles
        stats={defaultStats}
        isFullyUnfiltered
        filterUnverified={false}
        filterBanned={false}
        filterNew30d={false}
        isLoading={false}
        onTotalClick={vi.fn()}
        onUnverifiedToggle={vi.fn()}
        onBannedToggle={vi.fn()}
        onNew30dToggle={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: /total/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    rerender(
      <UsersStatTiles
        stats={defaultStats}
        isFullyUnfiltered={false}
        filterUnverified
        filterBanned={false}
        filterNew30d={false}
        isLoading={false}
        onTotalClick={vi.fn()}
        onUnverifiedToggle={vi.fn()}
        onBannedToggle={vi.fn()}
        onNew30dToggle={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: /total/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('should toggle the New (30d) tile', async () => {
    const user = userEvent.setup()
    const onNew30dToggle = vi.fn()

    render(
      <UsersStatTiles
        stats={defaultStats}
        isFullyUnfiltered={false}
        filterUnverified={false}
        filterBanned={false}
        filterNew30d={false}
        isLoading={false}
        onTotalClick={vi.fn()}
        onUnverifiedToggle={vi.fn()}
        onBannedToggle={vi.fn()}
        onNew30dToggle={onNew30dToggle}
      />,
    )

    await user.click(screen.getByRole('button', { name: /new \(30d\)/i }))

    expect(onNew30dToggle).toHaveBeenCalledTimes(1)
  })

  it('should render skeleton tiles while loading', () => {
    const { container } = render(
      <UsersStatTiles
        stats={null}
        isFullyUnfiltered
        filterUnverified={false}
        filterBanned={false}
        filterNew30d={false}
        isLoading
        onTotalClick={vi.fn()}
        onUnverifiedToggle={vi.fn()}
        onBannedToggle={vi.fn()}
        onNew30dToggle={vi.fn()}
      />,
    )

    expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(4)
    expect(
      screen.queryByRole('button', { name: /total/i }),
    ).not.toBeInTheDocument()
  })
})
