import { render, screen } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { UsersStatTiles } from './users-stat-tiles'

describe('UsersStatTiles', () => {
  it('should clear filters when Total is clicked', async () => {
    const user = userEvent.setup()
    const onTotalClick = vi.fn()

    render(
      <UsersStatTiles
        stats={{ total: 5, unverified: 1, banned: 2 }}
        filterUnverified
        filterBanned
        onTotalClick={onTotalClick}
        onUnverifiedToggle={vi.fn()}
        onBannedToggle={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: /total/i }))

    expect(onTotalClick).toHaveBeenCalledTimes(1)
  })

  it('should mark Total as pressed when no filters are active', () => {
    render(
      <UsersStatTiles
        stats={{ total: 5, unverified: 1, banned: 2 }}
        filterUnverified={false}
        filterBanned={false}
        onTotalClick={vi.fn()}
        onUnverifiedToggle={vi.fn()}
        onBannedToggle={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: /total/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('should toggle aria-pressed on filter tiles', async () => {
    const user = userEvent.setup()
    const onUnverifiedToggle = vi.fn()

    render(
      <UsersStatTiles
        stats={{ total: 5, unverified: 1, banned: 2 }}
        filterUnverified={false}
        filterBanned={false}
        onTotalClick={vi.fn()}
        onUnverifiedToggle={onUnverifiedToggle}
        onBannedToggle={vi.fn()}
      />,
    )

    const unverifiedTile = screen.getByRole('button', { name: /unverified/i })
    expect(unverifiedTile).toHaveAttribute('aria-pressed', 'false')

    await user.click(unverifiedTile)

    expect(onUnverifiedToggle).toHaveBeenCalledTimes(1)
  })
})
