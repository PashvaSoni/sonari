import { afterAll, describe, expect, it } from 'vitest'
import { buildServer } from './server.js'

describe('GET /health', () => {
  const appPromise = buildServer()

  afterAll(async () => {
    const app = await appPromise
    await app.close()
  })

  it('returns ok', async () => {
    const app = await appPromise
    const response = await app.inject({ method: 'GET', url: '/health' })
    expect(response.statusCode).toBe(200)
    const body = response.json() as { status: string; service: string }
    expect(body.status).toBe('ok')
    expect(body.service).toBe('sonari-api')
  })
})
