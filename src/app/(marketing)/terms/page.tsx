import type { Metadata } from 'next'

import { TERMS_PATH } from '@/constants/app-paths'

import { LandingContainer } from '../_components/landing-container'
import { LegalPlaceholder } from '../_components/legal-placeholder'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Placeholder Terms of Service for the Seminova template. Replace with your own policy when you spin off.',
  alternates: {
    canonical: TERMS_PATH,
  },
}

export default function TermsPage() {
  return (
    <main id="main-content" className="bg-background py-12">
      <LandingContainer>
        <LegalPlaceholder title="Terms of Service" />
      </LandingContainer>
    </main>
  )
}
