import {
  Accessibility,
  Activity,
  AlertCircle,
  Ban,
  Bell,
  Blocks,
  Bot,
  CheckCheck,
  ClipboardList,
  Code,
  FileCog,
  FileText,
  Flag,
  Globe,
  KeyRound,
  LayoutDashboard,
  LayoutPanelLeft,
  Lock,
  Mail,
  MailCheck,
  Megaphone,
  Palette,
  Puzzle,
  Radio,
  Ruler,
  Scale,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Map,
  Table,
  Terminal,
  Trash2,
  UserCog,
  Users,
  type LucideIcon,
} from 'lucide-react'

export type ReferenceAnchorId =
  | 'design-system'
  | 'forms'
  | 'feedback'
  | 'toast'
  | 'table'

export interface FeatureCapability {
  name: string
  blurb: string
  icon: LucideIcon
  referenceAnchor?: ReferenceAnchorId
  homeHighlight?: true
}

export interface FeatureCategory {
  id: string
  name: string
  icon: LucideIcon
  capabilities: FeatureCapability[]
}

export const featuresContent = {
  categories: [
    {
      id: 'auth',
      name: 'Auth and role-based access',
      icon: Lock,
      capabilities: [
        {
          name: 'Email and password auth',
          blurb:
            'Sign-up, login, forgot password, and update-password flows under the shared auth layout.',
          icon: Mail,
        },
        {
          name: 'Sessions and route protection',
          blurb:
            'A server-side session gate refreshes on matched requests and redirects unauthenticated visitors from protected routes.',
          icon: Shield,
        },
        {
          name: 'Role-based admin access',
          blurb:
            'Admin privilege keyed on app_metadata.role, enforced in the proxy, admin gate, and server actions.',
          icon: ShieldCheck,
        },
        {
          name: 'Email confirmation flow',
          blurb:
            'Confirm and recovery routes with safe post-auth redirects and mapped auth error copy.',
          icon: MailCheck,
        },
      ],
    },
    {
      id: 'admin-console',
      name: 'Admin console',
      icon: LayoutDashboard,
      capabilities: [
        {
          name: 'Admin shell',
          blurb:
            'A sidebar console layout with breadcrumb and nav, separate from the authenticated app shell.',
          icon: LayoutPanelLeft,
          homeHighlight: true,
        },
        {
          name: 'User management',
          blurb:
            'Paginated, sortable user list with stat-tile filters, debounced search, and focus refetch.',
          icon: Users,
        },
        {
          name: 'Promote and demote',
          blurb:
            'Grant or revoke admin from row actions in the users table or via the secret-key CLI.',
          icon: UserCog,
        },
        {
          name: 'Ban and unban',
          blurb:
            'Time-based or permanent bans with confirmation dialogs; self-ban blocked and unban is idempotent.',
          icon: Ban,
        },
        {
          name: 'Runtime settings',
          blurb:
            'Registry-driven app settings with type-matched controls and per-row save in admin.',
          icon: Settings,
        },
        {
          name: 'Banners admin',
          blurb:
            'Configure public and authenticated banners with schedule, preview, and status badges.',
          icon: Flag,
        },
        {
          name: 'Admin CLI',
          blurb:
            'Break-glass secret-key scripts for promote, demote, delete, and list admins.',
          icon: Terminal,
        },
      ],
    },
    {
      id: 'design-system',
      name: 'Design system',
      icon: Palette,
      capabilities: [
        {
          name: 'Semantic token theming',
          blurb:
            'One semantic token layer drives light and dark across the app — no hardcoded theme colors.',
          icon: Palette,
          referenceAnchor: 'design-system',
          homeHighlight: true,
        },
        {
          name: 'Owned UI primitives',
          blurb:
            'shadcn/ui components vendored as source you edit, not installed as a black-box package.',
          icon: Blocks,
          referenceAnchor: 'design-system',
          homeHighlight: true,
        },
        {
          name: 'Data table pattern',
          blurb:
            'Shared list-view shell with server sort, pagination, stat-tile filters, and skeleton loading.',
          icon: Table,
          referenceAnchor: 'table',
        },
        {
          name: 'Forms and save models',
          blurb:
            'Canonical blur-save, explicit submit, and upload-on-complete patterns with schema validation.',
          icon: ClipboardList,
          referenceAnchor: 'forms',
        },
        {
          name: 'Error surfaces',
          blurb:
            'Operational InlineError and fault ErrorPanel branches — errors never surface as toasts.',
          icon: AlertCircle,
          referenceAnchor: 'feedback',
        },
        {
          name: 'Toast system',
          blurb:
            'Semantic success toasts with status icons; confirmations only, never error feedback.',
          icon: Bell,
          referenceAnchor: 'toast',
        },
        {
          name: 'Accessibility checks',
          blurb:
            'CI-enforced heading order, meaningful alt text, and semantic token contrast in both themes.',
          icon: Accessibility,
          homeHighlight: true,
        },
      ],
    },
    {
      id: 'observability',
      name: 'Observability',
      icon: Activity,
      capabilities: [
        {
          name: 'Persistent logging',
          blurb:
            'Structured app logs written to the database via server and CLI wrappers, not raw console.',
          icon: FileText,
        },
        {
          name: 'Live logs feed',
          blurb:
            'Realtime INSERT subscription on the admin logs page with debounced invalidate-and-refetch.',
          icon: Radio,
        },
        {
          name: 'Browser log relay',
          blurb:
            'Client logs POST to a public relay route that forwards to server persistence under client- tags.',
          icon: Globe,
        },
        {
          name: 'Retention auto-purge',
          blurb:
            'Scheduled daily purge of log rows older than the configurable retention window.',
          icon: Trash2,
        },
      ],
    },
    {
      id: 'seo-geo',
      name: 'SEO and GEO',
      icon: Search,
      capabilities: [
        {
          name: 'Metadata and social previews',
          blurb:
            'Per-route metadata and dynamic Open Graph images resolved from a single site URL helper.',
          icon: Megaphone,
        },
        {
          name: 'Sitemap and robots',
          blurb:
            'Auto-discovered marketing routes in the sitemap with training-crawler disallow policy.',
          icon: Map,
        },
        {
          name: 'Structured data',
          blurb:
            'Organization and WebSite JSON-LD on the landing page, driven from site config.',
          icon: Code,
        },
      ],
    },
    {
      id: 'pm-agent-workflow',
      name: 'PM and agent workflow',
      icon: Bot,
      capabilities: [
        {
          name: 'Locked rules',
          blurb:
            'AGENTS.md as repo truth — hard constraints, implemented features, and a change protocol.',
          icon: KeyRound,
          homeHighlight: true,
        },
        {
          name: 'Deterministic rules',
          blurb:
            'Cursor rules with mechanical enforcement via lint rules and check scripts in pre-push.',
          icon: Ruler,
        },
        {
          name: 'Skills suite',
          blurb:
            'Invokable skills for migrations, review, doc sync, and quality audits.',
          icon: Puzzle,
        },
        {
          name: 'CI quality gates',
          blurb:
            'Pre-push hook mirroring CI — type-check, hard-constraint checks, lint, and coverage thresholds.',
          icon: CheckCheck,
        },
        {
          name: 'Collaboration model',
          blurb:
            'A packaged PM + agent partnership — planning docs, workflow explainer, and paired build skills.',
          icon: Users,
          homeHighlight: true,
        },
      ],
    },
    {
      id: 'site-content-config',
      name: 'Site content and configuration',
      icon: FileCog,
      capabilities: [
        {
          name: 'Public banners',
          blurb:
            'Admin-configurable announcement banners on marketing and authenticated surfaces.',
          icon: Flag,
        },
        {
          name: 'Legal placeholder pages',
          blurb:
            'Terms and privacy stubs with generator callouts — replace when you spin off.',
          icon: Scale,
        },
        {
          name: 'Site identity config',
          blurb:
            'Product name, nav links, metadata, and landing copy in three config files to re-skin.',
          icon: Settings,
        },
      ],
    },
  ] satisfies FeatureCategory[],
} as const
