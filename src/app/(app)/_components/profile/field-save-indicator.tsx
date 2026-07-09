'use client'

import { Check } from 'lucide-react'
import { useEffect } from 'react'

export type FieldSaveState = 'idle' | 'saving' | 'saved'

type FieldSaveIndicatorProps = {
  state: FieldSaveState
  onSavedComplete?: () => void
}

export const FieldSaveIndicator = ({
  state,
  onSavedComplete,
}: FieldSaveIndicatorProps) => {
  useEffect(() => {
    if (state !== 'saved' || !onSavedComplete) {
      return
    }

    const timer = window.setTimeout(onSavedComplete, 2000)
    return () => window.clearTimeout(timer)
  }, [state, onSavedComplete])

  if (state === 'idle') {
    return null
  }

  if (state === 'saving') {
    return (
      <span className="text-muted-foreground text-xs" role="status">
        Saving…
      </span>
    )
  }

  return (
    <span
      className="text-muted-foreground inline-flex items-center gap-1 text-xs"
      role="status"
    >
      <Check className="size-3" aria-hidden />
      Saved
    </span>
  )
}
