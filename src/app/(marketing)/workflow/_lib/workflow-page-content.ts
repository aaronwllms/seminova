import { siteConfig } from '@/config/site'

export const WORKFLOW_GUIDE_URL =
  `${siteConfig.links.github}/blob/main/docs/WORKFLOW_GUIDE.md` as const

export type WorkflowEnvironment = 'claude' | 'cursor'

export const WORKFLOW_ENVIRONMENTS = [
  {
    name: 'Claude Desktop',
    owns: [
      'Planning, alignment, and adversarial review',
      'Project kickoff and phase planning',
      'PRDs, roadmap, and shared vocabulary updates',
      'Implementation plan review before any code lands',
    ],
  },
  {
    name: 'Cursor',
    owns: [
      'Initializing spinoffs from the template',
      'Epic implementation plans',
      'Building and shipping code',
      'Repo truth sync after behavior changes',
    ],
  },
] as const

export const WORKFLOW_DOCUMENTS = [
  {
    name: 'ROADMAP.md',
    writtenBy: 'Claude Desktop',
    readBy: 'Both',
    purpose:
      'Thin phase stubs — the planning horizon with status and PRD links.',
  },
  {
    name: 'docs/prds/',
    writtenBy: 'Claude Desktop',
    readBy: 'Cursor',
    purpose: 'Per-phase forward intent — epics, stories, and success criteria.',
  },
  {
    name: 'AGENTS.md',
    writtenBy: 'Cursor',
    readBy: 'Both',
    purpose:
      'Repo truth — implemented features, routes, schema, and hard constraints.',
  },
  {
    name: 'LEXICON.md',
    writtenBy: 'Both',
    readBy: 'Both',
    purpose: 'Shared architectural vocabulary inherited by every spinoff.',
  },
  {
    name: 'docs/DOC_RULES.md',
    writtenBy: 'Claude Desktop',
    readBy: 'Both',
    purpose: 'Authoritative document roles and write discipline.',
  },
] as const

export const WORKFLOW_LOOP_NODES = [
  {
    id: 'project-kickoff',
    label: 'Project kickoff',
    skill: 'project-kickoff',
    environment: 'claude',
    detail:
      'One-time setup when a spinoff is cloned from the template. Claude, project-kickoff.',
  },
  {
    id: 'initialize-project',
    label: 'Initialize project',
    skill: 'initialize-project',
    environment: 'cursor',
    detail:
      'Cursor scaffolds the spinoff repo from the template. Cursor, initialize-project.',
  },
  {
    id: 'phase-planning',
    label: 'Plan phase',
    skill: 'phase-planning',
    environment: 'claude',
    detail:
      'Requirements and success criteria lock in before any epic starts. Claude, phase-planning.',
  },
  {
    id: 'plan-next-epic',
    label: 'Plan epic',
    skill: 'plan-next-epic',
    environment: 'cursor',
    detail:
      'Cursor drafts an implementation plan for the next epic. Cursor, plan-next-epic.',
  },
  {
    id: 'plan-review',
    label: 'Review plan',
    skill: 'plan-review',
    environment: 'claude',
    detail:
      'Claude checks the plan against repo truth and hard constraints before any code lands. Claude, plan-review.',
  },
  {
    id: 'build',
    label: 'Build',
    skill: null,
    environment: 'cursor',
    detail: 'Cursor implements the approved plan and runs code review.',
  },
  {
    id: 'ship-phase',
    label: 'Ship phase',
    skill: 'ship-phase',
    environment: 'cursor',
    detail:
      "Once every epic ships, the phase closes and the next planning pass starts from what's actually in the repo. Cursor, ship-phase.",
  },
] as const satisfies ReadonlyArray<{
  id: string
  label: string
  skill: string | null
  environment: WorkflowEnvironment
  detail: string
}>

export const WORKFLOW_CI_CONSTRAINTS = [
  {
    name: 'Auth boundary',
    description:
      'Public routes are explicitly allowlisted; all others require a session — enforced by check:auth-boundary.',
  },
  {
    name: 'Admin gate',
    description:
      'Admin role lives on auth.users app_metadata only — enforced by check:admin-gate.',
  },
  {
    name: 'Semantic tokens',
    description:
      'Themeable UI color must use semantic tokens, not raw hex or color scales — enforced by check:semantic-tokens.',
  },
  {
    name: 'SEO base URL',
    description:
      'Absolute site URLs resolve only through getSiteUrl() — enforced by check:seo-base-url.',
  },
] as const
