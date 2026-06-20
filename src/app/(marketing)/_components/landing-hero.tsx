import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { landingContent } from '@/config/landing-content'

import { LandingContainer } from './landing-container'

export const LandingHero = () => {
  const { hero } = landingContent

  return (
    <section className="bg-background py-14 md:py-16">
      <LandingContainer className="text-center">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          <h1 className="text-3xl font-semibold tracking-tight text-balance lg:text-5xl">
            {hero.title}
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-balance lg:text-lg">
            {hero.description}
          </p>
        </div>
        <Button asChild size="lg" className="mt-8 h-12 px-8 text-base">
          <Link href={hero.cta.href}>{hero.cta.label}</Link>
        </Button>
      </LandingContainer>
    </section>
  )
}
