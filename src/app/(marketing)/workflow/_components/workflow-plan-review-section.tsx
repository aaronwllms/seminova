import { WorkflowDiagram } from './workflow-diagram'

export const WorkflowPlanReviewSection = () => (
  <section aria-labelledby="plan-review-build" className="border-t pt-10">
    <h2
      className="text-2xl font-semibold tracking-tight"
      id="plan-review-build"
    >
      Plan, review, build
    </h2>
    <div className="text-muted-foreground mt-4 max-w-prose space-y-4 text-[15px] leading-relaxed">
      <p>
        Work moves in nested loops. At the phase level, planning locks scope
        into requirements before any epic starts. Within a phase, each epic
        follows the same subloop: plan in the implementation environment, review
        in the planning environment, build, run code review, mark the epic
        complete, then repeat until the phase is ready to ship.
      </p>
      <p>
        Adversarial review before build is the guardrail — implementation plans
        are checked against repo truth and hard constraints so surprises surface
        in chat, not in a diff.
      </p>
    </div>
    <div className="mt-8">
      <WorkflowDiagram />
    </div>
  </section>
)
