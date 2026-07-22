import { render, screen } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { StatTile } from './stat-tile'

describe('StatTile', () => {
  it('should expose label and count in aria-label but not tooltip text', () => {
    render(
      <StatTile
        label="Total"
        count={42}
        role="total"
        tooltip="Clear all filters"
        onClick={vi.fn()}
      />,
    )

    const button = screen.getByRole('button', { name: 'Total, 42' })

    expect(button).toHaveAttribute('aria-label', 'Total, 42')
    expect(button.getAttribute('aria-label')).not.toContain('Clear all filters')
  })

  it('should link tooltip copy via aria-describedby', () => {
    render(
      <StatTile
        label="Total"
        count={42}
        role="total"
        tooltip="Clear all filters"
        onClick={vi.fn()}
      />,
    )

    const button = screen.getByRole('button', { name: 'Total, 42' })
    const describedBy = button.getAttribute('aria-describedby')

    expect(describedBy).toBeTruthy()

    const description = document.getElementById(describedBy!)

    expect(description).toHaveTextContent('Clear all filters')
  })

  it('should omit aria-describedby when no tooltip is provided', () => {
    render(<StatTile label="Error" count={3} role="error" onClick={vi.fn()} />)

    expect(
      screen.getByRole('button', { name: 'Error, 3' }),
    ).not.toHaveAttribute('aria-describedby')
  })

  it('should call onClick when pressed', async () => {
    const user = userEvent.setup({ delay: null })
    const onClick = vi.fn()

    render(
      <StatTile label="Unread" count={1} role="unread" onClick={onClick} />,
    )

    await user.click(screen.getByRole('button', { name: 'Unread, 1' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
