import { cn } from '@/utils/tailwind'

type SiteContainerProps = {
  children: React.ReactNode
  className?: string
}

export const SiteContainer = ({ children, className }: SiteContainerProps) => (
  <div className={cn('mx-auto w-full max-w-7xl px-6 lg:px-8', className)}>
    {children}
  </div>
)
