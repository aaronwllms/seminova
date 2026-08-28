import { AuthApiError } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { APP_HOME } from '@/constants/app-paths'
import { MIN_PASSWORD_LENGTH } from '@/constants/auth'

const mockSignUp = vi.fn()
const mockAppLogError = vi.fn()
const mockServiceUpdate = vi.fn()
const mockServiceEq = vi.fn()

vi.mock('@/utils/app-logger', () => ({
  appLog: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: (...args: unknown[]) => mockAppLogError(...args),
  },
}))

vi.mock('@/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      signUp: mockSignUp,
    },
  })),
}))

vi.mock('@/supabase/service', () => ({
  createServiceClient: vi.fn(() => ({
    from: vi.fn(() => ({
      update: mockServiceUpdate,
    })),
  })),
}))

import { signUpWithPasswordAction } from './actions'

const USER_ID = 'user-1'
const VALID_INPUT = {
  email: 'new@example.com',
  password: 'password123',
}

describe('signUpWithPasswordAction', () => {
  beforeEach(() => {
    mockSignUp.mockReset()
    mockAppLogError.mockReset()
    mockServiceUpdate.mockReset()
    mockServiceEq.mockReset()

    mockServiceUpdate.mockReturnValue({ eq: mockServiceEq })
    mockServiceEq.mockResolvedValue({ error: null })
  })

  it('should return a validation error for invalid input', async () => {
    const result = await signUpWithPasswordAction({
      email: 'not-an-email',
      password: 'a'.repeat(MIN_PASSWORD_LENGTH),
    })

    expect(result).toMatchObject({
      success: false,
      error: { code: 'VALIDATION_ERROR', kind: 'operational' },
    })
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('should map a signUp AuthError and not stamp', async () => {
    mockSignUp.mockResolvedValue({
      data: { user: null },
      error: new AuthApiError('Password too weak', 400, 'weak_password'),
    })

    const result = await signUpWithPasswordAction(VALID_INPUT)

    expect(result).toMatchObject({
      success: false,
      error: { code: 'VALIDATION_ERROR', kind: 'operational' },
    })
    expect(mockServiceUpdate).not.toHaveBeenCalled()
    expect(mockAppLogError).not.toHaveBeenCalled()
  })

  it('should succeed without stamping when identities is empty', async () => {
    mockSignUp.mockResolvedValue({
      data: {
        user: { id: USER_ID, identities: [] },
      },
      error: null,
    })

    const result = await signUpWithPasswordAction(VALID_INPUT)

    expect(result).toMatchObject({ success: true })
    expect(mockServiceUpdate).not.toHaveBeenCalled()
  })

  it('should stamp has_password after a real new user signUp', async () => {
    mockSignUp.mockResolvedValue({
      data: {
        user: { id: USER_ID, identities: [{ id: 'ident-1' }] },
      },
      error: null,
    })

    const result = await signUpWithPasswordAction(VALID_INPUT)

    expect(mockSignUp).toHaveBeenCalledWith({
      email: VALID_INPUT.email,
      password: VALID_INPUT.password,
      options: {
        emailRedirectTo: expect.stringContaining(APP_HOME),
      },
    })
    expect(mockSignUp.mock.calls[0]?.[0].options).not.toHaveProperty('data')
    expect(mockServiceUpdate).toHaveBeenCalledWith({ has_password: true })
    expect(mockServiceEq).toHaveBeenCalledWith('id', USER_ID)
    expect(result).toMatchObject({ success: true })
  })

  it('should return a fault and log the orphaned user id when the stamp fails', async () => {
    mockSignUp.mockResolvedValue({
      data: {
        user: { id: USER_ID, identities: [{ id: 'ident-1' }] },
      },
      error: null,
    })
    mockServiceEq.mockResolvedValue({
      error: { message: 'stamp failed' },
    })

    const result = await signUpWithPasswordAction(VALID_INPUT)

    expect(result).toMatchObject({
      success: false,
      error: { code: 'INTERNAL_ERROR', kind: 'fault' },
    })
    expect(mockAppLogError).toHaveBeenCalledWith(
      'sign-up',
      'Failed to stamp has_password after signUp',
      expect.objectContaining({ userId: USER_ID }),
    )
  })
})
