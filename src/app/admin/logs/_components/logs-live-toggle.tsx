import { Pause, Play } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/utils/tailwind'

interface LogsLiveToggleProps {
  liveEnabled: boolean
  onLiveEnabledChange: (enabled: boolean) => void
  className?: string
}

export const LogsLiveToggle = ({
  liveEnabled,
  onLiveEnabledChange,
  className,
}: LogsLiveToggleProps) => {
  const Icon = liveEnabled ? Pause : Play

  return (
    <Button
      type="button"
      variant="outline"
      className={cn(
        'relative shrink-0',
        liveEnabled &&
          'border-success text-success bg-background hover:bg-background hover:text-success',
        className,
      )}
      aria-pressed={liveEnabled}
      aria-label={liveEnabled ? 'Turn live feed off' : 'Turn live feed on'}
      onClick={() => onLiveEnabledChange(!liveEnabled)}
    >
      {liveEnabled ? (
        <span
          aria-hidden
          className="shadow-success/45 ring-success/40 pointer-events-none absolute inset-0 animate-pulse rounded-md shadow-[0_0_18px_3px] ring-2"
        />
      ) : null}
      <Icon aria-hidden />
      Live
    </Button>
  )
}
