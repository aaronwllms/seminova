import type { User } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  mockFindUserByEmail,
  mockDeleteUserById,
  mockDeleteUserAvatarStorage,
  mockLoadServiceEnv,
  mockConfirmAction,
  mockCreateServiceClient,
  mockCliLog,
} = vi.hoisted(() => ({
  mockFindUserByEmail: vi.fn(),
  mockDeleteUserById: vi.fn(),
  mockDeleteUserAvatarStorage: vi.fn(),
  mockLoadServiceEnv: vi.fn(),
  mockConfirmAction: vi.fn(),
  mockCreateServiceClient: vi.fn(),
  mockCliLog: {
    debug: vi.fn().mockResolvedValue(undefined),
    info: vi.fn().mockResolvedValue(undefined),
    warn: vi.fn().mockResolvedValue(undefined),
    error: vi.fn().mockResolvedValue(undefined),
  },
}))

vi.mock('@/utils/app-logger-cli', () => ({
  cliLog: mockCliLog,
}))

vi.mock('./admin-users', () => ({
  deleteUserAvatarStorage: (...args: unknown[]) =>
    mockDeleteUserAvatarStorage(...args),
  deleteUserById: (...args: unknown[]) => mockDeleteUserById(...args),
  findUserByEmail: (...args: unknown[]) => mockFindUserByEmail(...args),
}))

vi.mock('@/utils/env', () => ({
  loadServiceEnvForCli: () => mockLoadServiceEnv(),
}))

vi.mock('./prompt', () => ({
  confirmAction: (...args: unknown[]) => mockConfirmAction(...args),
}))

vi.mock('@/supabase/service', () => ({
  createServiceClient: (...args: unknown[]) => mockCreateServiceClient(...args),
}))

import { runDeleteUser } from './cli'

const createMockUser = (): User =>
  ({
    id: 'user-1',
    email: 'alice@example.com',
  }) as User

describe('runDeleteUser', () => {
  const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {
    throw new Error('process.exit')
  }) as never)

  beforeEach(() => {
    vi.clearAllMocks()
    mockLoadServiceEnv.mockReturnValue({
      supabaseUrl: 'https://example.supabase.co',
      secretKey: 'secret',
    })
    mockCreateServiceClient.mockReturnValue({})
  })

  it('should exit when user is not found', async () => {
    mockConfirmAction.mockResolvedValue(true)
    mockFindUserByEmail.mockResolvedValue(null)

    await expect(runDeleteUser(['missing@example.com'])).rejects.toThrow(
      'process.exit',
    )

    expect(exitSpy).toHaveBeenCalledWith(1)
    expect(mockCliLog.error).toHaveBeenCalledWith(
      'delete-user',
      'no user found with that email',
    )
    expect(mockDeleteUserById).not.toHaveBeenCalled()
  })

  it('should cancel without deleting when confirmation is declined', async () => {
    mockConfirmAction.mockResolvedValue(false)

    await runDeleteUser(['alice@example.com'])

    expect(mockCliLog.info).toHaveBeenCalledWith('delete-user', 'Cancelled')
    expect(mockFindUserByEmail).not.toHaveBeenCalled()
    expect(mockDeleteUserById).not.toHaveBeenCalled()
  })

  it('should warn and still succeed when avatar storage delete fails', async () => {
    const storageError = { message: 'storage delete failed' }

    mockConfirmAction.mockResolvedValue(true)
    mockFindUserByEmail.mockResolvedValue(createMockUser())
    mockDeleteUserById.mockResolvedValue({
      status: 'deleted',
      email: 'alice@example.com',
    })
    mockDeleteUserAvatarStorage.mockResolvedValue({
      ok: false,
      error: storageError,
    })

    await runDeleteUser(['alice@example.com'])

    expect(mockDeleteUserById).toHaveBeenCalledWith({}, 'user-1')
    expect(mockDeleteUserAvatarStorage).toHaveBeenCalledWith({}, 'user-1')
    expect(mockCliLog.warn).toHaveBeenCalledWith(
      'delete-user',
      'user deleted but avatar file may remain at user-1/avatar.webp in avatars',
      storageError,
    )
    expect(mockCliLog.warn).toHaveBeenCalledWith(
      'delete-user',
      'alice@example.com deleted',
    )
  })
})
