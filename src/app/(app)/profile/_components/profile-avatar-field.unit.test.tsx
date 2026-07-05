import { beforeEach, describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'

import { render, screen, waitFor } from '@/test/test-utils'

import { ProfileAvatarField } from './profile-avatar-field'

const createObjectURL = vi.fn((file: File) => `blob:${file.name}`)
const revokeObjectURL = vi.fn()

describe('ProfileAvatarField', () => {
  beforeEach(() => {
    createObjectURL.mockClear()
    revokeObjectURL.mockClear()
    vi.stubGlobal('URL', {
      createObjectURL,
      revokeObjectURL,
    })
  })

  it('should revoke preview URLs and clear preview after a successful upload', async () => {
    const user = userEvent.setup()
    const onUpload = vi.fn().mockResolvedValue(undefined)

    render(
      <ProfileAvatarField
        avatarUrl="https://example.test/avatar.webp"
        displayName="Alex"
        email="alex@example.com"
        saveState="idle"
        onSavedComplete={vi.fn()}
        onUpload={onUpload}
        fileError={null}
        onFileError={vi.fn()}
      />,
    )

    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement

    await user.upload(input, file)

    await waitFor(() => {
      expect(onUpload).toHaveBeenCalledWith(file)
    })

    expect(createObjectURL).toHaveBeenCalledWith(file)
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:avatar.png')
  })
})
