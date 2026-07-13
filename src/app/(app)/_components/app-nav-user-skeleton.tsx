import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export const AppNavUserSkeleton = () => (
  <Button
    type="button"
    variant="ghost"
    size="icon"
    className="shrink rounded-full"
    disabled
    aria-busy="true"
    aria-label="Loading account menu"
  >
    <Skeleton className="h-8 w-8 rounded-full" aria-hidden="true" />
  </Button>
)
