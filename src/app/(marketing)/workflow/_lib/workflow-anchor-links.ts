export type WorkflowAnchorLink = {
  id: string
  label: string
}

export const WORKFLOW_ANCHOR_LINKS: readonly WorkflowAnchorLink[] = [
  { id: 'two-environments', label: 'Two environments' },
  { id: 'plan-review-build', label: 'Plan/review/build' },
  { id: 'the-documents', label: 'Documents' },
  { id: 'agent-conventions', label: 'Conventions' },
] as const
