import { MarketingDisplayCard } from '@/components/marketing-display-card'
import { Badge } from '@/components/ui/badge'

import {
  WORKFLOW_AGENTS_URL,
  WORKFLOW_CI_CONSTRAINTS,
} from '../_lib/workflow-page-content'
import { SECTION_SCROLL_CLASS } from '@/constants/section-scroll'

export const WorkflowConventionsSection = () => (
  <section aria-labelledby="agent-conventions" className="border-t py-10">
    <div className="mx-auto max-w-3xl px-4 sm:px-0">
      <h2
        className={`${SECTION_SCROLL_CLASS} text-2xl font-semibold tracking-tight`}
        id="agent-conventions"
      >
        Agent-ready conventions
      </h2>
      <p className="text-muted-foreground mt-4 max-w-prose text-[15px] leading-relaxed">
        Hard constraints are mechanically enforced so any AI agent inherits the
        same quality bars on day one. CI fails when these are violated. The full
        list lives in{' '}
        <a
          href={WORKFLOW_AGENTS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground font-medium underline-offset-4 hover:underline"
        >
          AGENTS.md
        </a>
        .
      </p>
    </div>

    <div className="mx-auto mt-6 grid max-w-6xl gap-4 px-4 sm:grid-cols-2 sm:px-0 lg:grid-cols-3">
      {WORKFLOW_CI_CONSTRAINTS.map((constraint) => (
        <MarketingDisplayCard key={constraint.name}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="text-base font-semibold tracking-tight">
              {constraint.name}
            </h3>
            <Badge variant="outline" className="font-mono text-[11px]">
              {constraint.check}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            {constraint.description}
          </p>
        </MarketingDisplayCard>
      ))}
    </div>
  </section>
)
