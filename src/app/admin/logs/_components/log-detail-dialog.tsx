'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { buildLogRowCopyText } from '../_lib/build-log-row-copy-text'
import type { AppLogRow } from '../_lib/app-log-row'
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="border-border space-y-3 border-b pr-8 pb-4">
          <DialogTitle>Log details</DialogTitle>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground font-mono text-sm">
              {log.timestampLabel}
            </span>
            <LogLevelBadge level={log.level} />
            <span className="text-muted-foreground font-mono text-sm">
              {log.tag}
            </span>
          </div>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <p className="text-sm wrap-break-word whitespace-pre-wrap">
            {log.message}
          </p>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Context</p>
            <pre className="bg-muted max-h-64 overflow-auto rounded-md p-3 font-mono text-xs">
              {formatContextJson(log.context)}
            </pre>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:justify-between">
          <div>
            {!log.isUnread && onMarkUnread ? (
              <Button
                type="button"
                variant="outline"
                disabled={isMarkUnreadPending}
                onClick={() => onMarkUnread(log.id)}
              >
                Mark unread
              </Button>
            ) : null}
          </div>
          <LogCopyButton copyText={copyText} ariaLabel="Copy log details" />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
