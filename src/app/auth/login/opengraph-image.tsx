import { siteConfig } from '@/config/site'
import {
  createOgImageResponse,
  formatOgPageTitle,
  OG_CONTENT_TYPE,
  OG_IMAGE_SIZE,
} from '@/utils/og-image'

export const alt = 'Login'
export const size = OG_IMAGE_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return createOgImageResponse({
    title: formatOgPageTitle('Login'),
    description: siteConfig.description,
  })
}
