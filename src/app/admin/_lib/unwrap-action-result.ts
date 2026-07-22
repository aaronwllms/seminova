import type { AppError } from '@/types/app-error'

type ActionResult<TData> =
  | { success: true; data: TData }
  | { success: false; error: AppError }

export const unwrapActionResult = <TData>(
  result: ActionResult<TData>,
): TData => {
  if (!result.success) {
    throw result.error
  }

  return result.data
}
