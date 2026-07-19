import 'server-only'

import { headers } from 'next/headers'

import { REQUEST_PATHNAME_LOG_HEADER } from '@/constants/request-log-context'

const toLogContextRecord = (
  context?: unknown,
): Record<string, unknown> | null => {
  if (context === undefined) {
    return null
  }

  if (context instanceof Error) {
    return {
      name: context.name,
      message: context.message,
      stack: context.stack,
    }
  }

  if (
    typeof context === 'object' &&
    context !== null &&
    !Array.isArray(context)
  ) {
    return context as Record<string, unknown>
  }

  return { detail: context }
}

export const getRequestPathnameForLog = async (): Promise<string | null> => {
  const headerStore = await headers()
  const pathname = headerStore.get(REQUEST_PATHNAME_LOG_HEADER)?.trim()

  return pathname || null
}

export const withPathnameLogContext = (
  pathname: string,
  context?: unknown,
): Record<string, unknown> => {
  const normalized = toLogContextRecord(context)

  if (normalized === null) {
    return { pathname }
  }

  return { pathname, ...normalized }
}

export const withRequestPathnameLogContext = async (
  context?: unknown,
): Promise<Record<string, unknown> | undefined> => {
  const pathname = await getRequestPathnameForLog()

  if (!pathname) {
    const normalized = toLogContextRecord(context)
    return normalized ?? undefined
  }

  return withPathnameLogContext(pathname, context)
}
