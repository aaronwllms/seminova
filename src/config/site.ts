import { Sparkles, type LucideIcon } from 'lucide-react'

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

export interface SiteLegalStub {
  label: string
}

export interface SiteConfig {
  name: string
  Logo: LucideIcon
  links: {
    github: string
  }
  nav: SiteNavLink[]
  social: SiteSocialLink[]
  legal: SiteLegalStub[]
}

export const siteConfig: SiteConfig = {
  name: 'Seminova',
  Logo: Sparkles,
  links: {
    github: GITHUB_URL,
  },
  nav: [
    { label: 'Home', href: '/' },
    { label: 'Features', href: '#features' },
    { label: 'GitHub', href: GITHUB_URL, external: true },
  ],
  social: [{ label: 'GitHub', href: GITHUB_URL, icon: 'github' }],
  legal: [{ label: 'Terms' }, { label: 'Privacy' }],
}
