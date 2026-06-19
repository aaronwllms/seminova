import { Badge } from '@/components/ui/badge'
import { landingContent } from '@/config/landing-content'

import { LandingContainer } from './landing-container'
import { LandingFeatureItem } from './landing-feature-item'

export const LandingFeatures = () => {
  const { features } = landingContent

  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="bg-background py-12 md:py-14"
    >
      <LandingContainer>
        <div className="mx-auto mb-10 flex max-w-3xl flex-col items-center gap-4 text-center md:mb-12">
          <Badge variant="secondary">{features.label}</Badge>
          <h2
            id="features-heading"
            className="text-3xl font-semibold tracking-tight text-pretty md:text-4xl lg:text-5xl"
          >
            {features.heading}
          </h2>
        </div>
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 md:gap-12">
          {features.items.map((feature) => (
            <LandingFeatureItem key={feature.title} feature={feature} />
          ))}
        </div>
      </LandingContainer>
    </section>
  )
}
