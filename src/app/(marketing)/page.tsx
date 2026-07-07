import type { Metadata } from 'next'

import { getOrganizationWebSiteJsonLd } from '@/utils/structured-data'
import { getSiteUrl } from '@/utils/site-url'

import { LandingFeatures } from './_components/landing-features'
import { LandingHero } from './_components/landing-hero'
import { LandingTechStack } from './_components/landing-tech-stack'

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
}

export default function Home() {
  const jsonLd = getOrganizationWebSiteJsonLd(getSiteUrl())

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main id="main-content" className="bg-background">
        <LandingHero />
        <LandingFeatures />
        <LandingTechStack />
      </main>
    </>
  )
}
