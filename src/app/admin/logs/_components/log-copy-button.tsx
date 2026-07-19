'use client'

import { Check, Copy } from 'lucide-react'

import { Button, buttonVariants } from '@/components/ui/button'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import type { VariantProps } from 'class-variance-authority'

interface LogCopyButtonProps {
  copyText: string
  ariaLabel: string
  onCopy?: () => void
  size?: VariantProps<typeof buttonVariants>['size']
}

export const LogCopyButton = ({
  copyText,
  ariaLabel,
  onCopy,
  size = 'xs',
}: LogCopyButtonProps) => {
  const { didCopy, copy } = useCopyToClipboard(copyText)

  const handleCopy = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    onCopy?.()
    void copy()
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size={size}
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
