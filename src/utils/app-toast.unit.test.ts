import { toast } from 'sonner'
import { describe, expect, it, vi } from 'vitest'

import { showSuccessToast } from '@/utils/app-toast'

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
  },
}))

describe('showSuccessToast', () => {
  it('calls toast.success with the message', () => {
    showSuccessToast('User promoted to admin')

    expect(toast.success).toHaveBeenCalledWith('User promoted to admin')
  })
})
