import { describe, expect, it } from 'vitest'

import type { AppError } from '@/types/app-error'

import { unwrapActionResult } from './unwrap-action-result'

describe('unwrapActionResult', () => {
  it('should return data on success', () => {
    expect(
      unwrapActionResult({
        success: true,
        data: { rows: [], hasNextPage: false },
      }),
    ).toEqual({ rows: [], hasNextPage: false })
  })

  it('should throw AppError on failure', () => {
    const error: AppError = {
      kind: 'operational',
      message: 'Forbidden',
    }

    expect(() => unwrapActionResult({ success: false, error })).toThrow()
  })
})
