import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { landingContent } from '@/config/landing-content'

import { SiteContainer } from '@/components/site-container'

export const LandingHero = () => {
  const { hero } = landingContent

  return (
    <section className="bg-background py-14 md:py-16">
      <SiteContainer className="text-center">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          <h1 className="text-3xl font-semibold tracking-tight text-balance lg:text-5xl">
            {hero.title}
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-balance lg:text-lg">
            {hero.description}
          </p>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Button asChild size="lg" className="h-12 px-8 text-base">
            <Link href={hero.cta.href}>{hero.cta.label}</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 px-8 text-base"
          >
            <Link href={hero.secondaryCta.href}>{hero.secondaryCta.label}</Link>
          </Button>
        </div>
      </SiteContainer>
    </section>
  )
}
