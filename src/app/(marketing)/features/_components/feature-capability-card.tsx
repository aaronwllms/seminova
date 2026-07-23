import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { REFERENCE_PATH } from '@/constants/app-paths'
import type { FeatureCapability } from '@/config/features-content'
import { Card } from '@/components/ui/card'

type FeatureCapabilityCardProps = {
  capability: FeatureCapability
}

export const FeatureCapabilityCard = ({
  capability,
}: FeatureCapabilityCardProps) => {
  const Icon = capability.icon

  return (
    <Card className="flex flex-col gap-1.5 p-4 shadow-none">
      <Icon className="text-primary size-5" aria-hidden />
      <h3 className="text-[15px] font-medium tracking-tight">
        {capability.name}
      </h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {capability.blurb}
      </p>
      {capability.referenceAnchor ? (
        <Link
          href={`${REFERENCE_PATH}#${capability.referenceAnchor}`}
          className="text-foreground hover:text-primary focus-visible:ring-ring mt-1 inline-flex min-h-11 items-center gap-1 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none md:min-h-0"
        >
          See it live
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      ) : null}
    </Card>
  )
}
