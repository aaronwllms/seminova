import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { LogDetailDialog } from './log-detail-dialog'

const sampleLog = {
  id: 7,
  level: 'warn' as const,
  tag: 'settings-read',
  message: 'Cache miss',
  context: { key: 'log_level' },
  createdAt: '2026-07-18T14:32:07.412Z',
  readAt: null,
  isUnread: true,
}

const readLog = {
  ...sampleLog,
  readAt: '2026-07-18T15:00:00.000Z',
  isUnread: false,
}

describe('LogDetailDialog', () => {
  const originalTz = process.env.TZ

  beforeEach(() => {
    process.env.TZ = 'America/New_York'
  })

  afterEach(() => {
    process.env.TZ = originalTz
  })

  it('should render metadata, message, and context when open', () => {
    render(
      <LogDetailDialog log={sampleLog} open onOpenChange={() => undefined} />,
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Jul 18, 10:32:07 AM.412')).toBeInTheDocument()
    expect(screen.getByText('settings-read')).toBeInTheDocument()
    expect(screen.getByText('Cache miss')).toBeInTheDocument()
    expect(screen.getByText(/"key": "log_level"/)).toBeInTheDocument()
  })

  it('should show Mark unread for a read log and call the handler', async () => {
    const user = userEvent.setup({ delay: null })
    const onMarkUnread = vi.fn()

    render(
      <LogDetailDialog
        log={readLog}
        open
        onOpenChange={() => undefined}
        onMarkUnread={onMarkUnread}
      />,
    )

    await user.click(screen.getByRole('button', { name: /mark unread/i }))

    expect(onMarkUnread).toHaveBeenCalledWith(7)
  })

  it('should hide Mark unread for an unread log', () => {
    render(
      <LogDetailDialog
        log={sampleLog}
        open
        onOpenChange={() => undefined}
        onMarkUnread={() => undefined}
      />,
    )

    expect(
      screen.queryByRole('button', { name: /mark unread/i }),
    ).not.toBeInTheDocument()
  })

  it('should swap the copy button to a Copied state after clicking', async () => {
    const user = userEvent.setup({ delay: null })

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
