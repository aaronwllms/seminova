import { getPageMetadata } from '@/config/site'

import { SiteContainer } from '@/components/site-container'
import { LegalPlaceholder } from '../_components/legal-placeholder'

import { privacy } from '../_lib/page-meta'

export const metadata = getPageMetadata(privacy)

export default function PrivacyPage() {
  return (
    <main id="main-content" className="bg-background py-12">
      <SiteContainer>
        <LegalPlaceholder title="Privacy Policy" />
      </SiteContainer>
    </main>
  )
}
