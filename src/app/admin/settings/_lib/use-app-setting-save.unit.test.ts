import { beforeEach, describe, expect, it, vi } from 'vitest'

import { act, renderHook, waitFor } from '@/test/test-utils'

import { useAppSettingSave } from './use-app-setting-save'

const saveAppSettingActionMock = vi.fn()
const showSuccessToastMock = vi.fn()

vi.mock('@/app/admin/settings/_lib/actions', () => ({
  saveAppSettingAction: (...args: unknown[]) =>
    saveAppSettingActionMock(...args),
}))

vi.mock('@/utils/app-toast', () => ({
  showSuccessToast: (...args: unknown[]) => showSuccessToastMock(...args),
}))

describe('useAppSettingSave', () => {
  const onSavedMock = vi.fn()
  const resetFormMock = vi.fn()

  beforeEach(() => {
    saveAppSettingActionMock.mockReset()
    showSuccessToastMock.mockReset()
    onSavedMock.mockReset()
    resetFormMock.mockReset()
  })

  it('should call onSaved and show a toast when parse succeeds and the action succeeds', async () => {
    saveAppSettingActionMock.mockResolvedValue({
      success: true,
      data: { key: 'min_log_level', value: 'warn' },
    })

    const { result } = renderHook(() =>
      useAppSettingSave({
        key: 'min_log_level',
        label: 'Minimum log level',
        savedValue: 'info',
        parse: () => 'warn',
        onSaved: onSavedMock,
        resetForm: resetFormMock,
      }),
    )

    await act(async () => {
      await result.current.save()
    })

    expect(saveAppSettingActionMock).toHaveBeenCalledWith({
      key: 'min_log_level',
      value: 'warn',
    })
    expect(onSavedMock).toHaveBeenCalledWith('min_log_level', 'warn')
    expect(showSuccessToastMock).toHaveBeenCalledWith('Minimum log level saved')
    expect(result.current.isSaving).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should set error and skip onSaved when the action fails', async () => {
    saveAppSettingActionMock.mockResolvedValue({
      success: false,
      error: {
        message: 'Save failed',
        code: 'INTERNAL_ERROR',
        kind: 'fault',
      },
    })

    const { result } = renderHook(() =>
      useAppSettingSave({
        key: 'log_retention_days',
        label: 'Log retention window',
        savedValue: 30,
        parse: () => 45,
        onSaved: onSavedMock,
        resetForm: resetFormMock,
      }),
    )

    await act(async () => {
      await result.current.save()
    })

    await waitFor(() => {
      expect(result.current.error).toEqual({
        message: 'Save failed',
        code: 'INTERNAL_ERROR',
        kind: 'fault',
      })
    })
    expect(onSavedMock).not.toHaveBeenCalled()
    expect(showSuccessToastMock).not.toHaveBeenCalled()
    expect(result.current.isSaving).toBe(false)
  })

  it('should not call the action when parse returns null', async () => {
    const { result } = renderHook(() =>
      useAppSettingSave({
        key: 'min_log_level',
        label: 'Minimum log level',
        savedValue: 'info',
        parse: () => null,
        onSaved: onSavedMock,
        resetForm: resetFormMock,
      }),
    )

    await act(async () => {
      await result.current.save()
    })

    expect(saveAppSettingActionMock).not.toHaveBeenCalled()
    expect(onSavedMock).not.toHaveBeenCalled()
    expect(showSuccessToastMock).not.toHaveBeenCalled()
  })
})
