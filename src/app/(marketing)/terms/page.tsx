import type { Metadata } from 'next'

import { TERMS_PATH } from '@/constants/app-paths'

import { SiteContainer } from '@/components/site-container'
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
      <SiteContainer>
        <LegalPlaceholder coversBothPolicies title="Terms of Service" />
      </SiteContainer>
    </main>
  )
}
