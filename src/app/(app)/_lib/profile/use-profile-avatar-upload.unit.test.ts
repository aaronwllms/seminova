import { act, renderHook, waitFor } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  AvatarUploadError,
  AvatarUploadErrorCode,
} from '@/utils/avatar-storage'
import { useProfileAvatarUpload } from './use-profile-avatar-upload'
import type {
  ProfileFieldKey,
  ProfileFormInputValues,
} from './profile-form-schema'

const mockUploadUserAvatar = vi.fn()
const mockWithAvatarCacheBust = vi.fn((url: string) => `${url}?v=1`)
const mockProbeSessionAction = vi.fn()
const mockRefresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}))

vi.mock('./probe-session-action', () => ({
  probeSessionAction: () => mockProbeSessionAction(),
}))

vi.mock('@/utils/avatar-storage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/utils/avatar-storage')>()
  return {
    ...actual,
    uploadUserAvatar: (...args: unknown[]) => mockUploadUserAvatar(...args),
    withAvatarCacheBust: (url: string) => mockWithAvatarCacheBust(url),
  }
})

const USER_ID = 'user-1'
const PUBLIC_URL =
  'https://example.supabase.co/storage/v1/object/public/avatars/user-1/avatar.webp'

const createInFlightRef = (avatarInFlight = false) => ({
  current: {
    displayName: false,
    bio: false,
    avatar: avatarInFlight,
  } satisfies Record<ProfileFieldKey, boolean>,
})

const createLastSavedRef = () => ({
  current: {
    displayName: 'Alex',
    bio: 'Builder',
    avatarUrl: null as string | null,
  },
})

const useTestAvatarUpload = ({
  inFlightRef = createInFlightRef(),
  persistField = vi.fn().mockResolvedValue(undefined),
  setFileError = vi.fn(),
  setFormError = vi.fn(),
  lastSavedRef = createLastSavedRef(),
}: {
  inFlightRef?: ReturnType<typeof createInFlightRef>
  persistField?: ReturnType<typeof vi.fn>
  setFileError?: ReturnType<typeof vi.fn>
  setFormError?: ReturnType<typeof vi.fn>
  lastSavedRef?: ReturnType<typeof createLastSavedRef>
} = {}) => {
  const form = useForm<ProfileFormInputValues>({
    defaultValues: {
      displayName: 'Alex',
      bio: 'Builder',
      avatarUrl: '',
    },
  })

  const hook = useProfileAvatarUpload({
    userId: USER_ID,
    form,
    persistField,
    inFlightRef,
    setFileError,
    setFormError,
    lastSavedRef,
  })

  return {
    ...hook,
    form,
    persistField,
    setFileError,
    setFormError,
    lastSavedRef,
    inFlightRef,
  }
}

