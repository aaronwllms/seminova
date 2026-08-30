import type { Metadata } from 'next'
import { Sparkles, type LucideIcon } from 'lucide-react'

import {
  FEATURES_PATH,
  PRIVACY_PATH,
  REFERENCE_PATH,
  TERMS_PATH,
  WORKFLOW_PATH,
} from '@/constants/app-paths'

const GITHUB_URL = 'https://github.com/aaronwllms/seminova'

export interface SiteNavLink {
  label: string
  href: string
  external?: boolean
}

export interface SiteSocialLink {
  label: string
  href: string
  icon: 'github'
}

export interface SiteLegalLink {
  label: string
  href: string
}

export interface SiteFooterColumn {
  heading: string
  links: SiteNavLink[]
}

export interface SiteConfig {
  name: string
  description: string
  // LucideIcon is a Satori compatibility constraint, not a stylistic default:
  // ImageResponse renders Logo for the favicon and OG image; widening this type
  // silently produces blank glyphs. See seo.mdc § Satori constraints.
  Logo: LucideIcon
  links: {
    github: string
  }
  // Header nav only. The footer intentionally keeps a separate, broader list —
  // do not derive one from the other.
  nav: SiteNavLink[]
  footer: SiteFooterColumn[]
  social: SiteSocialLink[]
  legal: SiteLegalLink[]
}

export const siteConfig: SiteConfig = {
  name: 'Seminova',
  description:
    'An opinionated, AI-native starter for building SaaS products with Next.js and Supabase.',
  Logo: Sparkles,
  links: {
    github: GITHUB_URL,
  },
  nav: [
    { label: 'Home', href: '/' },
    { label: 'Features', href: FEATURES_PATH },
    { label: 'Reference', href: REFERENCE_PATH },
    { label: 'Workflow', href: WORKFLOW_PATH },
  ],
  footer: [
    {
      heading: 'Product',
      links: [{ label: 'Features', href: FEATURES_PATH }],
    },
    {
      heading: 'Docs',
      links: [
        { label: 'Reference', href: REFERENCE_PATH },
        { label: 'Workflow', href: WORKFLOW_PATH },
      ],
    },
    {
      heading: 'Project',
      links: [
        { label: 'GitHub', href: GITHUB_URL, external: true },
        { label: 'Issues', href: `${GITHUB_URL}/issues`, external: true },
        { label: 'Releases', href: `${GITHUB_URL}/releases`, external: true },
      ],
    },
  ],
  social: [{ label: 'GitHub', href: GITHUB_URL, icon: 'github' }],
  legal: [
    { label: 'Terms', href: TERMS_PATH },
    { label: 'Privacy', href: PRIVACY_PATH },
  ],
}

export interface PageMetadataInput {
  title: string
  description: string
  path: string
}

/** Site-level Open Graph defaults — spread in any segment that sets its own `openGraph`. */
export const siteOpenGraphBase = {
  title: siteConfig.name,
  description: siteConfig.description,
  siteName: siteConfig.name,
  type: 'website' as const,
}

export const getPageMetadata = ({
  title,
  description,
  path,
}: PageMetadataInput): Metadata => ({
  title,
  description,
  alternates: {
    canonical: path,
  },
  openGraph: {
    ...siteOpenGraphBase,
    title,
    description,
    url: path,
  },
})

export const getSiteMetadata = (metadataBase: URL): Metadata => ({
  metadataBase,
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    ...siteOpenGraphBase,
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
  },
})
