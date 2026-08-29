import { toast } from 'sonner'
import { describe, expect, it, vi } from 'vitest'

import {
  showErrorToast,
  showInfoToast,
  showPromiseToast,
  showSuccessToast,
  showWarningToast,
} from '@/utils/app-toast'

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    promise: vi.fn(),
  },
}))

describe('showSuccessToast', () => {
  it('calls toast.success with the message', () => {
    showSuccessToast('User promoted to admin')

    expect(toast.success).toHaveBeenCalledWith('User promoted to admin')
  })
})

describe('showInfoToast', () => {
  it('calls toast.info with the message', () => {
    showInfoToast('Heads up')

    expect(toast.info).toHaveBeenCalledWith('Heads up')
  })
})

describe('showWarningToast', () => {
  it('calls toast.warning with the message', () => {
    showWarningToast('Check this')

    expect(toast.warning).toHaveBeenCalledWith('Check this')
  })
})

describe('showErrorToast', () => {
  it('calls toast.error with the message', () => {
    showErrorToast('Something failed')

    expect(toast.error).toHaveBeenCalledWith('Something failed')
  })
})

describe('showPromiseToast', () => {
  it('calls toast.promise with the promise and message object', async () => {
    const promise = Promise.resolve('done')
    const messages = { loading: 'Saving…', success: 'Saved' }

    showPromiseToast(promise, messages)

    expect(toast.promise).toHaveBeenCalledWith(promise, messages)
    await promise
  })
})
