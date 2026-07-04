import { describe, expect, it } from 'vitest'
import { toMoneyString } from './index.js'

describe('toMoneyString', () => {
  it('formats to two decimal places', () => {
    expect(toMoneyString('51240')).toBe('51240.00')
  })
})
