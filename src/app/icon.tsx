import {
  BRAND_MARK_CONTENT_TYPE,
  BRAND_MARK_SIZE,
  createBrandMarkImageResponse,
} from '@/utils/brand-mark-image'

export const size = BRAND_MARK_SIZE
export const contentType = BRAND_MARK_CONTENT_TYPE

export default function Icon() {
  return createBrandMarkImageResponse()
}
