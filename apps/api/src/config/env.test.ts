import { describe, expect, it } from 'vitest'
import { parseCorsOrigins } from './env.js'

describe('parseCorsOrigins', () => {
  it('splits comma-separated origins and trims whitespace', () => {
    expect(
      parseCorsOrigins('https://app.sonari.shop, https://admin.sonari.shop'),
    ).toEqual(['https://app.sonari.shop', 'https://admin.sonari.shop'])
  })

  it('drops empty segments', () => {
    expect(parseCorsOrigins('https://app.sonari.shop,,  ,https://admin.sonari.shop,')).toEqual([
      'https://app.sonari.shop',
      'https://admin.sonari.shop',
    ])
  })

  it('returns localhost defaults shape for local Vite ports', () => {
    expect(parseCorsOrigins('http://localhost:5173,http://localhost:5174')).toEqual([
      'http://localhost:5173',
      'http://localhost:5174',
    ])
  })

  it('returns empty array for blank input', () => {
    expect(parseCorsOrigins('')).toEqual([])
    expect(parseCorsOrigins('   ')).toEqual([])
  })
})
