import { siteConfig } from '@/config/site'

export const WORKFLOW_GUIDE_URL =
  `${siteConfig.links.github}/blob/main/docs/WORKFLOW_GUIDE.md` as const

export const WORKFLOW_SETUP_URL =
  `${siteConfig.links.github}/blob/main/docs/WORKFLOW_SETUP.md` as const

export type WorkflowEnvironment = 'claude' | 'cursor'

export interface WorkflowEnvironmentLogo {
  src: string
  srcDark?: string
  width: number
  height: number
}

const workflowRepoUrl = (segment: 'blob' | 'tree', path: string) =>
  `${siteConfig.links.github}/${segment}/main/${path}` as const

export const WORKFLOW_AGENTS_URL = workflowRepoUrl('blob', 'AGENTS.md')

export const WORKFLOW_TOOL_LOGOS = {
  claude: {
    src: '/images/logos/Claude Spark - Clay.svg',
    width: 94,
    height: 94,
  },
  cursor: {
    src: '/images/logos/CUBE_2D_LIGHT.svg',
    srcDark: '/images/logos/CUBE_2D_DARK.svg',
    width: 467,
    height: 532,
  },
} as const satisfies Record<WorkflowEnvironment, WorkflowEnvironmentLogo>

export const WORKFLOW_ENVIRONMENTS = [
  {
    name: 'Claude Desktop',
    logo: WORKFLOW_TOOL_LOGOS.claude,
    owns: [
      'Planning, alignment, and adversarial review',
      'Project kickoff and phase planning',
      'PRDs, roadmap, and shared vocabulary updates',
      'Implementation plan review before any code lands',
    ],
  },
  {
    name: 'Cursor',
    logo: WORKFLOW_TOOL_LOGOS.cursor,
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
    repoPath: 'ROADMAP.md',
    url: workflowRepoUrl('blob', 'ROADMAP.md'),
    writtenBy: 'Claude Desktop',
    readBy: 'Both',
    purpose:
      'Thin phase stubs — the planning horizon with status and PRD links.',
  },
  {
    name: 'docs/prds/',
    repoPath: 'docs/prds',
    url: workflowRepoUrl('tree', 'docs/prds'),
    writtenBy: 'Claude Desktop',
    readBy: 'Cursor',
    purpose: 'Per-phase forward intent — epics, stories, and success criteria.',
  },
  {
    name: 'AGENTS.md',
    repoPath: 'AGENTS.md',
    url: workflowRepoUrl('blob', 'AGENTS.md'),
    writtenBy: 'Cursor',
    readBy: 'Both',
    purpose:
      'Repo truth — implemented features, routes, schema, and hard constraints.',
  },
  {
    name: 'LEXICON.md',
    repoPath: 'LEXICON.md',
    url: workflowRepoUrl('blob', 'LEXICON.md'),
    writtenBy: 'Both',
    readBy: 'Both',
    purpose: 'Shared architectural vocabulary inherited by every spinoff.',
  },
  {
    name: 'docs/DOC_RULES.md',
    repoPath: 'docs/DOC_RULES.md',
    url: workflowRepoUrl('blob', 'docs/DOC_RULES.md'),
    writtenBy: 'Claude Desktop',
    readBy: 'Both',
    purpose: 'Authoritative document roles and write discipline.',
  },
] as const

export type WorkflowLoopNodeLayout = 'three-line' | 'two-line'

export interface WorkflowLoopNodeGeometry {
  x: number
  y: number
  width: number
  height: number
  layout: WorkflowLoopNodeLayout
}

