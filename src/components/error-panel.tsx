'use client'

import { AlertTriangle, Copy } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/tailwind'

interface BuildErrorCopyTextParams {
  message: string
  code?: string
}

interface ErrorPanelProps {
  message: string
  code?: string
  className?: string
}

export const buildErrorCopyText = ({
  message,
  code,
}: BuildErrorCopyTextParams): string => {
  if (code) {
    return `${message}\nCode: ${code}`
  }

  return message
}

export const ErrorPanel = ({ message, code, className }: ErrorPanelProps) => {
  const [didCopy, setDidCopy] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildErrorCopyText({ message, code }))
      setDidCopy(true)
      window.setTimeout(() => setDidCopy(false), 2000)
    } catch {
      setDidCopy(false)
    }
  }

  return (
    <div
      role="alert"
      className={cn(
        'bg-card flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-start sm:justify-between',
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-2.5">
        <AlertTriangle
          className="text-destructive mt-0.5 size-[18px] shrink-0"
          aria-hidden
        />
        <p className="text-destructive text-sm">{message}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2 sm:items-center">
        <div className="flex flex-wrap items-center justify-end gap-2">
          {code ? (
            <Badge variant="secondary" className="font-mono text-xs">
              {code}
            </Badge>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void handleCopy()}
          >
            <Copy className="size-4" aria-hidden />
            Copy
          </Button>
        </div>
        <span aria-live="polite" className="text-muted-foreground text-xs">
          {didCopy ? 'Copied' : ''}
        </span>
      </div>
    </div>
  )
}
