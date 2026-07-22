import type { Metadata } from 'next'

import { PRIVACY_PATH } from '@/constants/app-paths'

import { SiteContainer } from '@/components/site-container'
import { LegalPlaceholder } from '../_components/legal-placeholder'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Placeholder Privacy Policy for the Seminova template. Replace with your own policy when you spin off.',
  alternates: {
    canonical: PRIVACY_PATH,
  },
}

export default function PrivacyPage() {
  return (
    <main id="main-content" className="bg-background py-12">
      <SiteContainer>
        <LegalPlaceholder title="Privacy Policy" />
      </SiteContainer>
    </main>
  )
}
