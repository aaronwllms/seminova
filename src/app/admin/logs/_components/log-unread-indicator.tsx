'use client'

import type { MouseEvent } from 'react'

import { cn } from '@/utils/tailwind'

interface LogUnreadIndicatorProps {
  isUnread: boolean
  onMarkRead: () => void
  logId: number
}

export const LogUnreadIndicator = ({
  isUnread,
  onMarkRead,
  logId,
}: LogUnreadIndicatorProps) => {
  if (!isUnread) {
    return <span aria-hidden className="inline-block size-4 shrink-0" />
  }

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    onMarkRead()
  }

  return (
    <button
      type="button"
      className={cn(
        'inline-flex size-4 shrink-0 items-center justify-center rounded-full',
        'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
      )}
      aria-label={`Mark log ${logId} as read`}
      onClick={handleClick}
    >
      <span className="bg-unread block size-1.5 rounded-full" aria-hidden />
    </button>
  )
}
