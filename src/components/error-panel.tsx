'use client'

import { AlertTriangle, Copy } from 'lucide-react'
import { useState } from 'react'

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
        'border-destructive/30 bg-destructive/5 flex items-center justify-between gap-3.5 rounded-md border p-3',
        className,
      )}
    >
      <div className="flex items-center gap-2.5">
        <AlertTriangle
          className="text-destructive size-[18px] shrink-0"
          aria-hidden
        />
        <p className="text-destructive text-sm">{message}</p>
      </div>
      <div className="flex shrink-0 flex-col items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Copy error details"
          onClick={() => void handleCopy()}
        >
          <Copy className="size-4" />
        </Button>
        <span aria-live="polite" className="text-muted-foreground text-xs">
          {didCopy ? 'Copied' : ''}
        </span>
      </div>
    </div>
  )
}
