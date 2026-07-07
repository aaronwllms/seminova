import type { Metadata } from 'next'

import { LandingFeatures } from './_components/landing-features'
import { LandingHero } from './_components/landing-hero'
import { LandingTechStack } from './_components/landing-tech-stack'

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
}

export default function Home() {
  return (
    <main id="main-content" className="bg-background">
      <LandingHero />
      <LandingFeatures />
      <LandingTechStack />
    </main>
  )
}
