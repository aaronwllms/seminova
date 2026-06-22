import { toast } from 'sonner'

export const showSuccessToast = (message: string): void => {
  toast.success(message)
}
