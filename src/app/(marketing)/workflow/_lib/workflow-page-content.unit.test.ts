import { siteConfig } from '@/config/site'

import {
  WORKFLOW_CI_CONSTRAINTS,
  WORKFLOW_DOCUMENTS,
  WORKFLOW_ENVIRONMENTS,
  WORKFLOW_GUIDE_URL,
  WORKFLOW_LOOP_NODES,
} from './workflow-page-content'

describe('workflow-page-content', () => {
  it('should point the workflow guide link at the repo docs path', () => {
    expect(WORKFLOW_GUIDE_URL).toBe(
      `${siteConfig.links.github}/blob/main/docs/WORKFLOW_GUIDE.md`,
    )
  })

  it('should export workflow page data with expected shapes', () => {
    expect(WORKFLOW_ENVIRONMENTS).toHaveLength(2)
    expect(WORKFLOW_DOCUMENTS).toHaveLength(5)
    expect(WORKFLOW_LOOP_NODES).toHaveLength(7)
    expect(WORKFLOW_CI_CONSTRAINTS).toHaveLength(4)
    expect(WORKFLOW_DOCUMENTS[0]?.name).toBe('ROADMAP.md')
  })
})
