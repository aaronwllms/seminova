import { AlertCircle } from 'lucide-react'

import { cn } from '@/utils/tailwind'

interface InlineErrorProps {
  message: string
  className?: string
}

export const InlineError = ({ message, className }: InlineErrorProps) => (
  <p
    role="alert"
    className={cn(
      'text-destructive flex items-center gap-1.5 text-sm',
      className,
    )}
  >
    <AlertCircle className="size-[15px] shrink-0" aria-hidden />
    {message}
  </p>
)