describe('useProfileAvatarUpload', () => {
  beforeEach(() => {
    mockUploadUserAvatar.mockReset()
    mockWithAvatarCacheBust.mockClear()
    mockProbeSessionAction.mockReset()
    mockRefresh.mockReset()
    mockUploadUserAvatar.mockResolvedValue({ publicUrl: PUBLIC_URL })
    mockProbeSessionAction.mockResolvedValue({ success: true })
  })

  it('should upload, persist, and update form state on success', async () => {
    const persistField = vi.fn().mockResolvedValue(undefined)
    const setFileError = vi.fn()
    const lastSavedRef = createLastSavedRef()
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })

    const { result } = renderHook(() =>
      useTestAvatarUpload({ persistField, setFileError, lastSavedRef }),
    )

    await act(async () => {
      await result.current.handleAvatarUpload(file)
    })

    expect(setFileError).toHaveBeenCalledWith(null)
    expect(mockUploadUserAvatar).toHaveBeenCalledWith({ userId: USER_ID, file })
    expect(mockWithAvatarCacheBust).toHaveBeenCalledWith(PUBLIC_URL)
    expect(persistField).toHaveBeenCalledWith({
      field: 'avatar',
      payload: { avatarUrl: `${PUBLIC_URL}?v=1` },
      refresh: true,
      onSuccess: expect.any(Function),
    })

    const onSuccess = persistField.mock.calls[0]?.[0]?.onSuccess
    act(() => {
      onSuccess?.()
    })

    expect(lastSavedRef.current.avatarUrl).toBe(`${PUBLIC_URL}?v=1`)
  })

  it('should skip upload when an avatar save is already in flight', async () => {
    const persistField = vi.fn()
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })

    const { result } = renderHook(() =>
      useTestAvatarUpload({
        inFlightRef: createInFlightRef(true),
        persistField,
      }),
    )

    await act(async () => {
      await result.current.handleAvatarUpload(file)
    })

    expect(mockUploadUserAvatar).not.toHaveBeenCalled()
    expect(persistField).not.toHaveBeenCalled()
  })

  it('should probe session and retry upload after auth failure', async () => {
    const persistField = vi.fn().mockResolvedValue(undefined)
    const setFileError = vi.fn()
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })
    const callOrder: string[] = []

    mockRefresh.mockImplementation(() => {
      callOrder.push('refresh')
    })
    mockProbeSessionAction.mockImplementation(async () => {
      callOrder.push('probe')
      return { success: true }
    })
    mockUploadUserAvatar
      .mockImplementationOnce(async () => {
        callOrder.push('upload-attempt-1')
        throw AvatarUploadError.sessionAuthRequired()
      })
      .mockImplementationOnce(async () => {
        callOrder.push('upload-attempt-2')
        return { publicUrl: PUBLIC_URL }
      })

    const { result } = renderHook(() =>
      useTestAvatarUpload({ persistField, setFileError }),
    )

    await act(async () => {
      await result.current.handleAvatarUpload(file)
    })

    expect(callOrder).toEqual([
      'upload-attempt-1',
      'refresh',
      'probe',
      'upload-attempt-2',
    ])
    expect(mockRefresh).toHaveBeenCalledOnce()
    expect(mockProbeSessionAction).toHaveBeenCalledOnce()
    expect(mockUploadUserAvatar).toHaveBeenCalledTimes(2)
    expect(persistField).toHaveBeenCalledOnce()
    expect(setFileError).not.toHaveBeenCalledWith(
      'You must be signed in to upload an image.',
    )
  })

  it('should surface sign-in message when probe fails', async () => {
    const setFileError = vi.fn()
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })

    mockUploadUserAvatar.mockRejectedValue(
      AvatarUploadError.sessionAuthRequired(),
    )
    mockProbeSessionAction.mockResolvedValue({ success: false })

    const { result } = renderHook(() => useTestAvatarUpload({ setFileError }))

    await act(async () => {
      await result.current.handleAvatarUpload(file)
    })

    expect(mockRefresh).toHaveBeenCalledOnce()
    expect(mockProbeSessionAction).toHaveBeenCalledOnce()
    expect(mockUploadUserAvatar).toHaveBeenCalledTimes(1)
    expect(setFileError).toHaveBeenCalledWith(
      'You must be signed in to upload an image.',
    )
  })

  it('should surface AvatarUploadError on the file control', async () => {
    const setFileError = vi.fn()
    const setFormError = vi.fn()
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })
    mockUploadUserAvatar.mockRejectedValue(
      new AvatarUploadError('Image must be 2 MB or smaller.'),
    )

    const { result } = renderHook(() =>
      useTestAvatarUpload({ setFileError, setFormError }),
    )

    await act(async () => {
      await result.current.handleAvatarUpload(file)
    })

    expect(setFileError).toHaveBeenCalledWith('Image must be 2 MB or smaller.')
    expect(setFormError).not.toHaveBeenCalled()
  })

  it('should surface unexpected upload failures as a form fault', async () => {
    const setFileError = vi.fn()
    const setFormError = vi.fn()
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })
    mockUploadUserAvatar.mockRejectedValue(new Error('network down'))

    const { result } = renderHook(() =>
      useTestAvatarUpload({ setFileError, setFormError }),
    )

    await act(async () => {
      await result.current.handleAvatarUpload(file)
    })

    expect(setFileError).toHaveBeenCalledWith(null)
    expect(setFormError).toHaveBeenCalledWith({
      message: 'Could not save your profile. Please try again.',
      kind: 'fault',
      code: 'INTERNAL_ERROR',
    })
  })

  it('should surface persist failures as a form fault', async () => {
    const setFormError = vi.fn()
    const persistField = vi.fn().mockRejectedValue(new Error('save failed'))
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })

    const { result } = renderHook(() =>
      useTestAvatarUpload({ persistField, setFormError }),
    )

    await act(async () => {
      await result.current.handleAvatarUpload(file)
    })

    await waitFor(() => {
      expect(setFormError).toHaveBeenCalledWith({
        message: 'Could not save your profile. Please try again.',
        kind: 'fault',
        code: 'INTERNAL_ERROR',
      })
    })
  })
})
