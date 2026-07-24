import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { getHomeHighlightCapabilities } from '@/config/features-content'
import { landingContent } from '@/config/landing-content'

import { SiteContainer } from '@/components/site-container'
import { LandingFeatureItem } from './landing-feature-item'

export const LandingFeatures = () => {
  const { featureHighlights } = landingContent
  const capabilities = getHomeHighlightCapabilities()

  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="bg-background py-12 md:py-14"
    >
      <SiteContainer>
        <div className="mx-auto mb-10 flex max-w-3xl flex-col items-center gap-4 text-center md:mb-12">
          <Badge variant="secondary">{featureHighlights.label}</Badge>
          <h2
            id="features-heading"
            className="text-3xl font-semibold tracking-tight text-pretty md:text-4xl"
          >
            {featureHighlights.heading}
          </h2>
        </div>
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 md:gap-12">
          {capabilities.map((capability) => (
            <LandingFeatureItem key={capability.name} capability={capability} />
          ))}
        </div>
        <div className="mt-10 flex justify-center md:mt-12">
          {/* debt: swept-tier CTA link class bundle duplicated in feature-capability-card.tsx; a tier/focus-ring change here can be missed there. */}
          <Link
            href={featureHighlights.cta.href}
            className="text-foreground hover:text-primary focus-visible:ring-ring duration-swept inline-flex min-h-11 items-center gap-1 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none md:min-h-0"
          >
            {featureHighlights.cta.label}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </SiteContainer>
    </section>
  )
}
