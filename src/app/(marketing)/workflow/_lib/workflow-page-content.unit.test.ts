import { siteConfig } from '@/config/site'

import { WORKFLOW_DOCUMENTS, WORKFLOW_GUIDE_URL } from './workflow-page-content'

describe('workflow-page-content', () => {
  it('should point the workflow guide link at the repo docs path', () => {
    expect(WORKFLOW_GUIDE_URL).toBe(
      `${siteConfig.links.github}/blob/main/docs/WORKFLOW_GUIDE.md`,
    )
  })

  it('should describe each planning document by role', () => {
    expect(WORKFLOW_DOCUMENTS.map((document) => document.name)).toEqual([
      'Phase roadmap',
      'Phase requirements',
      'Repo truth',
      'Shared vocabulary',
      'Doc maintenance rules',
    ])
  })
})
