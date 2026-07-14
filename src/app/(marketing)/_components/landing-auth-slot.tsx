import { AppHeaderAccountNav } from '@/app/(app)/_components/app-header-account-nav'
import { LandingAuthButtons } from '@/app/(marketing)/_components/landing-auth-buttons'
import { hasServerAuthSession } from '@/supabase/require-auth'
import { cn } from '@/utils/tailwind'

type LandingAuthSlotProps = {
  layout?: 'row' | 'stack'
  className?: string
}

export const LandingAuthSlot = async ({
  layout = 'row',
  className,
}: LandingAuthSlotProps) => {
  const isAuthenticated = await hasServerAuthSession()

  if (isAuthenticated) {
    return (
      <div className={cn(layout === 'stack' && 'w-full', className)}>
        <AppHeaderAccountNav showOpenApp />
      </div>
    )
  }

  return <LandingAuthButtons layout={layout} className={className} />
}
