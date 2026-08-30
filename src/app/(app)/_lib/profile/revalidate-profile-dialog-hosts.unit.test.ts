import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/cache')>()

  return {
    ...actual,
    revalidatePath: vi.fn(),
  }
})

import { revalidatePath } from 'next/cache'

import { revalidateProfileDialogHosts } from './revalidate-profile-dialog-hosts'

describe('revalidateProfileDialogHosts', () => {
  beforeEach(() => {
    vi.mocked(revalidatePath).mockClear()
  })

  it('should revalidate the three profile dialog host layouts', () => {
    revalidateProfileDialogHosts()

    expect(revalidatePath).toHaveBeenCalledTimes(3)
    expect(revalidatePath).toHaveBeenNthCalledWith(1, '/(app)', 'layout')
    expect(revalidatePath).toHaveBeenNthCalledWith(2, '/admin', 'layout')
    expect(revalidatePath).toHaveBeenNthCalledWith(3, '/(marketing)', 'layout')
  })
})
