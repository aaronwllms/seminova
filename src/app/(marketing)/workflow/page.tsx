import type { Metadata } from 'next'

import { WORKFLOW_PATH } from '@/constants/app-paths'
import { Badge } from '@/components/ui/badge'

import { LandingContainer } from '../_components/landing-container'
import { WorkflowConventionsSection } from './_components/workflow-conventions-section'
import { WorkflowDocumentsSection } from './_components/workflow-documents-section'
import { WorkflowGuideCta } from './_components/workflow-guide-cta'
import { WorkflowPlanReviewSection } from './_components/workflow-plan-review-section'
import { WorkflowTwoEnvironmentsSection } from './_components/workflow-two-environments-section'

export const metadata: Metadata = {
  title: 'PM + Agent Workflow',
  description:
    'How Seminova splits planning and implementation across two environments, which documents each side owns, and the plan-review-build loop your spinoff inherits.',
  alternates: {
    canonical: WORKFLOW_PATH,
  },
}

export default function WorkflowPage() {
  return (
    <main id="main-content" className="bg-background py-12">
      <LandingContainer>
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
        </div>

        <div className="mt-10 space-y-0">
          <WorkflowTwoEnvironmentsSection />
          <WorkflowPlanReviewSection />
          <WorkflowDocumentsSection />
          <WorkflowConventionsSection />
          <div className="mx-auto max-w-3xl px-4 sm:px-0">
            <WorkflowGuideCta />
          </div>
        </div>
      </LandingContainer>
    </main>
  )
}
