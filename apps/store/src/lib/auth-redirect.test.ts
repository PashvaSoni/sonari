import { describe, expect, it } from 'vitest'
import { authEmailRedirectTo } from './auth-redirect.js'

describe('authEmailRedirectTo', () => {
  it('appends /login and strips a trailing slash on origin', () => {
    expect(authEmailRedirectTo('https://app.sonari.shop')).toBe('https://app.sonari.shop/login')
    expect(authEmailRedirectTo('https://app.sonari.shop/')).toBe('https://app.sonari.shop/login')
  })

  it('supports local Vite origins', () => {
    expect(authEmailRedirectTo('http://localhost:5173')).toBe('http://localhost:5173/login')
  })
})
