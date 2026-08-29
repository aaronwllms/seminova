import { ExternalLink } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { SiteContainer } from '@/components/site-container'
import {
  WORKFLOW_GUIDE_URL,
  WORKFLOW_SETUP_URL,
} from '../_lib/workflow-page-content'
import { SECTION_SCROLL_CLASS } from '@/constants/section-scroll'

export const WorkflowGuideCta = () => (
  <section aria-labelledby="workflow-guide" className="bg-muted py-12 md:py-14">
    <SiteContainer className="text-center">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 sm:px-0">
        <h2
          id="workflow-guide"
          className={`${SECTION_SCROLL_CLASS} text-2xl font-semibold tracking-tight text-pretty md:text-3xl`}
        >
          Go deeper
        </h2>
        <p className="text-muted-foreground max-w-2xl text-pretty md:text-lg">
          This page is a concept map. Setup steps, skill references, model
          guidance, and the full phase-by-phase walkthrough live in the workflow
          guide on GitHub.
        </p>
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button asChild>
          <a
            href={WORKFLOW_GUIDE_URL}
            rel="noopener noreferrer"
            target="_blank"
          >
            Read the full workflow guide
            <ExternalLink aria-hidden className="size-4" />
          </a>
        </Button>
        <Button asChild variant="outline">
          <a
            href={WORKFLOW_SETUP_URL}
            rel="noopener noreferrer"
            target="_blank"
          >
            Read the full workflow setup
            <ExternalLink aria-hidden className="size-4" />
          </a>
        </Button>
      </div>
    </SiteContainer>
  </section>
)
