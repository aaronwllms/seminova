import { describe, expect, it } from 'vitest'

import type { AppError } from '@/types/app-error'

import { isAppError, toAppError } from './is-app-error'

describe('isAppError', () => {
  it('should accept valid operational and fault AppError values', () => {
    const operational: AppError = {
      kind: 'operational',
      message: 'Invalid input',
    }
    const fault: AppError = {
      kind: 'fault',
      message: 'Unexpected failure',
      code: 'INTERNAL_ERROR',
    }

    expect(isAppError(operational)).toBe(true)
    expect(isAppError(fault)).toBe(true)
  })

  it('should reject non-AppError values', () => {
    expect(isAppError(new Error('network'))).toBe(false)
    expect(isAppError('failure')).toBe(false)
    expect(isAppError(null)).toBe(false)
    expect(isAppError({ kind: 'fault' })).toBe(false)
  })
})

describe('toAppError', () => {
  it('should pass through valid AppError values unchanged', () => {
    const operational: AppError = {
      kind: 'operational',
      message: 'Forbidden',
    }
    const fault: AppError = {
      kind: 'fault',
      message: 'Database unavailable',
    }

    expect(toAppError(operational)).toBe(operational)
    expect(toAppError(fault)).toBe(fault)
  })

  it('should wrap plain Error, string, and non-object values in synthetic fault', () => {
    expect(toAppError(new Error('raw network message'))).toEqual({
      kind: 'fault',
      message: 'Something went wrong',
    })
    expect(toAppError('failure')).toEqual({
      kind: 'fault',
      message: 'Something went wrong',
    })
    expect(toAppError(undefined)).toEqual({
      kind: 'fault',
      message: 'Something went wrong',
    })
  })
})
