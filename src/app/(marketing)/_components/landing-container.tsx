import { cn } from '@/utils/tailwind'

type LandingContainerProps = {
  children: React.ReactNode
  className?: string
}

export const LandingContainer = ({
  children,
  className,
}: LandingContainerProps) => (
  <div className={cn('mx-auto w-full max-w-7xl px-6 lg:px-8', className)}>
    {children}
  </div>
)
