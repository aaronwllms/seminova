import { LOGIN_PATH } from '@/constants/app-paths'

import { isSafeRedirect } from './is-safe-redirect'

export const buildLoginRedirectUrl = (
  intendedPath: string,
  baseUrl: string,
): URL => {
  const url = new URL(LOGIN_PATH, baseUrl)

  if (isSafeRedirect(intendedPath, baseUrl)) {
    url.searchParams.set('next', intendedPath)
  }

  return url
}
