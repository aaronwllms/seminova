'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import type { AppLogRow } from '../_lib/app-log-row'
import { buildLogRowCopyText } from '../_lib/build-log-row-copy-text'
import { formatLogTimestampDisplay } from '../_lib/format-log-timestamp-display'
import { LogCopyButton } from './log-copy-button'
import { LogLevelBadge } from './log-level-badge'

interface LogDetailDialogProps {
  log: AppLogRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onMarkUnread?: (id: number) => void
  isMarkUnreadPending?: boolean
}

const formatContextJson = (context: AppLogRow['context']): string => {
  if (context === null) {
    return 'null'
  }

  return JSON.stringify(context, null, 2)
}

const fieldLabelClassName = 'text-muted-foreground mb-1 text-xs'

export const LogDetailDialog = ({
  log,
  open,
  onOpenChange,
  onMarkUnread,
  isMarkUnreadPending = false,
}: LogDetailDialogProps) => {
  if (!log) {
    return null
  }

  const copyText = buildLogRowCopyText({
    createdAt: log.createdAt,
    level: log.level,
    tag: log.tag,
    message: log.message,
    context: log.context,
  })

  const showMarkUnread = !log.isUnread && onMarkUnread

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-6 sm:max-w-2xl">
        <DialogHeader className="mb-6 space-y-0 text-left">
          <DialogTitle>Log details</DialogTitle>
        </DialogHeader>

        <div className="mb-5 grid grid-cols-[1.6fr_0.8fr_1fr] gap-4">
          <div className="min-w-0">
            <p className={fieldLabelClassName}>Timestamp</p>
            <p className="text-sm tabular-nums">
              {formatLogTimestampDisplay(log.createdAt)}
            </p>
          </div>
          <div className="shrink-0">
            <p className={fieldLabelClassName}>Level</p>
            <LogLevelBadge level={log.level} />
          </div>
          <div className="min-w-0">
            <p className={fieldLabelClassName}>Tag</p>
            <p className="truncate font-mono text-sm">{log.tag}</p>
          </div>
        </div>

        <div className="border-border mb-4 border-t pt-4">
          <p className={fieldLabelClassName}>Message</p>
          <p className="text-sm wrap-break-word whitespace-pre-wrap">
            {log.message}
          </p>
        </div>

        <div className="mb-6 min-w-0">
          <p className={fieldLabelClassName}>Context</p>
          <pre className="bg-muted text-muted-foreground max-h-64 w-full min-w-0 overflow-auto rounded-md p-3 font-mono text-xs wrap-break-word whitespace-pre-wrap">
            {formatContextJson(log.context)}
          </pre>
        </div>

        <DialogFooter className="border-border items-center gap-2 border-t pt-4 sm:justify-end">
          {showMarkUnread ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isMarkUnreadPending}
              onClick={() => onMarkUnread(log.id)}
            >
              Mark unread
            </Button>
          ) : null}
          <LogCopyButton
            copyText={copyText}
            ariaLabel="Copy log details"
            size="sm"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
