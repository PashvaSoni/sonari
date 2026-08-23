import { afterAll, describe, expect, it } from 'vitest'
import { buildServer } from './server.js'

describe('CORS', () => {
  const appPromise = buildServer()

  afterAll(async () => {
    const app = await appPromise
    await app.close()
  })

  it('reflects allowed Origin on /health', async () => {
    const app = await appPromise
    const response = await app.inject({
      method: 'GET',
      url: '/health',
      headers: { origin: 'https://app.sonari.shop' },
    })
    expect(response.statusCode).toBe(200)
    expect(response.headers['access-control-allow-origin']).toBe('https://app.sonari.shop')
    expect(response.headers['access-control-allow-credentials']).toBe('true')
  })

  it('includes CORS headers on 401 so browsers can read the error', async () => {
    const app = await appPromise
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/store',
      headers: { origin: 'https://app.sonari.shop' },
    })
    expect(response.statusCode).toBe(401)
    expect(response.headers['access-control-allow-origin']).toBe('https://app.sonari.shop')
    const body = response.json() as { error: { code: string } }
    expect(body.error.code).toBe('UNAUTHORIZED')
  })

  it('does not reflect disallowed origins', async () => {
    const app = await appPromise
    const response = await app.inject({
      method: 'GET',
      url: '/health',
      headers: { origin: 'https://evil.example' },
    })
    expect(response.statusCode).toBe(200)
    expect(response.headers['access-control-allow-origin']).toBeUndefined()
  })
})
