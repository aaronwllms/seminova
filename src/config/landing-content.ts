import {
  Accessibility,
  Blocks,
  Bot,
  LayoutDashboard,
  Palette,
  Users,
  type LucideIcon,
} from 'lucide-react'

export interface LandingFeature {
  title: string
  description: string
  icon: LucideIcon
}

export interface LandingTechLogo {
  name: string
  src: string
  srcDark?: string
  width: number
  height: number
}

export const landingContent = {
  hero: {
    title: 'Start curated, not from scratch',
    description:
      'An opinionated, AI-native starter with a real design-system structure, agent conventions, and admin shell — so your product begins consistent instead of blank.',
    cta: { label: 'Get started', href: '/auth/sign-up' },
  },
  features: {
    label: 'Features',
    heading: 'Everything a SaaS foundation should ship with',
    items: [
      {
        title: 'Design-system token layer',
        description:
          'Semantic design tokens, not hardcoded values — the industry-standard pattern for theme consistency at scale.',
        icon: Palette,
      },
      {
        title: 'Primitive-first components',
        description:
          'shadcn/ui components owned as source, not installed as a dependency — the primitive-first pattern, not a black-box library.',
        icon: Blocks,
      },
      {
        title: 'Accessibility by default',
        description:
          'WCAG 2.1 AA conventions — semantic HTML, focus states, contrast — are baked into the foundation, not bolted on after launch.',
        icon: Accessibility,
      },
      {
        title: 'Admin shell out of the box',
        description:
          'A working admin sidebar, Supabase auth flows, and role-gated access are already wired — start building your product, not your login screen.',
        icon: LayoutDashboard,
      },
      {
        title: 'Agent-ready conventions',
        description:
          'AGENTS.md, rules, and skills lock in coding standards for any agent working in the codebase.',
        icon: Bot,
      },
      {
        title: 'PM/agent collaboration model',
        description:
          'A packaged collaboration model — Claude Desktop for PM-level planning, paired skills that turn the plan into agent-ready work.',
        icon: Users,
      },
    ] satisfies LandingFeature[],
  },
  techStack: {
    label: 'Built with',
    logos: [
      {
        name: 'Next.js',
        src: '/tech/nextjs.svg',
        srcDark: '/tech/nextjs-dark.svg',
        width: 32,
        height: 32,
      },
      { name: 'Supabase', src: '/tech/supabase.svg', width: 31, height: 32 },
      {
        name: 'Vercel',
        src: '/tech/vercel.svg',
        srcDark: '/tech/vercel-dark.svg',
        width: 32,
        height: 28,
      },
      {
        name: 'Tailwind CSS',
        src: '/tech/tailwind.svg',
        srcDark: '/tech/tailwind-dark.svg',
        width: 32,
        height: 27,
      },
      { name: 'shadcn/ui', src: '/tech/shadcn.svg', width: 32, height: 32 },
      {
        name: 'TanStack Query',
        src: '/tech/tanstack-query.svg',
        width: 32,
        height: 32,
      },
    ] satisfies LandingTechLogo[],
  },
} as const
