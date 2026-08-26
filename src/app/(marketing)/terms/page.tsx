import { getPageMetadata } from '@/config/site'

import { SiteContainer } from '@/components/site-container'
import { LegalPlaceholder } from '../_components/legal-placeholder'

import { terms } from '../_lib/page-meta'

export const metadata = getPageMetadata(terms)

export default function TermsPage() {
  return (
    <main id="main-content" className="bg-background py-12">
      <SiteContainer>
        <LegalPlaceholder coversBothPolicies title="Terms of Service" />
      </SiteContainer>
    </main>
  )
}
