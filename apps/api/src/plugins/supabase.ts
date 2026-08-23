import { createAnonClient } from '@sonari/db'
import type { FastifyInstance } from 'fastify'
import { config } from '../config/env.js'

declare module 'fastify' {
  interface FastifyRequest {
    db: ReturnType<typeof createAnonClient>
  }
}

export async function supabasePlugin(app: FastifyInstance): Promise<void> {
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
