import { fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { render, screen, waitFor } from '@/test/test-utils'

import {
  ProfileAvatarField,
  getProfileAvatarAltText,
} from './profile-avatar-field'

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

  it('should use the display name in the avatar alt text', () => {
    expect(getProfileAvatarAltText('Alex')).toBe('Alex avatar')
  })

  it('should fall back to a generic alt label when display name is empty', () => {
    expect(getProfileAvatarAltText(null)).toBe('Profile photo')
    expect(getProfileAvatarAltText('   ')).toBe('Profile photo')
  })

  it('should show inline error for invalid file types', () => {
    const onFileError = vi.fn()

    render(
      <ProfileAvatarField
        avatarUrl={null}
        displayName="Alex"
        email="alex@example.com"
        saveState="idle"
        onSavedComplete={vi.fn()}
        onUpload={vi.fn()}
        fileError={null}
        onFileError={onFileError}
      />,
    )

    const file = new File(['text'], 'notes.txt', { type: 'text/plain' })
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement

    Object.defineProperty(input, 'files', {
      configurable: true,
      value: [file],
    })
    fireEvent.change(input)

    expect(onFileError).toHaveBeenCalledWith(
      'Please choose a JPEG, PNG, or WebP image.',
    )
  })
})
