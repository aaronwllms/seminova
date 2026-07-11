export const WorkflowTwoEnvironmentsSection = () => (
  <section aria-labelledby="two-environments" className="border-t pt-10">
    <h2 className="text-2xl font-semibold tracking-tight" id="two-environments">
      Two environments
    </h2>
    <div className="text-muted-foreground mt-4 max-w-prose space-y-4 text-[15px] leading-relaxed">
      <p>
        Seminova&apos;s planning system runs across two tools with a hard
        boundary between them. Claude owns planning, alignment, and adversarial
        review. Cursor owns implementation — turning approved plans into shipped
        code.
      </p>
      <p>
        In Claude, you shape what to build next, decompose work into epics and
        stories, and review implementation plans before any code lands. In
        Cursor, you initialize spinoffs from the template, generate epic plans,
        and write the product.
      </p>
      <p>
        Artifacts cross the boundary in one direction at a time: requirements
        flow from planning to implementation; repo truth flows back so the next
        planning pass starts from what is actually shipped.
      </p>
    </div>
  </section>
)
