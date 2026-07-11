export const WorkflowTwoEnvironmentsSection = () => (
  <section aria-labelledby="two-environments" className="border-t pt-10">
    <h2 className="text-2xl font-semibold tracking-tight" id="two-environments">
      Two environments
    </h2>
    <div className="text-muted-foreground mt-4 max-w-prose space-y-4 text-[15px] leading-relaxed">
      <p>
        Seminova&apos;s planning system runs across two tools with a hard
        boundary between them. One environment owns planning, alignment, and
        adversarial review. The other owns implementation — turning approved
        plans into shipped code.
      </p>
      <p>
        The planning environment shapes what to build next, decomposes work into
        epics and stories, and reviews implementation plans before any code
        lands. The implementation environment initializes spinoffs from the
        template, generates epic plans, and writes the product.
      </p>
      <p>
        Artifacts cross the boundary in one direction at a time: requirements
        flow from planning to implementation; repo truth flows back so the next
        planning pass starts from what is actually shipped.
      </p>
    </div>
  </section>
)
