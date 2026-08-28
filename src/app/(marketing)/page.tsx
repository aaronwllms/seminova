import type { Metadata } from 'next'

import { siteOpenGraphBase } from '@/config/site'
import { getOrganizationWebSiteJsonLdScript } from '@/utils/structured-data'
import { getSiteUrl } from '@/utils/site-url'

import { LandingFeatures } from './_components/landing-features'
import { LandingHero } from './_components/landing-hero'
import { LandingProofCta } from './_components/landing-proof-cta'
import { LandingTechStack } from './_components/landing-tech-stack'

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
  openGraph: {
    ...siteOpenGraphBase,
    url: '/',
  },
}

export default function Home() {
  const jsonLdScript = getOrganizationWebSiteJsonLdScript(getSiteUrl())

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript }}
      />
      <main id="main-content" className="bg-background">
        <LandingHero />
        <LandingFeatures />
        <LandingProofCta />
        <LandingTechStack />
      </main>
    </>
  )
}
