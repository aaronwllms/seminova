import { ExternalLink } from 'lucide-react'

import { Button } from '@/components/ui/button'

import {
  WORKFLOW_GUIDE_URL,
  WORKFLOW_SETUP_URL,
} from '../_lib/workflow-page-content'

export const WorkflowGuideCta = () => (
  <section aria-labelledby="workflow-guide" className="border-t py-10">
    <h2 className="text-2xl font-semibold tracking-tight" id="workflow-guide">
      Go deeper
    </h2>
    <p className="text-muted-foreground mt-4 max-w-prose text-[15px] leading-relaxed">
      This page is a concept map. Setup steps, skill references, model guidance,
      and the full phase-by-phase walkthrough live in the workflow guide on
      GitHub.
    </p>
    <div className="mt-6 flex flex-wrap gap-2">
      <Button asChild>
        <a href={WORKFLOW_GUIDE_URL} rel="noopener noreferrer" target="_blank">
          Read the full workflow guide
          <ExternalLink aria-hidden className="size-4" />
        </a>
      </Button>
      <Button asChild variant="outline">
        <a href={WORKFLOW_SETUP_URL} rel="noopener noreferrer" target="_blank">
          Read the full workflow setup
          <ExternalLink aria-hidden className="size-4" />
        </a>
      </Button>
    </div>
  </section>
)
