import type { NextRequest } from 'next/server'

import { getSiteUrl } from '@/utils/site-url'

const normalizeOrigin = (value: string): string | null => {
  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

export const isSameOriginRelayRequest = (request: NextRequest): boolean => {
  const expectedOrigin = getSiteUrl().origin
  const origin = request.headers.get('origin')

  if (origin) {
    return normalizeOrigin(origin) === expectedOrigin
  }

  const referer = request.headers.get('referer')

  if (referer) {
    const refererOrigin = normalizeOrigin(referer)
    return refererOrigin === expectedOrigin
  }

  return false
}
