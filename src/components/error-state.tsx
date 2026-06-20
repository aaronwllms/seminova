'use client'

import { Copy } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/utils/tailwind'

interface BuildErrorCopyTextParams {
  message: string
  code: string
  detail?: string
}

interface ErrorStateProps {
  message: string
  code?: string
  detail?: string
  className?: string
}

export const buildErrorCopyText = ({
  message,
  code,
  detail,
}: BuildErrorCopyTextParams): string => {
  const lines = [message, `Code: ${code}`]

  if (detail) {
    lines.push(`Detail: ${detail}`)
  }

  return lines.join('\n')
}

export const ErrorState = ({
  message,
  code,
  detail,
  className,
}: ErrorStateProps) => {
  if (!code) {
    return (
      <p role="alert" className={cn('text-destructive text-sm', className)}>
        {message}
      </p>
    )
  }

  return (
    <ErrorStateWithCopy
      message={message}
      code={code}
      detail={detail}
      className={className}
    />
  )
}

interface ErrorStateWithCopyProps {
  message: string
  code: string
  detail?: string
  className?: string
}

const ErrorStateWithCopy = ({
  message,
  code,
  detail,
  className,
}: ErrorStateWithCopyProps) => {
  const [didCopy, setDidCopy] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        buildErrorCopyText({ message, code, detail }),
      )
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
        'border-destructive/30 bg-destructive/5 flex items-start justify-between gap-3 rounded-md border p-3',
        className,
      )}
    >
      <p className="text-destructive text-sm">{message}</p>
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
