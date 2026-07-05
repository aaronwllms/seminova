import { SIDEBAR_COOKIE_NAME } from './constants'

export function parseSidebarOpenCookie(
  cookieValue: string | undefined | null,
  defaultOpen = true,
): boolean {
  if (cookieValue == null || cookieValue === '') return defaultOpen
  return cookieValue === 'true'
}

export function readSidebarOpenFromDocumentCookie(defaultOpen = true): boolean {
  if (typeof document === 'undefined') return defaultOpen

  const prefix = `${SIDEBAR_COOKIE_NAME}=`
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(prefix))

  return parseSidebarOpenCookie(match?.slice(prefix.length), defaultOpen)
}
