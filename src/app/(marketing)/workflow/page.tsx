import { getPageMetadata } from '@/config/site'
import { Badge } from '@/components/ui/badge'

import { SiteContainer } from '@/components/site-container'
import { WorkflowConventionsSection } from './_components/workflow-conventions-section'
import { WorkflowDocumentsSection } from './_components/workflow-documents-section'
import { WorkflowGuideCta } from './_components/workflow-guide-cta'
import { WorkflowPlanReviewSection } from './_components/workflow-plan-review-section'
import { WorkflowSectionNav } from './_components/workflow-section-nav'
import { WorkflowTwoEnvironmentsSection } from './_components/workflow-two-environments-section'

import { workflow } from '../_lib/page-meta'

export const metadata = getPageMetadata(workflow)

export default function WorkflowPage() {
  return (
    <main id="main-content" className="bg-background py-12">
      <SiteContainer>
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-0">
          <Badge variant="secondary" className="mb-3">
            Workflow
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How planning and building work
          </h1>
          <p className="text-muted-foreground mx-auto mt-2 max-w-md text-[15px] leading-relaxed">
            A concept map of Seminova&apos;s two-environment model — what each
            side owns, how documents hand off, and the loop that turns
            requirements into shipped code.
          </p>

          <WorkflowSectionNav />
        </div>

        <div className="space-y-0">
          <WorkflowTwoEnvironmentsSection />
          <WorkflowPlanReviewSection />
          <WorkflowDocumentsSection />
          <WorkflowConventionsSection />
        </div>
      </SiteContainer>

      <WorkflowGuideCta />
    </main>
  )
}
