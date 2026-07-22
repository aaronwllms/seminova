import type { AppError, ErrorKind } from '@/types/app-error'

const ERROR_KINDS: ReadonlySet<ErrorKind> = new Set(['operational', 'fault'])

const SYNTHETIC_FAULT_MESSAGE = 'Something went wrong'

export const isAppError = (error: unknown): error is AppError => {
  if (typeof error !== 'object' || error === null) {
    return false
  }

  const candidate = error as AppError

  return (
    typeof candidate.message === 'string' && ERROR_KINDS.has(candidate.kind)
  )
}

export const toAppError = (error: unknown): AppError => {
  if (isAppError(error)) {
    return error
  }

  return {
    kind: 'fault',
    message: SYNTHETIC_FAULT_MESSAGE,
  }
}
