'use client'

import { useSelectedLayoutSegment } from 'next/navigation'

import { cn } from '@/utils/tailwind'

type MarketingFooterBorderProps = {
  children: React.ReactNode
}

export const MarketingFooterBorder = ({
  children,
}: MarketingFooterBorderProps) => {
  const segment = useSelectedLayoutSegment()

  return (
    <div className={cn(segment !== 'workflow' && 'border-t')}>{children}</div>
  )
}
