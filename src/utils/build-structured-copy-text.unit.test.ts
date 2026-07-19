import { describe, expect, it } from 'vitest'

import { buildStructuredCopyText } from './build-structured-copy-text'

describe('buildStructuredCopyText', () => {
  it('should omit null and undefined keys while retaining falsy values', () => {
    const result = buildStructuredCopyText({
      keptZero: 0,
      keptEmpty: '',
      keptFalse: false,
      droppedNull: null,
      droppedUndefined: undefined,
    })

    expect(JSON.parse(result)).toEqual({
      keptZero: 0,
      keptEmpty: '',
      keptFalse: false,
    })
  })

  it('should return valid JSON with 2-space indent', () => {
    const result = buildStructuredCopyText({ message: 'hello', code: 'ERR' })

    expect(JSON.parse(result)).toEqual({ message: 'hello', code: 'ERR' })
    expect(result).toContain('\n  ')
  })
})
