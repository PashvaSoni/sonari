import { createAnonClient } from '@sonari/db'
import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { config } from '../config/env.js'

declare module 'fastify' {
  interface FastifyRequest {
    db: ReturnType<typeof createAnonClient>
  }
}

const supabasePluginImpl: FastifyPluginAsync = async (app) => {
  app.decorateRequest('db', undefined as unknown as ReturnType<typeof createAnonClient>)

  app.addHook('preHandler', async (request) => {
    if (!request.auth?.rawToken) {
      return
    }

    request.db = createAnonClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${request.auth.rawToken}`,
        },
      },
    })
  })
}

export const supabasePlugin = fp(supabasePluginImpl, { name: 'sonari-supabase' })
