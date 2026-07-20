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

/** Clears sticky site header (h-16) when jumping to in-page anchors. */
export const WORKFLOW_SECTION_SCROLL_CLASS = 'scroll-mt-24'
