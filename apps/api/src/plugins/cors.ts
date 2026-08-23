import type { FastifyInstance } from 'fastify'
import { config } from '../config/env.js'

export async function corsPlugin(app: FastifyInstance): Promise<void> {
  await app.register(import('@fastify/cors'), {
    origin: config.corsOrigins,
    credentials: true,
  })
}
