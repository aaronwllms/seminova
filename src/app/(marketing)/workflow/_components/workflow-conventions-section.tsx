import { WORKFLOW_CI_CONSTRAINTS } from '../_lib/workflow-page-content'
import { WORKFLOW_SECTION_SCROLL_CLASS } from '../_lib/workflow-anchor-links'

export const WorkflowConventionsSection = () => (
  <section aria-labelledby="agent-conventions" className="border-t py-10">
    <div className="mx-auto max-w-3xl px-4 sm:px-0">
      <h2
        className={`${WORKFLOW_SECTION_SCROLL_CLASS} text-2xl font-semibold tracking-tight`}
        id="agent-conventions"
      >
        Agent-ready conventions
      </h2>
      <p className="text-muted-foreground mt-4 max-w-prose text-[15px] leading-relaxed">
        Hard constraints are mechanically enforced so any AI agent inherits the
        same quality bars on day one. CI fails when these are violated.
      </p>
      <ul className="text-muted-foreground mt-4 max-w-prose list-disc space-y-2 pl-5 text-[15px] leading-relaxed">
        {WORKFLOW_CI_CONSTRAINTS.map((constraint) => (
          <li key={constraint.name}>
            <span className="text-foreground font-medium">
              {constraint.name}
            </span>
            {' — '}
            {constraint.description}
          </li>
        ))}
      </ul>
    </div>
  </section>
)
