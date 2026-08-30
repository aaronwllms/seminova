import { toast } from 'sonner'

export const showSuccessToast = (message: string): void => {
  toast.success(message)
}

// Production calls only showSuccessToast; the four helpers below exist for the
// /reference toast gallery. Errors never surface as toasts in product code
// (notifications.mdc) — showErrorToast is gallery-only and does not change that.

export const showInfoToast = (message: string): void => {
  toast.info(message)
}

export const showWarningToast = (message: string): void => {
  toast.warning(message)
}

export const showErrorToast = (message: string): void => {
  toast.error(message)
}

type PromiseToastMessages = {
  loading: string
  success: string
  error?: string
}

export const showPromiseToast = (
  promise: Promise<unknown>,
  messages: PromiseToastMessages,
): void => {
  toast.promise(promise, messages)
}
