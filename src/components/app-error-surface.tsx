import type { AppError } from '@/types/app-error'

import { ErrorPanel } from '@/components/error-panel'
import { InlineError } from '@/components/inline-error'

interface AppErrorSurfaceProps {
  error: AppError | null | undefined
  className?: string
}

export const AppErrorSurface = ({ error, className }: AppErrorSurfaceProps) => {
  if (!error) {
    return null
  }

  if (error.kind === 'fault') {
    return (
      <ErrorPanel
        title="Something went wrong"
        message={error.message}
        code={error.code}
        className={className}
      />
    )
  }

  return <InlineError message={error.message} className={className} />
}
