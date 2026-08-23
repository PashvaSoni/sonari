import { describe, expect, it } from 'vitest'
import { buildCorsHeaders } from './cors-headers.js'

describe('buildCorsHeaders', () => {
  it('reflects allow-listed production origins', () => {
    expect(buildCorsHeaders('https://app.sonari.shop')).toEqual({
      'Access-Control-Allow-Origin': 'https://app.sonari.shop',
      'Access-Control-Allow-Credentials': 'true',
      Vary: 'Origin',
    })
  })

  it('returns empty for missing or unknown origins', () => {
    expect(buildCorsHeaders(undefined)).toEqual({})
    expect(buildCorsHeaders('https://evil.example')).toEqual({})
  })
})
