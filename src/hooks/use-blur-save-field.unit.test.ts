import { act, renderHook, waitFor } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import type { ProfileFormInputValues } from '@/app/(app)/_lib/profile/profile-form-schema'

import { useBlurSaveField } from './use-blur-save-field'

const mockPersist = vi.fn()
const mockRefresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}))

const profileDefaultValues = {
  displayName: 'Alex',
  bio: 'Builder',
  avatarUrl: null as string | null,
}

const useProfileBlurSaveField = () => {
  const form = useForm<ProfileFormInputValues>({
    defaultValues: {
      displayName: profileDefaultValues.displayName ?? '',
      bio: profileDefaultValues.bio ?? '',
      avatarUrl: '',
    },
  })

  return useBlurSaveField<
    ProfileFormInputValues,
    'displayName' | 'bio',
    'displayName' | 'bio' | 'avatar',
    {
      displayName: string | null
      bio: string | null
      avatarUrl: string | null
    },
    {
      displayName?: string | null
      bio?: string | null
      avatarUrl?: string | null
    }
  >({
    form,
    inFlightKeys: ['displayName', 'bio', 'avatar'] as const,
    initialLastSaved: {
      displayName: profileDefaultValues.displayName?.trim() || null,
      bio: profileDefaultValues.bio?.trim() || null,
      avatarUrl: profileDefaultValues.avatarUrl,
    },
    persist: mockPersist,
  })
}

const noteSchema = z.object({
  title: z.string().max(100),
  body: z.string().max(500),
})

type NoteFormValues = z.infer<typeof noteSchema>

const useNoteBlurSaveField = () => {
  const form = useForm<NoteFormValues>({
    defaultValues: {
      title: 'Draft',
      body: 'Notes',
    },
  })

  return useBlurSaveField<
    NoteFormValues,
    'title' | 'body',
    'title' | 'body',
    { title: string | null; body: string | null },
    { title?: string | null; body?: string | null }
  >({
    form,
    inFlightKeys: ['title', 'body'] as const,
    initialLastSaved: {
      title: 'Draft',
      body: 'Notes',
    },
    persist: mockPersist,
  })
}

describe('useBlurSaveField', () => {
  beforeEach(() => {
    mockPersist.mockReset()
    mockRefresh.mockReset()
    mockPersist.mockResolvedValue({
      success: true,
      data: profileDefaultValues,
    })
  })

  it('should skip persist when value unchanged from last saved', async () => {
    const { result } = renderHook(() => useProfileBlurSaveField())

    const handler = result.current.createTextBlurHandler('displayName', {
      refresh: true,
      toPayload: (trimmed) => ({ displayName: trimmed }),
      lastSaved: {
        get: (snapshot) => snapshot.displayName,
        set: (snapshot, value) => {
          snapshot.displayName = value
        },
      },
    })

    await handler()

    expect(mockPersist).not.toHaveBeenCalled()
  })

  it('should persist and refresh when configured', async () => {
    const { result } = renderHook(() => useProfileBlurSaveField())

    result.current.lastSavedRef.current.displayName = 'Old'

    const handler = result.current.createTextBlurHandler('displayName', {
      refresh: true,
      toPayload: (trimmed) => ({ displayName: trimmed }),
      lastSaved: {
        get: (snapshot) => snapshot.displayName,
        set: (snapshot, value) => {
          snapshot.displayName = value
        },
      },
    })

    await act(async () => {
      await handler()
    })

    await waitFor(() => {
      expect(mockPersist).toHaveBeenCalledWith({
        displayName: 'Alex',
      })
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it('should persist without refresh when refresh is false', async () => {
    const { result } = renderHook(() => useProfileBlurSaveField())

    result.current.lastSavedRef.current.bio = 'Old'

    const handler = result.current.createTextBlurHandler('bio', {
      refresh: false,
      toPayload: (trimmed) => ({ bio: trimmed }),
      lastSaved: {
        get: (snapshot) => snapshot.bio,
        set: (snapshot, value) => {
          snapshot.bio = value
        },
      },
    })

    await act(async () => {
      await handler()
    })

    await waitFor(() => {
      expect(mockPersist).toHaveBeenCalledWith({ bio: 'Builder' })
    })

    expect(mockRefresh).not.toHaveBeenCalled()
  })

  it('should skip duplicate persist while save is in flight', async () => {
    let resolveUpdate: (value: unknown) => void = () => {}
    mockPersist.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveUpdate = resolve
        }),
    )

    const { result } = renderHook(() => useProfileBlurSaveField())

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
      expect(mockPersist).toHaveBeenCalledTimes(1)
    })

    await act(async () => {
      resolveUpdate({
        success: true,
        data: profileDefaultValues,
      })
    })
  })

  it('should compile and persist against a non-profile form schema', async () => {
    const { result } = renderHook(() => useNoteBlurSaveField())

    result.current.lastSavedRef.current.title = 'Old'

    const handler = result.current.createTextBlurHandler('title', {
      refresh: false,
      toPayload: (trimmed) => ({ title: trimmed }),
      lastSaved: {
        get: (snapshot) => snapshot.title,
        set: (snapshot, value) => {
          snapshot.title = value
        },
      },
    })

    await act(async () => {
      await handler()
    })

    await waitFor(() => {
      expect(mockPersist).toHaveBeenCalledWith({ title: 'Draft' })
    })
  })
})
