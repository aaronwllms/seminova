const WORKFLOW_DIAGRAM_ALT =
  'Seminova workflow: project kickoff and initialize project feed into a phase loop (plan phase, then a nested epic loop of plan epic, review plan, build, then ship phase)'

export const WorkflowDiagram = () => (
  <picture className="block w-full">
    <source
      media="(prefers-color-scheme: dark)"
      srcSet="/images/workflow-dark.svg"
    />
    <source
      media="(prefers-color-scheme: light)"
      srcSet="/images/workflow-light.svg"
    />
    <img
      alt={WORKFLOW_DIAGRAM_ALT}
      className="w-full rounded-lg border"
      height={320}
      src="/images/workflow-light.svg"
      width={860}
    />
  </picture>
)
