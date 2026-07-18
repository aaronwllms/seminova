'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

interface LogCopyButtonProps {
  copyText: string
  ariaLabel: string
}

export const LogCopyButton = ({ copyText, ariaLabel }: LogCopyButtonProps) => {
  const [didCopy, setDidCopy] = useState(false)

  const handleCopy = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()

    try {
      await navigator.clipboard.writeText(copyText)
      setDidCopy(true)
      window.setTimeout(() => setDidCopy(false), 2000)
    } catch {
      setDidCopy(false)
    }
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
