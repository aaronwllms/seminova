'use client'

import {
  Dialog,
  DialogContent,
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
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm">{log.timestampLabel}</span>
            <LogLevelBadge level={log.level} />
            <span className="text-muted-foreground font-mono text-sm">
              {log.tag}
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Message</p>
            <p className="text-sm wrap-break-word whitespace-pre-wrap">
              {log.message}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Context</p>
            <pre className="bg-muted max-h-64 overflow-auto rounded-md p-3 font-mono text-xs">
              {formatContextJson(log.context)}
            </pre>
          </div>
          <div className="flex justify-end">
            <LogCopyButton copyText={copyText} ariaLabel="Copy log details" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
