import {
  AuthSessionSchema,
  BootstrapRequestSchema,
  BootstrapResponseSchema,
} from '@sonari/types'
import type { FastifyInstance } from 'fastify'
import { UnauthorizedError } from '../../lib/errors.js'
import { verifySupabaseJwt } from '../../lib/jwt.js'
import { bootstrapTenant, getAuthSession } from './service.js'

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post('/api/v1/auth/bootstrap', async (request) => {
    const header = request.headers.authorization
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) {
      throw new UnauthorizedError()
    }

    const payload = await verifySupabaseJwt(token)
    const body = BootstrapRequestSchema.parse(request.body)
    const result = await bootstrapTenant(payload.sub, body)
    return BootstrapResponseSchema.parse(result)
  })

  app.get('/api/v1/auth/session', async (request) => {
    if (!request.auth) {
      throw new UnauthorizedError()
    }

    const session = await getAuthSession(request.auth.userId, request.auth.email)
    return AuthSessionSchema.parse(session)
  })
}
