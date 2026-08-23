'use client'

import { AlertTriangle, Check, Copy } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { buildStructuredCopyText } from '@/utils/build-structured-copy-text'
import { cn } from '@/utils/tailwind'

interface BuildErrorCopyTextParams {
  message: string
  code?: string
  digest?: string
}

interface ErrorPanelProps {
  title?: string
  message: string
  code?: string
  digest?: string
  className?: string
}

export const buildErrorCopyText = ({
  message,
  code,
  digest,
}: BuildErrorCopyTextParams): string =>
  buildStructuredCopyText({ message, code, digest })

export const ErrorPanel = ({
  title,
  message,
  code,
  digest,
  className,
}: ErrorPanelProps) => {
  const { didCopy, copy } = useCopyToClipboard(
    buildErrorCopyText({ message, code, digest }),
  )

  const chipLabel = code ?? digest
  const contentIndent = title ? 'pl-[30px]' : undefined

  return (
    <div
      role="alert"
      className={cn(
        'bg-card surface-elevated flex flex-col rounded-md border p-4',
        className,
      )}
    >
      {title ? (
        <>
          <div className="mb-1.5 flex items-center gap-2.5">
            <AlertTriangle
              className="text-destructive size-5 shrink-0"
              aria-hidden
            />
            <p className="text-sm font-medium">{title}</p>
          </div>
          <p
            className={cn('text-muted-foreground mb-3 text-sm', contentIndent)}
          >
            {message}
          </p>
        </>
      ) : (
        <div className="mb-3 flex items-start gap-2.5">
          <AlertTriangle
            className="text-destructive mt-0.5 size-5 shrink-0"
            aria-hidden
          />
          <p className="text-muted-foreground text-sm">{message}</p>
        </div>
      )}

      <div className="bg-muted ml-[30px] flex items-center justify-between gap-2 rounded-md px-2.5 py-2">
        {chipLabel ? (
          <span className="text-muted-foreground font-mono text-sm">
            {chipLabel}
          </span>
        ) : (
          <span className="sr-only">Error details</span>
        )}
        <Button
          type="button"
          variant="outline"
          size="xs"
          className="min-w-16 shrink-0"
          onClick={() => void copy()}
        >
          {didCopy ? (
            <>
              <Check className="text-success size-3.5" aria-hidden />
              Copied
            </>
          ) : (
            <>
              <Copy className="size-3.5" aria-hidden />
              Copy
            </>
          )}
        </Button>
      </div>
      <span role="status" aria-live="polite" className="sr-only">
        {didCopy ? 'Copied to clipboard' : ''}
      </span>
    </div>
  )
}
