import type { Metadata } from 'next'

import { REFERENCE_PATH } from '@/constants/app-paths'
import { Badge } from '@/components/ui/badge'

import { SiteContainer } from '@/components/site-container'
import { ReferenceDesignSystemSection } from './_components/reference-design-system-section'
import { ReferenceFeedbackSection } from './_components/reference-feedback-section'
import { ReferenceFormsSection } from './_components/reference-forms-section'
import { ReferenceSectionNav } from './_components/reference-section-nav'
import { ReferenceTableSection } from './_components/reference-table-section'
import { ReferenceToastSection } from './_components/reference-toast-section'

export const metadata: Metadata = {
  title: 'Pattern Reference',
  description:
    'Live demos of shipped form save models, error surfaces, toast variants, canonical data table, and design tokens your spinoff inherits from Seminova.',
  alternates: {
    canonical: REFERENCE_PATH,
  },
}

export default function ReferencePage() {
  return (
    <main id="main-content" className="bg-background py-12">
      <SiteContainer>
        <div className="mx-auto max-w-3xl px-4 sm:px-0">
          <div className="text-center">
            <Badge variant="secondary" className="mb-3">
              Pattern reference
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              What you inherit
            </h1>
            <p className="text-muted-foreground mx-auto mt-2 max-w-md text-[15px] leading-relaxed">
              Every component below is the one your spinoff imports. Nothing
              here is a reimplementation.
            </p>
          </div>

          <ReferenceSectionNav />
        </div>

        <div className="mx-auto max-w-3xl px-4 sm:px-0">
          <ReferenceDesignSystemSection />
          <ReferenceFormsSection />
          <ReferenceFeedbackSection />
          <ReferenceToastSection />
        </div>

        <ReferenceTableSection />
      </SiteContainer>
    </main>
  )
}
