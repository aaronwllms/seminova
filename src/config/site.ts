import type { Metadata } from 'next'
import { Sparkles, type LucideIcon } from 'lucide-react'

import { PRIVACY_PATH, REFERENCE_PATH, TERMS_PATH } from '@/constants/app-paths'

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
  nav: SiteNavLink[]
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
    { label: 'Features', href: '#features' },
    { label: 'Reference', href: REFERENCE_PATH },
    { label: 'GitHub', href: GITHUB_URL, external: true },
  ],
  social: [{ label: 'GitHub', href: GITHUB_URL, icon: 'github' }],
  legal: [
    { label: 'Terms', href: TERMS_PATH },
    { label: 'Privacy', href: PRIVACY_PATH },
  ],
}

export const getSiteMetadata = (metadataBase: URL): Metadata => ({
  metadataBase,
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
  },
})
