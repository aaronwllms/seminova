import { siteConfig } from '@/config/site'

export const WORKFLOW_GUIDE_URL =
  `${siteConfig.links.github}/blob/main/docs/WORKFLOW_GUIDE.md` as const

export const WORKFLOW_DOCUMENTS = [
  {
    name: 'Phase roadmap',
    writtenBy: 'Planning environment',
    readBy: 'Both environments',
    purpose:
      'A thin horizon of phases — status and where to find each phase’s requirements.',
  },
  {
    name: 'Phase requirements',
    writtenBy: 'Planning environment',
    readBy: 'Implementation environment',
    purpose:
      'Forward intent for one phase: epics, stories, and success criteria to build from.',
  },
  {
    name: 'Repo truth',
    writtenBy: 'Implementation environment',
    readBy: 'Both environments',
    purpose:
      'What is actually shipped today — routes, schema, constraints, and where things live.',
  },
  {
    name: 'Shared vocabulary',
    writtenBy: 'Both environments',
    readBy: 'Both environments',
    purpose:
      'Architectural terms every spinoff inherits; domain terms are added on top.',
  },
  {
    name: 'Doc maintenance rules',
    writtenBy: 'Planning environment',
    readBy: 'Both environments',
    purpose:
      'Authoritative roles for each document and the write discipline that keeps them aligned.',
  },
] as const
