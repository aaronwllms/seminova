import type { PageMetadataInput } from '@/config/site'
import {
  FEATURES_PATH,
  PRIVACY_PATH,
  REFERENCE_PATH,
  TERMS_PATH,
  WORKFLOW_PATH,
} from '@/constants/app-paths'

export const features: PageMetadataInput = {
  title: 'Features',
  description:
    'A full inventory of what ships with the template — auth, admin console, design system, observability, SEO, and the agent workflow that builds it.',
  path: FEATURES_PATH,
}

export const workflow: PageMetadataInput = {
  title: 'PM + Agent Workflow',
  description:
    'How Seminova splits planning and implementation across two environments, which documents each side owns, and the plan-review-build loop your spinoff inherits.',
  path: WORKFLOW_PATH,
}

export const reference: PageMetadataInput = {
  title: 'Pattern Reference',
  description:
    'Live demos of shipped form save models, error surfaces, toast variants, canonical data table, and design tokens your spinoff inherits from Seminova.',
  path: REFERENCE_PATH,
}

export const terms: PageMetadataInput = {
  title: 'Terms of Service',
  description:
    'Placeholder Terms of Service for the Seminova template. Replace with your own policy when you spin off.',
  path: TERMS_PATH,
}

export const privacy: PageMetadataInput = {
  title: 'Privacy Policy',
  description:
    'Placeholder Privacy Policy for the Seminova template. Replace with your own policy when you spin off.',
  path: PRIVACY_PATH,
}
