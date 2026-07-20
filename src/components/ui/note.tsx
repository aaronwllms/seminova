import { cva, type VariantProps } from 'class-variance-authority'
import { InfoIcon } from 'lucide-react'
import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/utils/tailwind'

const noteVariants = cva('flex gap-3 rounded-lg border p-4 text-sm', {
  variants: {
    variant: {
      info: 'bg-muted/50 border-border text-foreground',
    },
  },
  defaultVariants: {
    variant: 'info',
  },
})

type NoteProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof noteVariants> & {
    icon?: ReactNode
  }

export const Note = ({
  className,
  variant,
  icon,
  children,
  ...props
}: NoteProps) => {
  return (
    <div
      role="note"
      className={cn(noteVariants({ variant }), className)}
      {...props}
    >
      <div className="text-info mt-0.5 shrink-0">
        {icon ?? <InfoIcon className="size-4" aria-hidden />}
      </div>
      <div className="text-muted-foreground [&_strong]:text-foreground min-w-0 flex-1">
        {children}
      </div>
    </div>
  )
}
