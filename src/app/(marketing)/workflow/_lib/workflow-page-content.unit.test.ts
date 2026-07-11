import { siteConfig } from '@/config/site'

import { WORKFLOW_GUIDE_URL } from './workflow-page-content'

describe('workflow-page-content', () => {
  it('should point the workflow guide link at the repo docs path', () => {
    expect(WORKFLOW_GUIDE_URL).toBe(
      `${siteConfig.links.github}/blob/main/docs/WORKFLOW_GUIDE.md`,
    )
  })
})
