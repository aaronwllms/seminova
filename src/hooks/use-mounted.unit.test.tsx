import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useMounted } from './use-mounted'

describe('useMounted', () => {
  it('starts false and becomes true after mount', () => {
    const values: boolean[] = []

    const Probe = () => {
      values.push(useMounted())
      return null
    }

    render(<Probe />)

    expect(values[0]).toBe(false)
    expect(values.at(-1)).toBe(true)
  })
})
