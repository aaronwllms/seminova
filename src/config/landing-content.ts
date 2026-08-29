import {
  FEATURES_PATH,
  REFERENCE_PATH,
  WORKFLOW_PATH,
} from '@/constants/app-paths'

export interface LandingTechLogo {
  name: string
  src: string
  srcDark?: string
  width: number
  height: number
}

export interface LandingProofCtaLink {
  label: string
  href: string
}

export const landingContent = {
  hero: {
    title: 'Start curated, not from scratch',
    description:
      'An opinionated, AI-native starter with a real design-system structure, agent conventions, and admin shell — so your product begins consistent instead of blank.',
    cta: { label: 'Get started', href: '/auth/sign-up' },
    secondaryCta: {
      label: 'View pattern reference',
      href: REFERENCE_PATH,
    },
  },
  featureHighlights: {
    label: 'Feature highlights',
    heading: "The pieces you'd otherwise build first",
    cta: { label: 'See all features', href: FEATURES_PATH },
  },
  proofCta: {
    heading: 'Explore the template',
    subhead: 'Live components to browse, and the process that builds them.',
    // Fixed at two links — landing-proof-cta renders a primary and secondary button.
    links: [
      { label: 'Pattern reference', href: '/reference' },
      { label: 'How planning works', href: '/workflow' },
    ] satisfies readonly [LandingProofCtaLink, LandingProofCtaLink],
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
