'use client'

import { Check, Copy } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'

interface LogCopyButtonProps {
  copyText: string
  ariaLabel: string
}

export const LogCopyButton = ({ copyText, ariaLabel }: LogCopyButtonProps) => {
  const { didCopy, copy } = useCopyToClipboard(copyText)

  const handleCopy = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    void copy()
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="xs"
        className="min-w-16 shrink-0"
        aria-label={didCopy ? 'Copied' : ariaLabel}
        onClick={(event) => void handleCopy(event)}
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
      <span role="status" aria-live="polite" className="sr-only">
        {didCopy ? 'Copied to clipboard' : ''}
      </span>
    </>
  )
}