export const WORKFLOW_LOOP_NODES = [
  {
    id: 'project-kickoff',
    label: 'Project kickoff',
    skill: 'project-kickoff',
    environment: 'claude',
    detail:
      'One-time setup when a spinoff is cloned from the template. Claude, project-kickoff.',
    geometry: { x: 260, y: 40, width: 150, height: 68, layout: 'three-line' },
  },
  {
    id: 'initialize-project',
    label: 'Initialize project',
    skill: 'initialize-project',
    environment: 'cursor',
    detail:
      'Cursor scaffolds the spinoff repo from the template. Cursor, initialize-project.',
    geometry: { x: 436, y: 40, width: 170, height: 68, layout: 'three-line' },
  },
  {
    id: 'phase-planning',
    label: 'Plan phase',
    skill: 'phase-planning',
    environment: 'claude',
    detail:
      'Requirements and success criteria lock in before any epic starts. Claude, phase-planning.',
    geometry: { x: 60, y: 186, width: 130, height: 68, layout: 'three-line' },
  },
  {
    id: 'plan-next-epic',
    label: 'Plan epic',
    skill: 'plan-next-epic',
    environment: 'cursor',
    detail:
      'Cursor drafts an implementation plan for the next epic. Cursor, plan-next-epic.',
    geometry: { x: 232, y: 186, width: 130, height: 68, layout: 'three-line' },
  },
  {
    id: 'plan-review',
    label: 'Review plan',
    skill: 'plan-review',
    environment: 'claude',
    detail:
      'Claude checks the plan against repo truth and hard constraints before any code lands. Claude, plan-review.',
    geometry: { x: 388, y: 186, width: 130, height: 68, layout: 'three-line' },
  },
  {
    id: 'build',
    label: 'Build',
    skill: null,
    environment: 'cursor',
    detail: 'Cursor implements the approved plan and runs code review.',
    geometry: { x: 544, y: 186, width: 90, height: 68, layout: 'two-line' },
  },
  {
    id: 'ship-phase',
    label: 'Ship phase',
    skill: 'ship-phase',
    environment: 'cursor',
    detail:
      "Once every epic ships, the phase closes and the next planning pass starts from what's actually in the repo. Cursor, ship-phase.",
    geometry: { x: 676, y: 186, width: 130, height: 68, layout: 'three-line' },
  },
] as const satisfies ReadonlyArray<{
  id: string
  label: string
  skill: string | null
  environment: WorkflowEnvironment
  detail: string
  geometry: WorkflowLoopNodeGeometry
}>

export type WorkflowLoopNodeId = (typeof WORKFLOW_LOOP_NODES)[number]['id']

export const WORKFLOW_CI_CONSTRAINTS = [
  {
    name: 'pnpm only',
    check: 'check:pnpm-only',
    description:
      'Never npm or yarn — one lockfile (pnpm-lock.yaml) for every spinoff.',
  },
  {
    name: 'Primitive-first UI',
    check: 'check:no-shadcn-pkg',
    description:
      'Own shadcn/ui components in src/components/ui; never install shadcn as an npm package.',
  },
  {
    name: 'Semantic tokens',
    check: 'check:semantic-tokens',
    description:
      'Themeable UI color uses semantic tokens from globals.css — no raw hex or numeric Tailwind color scales.',
  },
  {
    name: 'Auth boundary',
    check: 'check:auth-boundary',
    description:
      'Public routes are explicitly allowlisted; all others require a session via the auth proxy.',
  },
  {
    name: 'Admin gate',
    check: 'check:admin-gate',
    description:
      'Admin role lives on auth.users app_metadata only — never a profiles column.',
  },
  {
    name: 'SEO base URL',
    check: 'check:seo-base-url',
    description:
      'Absolute site URLs resolve only through getSiteUrl() or metadataBase — no hardcoded origins.',
  },
  {
    name: 'A11y structure',
    check: 'check:a11y-structure',
    description:
      'Every route has exactly one h1, meaningful images have alt text, and heading levels do not skip.',
  },
  {
    name: 'A11y contrast',
    check: 'check:a11y-contrast',
    description:
      'Semantic token foreground pairs in globals.css meet WCAG AA 4.5:1 in both light and dark mode.',
  },
  {
    name: 'Application logging',
    check: 'check:no-raw-console',
    description:
      'Application code logs through appLog, cliLog, or clientLog — raw console.* only at exempt surfaces.',
  },
] as const
