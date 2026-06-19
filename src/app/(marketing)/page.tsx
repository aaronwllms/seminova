import { LandingFeatures } from './_components/landing-features'
import { LandingHero } from './_components/landing-hero'
import { LandingTechStack } from './_components/landing-tech-stack'

export default function Home() {
  return (
    <main id="main-content" className="bg-background">
      <LandingHero />
      <LandingFeatures />
      <LandingTechStack />
    </main>
  )
}
