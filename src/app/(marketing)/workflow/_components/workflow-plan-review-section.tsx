import { WorkflowDiagram } from './workflow-diagram'

export const WorkflowPlanReviewSection = () => (
  <section aria-labelledby="plan-review-build" className="border-t pt-10">
    <div className="mx-auto max-w-3xl px-4 sm:px-0">
      <h2
        className="text-2xl font-semibold tracking-tight"
        id="plan-review-build"
      >
        Plan, review, build
      </h2>
      <div className="text-muted-foreground mt-4 max-w-prose space-y-4 text-[15px] leading-relaxed">
        <p>
          Work moves in nested loops — a phase loop containing an epic loop of
          plan, adversarial review, and build. Hover or focus a step below to
          see which skill and environment own it.
        </p>
        <p>
          Adversarial review before build is the guardrail — implementation
          plans are checked against repo truth and hard constraints so surprises
          surface in chat, not in a diff.
        </p>
      </div>
    </div>

    <div className="mx-auto mt-8 max-w-6xl px-4 sm:px-0">
      <WorkflowDiagram ariaLabelledBy="plan-review-build" />
    </div>
  </section>
)
