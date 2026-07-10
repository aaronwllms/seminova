// @vitest-environment node

import { describe, expect, it } from 'vitest'

import { createBrandMarkImageResponse } from './brand-mark-image'

const PNG_MAGIC = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
])

describe('createBrandMarkImageResponse', () => {
  it('should render a non-blank PNG with the brand mark glyph', async () => {
    const response = createBrandMarkImageResponse()
    const buffer = new Uint8Array(await response.arrayBuffer())

    expect(buffer.subarray(0, PNG_MAGIC.length)).toEqual(PNG_MAGIC)
    // A blank single-color 32×32 PNG is ~140 bytes; a rendered glyph is ~600+.
    expect(buffer.byteLength).toBeGreaterThan(300)
  })
})
