import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { MarketingDisplayCard } from '@/components/marketing-display-card'
import { REFERENCE_PATH } from '@/constants/app-paths'
import type { FeatureCapability } from '@/config/features-content'

type FeatureCapabilityCardProps = {
  capability: FeatureCapability
}

export const FeatureCapabilityCard = ({
  capability,
}: FeatureCapabilityCardProps) => {
  const Icon = capability.icon

  return (
    <MarketingDisplayCard className="flex flex-col gap-1.5">
      <Icon className="text-primary size-5" aria-hidden />
      <h3 className="text-[15px] font-medium tracking-tight">
        {capability.name}
      </h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {capability.blurb}
      </p>
      {capability.referenceAnchor ? (
        // debt: swept-tier CTA link class bundle duplicated in landing-features.tsx; a tier/focus-ring change here can be missed there.
        <Link
          href={`${REFERENCE_PATH}#${capability.referenceAnchor}`}
          className="text-foreground hover:text-primary focus-visible:ring-ring duration-swept mt-1 inline-flex min-h-11 items-center gap-1 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none md:min-h-0"
        >
          See it live
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      ) : null}
    </MarketingDisplayCard>
  )
}
