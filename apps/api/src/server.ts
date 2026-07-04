import Fastify, { type FastifyInstance } from 'fastify'
import { HealthResponseSchema, type HealthResponse } from '@sonari/types'

export async function buildServer(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: true,
  })

  app.get('/health', async (): Promise<HealthResponse> => {
    const payload = {
      status: 'ok' as const,
      service: 'sonari-api',
      timestamp: new Date().toISOString(),
    }
    return HealthResponseSchema.parse(payload)
  })

  return app
}
