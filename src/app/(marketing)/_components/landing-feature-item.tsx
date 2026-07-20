import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import type { LandingFeature } from '@/config/landing-content'

type LandingFeatureItemProps = {
  feature: LandingFeature
}

export const LandingFeatureItem = ({ feature }: LandingFeatureItemProps) => {
  const Icon = feature.icon

  return (
    <div className="flex gap-6 md:block md:space-y-4">
      <span className="bg-accent flex size-10 shrink-0 items-center justify-center rounded-full md:size-12">
        <Icon className="size-5" aria-hidden />
      </span>
      <div>
        <h3 className="font-medium tracking-tight md:mb-2 md:text-xl">
          {feature.title}
        </h3>
        <p className="text-muted-foreground text-sm md:text-base">
          {feature.description}
        </p>
        {feature.href ? (
          <Link
            href={feature.href}
            className="text-foreground hover:text-primary focus-visible:ring-ring mt-2 inline-flex min-h-11 items-center gap-1 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none md:min-h-0"
          >
            Learn more
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        ) : null}
      </div>
    </div>
  )
}
