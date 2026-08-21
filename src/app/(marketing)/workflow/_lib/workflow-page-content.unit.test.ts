import { siteConfig } from '@/config/site'

import {
  WORKFLOW_DOCUMENTS,
  WORKFLOW_GUIDE_URL,
  WORKFLOW_SETUP_URL,
} from './workflow-page-content'

describe('workflow-page-content', () => {
  it('should point the workflow guide link at the repo docs path', () => {
    expect(WORKFLOW_GUIDE_URL).toBe(
      `${siteConfig.links.github}/blob/main/docs/WORKFLOW_GUIDE.md`,
    )
  })

  it('should point the workflow setup link at the repo docs path', () => {
    expect(WORKFLOW_SETUP_URL).toBe(
      `${siteConfig.links.github}/blob/main/docs/WORKFLOW_SETUP.md`,
    )
  })

  it('should point document paths at the repo on GitHub', () => {
    expect(WORKFLOW_DOCUMENTS[0]?.url).toBe(
      `${siteConfig.links.github}/blob/main/ROADMAP.md`,
    )
    expect(WORKFLOW_DOCUMENTS[1]?.url).toBe(
      `${siteConfig.links.github}/tree/main/docs/prds`,
    )
    expect(WORKFLOW_DOCUMENTS[2]?.url).toBe(
      `${siteConfig.links.github}/blob/main/AGENTS.md`,
    )
  })

  it('should describe the AGENTS.md row by the charter, not as a catalog', () => {
    const agentsDoc = WORKFLOW_DOCUMENTS.find((doc) => doc.name === 'AGENTS.md')

    expect(agentsDoc?.purpose).toBe(
      'Hard constraints, agent workflow gates, merge checklist, and change protocol.',
    )
  })
})
