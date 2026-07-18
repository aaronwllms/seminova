import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { LogDetailDialog } from './log-detail-dialog'

const sampleLog = {
  id: 7,
  level: 'warn' as const,
  tag: 'settings-read',
  message: 'Cache miss',
  context: { key: 'log_level' },
  createdAt: '2026-07-18T14:32:07.412Z',
  timestampLabel: 'Jul 18, 2026, 2:32:07 PM.412',
}

describe('LogDetailDialog', () => {
  it('should render message and context when open', () => {
    render(
      <LogDetailDialog log={sampleLog} open onOpenChange={() => undefined} />,
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Cache miss')).toBeInTheDocument()
    expect(screen.getByText(/"key": "log_level"/)).toBeInTheDocument()
  })

  it('should swap the copy button to a Copied state after clicking', async () => {
    const user = userEvent.setup()

    render(
      <LogDetailDialog log={sampleLog} open onOpenChange={() => undefined} />,
    )

    await user.click(screen.getByRole('button', { name: /copy log details/i }))

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /^copied$/i }),
      ).toBeInTheDocument()
    })
    expect(screen.getByRole('status')).toHaveTextContent('Copied to clipboard')
  })
})
