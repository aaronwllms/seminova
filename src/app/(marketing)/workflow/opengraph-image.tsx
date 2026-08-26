import {
  createOgImageResponse,
  OG_CONTENT_TYPE,
  OG_IMAGE_SIZE,
} from '@/utils/og-image'

import { workflow } from '../_lib/page-meta'

export const alt = workflow.title
export const size = OG_IMAGE_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return createOgImageResponse({
    title: workflow.title,
    description: workflow.description,
  })
}
