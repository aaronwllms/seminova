import {
  createOgImageResponse,
  OG_CONTENT_TYPE,
  OG_IMAGE_SIZE,
} from '@/utils/og-image'

import { terms } from '../_lib/page-meta'

export const alt = terms.title
export const size = OG_IMAGE_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return createOgImageResponse({
    title: terms.title,
    description: terms.description,
  })
}
