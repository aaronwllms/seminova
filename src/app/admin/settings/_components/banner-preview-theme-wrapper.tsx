import type { ReactNode } from 'react'

import { cn } from '@/utils/tailwind'

type BannerPreviewThemeWrapperProps = {
  theme: 'light' | 'dark'
  children: ReactNode
}

export const BannerPreviewThemeWrapper = ({
  theme,
  children,
}: BannerPreviewThemeWrapperProps) => (
  <div
    className={cn(
      'bg-background overflow-hidden rounded-md',
      theme === 'dark' ? 'dark' : 'light',
    )}
  >
    {children}
  </div>
)
