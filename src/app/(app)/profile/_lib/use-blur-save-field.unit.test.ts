import { act, renderHook, waitFor } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ProfileFormInputValues } from './profile-form-schema'
import { useBlurSaveField } from './use-blur-save-field'

const mockUpdateProfileAction = vi.fn()
const mockRefresh = vi.fn()

vi.mock('../actions', () => ({
  updateProfileAction: (...args: unknown[]) => mockUpdateProfileAction(...args),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}))

const defaultValues = {
  displayName: 'Alex',
  bio: 'Builder',
  avatarUrl: null as string | null,
}

const useTestBlurSaveField = () => {
  const form = useForm<ProfileFormInputValues>({
    defaultValues: {
      displayName: defaultValues.displayName ?? '',
      bio: defaultValues.bio ?? '',
      avatarUrl: '',
    },
  })

  return useBlurSaveField({ defaultValues, form })
}

describe('useBlurSaveField', () => {
  beforeEach(() => {
    mockUpdateProfileAction.mockReset()
    mockRefresh.mockReset()
    mockUpdateProfileAction.mockResolvedValue({
      success: true,
      data: defaultValues,
    })
  })

  it('should skip persist when value unchanged from last saved', async () => {
    const { result } = renderHook(() => useTestBlurSaveField())

    const handler = result.current.createTextBlurHandler('displayName', {
      refresh: true,
      toPayload: (trimmed) => ({ displayName: trimmed }),
    })

    await handler()

    expect(mockUpdateProfileAction).not.toHaveBeenCalled()
  })

  it('should persist and refresh when configured', async () => {
    const { result } = renderHook(() => useTestBlurSaveField())

    result.current.lastSavedRef.current.displayName = 'Old'

    const handler = result.current.createTextBlurHandler('displayName', {
      refresh: true,
      toPayload: (trimmed) => ({ displayName: trimmed }),
    })

    await act(async () => {
      await handler()
    })

    await waitFor(() => {
      expect(mockUpdateProfileAction).toHaveBeenCalledWith({
        displayName: 'Alex',
      })
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it('should persist without refresh when refresh is false', async () => {
    const { result } = renderHook(() => useTestBlurSaveField())

    result.current.lastSavedRef.current.bio = 'Old'

    const handler = result.current.createTextBlurHandler('bio', {
      refresh: false,
      toPayload: (trimmed) => ({ bio: trimmed }),
    })

    await act(async () => {
      await handler()
    })

    await waitFor(() => {
      expect(mockUpdateProfileAction).toHaveBeenCalledWith({ bio: 'Builder' })
    })

    expect(mockRefresh).not.toHaveBeenCalled()
  })

  it('should skip duplicate persist while save is in flight', async () => {
    let resolveUpdate: (value: unknown) => void = () => {}
    mockUpdateProfileAction.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveUpdate = resolve
        }),
    )

    const { result } = renderHook(() => useTestBlurSaveField())

    await act(async () => {
      void result.current.persistField({
        field: 'displayName',
        payload: { displayName: 'Jordan' },
        refresh: false,
      })
      void result.current.persistField({
        field: 'displayName',
        payload: { displayName: 'Jordan' },
        refresh: false,
      })
    })

    await waitFor(() => {
      expect(mockUpdateProfileAction).toHaveBeenCalledTimes(1)
    })

    await act(async () => {
      resolveUpdate({
        success: true,
        data: defaultValues,
      })
    })
  })
})
