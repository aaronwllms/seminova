import { WORKFLOW_ENVIRONMENTS } from '../_lib/workflow-page-content'

export const WorkflowTwoEnvironmentsSection = () => (
  <section aria-labelledby="two-environments" className="border-t py-10">
    <div className="mx-auto max-w-3xl px-4 sm:px-0">
      <h2
        className="text-2xl font-semibold tracking-tight"
        id="two-environments"
      >
        Two environments
      </h2>
      <p className="text-muted-foreground mt-4 max-w-prose text-[15px] leading-relaxed">
        Seminova&apos;s planning system runs across two tools with a hard
        boundary between them. Requirements flow from planning to
        implementation; repo truth flows back so the next pass starts from what
        is actually shipped.
      </p>
    </div>

    <div className="mx-auto mt-6 grid max-w-6xl gap-4 px-4 sm:grid-cols-2 sm:px-0">
      {WORKFLOW_ENVIRONMENTS.map((environment) => (
        <div key={environment.name} className="bg-card rounded-xl border p-5">
          <h3 className="text-lg font-semibold tracking-tight">
            {environment.name}
          </h3>
          <p className="text-muted-foreground mt-1 text-sm">Owns</p>
          <ul className="text-muted-foreground mt-2 list-disc space-y-1 pl-5 text-[15px] leading-relaxed">
            {environment.owns.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </section>
)
