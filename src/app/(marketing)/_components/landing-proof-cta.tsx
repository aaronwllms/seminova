import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { landingContent } from '@/config/landing-content'

import { LandingContainer } from './landing-container'

export const LandingProofCta = () => {
  const { proofCta } = landingContent
  const [primaryLink, secondaryLink] = proofCta.links

  return (
    <section
      aria-labelledby="proof-cta-heading"
      className="border-border border-t py-10 md:py-12"
    >
      <LandingContainer className="text-center">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4">
          <h2
            id="proof-cta-heading"
            className="text-2xl font-semibold tracking-tight text-pretty md:text-3xl"
          >
            {proofCta.heading}
          </h2>
          <p className="text-muted-foreground max-w-2xl text-pretty md:text-lg">
            {proofCta.subhead}
          </p>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link href={primaryLink.href}>{primaryLink.label}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={secondaryLink.href}>{secondaryLink.label}</Link>
          </Button>
        </div>
      </LandingContainer>
    </section>
  )
}
