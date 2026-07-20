export type ReferenceAnchorLink = {
  id: string
  label: string
}

export const REFERENCE_ANCHOR_LINKS: readonly ReferenceAnchorLink[] = [
  { id: 'design-system', label: 'Design system' },
  { id: 'forms', label: 'Forms and save models' },
  { id: 'feedback', label: 'InlineError and ErrorPanel' },
  { id: 'toast', label: 'Toast' },
  { id: 'table', label: 'Data table' },
] as const

/** Clears sticky site header (h-16) when jumping to in-page anchors. */
export const REFERENCE_SECTION_SCROLL_CLASS = 'scroll-mt-24'
