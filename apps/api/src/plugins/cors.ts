import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { applyCorsHeaders } from '../lib/cors-headers.js'
import { config } from '../config/env.js'

const corsPluginImpl: FastifyPluginAsync = async (app) => {
  await app.register(import('@fastify/cors'), {
    origin: config.corsOrigins,
    credentials: true,
  })

  // Ensure ACAO on error replies (browser otherwise shows opaque "Failed to fetch").
  app.addHook('onSend', async (request, reply, payload) => {
    applyCorsHeaders(request, reply)
    return payload
  })
}

/** Break Fastify encapsulation so CORS applies to all routes (see Posport: CORS on every response). */
export const corsPlugin = fp(corsPluginImpl, { name: 'sonari-cors' })
