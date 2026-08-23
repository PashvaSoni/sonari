import Fastify, { type FastifyInstance } from 'fastify'
import { HealthResponseSchema, type HealthResponse } from '@sonari/types'
import { config } from './config/env.js'
import { registerRoutes } from './modules/index.js'
import { authPlugin } from './plugins/auth.js'
import { corsPlugin } from './plugins/cors.js'
import { errorsPlugin } from './plugins/errors.js'
import { supabasePlugin } from './plugins/supabase.js'

export async function buildServer(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: { level: config.LOG_LEVEL },
    genReqId: () => crypto.randomUUID(),
    trustProxy: true,
  })

  await app.register(errorsPlugin)
  await app.register(corsPlugin)
  await app.register(authPlugin)
  await app.register(supabasePlugin)

  app.get('/health', async (): Promise<HealthResponse> => {
    const payload = {
      status: 'ok' as const,
      service: 'sonari-api',
      timestamp: new Date().toISOString(),
    }
    return HealthResponseSchema.parse(payload)
  })

  await registerRoutes(app)

  return app
}
