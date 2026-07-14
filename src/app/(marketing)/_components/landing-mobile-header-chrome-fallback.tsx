import { AppNavUserSkeleton } from '@/app/(app)/_components/app-nav-user-skeleton'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export const LandingMobileHeaderChromeFallback = () => (
  <div className="flex items-center gap-2">
    <Button
      variant="ghost"
      size="icon-sm"
      disabled
      aria-busy="true"
      aria-label="Open menu"
    >
      <Skeleton className="size-5" aria-hidden="true" />
    </Button>
    <AppNavUserSkeleton />
  </div>
)
